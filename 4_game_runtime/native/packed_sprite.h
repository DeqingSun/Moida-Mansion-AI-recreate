#ifndef MOIDA_PACKED_SPRITE_H
#define MOIDA_PACKED_SPRITE_H
#include <stdint.h>
extern const uint8_t icon_sprites[];
/* Valid table index required. Ten-bit positions have shifts 0,2,4,6,
   so exactly two byte loads suffice, including the final entry. */
static inline unsigned moida_packed_sprite(const uint8_t *bytes,unsigned index) {
 unsigned bit=index*10u, pos=bit>>3;
 return ((unsigned)(bytes[pos]|((unsigned)bytes[pos+1]<<8))>>(bit&7u))&1023u;
}
#endif
