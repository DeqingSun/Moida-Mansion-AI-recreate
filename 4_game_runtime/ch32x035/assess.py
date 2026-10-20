#!/usr/bin/env python3
"""Compile-only CH32X035 resource assessment. Never uploads or changes the core."""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = HERE.parent / "native"
SOURCES = ["moida_core", "moida_text", "moida_room", "moida_layout",
           "moida_puzzle", "moida_house", "moida_game", "moida_hal"]
TYPES = ["MoidaGame", "MoidaHost", "MoidaFrame", "MoidaHouse",
         "MoidaDecoratedRoom", "MoidaRoom", "MoidaRoomEntity", "MoidaPuzzle",
         "MoidaPuzzleEntity", "MoidaLayout", "MoidaResult", "MoidaSearch",
         "MoidaIntro", "MoidaRunner", "MoidaAmbient", "MoidaReveal"]


def map_metrics(path):
    # Failed size/stack links still emit a complete map. No oversized ELF needed.
    text = path.read_text()
    sections = {}
    for match in re.finditer(
            r"^(\.\S+)\s+0x([0-9a-f]+)\s+0x([0-9a-f]+)"
            r"(?: load address 0x([0-9a-f]+))?", text, re.M):
        name, addr, size, load = match.groups()
        sections[name] = {"address": int(addr, 16), "size": int(size, 16),
                          "load": int(load or addr, 16)}
    # data load image ends flash; includes vectors, code, rodata, USB highcode,
    # constructor arrays and linker alignment. BSS and stack have no flash image.
    data, bss = sections[".data"], sections[".bss"]
    flash = data["load"] + data["size"]
    ram = bss["address"] + bss["size"] - 0x20000000
    largest = sorted(
        ({"name": name, "bytes": int(size, 16)}
         for name, size in re.findall(
             r"^ (\.(?:rodata|text|bss)\S*)\s+0x[0-9a-f]+\s+0x([0-9a-f]+)",
             text, re.M)), key=lambda row: row["bytes"], reverse=True)[:20]
    return {"flash_bytes": flash, "static_ram_bytes": ram,
            "flash_margin_bytes": 63488 - flash,
            "ram_remaining_before_stack_heap_irq_bytes": 20480 - ram,
            "linker_stack_reservation_bytes": sections[".stack"]["size"],
            "sections": sections, "largest_input_sections": largest}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cli", default=shutil.which("arduino-cli") or
                        "/Applications/Arduino IDE.app/Contents/Resources/"
                        "app/lib/backend/resources/arduino-cli")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    out = args.output or Path(tempfile.mkdtemp(prefix="moida-ch32-assess-"))
    out.mkdir(parents=True, exist_ok=True)
    package = Path.home() / "Library/Arduino15/packages/WCH"
    tool = next(package.glob("tools/riscv-none-embed-gcc/*/bin/riscv-wch-elf-gcc"))
    nm = tool.with_name("riscv-wch-elf-nm")
    sketch = out / "assessment"
    sketch.mkdir(exist_ok=True)
    inputs = [p for p in NATIVE.iterdir()
              if p.suffix in (".h", ".inc") or p.stem in SOURCES]
    for p in inputs:
        shutil.copy2(p, sketch / p.name)
    shutil.copy2(HERE / "assessment.ino", sketch / "assessment.ino")
    report = {
        "toolchain": subprocess.check_output([tool, "--version"], text=True).splitlines()[0],
        "source_sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                          for p in inputs},
        "limits": {"flash_bytes": 63488, "ram_bytes": 20480, "cpu_hz": 48000000},
        "builds": {},
    }
    for name, opt, usb in [("os", "osstd", False), ("lto", "oslto", False),
                            ("usb-lto", "oslto", True)]:
        build = out / name
        flags = "-fstack-usage" + (" -DASSESS_USB" if usb else "")
        cmd = [args.cli, "compile", "--fqbn",
               f"WCH:ch32v:CH32X035_EVT:pnum=CH32X035G8U,clock=48MHz_HSI,opt={opt}",
               "--build-path", str(build),
               "--build-property", "compiler.c.extra_flags=" + flags,
               "--build-property", "compiler.cpp.extra_flags=" + flags,
               str(sketch)]
        result = subprocess.run(cmd, text=True, stdout=subprocess.PIPE,
                                stderr=subprocess.STDOUT)
        (out / (name + ".log")).write_text(result.stdout)
        map_file = build / "assessment.ino.map"
        if not map_file.exists():
            raise RuntimeError(f"{name}: no map; see {out / (name + '.log')}")
        metrics = map_metrics(map_file)
        metrics["build_exit_code"] = result.returncode
        metrics["command"] = cmd
        metrics["diagnostics"] = [line for line in result.stdout.splitlines()
                                  if "overlap" in line or "overflow" in line
                                  or "will not fit" in line]
        # Do not silently treat unrelated compile/link errors as size results.
        if result.returncode and not metrics["diagnostics"]:
            raise RuntimeError(f"{name}: unexpected build failure; read log")
        report["builds"][name] = metrics
        print(name, {k: metrics[k] for k in
                     ("flash_bytes", "static_ram_bytes", "flash_margin_bytes",
                      "ram_remaining_before_stack_heap_irq_bytes")}, flush=True)

    probe = out / "sizes.c"
    probe.write_text('#include "moida_hal.h"\n' + "\n".join(
        f"char size_{name}[sizeof({name})];" for name in TYPES))
    obj = out / "sizes.o"
    subprocess.run([tool, "-march=rv32imacxw", "-mabi=ilp32",
                    "-I" + str(NATIVE), "-c", str(probe), "-o", str(obj)], check=True)
    symbols = subprocess.check_output([nm, "-S", "--radix=d", str(obj)], text=True)
    report["target_type_bytes"] = {
        name: int(size) for size, name in re.findall(r"\d+\s+(\d+)\s+\w\s+size_(\w+)", symbols)}
    stack = []
    for path in (out / "os").rglob("*.su"):
        if path.name.startswith("moida_"):
            for line in path.read_text().splitlines():
                location, amount, qualifier = line.split("\t")
                stack.append({"function": location.split(":")[-1],
                              "bytes": int(amount), "qualifier": qualifier})
    report["non_lto_function_stack_frames"] = sorted(
        stack, key=lambda row: row["bytes"], reverse=True)
    (out / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print("Logs, maps, stack frames and report:", out)
    print("Failed size links are expected for the current port. No upload performed.")


if __name__ == "__main__":
    main()
