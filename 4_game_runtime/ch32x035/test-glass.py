"""Verify each logical cell maps to the reversed HT16C24A RAM address."""
from pathlib import Path
import subprocess,tempfile
here=Path(__file__).resolve().parent
with tempfile.TemporaryDirectory() as tmp:
 p=Path(tmp)
 (p/'test.c').write_text('''#include "lcd_glass.h"
#include <assert.h>
int main(void){
 uint8_t cells[16][6]={0},ram[120];
 for(unsigned c=0;c<16;c++)for(unsigned s=0;s<48;s++){
  cells[c][s/8]=(uint8_t)(1u<<(s%8));
  moida_glass_ram(cells,ram);
  unsigned address=(47-s)*2+(15-c)/8, mask=1u<<((15-c)%8);
  for(unsigned i=0;i<120;i++)assert(ram[i]==(i==address?mask:0));
  cells[c][s/8]=0;
 }
 for(unsigned c=0;c<16;c++)for(unsigned b=0;b<6;b++)cells[c][b]=255;
 moida_glass_ram(cells,ram);
 for(unsigned i=0;i<120;i++)assert(ram[i]==(i<96?255:0));
 for(unsigned c=0;c<16;c++)for(unsigned b=0;b<6;b++)cells[c][b]=0;
 moida_glass_ram(cells,ram);
 for(unsigned i=0;i<120;i++)assert(ram[i]==0);
}''')
 subprocess.run(['cc','-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined','-I'+str(here/'moida_test'),str(p/'test.c'),'-o',str(p/'test')],check=True)
 subprocess.run([str(p/'test')],check=True)
print('PASS: all 768 cells, all-on/off, unused 24 driver bytes clear; sanitizers enabled.')
