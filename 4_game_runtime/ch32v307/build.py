#!/usr/bin/env python3
"""Prepare Arduino sketch and compile for CH32V307VCT6; never upload."""
import argparse, pathlib, subprocess, re, json
HERE=pathlib.Path(__file__).resolve().parent
CORE=HERE.parent/'native'
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--cli',default=str(pathlib.Path.home()/'Documents/GitHub/CH32V003-Automatic-Test-Tool/controllerCode/ch32v305_controller/build/arduino_cli/bin/arduino-cli'))
a=p.parse_args()
package=pathlib.Path.home()/'Library/Arduino15/packages/WCH/hardware/ch32v/26.1.1'
sketch=HERE/'moida_test'; src=sketch/'src'; src.mkdir(exist_ok=True)
sources=['moida_core','moida_text','moida_room','moida_layout','moida_puzzle','moida_house','moida_game','moida_hal']
for f in CORE.iterdir():
 if f.suffix in ('.h','.inc') or (f.suffix=='.c' and f.stem in sources):
  name=f.stem+'.h' if f.suffix=='.inc' else f.name
  content=f.read_text()
  if f.suffix=='.c': content=content.replace('_tables.inc', '_tables.h')
  (src/name).write_text(content)
mode='usb-hse'
build=HERE/'build'/mode; build.mkdir(parents=True,exist_ok=True)
oracle=build/'oracle.c'
oracle.write_text('''#include "moida_game.h"
#include <stdio.h>
#include <inttypes.h>
static MoidaGame g;
int main(void){MoidaFrame f; uint32_t hash=2166136261u;
 if(!moida_game_init(&g,1700000000000LL))return 1;
 for(unsigned i=0;i<1000;i++){
 unsigned buttons=i%23==0?1u<<((i/23)%4):0;
 if(!moida_game_tick(&g,buttons,&f))return 2;
 for(unsigned j=0;j<20;j++)for(unsigned b=0;b<4;b++){
 hash^=(f.display.data[j]>>(8*b))&255;hash*=16777619u;}}
 printf("%" PRIu32,hash);return 0;}
''')
exe=build/'oracle'
subprocess.run(['cc','-std=c11','-fsanitize=address,undefined','-I'+str(CORE),str(oracle),*[str(CORE/(s+'.c')) for s in sources],'-o',str(exe)],check=True)
expected=int(subprocess.check_output([str(exe)],text=True))
(src/'expected.h').write_text(f'#define MOIDA_EXPECTED_HASH UINT32_C({expected})\n')
# Use a local linker copy: default 2 KiB is too small for generation.
ld=(package/'system/CH32V30x/SRC/Ld/Link.ld').read_text()
ld,n=re.subn(r'__stack_size\s*=\s*\d+\s*;', '__stack_size = 8192;',ld)
if n!=1:raise RuntimeError('Unexpected linker stack declaration')
linker=HERE/'build'/('moida-'+mode+'.ld'); linker.write_text(ld)
platform=(package/'platform.txt').read_text()
recipe=re.search(r'^recipe.c.combine.pattern=(.*)$',platform,re.M)[1]
recipe=recipe.replace('"{build.system.path}/{build.series}/SRC/Ld/{build.ldscript}"','"'+str(linker)+'"')
clock='144MHz_HSE'
fqbn=f'WCH:ch32v:CH32V30x_EVT:pnum=CH32V307VCT6,clock={clock},opt=oslto,usb=none'
cmd=[a.cli,'compile','--fqbn',fqbn,'--build-path',str(build),
 '--build-property','recipe.c.combine.pattern='+recipe,str(sketch)]
print('Expected 1000-tick display hash:',hex(expected),flush=True)
subprocess.run(cmd,check=True)
(build/'settings.json').write_text(json.dumps({'fqbn':fqbn,'expected_hash':expected,'stack_bytes':8192,'compile_command':cmd},indent=2)+'\n')
print('Build only; nothing uploaded. Artifacts:',build)
