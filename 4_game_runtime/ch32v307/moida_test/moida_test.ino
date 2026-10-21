// Run build.py first to populate src/ from the canonical portable C core.
#include <Arduino.h>
#include <SimpleUsbSerial.h>
#define PORT SerialUSB
#if !defined(SYSCLK_FREQ_144MHz_HSE)
#error "Select 144 MHz external clock with an 8 MHz crystal."
#endif
static_assert(HSE_VALUE == 8000000, "USB configuration requires an 8 MHz crystal.");
extern "C" {
#include "src/moida_hal.h"
}
#include "src/expected.h"
static MoidaHost host;
static MoidaFrame latest;
static uint32_t digest, ticks, maxTickUs, initUs, lastTick;
static bool ready, running;
static uint8_t nextButtons;
static void present(void*, const MoidaFrame *f) {
  latest = *f;
  // Canonical byte order; no struct padding or floating-point representation.
  for (unsigned i=0;i<20;i++) for (unsigned b=0;b<4;b++) {
    digest ^= (f->display.data[i] >> (8*b)) & 255;
    digest *= 16777619u;
  }
}
// Local workaround for WCH 26.1.1 getCurrentMicros(): SysTick counts UP.
// Main-loop only, with interrupts enabled. Retry across rollover/pending ISR
// so the millisecond epoch and fractional count belong to the same period.
static uint32_t measurementMicros() {
  for (;;) {
    uint32_t ms = millis();
    uint32_t count = (uint32_t)SysTick->CNT;
    uint32_t pending = SysTick->SR;
    uint32_t after = millis();
    uint32_t period = (uint32_t)SysTick->CMP + 1u;
    if (ms == after && !(pending & 1u) && count < period)
      return ms * 1000u + (uint32_t)((uint64_t)count * 1000u / period);
  }
}
static void resetGame() {
  MoidaHal hal = {nullptr,nullptr,nullptr,present};
  uint32_t start = measurementMicros();
  ready = moida_host_init(&host,1700000000000LL,&hal);
  initUs = measurementMicros()-start;
  digest=2166136261u; ticks=0; maxTickUs=0; nextButtons=0;
  latest={}; lastTick=millis();
}
static bool step(uint8_t buttons) {
  uint32_t start=measurementMicros();
  bool ok=moida_host_step(&host,buttons);
  uint32_t elapsed=measurementMicros()-start;
  if(elapsed>maxTickUs) maxTickUs=elapsed;
  if(ok) ticks++; else {ready=false; running=false;}
  return ok;
}
static void status() {
  PORT.print("ready="); PORT.print(ready);
  PORT.print(" clock_hz="); PORT.print(SystemCoreClock);
  PORT.print(" host_bytes="); PORT.print(sizeof(host));
  PORT.print(" init_us="); PORT.print(initUs);
  PORT.print(" ticks="); PORT.print(ticks);
  PORT.print(" max_tick_us="); PORT.print(maxTickUs);
  PORT.print(" frame_hash="); PORT.println(digest,HEX);
  PORT.flush(); // Submit the final partial USB packet, including self-test output.
}
static void selfTest() {
  running=false; resetGame();
  for(unsigned i=0;i<1000 && ready;i++) {
    uint8_t b=(i%23==0)?(1u<<((i/23)%4)):0;
    if(!step(b)) break;
  }
  PORT.print(ready && ticks==1000 && digest==MOIDA_EXPECTED_HASH ? "PASS " : "FAIL ");
  PORT.print("expected="); PORT.println(MOIDA_EXPECTED_HASH,HEX);
  status(); // Test leaves its final state paused. 'r' starts a fresh game.
}
static void help() {
  PORT.println("Moida C test: t=self-test, r=reset/run, p=pause/resume, i=stats, d=display");
  PORT.println("a=left, f=right, w=stairs, s=search; h=help");
  PORT.flush();
}
void setup() {
  PORT.begin(115200);
  resetGame(); running=false;
  // No wait-for-terminal: send h/i/t after opening it.
  help(); status();
}
void loop() {
  if(PORT.available()) {
    char c=PORT.read();
    switch(c) {
    case 'h': help(); break;
    case 'i': status(); break;
    case 't': selfTest(); break;
    case 'r': resetGame(); running=ready; status(); break;
    case 'p': running=ready&&!running; lastTick=millis(); status(); break;
    case 'a': nextButtons=MOIDA_BUTTON_LEFT; break;
    case 'f': nextButtons=MOIDA_BUTTON_RIGHT; break;
    case 'w': nextButtons=MOIDA_BUTTON_STAIRS; break;
    case 's': nextButtons=MOIDA_BUTTON_SEARCH; break;
    case 'd':
      for(unsigned i=0;i<20;i++){PORT.print(latest.display.data[i],HEX);PORT.print(' ');}
      PORT.println(); PORT.flush(); break;
    }
  }
  if(running && uint32_t(millis()-lastTick)>=MOIDA_TICK_MS) {
    lastTick=millis(); step(nextButtons); nextButtons=0;
  }
}
