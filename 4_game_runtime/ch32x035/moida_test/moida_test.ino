// Run build.py first to populate src/ from the canonical portable C core.
#include <Arduino.h>
#include <SimpleUsbSerial.h>
#include "buttons.h"
#define PORT SerialUSB
#if !defined(SYSCLK_FREQ_48MHz_HSI)
#error "Select CH32X035 internal 48 MHz clock."
#endif
extern "C" {
#include "src/moida_hal.h"
#include "piezo.h"
}
#include "src/expected.h"
// Small integer-only reporting avoids Arduino Print's general number formatter.
static void emit(const char *s) { while (*s) PORT.write((uint8_t)*s++); }
static void emit(uint32_t n, unsigned base=10) {
  char digits[32]; unsigned used=0;
  do { unsigned d=n%base; digits[used++]="0123456789ABCDEF"[d]; n/=base; } while(n);
  while(used) PORT.write((uint8_t)digits[--used]);
}
static void line() { emit("\n"); }
static void line(const char *s) { emit(s); line(); }
static void line(uint32_t n, unsigned base=10) { emit(n,base); line(); }
// Explicit strong handler: startup and Arduino both supply weak handlers, so
// archive linking otherwise selects startup's infinite-loop default.
extern "C" {
extern volatile uint64_t msTick;
void osSystickHandler(void);
void SysTick_Handler(void) __attribute__((interrupt("WCH-Interrupt-fast")));
void SysTick_Handler(void) { ++msTick; osSystickHandler(); piezo_tick_1ms(); SysTick->SR=0; }
}
#include "src/moida_lcd_lut.h"
static uint8_t lcdCells[16][6];
static uint32_t lcdMaxUs, lcdLastUs, lcdHash;
static uint32_t measurementMicros();
static MoidaHost host;
static MoidaFrame latest;
static uint32_t digest, ticks, maxTickUs, initUs, lastTick;
static bool ready, running, soundOn=true;
static uint8_t nextButtons;
static PhysicalButtons physicalButtons;
static_assert(MOIDA_BUTTON_STAIRS==1 && MOIDA_BUTTON_SEARCH==2 &&
              MOIDA_BUTTON_LEFT==4 && MOIDA_BUTTON_RIGHT==8, "Button mapping changed");
static void pollButtons() {
  const uint8_t pressed=uint8_t(~GPIOA->INDR)&0x0F;
  physicalButtons.update(pressed,millis());
  if(!running) physicalButtons.discard();
}
static void present(void*, const MoidaFrame *f) {
  latest = *f;
  uint32_t mapStart=measurementMicros();
  moida_lcd_map(f->display.data,lcdCells);
  lcdLastUs=measurementMicros()-mapStart;
  if(lcdLastUs>lcdMaxUs)lcdMaxUs=lcdLastUs;
  // Consume every mapped byte so LTO must retain the actual conversion.
  // Hashing is outside the measured mapping interval.
  for(unsigned c=0;c<16;c++)for(unsigned b=0;b<6;b++){
    lcdHash^=lcdCells[c][b];lcdHash*=16777619u;
  }
  if(soundOn && f->beeper_duration_ms) piezo_play(f->beeper_hz, f->beeper_duration_ms);
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
  digest=2166136261u; lcdHash=2166136261u; lcdLastUs=lcdMaxUs=0; ticks=0; maxTickUs=0; nextButtons=0;
  latest={}; physicalButtons.discard(); lastTick=millis();
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
  emit("ready="); emit(ready);
  emit(" sound="); emit(soundOn);
  emit(" running="); emit(running);
  emit(" gpio_pressed="); emit(uint32_t(~GPIOA->INDR)&15);
  emit(" buttons_stable="); emit(physicalButtons.stable);
  emit(" game_buttons="); emit(host.game.previous_buttons);
  emit(" game_stage="); emit(host.game.stage);
  emit(" gpio_config="); emit(GPIOA->CFGLR&0xFFFFu,HEX);
  emit(" gpio_pullup="); emit(GPIOA->OUTDR&15);
  emit(" clock_hz="); emit(SystemCoreClock);
  emit(" host_bytes="); emit(sizeof(host));
  emit(" init_us="); emit(initUs);
  emit(" ticks="); emit(ticks);
  emit(" max_tick_us="); emit(maxTickUs);
  emit(" lut_last_us="); emit(lcdLastUs);
  emit(" lut_max_us="); emit(lcdMaxUs);
  emit(" lut_hash="); emit(lcdHash,HEX);
  emit(" frame_hash="); line(digest,HEX);
  PORT.flush(); // Submit the final partial USB packet, including self-test output.
}
static void selfTest() {
  bool previousSound=soundOn;
  running=false; piezo_stop(); soundOn=false; resetGame();
  for(unsigned i=0;i<1000 && ready;i++) {
    uint8_t b=(i%23==0)?(1u<<((i/23)%4)):0;
    if(!step(b)) break;
  }
  soundOn=previousSound;
  emit(ready && ticks==1000 && digest==MOIDA_EXPECTED_HASH && lcdHash==MOIDA_EXPECTED_LCD_HASH ? "PASS " : "FAIL ");
  emit("expected="); line(MOIDA_EXPECTED_HASH,HEX);
  status(); // Test leaves its final state paused. 'r' starts a fresh game.
}
static void help() {
  line("Moida C test: t=self-test, r=reset/run, p=pause/resume, i=stats, d=display");
  line("a=left, f=right, w=stairs, s=search; b=piezo test tone; m=mute, u=unmute; h=help");
  PORT.flush();
}
void setup() {
  // PA0..PA3 input pull-up (WCH GPIO_Mode_IPU = 0x48).
  // Direct access avoids linking Arduino's general pin/peripheral dispatch.
  piezo_init();
  PORT.begin(115200);
  RCC->APB2PCENR |= RCC_IOPAEN;
  (void)RCC->APB2PCENR; // Read back the clock enable before accessing GPIO.
  GPIOA->CFGLR = (GPIOA->CFGLR & ~0xFFFFu) | 0x8888u;
  // Select pull-up after configuring input mode. Explicit OUTDR avoids the
  // ineffective early BSHR write observed on the board (OUTDR stayed zero).
  GPIOA->OUTDR |= 0x0Fu;
  resetGame(); running=false;
  // No wait-for-terminal: send h/i/t after opening it.
  help(); status();
}
void loop() {
  pollButtons();
  if(PORT.available()) {
    char c=PORT.read();
    switch(c) {
    case 'h': help(); break;
    case 'i': status(); break;
    case 't': selfTest(); break;
    case 'r': piezo_stop(); resetGame(); running=ready; status(); break;
    case 'p': piezo_stop(); running=ready&&!running; lastTick=millis(); status(); break;
    case 'm': soundOn=false; piezo_stop(); status(); break;
    case 'u': soundOn=true; status(); break;
    case 'b': if(soundOn) piezo_play(440,500); break;
    case 'a': nextButtons=MOIDA_BUTTON_LEFT; break;
    case 'f': nextButtons=MOIDA_BUTTON_RIGHT; break;
    case 'w': nextButtons=MOIDA_BUTTON_STAIRS; break;
    case 's': nextButtons=MOIDA_BUTTON_SEARCH; break;
    case 'd':
      for(unsigned i=0;i<20;i++){emit(latest.display.data[i],HEX);emit(" ");}
      line(); PORT.flush(); break;
    }
  }
  if(running && uint32_t(millis()-lastTick)>=MOIDA_TICK_MS) {
    lastTick=millis(); step(nextButtons|physicalButtons.take()); nextButtons=0;
  }
}
