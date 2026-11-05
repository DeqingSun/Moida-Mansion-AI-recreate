#ifndef MOIDA_PHYSICAL_BUTTONS_H
#define MOIDA_PHYSICAL_BUTTONS_H
#include <stdint.h>
// Poll often; latch short presses between the game's 100 ms ticks.
struct PhysicalButtons {
  uint8_t candidate=0, stable=0, pending=0;
  uint32_t changedAt[4]={};
  void update(uint8_t pressed, uint32_t now) {
    for(unsigned i=0;i<4;i++) {
      const uint8_t bit=uint8_t(1u<<i);
      if((pressed^candidate)&bit) {
        candidate^=bit; changedAt[i]=now;
      } else if(((stable^candidate)&bit) && uint32_t(now-changedAt[i])>=20) {
        stable^=bit;
        if(stable&bit) pending|=bit;
      }
    }
  }
  uint8_t take() { uint8_t result=stable|pending; pending=0; return result; }
  void discard() { pending=0; }
};
#endif
