#include <cassert>
#include "moida_test/buttons.h"
int main() {
  PhysicalButtons b;
  b.update(1,0); b.update(0,5); b.update(1,10); b.update(1,29);
  assert(b.take()==0); // Bounce does not generate an input.
  b.update(1,30); assert(b.take()==1); assert(b.take()==1); // Held.
  b.update(0,31); b.update(0,51); assert(b.take()==0);
  b.update(4,60); b.update(4,80); b.update(0,81); b.update(0,101);
  assert(b.take()==4); assert(b.take()==0); // Short tap survives release.
  b.update(10,110); b.update(10,130); assert(b.take()==10); // Independent pins.
  b.update(0,140); b.update(0,160); b.discard(); assert(b.take()==0);
  PhysicalButtons wrap;
  wrap.update(2,UINT32_MAX-10); wrap.update(2,9); assert(wrap.take()==2);
}
