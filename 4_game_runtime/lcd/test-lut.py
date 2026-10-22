"""Test generated C mapping against every island in the JSON manifest."""
import json, pathlib, subprocess, tempfile
here = pathlib.Path(__file__).resolve().parent
rows = json.loads((here/'mapping.json').read_text())['islands']
expected = [[0]*96 for _ in range(631)]
for r in rows:
    expected[r['bit']][r['com']*6+r['seg']//8] |= 1 << (r['seg']%8)
with tempfile.TemporaryDirectory() as d:
    p = pathlib.Path(d)
    (p/'test.c').write_text('''#include "moida_lcd_lut.h"
#include <stdio.h>
int main(void) {
 uint32_t words[20]={0}; uint8_t out[16][6];
 for(unsigned bit=0;bit<640;bit++) {
  if(bit)words[(bit-1)/32]=0;
  words[bit/32]=UINT32_C(1)<<(bit%32);
  moida_lcd_map(words,out);
  if(fwrite(out,1,sizeof out,stdout)!=sizeof out)return 1;
 }
 for(unsigned i=0;i<20;i++)words[i]=UINT32_MAX;
 moida_lcd_map(words,out);fwrite(out,1,sizeof out,stdout);
 for(unsigned i=0;i<20;i++)words[i]=0;
 moida_lcd_map(words,out);fwrite(out,1,sizeof out,stdout);
 return 0;
}
''')
    subprocess.run(['cc','-std=c11','-Wall','-Wextra','-Werror','-fsanitize=address,undefined','-I'+str(here),str(p/'test.c'),'-o',str(p/'test')],check=True)
    actual = subprocess.check_output([str(p/'test')])
    all_on = [0]*96
    for row in expected:
        for i,v in enumerate(row): all_on[i] |= v
    assert actual == b''.join(bytes(row) for row in expected+[ [0]*96 for _ in range(9) ]+[all_on,[0]*96])
print('PASS: all 631 game bits, 9 padding bits, all-on and all-off; sanitizers enabled.')
