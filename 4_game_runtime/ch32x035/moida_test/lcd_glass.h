#ifndef MOIDA_LCD_GLASS_H
#define MOIDA_LCD_GLASS_H
#include <stdint.h>
/* Factory glass: test-driver SEG0/COM0 is routed SEG47/COM15 (lower right).
   Change these independently if a walking-electrode test establishes otherwise. */
#define MOIDA_GLASS_REVERSE_SEG 1
#define MOIDA_GLASS_REVERSE_COM 1
/* Convert logical COM-major LUT output to HT16C24A SEG-major RAM.
   Driver SEG12..59 use bytes 0..95; unused SEG60..71 stay clear. */
static inline void moida_glass_ram(const uint8_t cells[16][6],uint8_t ram[120]) {
 for(unsigned i=0;i<120;i++)ram[i]=0;
 for(unsigned c=0;c<16;c++)for(unsigned s=0;s<48;s++) {
  unsigned ds=MOIDA_GLASS_REVERSE_SEG?47-s:s;
  unsigned dc=MOIDA_GLASS_REVERSE_COM?15-c:c;
  if((cells[c][s>>3]>>(s&7))&1u)ram[ds*2+(dc>>3)]|=(uint8_t)(1u<<(dc&7));
 }
}
#endif
