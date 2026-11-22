#!/usr/bin/env python3
"""Compile the CH32X035 sleep/wake bring-up sketch; never upload."""
import argparse, json, pathlib, re, subprocess
HERE = pathlib.Path(__file__).resolve().parent
p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--cli', default=str(pathlib.Path.home() /
    'Documents/GitHub/CH32V003-Automatic-Test-Tool/controllerCode/'
    'ch32v305_controller/build/arduino_cli/bin/arduino-cli'))
a = p.parse_args()
package = pathlib.Path.home() / 'Library/Arduino15/packages/WCH/hardware/ch32v/26.1.1'
sketch = HERE / 'sleep_test'
mode = 'usb-hsi'
build = HERE / 'build' / mode
build.mkdir(parents=True, exist_ok=True)
ld = (package / 'system/CH32X035/SRC/Ld/Link.ld').read_text()
ld, n = re.subn(r'__stack_size\s*=\s*\d+\s*;', '__stack_size = 4096;', ld)
if n != 1:
    raise RuntimeError('Unexpected linker stack declaration')
linker = HERE / 'build' / ('sleep-' + mode + '.ld')
linker.write_text(ld)
platform = (package / 'platform.txt').read_text()
recipe = re.search(r'^recipe.c.combine.pattern=(.*)$', platform, re.M)[1]
recipe = recipe.replace(
    '"{build.system.path}/{build.series}/SRC/Ld/{build.ldscript}"',
    '"' + str(linker) + '"')
recipe = recipe.replace('-Wl,--whole-archive ', '').replace(
    '-Wl,--no-whole-archive ', '')
fqbn = 'WCH:ch32v:CH32X035_EVT:pnum=CH32X035G8U,clock=48MHz_HSI,opt=oslto'
cmd = [a.cli, 'compile', '--fqbn', fqbn, '--build-path', str(build),
       '--build-property', 'recipe.c.combine.pattern=' + recipe, str(sketch)]
subprocess.run(cmd, check=True)
text = (build / 'sleep_test.ino.map').read_text()
sections = {}
for match in re.finditer(
        r'^(\.\S+)\s+0x([0-9a-f]+)\s+0x([0-9a-f]+)'
        r'(?: load address 0x([0-9a-f]+))?', text, re.M):
    name, addr, size, load = match.groups()
    sections[name] = {'address': int(addr, 16), 'size': int(size, 16),
                      'load': int(load or addr, 16)}
data, bss = sections['.data'], sections['.bss']
flash = data['load'] + data['size']
ram = bss['address'] + bss['size'] - 0x20000000
(build / 'settings.json').write_text(json.dumps({
    'fqbn': fqbn, 'stack_bytes': 4096, 'flash_bytes': flash,
    'static_ram_bytes': ram, 'compile_command': cmd}, indent=2) + '\n')
nm = next((package.parents[2] / 'tools').glob(
    'riscv-none-embed-gcc/*/bin/riscv-wch-elf-nm'))
symbols = subprocess.check_output(
    [str(nm), str(build / 'sleep_test.ino.elf')], text=True)
for handler in ['SysTick_Handler', 'EXTI7_0_IRQHandler']:
    if not re.search(r' T ' + handler + r'$', symbols, re.M):
        raise RuntimeError('Missing strong interrupt handler: ' + handler)
print('Flash bytes:', flash, 'static RAM:', ram)
print('Build only; nothing uploaded. Artifacts:', build)
