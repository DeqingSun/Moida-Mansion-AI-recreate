// Run build.py first to populate src/ from the canonical portable C core.
//
// Product (no USB CDC). Comment out for USB debug console, or use build.py --standalone.
#define MOIDA_STANDALONE 1
#ifndef MOIDA_STANDALONE
#define MOIDA_STANDALONE 0
#endif
#ifndef MOIDA_IDLE_SLEEP_MS
#define MOIDA_IDLE_SLEEP_MS 90000u
#endif
#ifndef MOIDA_WAKE_HOLD_MS
#define MOIDA_WAKE_HOLD_MS 2000u
#endif

// GPIO assignment:
// PA0: button stairs
// PA1: button search
// PA2: button left
// PA3: button right
// PC3: LED on board
// PC16: USB D-
// PC17: USB D+
// PC18: I2C SDA
// PC19: I2C SCL
// PB6: piezo -
// PB9: piezo +
// PB12: EN_DCDC for ME2107A33M5G

#include <Arduino.h>
#if !MOIDA_STANDALONE
#include <SimpleUsbSerial.h>
#define PORT SerialUSB
#endif
#include "buttons.h"
#if !defined(SYSCLK_FREQ_48MHz_HSI)
#error "Select CH32X035 internal 48 MHz clock."
#endif
extern "C" {
#include "src/moida_hal.h"
#include "piezo.h"
#include "i2c.h"
#include "ht16c24a.h"
#include "lcd_glass.h"
#include "power_sleep.h"
}
/* SysTick_Handler / USBFS_IRQHandler live in irq_handlers.c (Arduino .ino
   prototype injection must not touch them — it breaks overloads / attributes). */

#if !MOIDA_STANDALONE
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
#endif

#include "src/moida_lcd_lut.h"
static uint8_t lcdCells[16][6];
static bool lcdReady, lcdSuspend;
static int lcdResult;
static uint32_t lcdWriteUs, lcdWriteMaxUs;
static uint32_t lastActivityMs;
static uint32_t measurementMicros();
static void writeGlass() {
  if(!lcdReady || lcdSuspend)return;
  uint8_t ram[120];
  uint32_t start=measurementMicros();
  moida_glass_ram(lcdCells,ram);
  lcdResult=ht16c24a_write_ram(0,ram,sizeof ram);
  lcdWriteUs=measurementMicros()-start;
  if(lcdWriteUs>lcdWriteMaxUs)lcdWriteMaxUs=lcdWriteUs;
}
static void initGlass() {
  lcdResult=ht16c24a_init();lcdReady=lcdResult==I2C_OK;
  writeGlass();
}
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
static void noteActivity() { lastActivityMs = millis(); }
static void pollButtons() {
  const uint8_t pressed=uint8_t(~GPIOA->INDR)&0x0F;
  if(pressed) noteActivity();
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
  writeGlass();
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
  latest={}; for(unsigned c=0;c<16;c++)for(unsigned b=0;b<6;b++)lcdCells[c][b]=0; writeGlass(); physicalButtons.discard(); lastTick=millis();
}
static bool step(uint8_t buttons) {
  uint32_t start=measurementMicros();
  bool ok=moida_host_step(&host,buttons);
  uint32_t elapsed=measurementMicros()-start;
  if(elapsed>maxTickUs) maxTickUs=elapsed;
  if(ok) ticks++; else {ready=false; running=false;}
  return ok;
}
#if !MOIDA_STANDALONE
static void status() {
  emit("ready="); emit(ready);
  emit(" lcd_ready="); emit(lcdReady);
  emit(" lcd_result="); emit((uint32_t)lcdResult);
  emit(" lcd_write_us="); emit(lcdWriteUs);
  emit(" lcd_write_max_us="); emit(lcdWriteMaxUs);
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
  lcdSuspend=true; // Deterministic CPU benchmark: do not queue 1000 I2C frames.
  running=false; piezo_stop(); soundOn=false; resetGame();
  for(unsigned i=0;i<1000 && ready;i++) {
    uint8_t b=(i%23==0)?(1u<<((i/23)%4)):0;
    if(!step(b)) break;
  }
  soundOn=previousSound; lcdSuspend=false; writeGlass();
  emit(ready && ticks==1000 && digest==MOIDA_EXPECTED_HASH && lcdHash==MOIDA_EXPECTED_LCD_HASH ? "PASS " : "FAIL ");
  emit("expected="); line(MOIDA_EXPECTED_HASH,HEX);
  status(); // Test leaves its final state paused. 'r' starts a fresh game.
}
static void emitHex2(uint8_t v) { emit(v>>4,HEX); emit(v&15u,HEX); }
// Display RAM is the HT16C24A's only readable state; command settings are write-only.
static int readLcdRam(uint8_t address, uint8_t *data, unsigned count) {
  const uint8_t setPointer[]={0x80,address};
  return i2c_write_read(HT16C24A_ADDR,setPointer,2,data,count);
}
static int writeLcdRam(uint8_t address, uint8_t value) {
  const uint8_t write[]={0x80,address,value};
  return i2c_write(HT16C24A_ADDR,write,3);
}
// Write/read back two patterns at RAM 00, then restore it. The display is off
// after power-on, so this is invisible on the glass.
static int lcdRamReadback(uint8_t original) {
  static const uint8_t patterns[]={0x55,0xAA};
  int result=I2C_OK;
  uint8_t readBack=0;
  unsigned i;
  for(i=0;i<2 && result==I2C_OK;i++) {
    result=writeLcdRam(0,patterns[i]);
    if(result==I2C_OK) result=readLcdRam(0,&readBack,1);
    if(result==I2C_OK && readBack!=patterns[i]) break;
  }
  int restore=writeLcdRam(0,original);
  if(result!=I2C_OK) return result;
  if(i<2){ emit(" ram_rw=fail wrote="); emitHex2(patterns[i]); emit(" read="); emitHex2(readBack); }
  else emit(" ram_rw=ok");
  return restore;
}
static void probeLcdDriver() {
  static const char *const errors[]={"","nack","busy","timeout"};
  int result=i2c_probe(HT16C24A_ADDR);
  emit("ht16c24a="); emit(result==I2C_OK);
  emit(" addr="); emit(HT16C24A_ADDR,HEX);
  if(result==I2C_OK) {
    uint8_t ram[8];
    result=readLcdRam(0,ram,sizeof ram);
    if(result==I2C_OK) {
      emit(" ram00=");
      for(unsigned i=0;i<sizeof ram;i++) emitHex2(ram[i]);
      result=lcdRamReadback(ram[0]);
    }
  }
  if(result!=I2C_OK){ emit(" err="); emit(errors[result]); }
  uint8_t lines=i2c_lines();
  emit(" sda="); emit(lines&1u);
  emit(" scl="); line((lines>>1)&1u);
  PORT.flush();
}
static void help() {
  line("Moida C test: t=self-test, r=reset/run, p=pause/resume, i=stats, d=display");
  line("a=left, f=right, w=stairs, s=search; b=piezo test tone; m=mute, u=unmute");
  line("L=LCD init/retry; l=HT16C24A probe + RAM read/write test (I2C SDA=PC18, SCL=PC19); h=help");
  PORT.flush();
}
#endif

static void enterIdleSleep() {
  running = false;
  piezo_stop();
  if (lcdReady) ht16c24a_standby();
  power_enter_deep_sleep(MOIDA_WAKE_HOLD_MS);
}

void setup() {
  dcdc_init();
  dcdc_on();
  // PA0..PA3 input pull-up (WCH GPIO_Mode_IPU = 0x48).
  // Direct access avoids linking Arduino's general pin/peripheral dispatch.
  piezo_init();
  i2c_init();
  delay(2);
  initGlass();
#if !MOIDA_STANDALONE
  PORT.begin(115200);
#endif
  RCC->APB2PCENR |= RCC_IOPAEN;
  (void)RCC->APB2PCENR; // Read back the clock enable before accessing GPIO.
  GPIOA->CFGLR = (GPIOA->CFGLR & ~0xFFFFu) | 0x8888u;
  // Select pull-up after configuring input mode. Explicit OUTDR avoids the
  // ineffective early BSHR write observed on the board (OUTDR stayed zero).
  GPIOA->OUTDR |= 0x0Fu;
  resetGame(); running=ready;
  noteActivity();
#if !MOIDA_STANDALONE
  // No wait-for-terminal: send h/i/t after opening it.
  help(); status();
#endif
}
void loop() {
  pollButtons();
#if !MOIDA_STANDALONE
  if(PORT.available()) {
    noteActivity();
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
    case 'l': probeLcdDriver(); break;
    case 'L': initGlass(); status(); break;
    case 'a': nextButtons=MOIDA_BUTTON_LEFT; break;
    case 'f': nextButtons=MOIDA_BUTTON_RIGHT; break;
    case 'w': nextButtons=MOIDA_BUTTON_STAIRS; break;
    case 's': nextButtons=MOIDA_BUTTON_SEARCH; break;
    case 'd':
      for(unsigned i=0;i<20;i++){emit(latest.display.data[i],HEX);emit(" ");}
      line(); PORT.flush(); break;
    }
  }
#endif
  if(running && uint32_t(millis()-lastTick)>=MOIDA_TICK_MS) {
    lastTick=millis(); step(nextButtons|physicalButtons.take()); nextButtons=0;
  }
  if(uint32_t(millis()-lastActivityMs)>=MOIDA_IDLE_SLEEP_MS) enterIdleSleep();
}
