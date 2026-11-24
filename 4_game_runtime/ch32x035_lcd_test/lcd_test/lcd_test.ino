// HT16C24A LCD bring-up on CH32X035. Flash over USB (I2C init turns SWD off).
//
// GPIO:
// PC16: USB D-
// PC17: USB D+
// PC18: I2C SDA
// PC19: I2C SCL
// VLCD: external through 1K to VDD (IVA DE=VE=DA=0)
//
// Init sequence (command `i` / ht16c24a_init):
//   1. Wait >=1 ms after power-on (setup delay(2))
//   2. Mode: 1/16 duty + 1/5 bias (0x82, 0x0A)
//   3. IVA: external VLCD, follower off (0x8A, 0x00)
//   4. Frame: 80 Hz (0x86, 0x00)
//   5. Blink off (0x88, 0x00)
//   6. Clear RAM (120 bytes @ 0x00)
//   7. System: osc + display on (0x84, 0x03)
//
// Serial @ 115200 (line-based; send CR/LF after each command):
//   h       help
//   p       probe addr 0x3D
//   i       run init sequence above
//   o / z   display on / off (osc stays on)
//   a / c   all pixels on / clear
//   m       checkerboard
//   C n     COM n only, all SEGs (n=0..15)
//   D n     COM n, even SEGs only (half load / RC)
//   S n     SEG n only, all COMs (n=0..47)
//   T n     SEG n, even COMs only (half load / RC)
//   b n     bias 0=1/3, 1=1/4, 2=1/5
//   v n     IVA control byte 0..63
//   r       dump first 8 RAM bytes
// Typical: p -> i -> a -> c -> C 0 / S 0; compare D/T vs C/S for RC.

#include <Arduino.h>
#include <SimpleUsbSerial.h>
#define PORT SerialUSB
#if !defined(SYSCLK_FREQ_48MHz_HSI)
#error "Select CH32X035 internal 48 MHz clock."
#endif
extern "C" {
#include "i2c.h"
#include "ht16c24a.h"
}

static void emit(const char *s) { while (*s) PORT.write((uint8_t)*s++); }
static void emit(uint32_t n, unsigned base=10) {
  char digits[32]; unsigned used=0;
  do { unsigned d=n%base; digits[used++]="0123456789ABCDEF"[d]; n/=base; } while(n);
  while(used) PORT.write((uint8_t)digits[--used]);
}
static void line() { emit("\n"); }
static void line(const char *s) { emit(s); line(); }
static void emitHex2(uint8_t v) { emit(v>>4,16); emit(v&15u,16); }

// Strong SysTick handler so archive linking does not pick the startup stub.
extern "C" {
extern volatile uint64_t msTick;
void osSystickHandler(void);
void SysTick_Handler(void) __attribute__((interrupt("WCH-Interrupt-fast")));
void SysTick_Handler(void) { ++msTick; osSystickHandler(); SysTick->SR=0; }
}

static const char *const i2cErrors[] = {"ok", "nack", "busy", "timeout"};
enum { LINE_MAX = 32 };
static char lineBuf[LINE_MAX];
static unsigned lineLen;

static void report(int result) {
  if (result < 0 || result > I2C_TIMEOUT) result = I2C_BUSY;
  emit(" result=");
  line(i2cErrors[result]);
  PORT.flush();
}

/* Parse an unsigned decimal starting at s; returns 1 on success. */
static int parseUint(const char *s, unsigned *out) {
  while (*s == ' ' || *s == '\t') s++;
  if (*s < '0' || *s > '9') return 0;
  unsigned value = 0;
  while (*s >= '0' && *s <= '9') {
    value = value * 10u + (unsigned)(*s - '0');
    s++;
  }
  while (*s == ' ' || *s == '\t') s++;
  if (*s != 0) return 0;
  *out = value;
  return 1;
}

static void help() {
  line("LCD test: p=probe i=init o=on z=off a=all-on c=clear m=checker");
  line("C n=COM-only D n=COM-half(even SEG) S n=SEG-only T n=SEG-half(even COM)");
  line("b n=bias(0=1/3,1=1/4,2=1/5) v n=IVA r=ram h=help");
  PORT.flush();
}

static void probe() {
  int result = i2c_probe(HT16C24A_ADDR);
  emit("ht16c24a=");
  emit(result == I2C_OK);
  emit(" addr=");
  emit(HT16C24A_ADDR, 16);
  uint8_t lines = i2c_lines();
  emit(" sda=");
  emit(lines & 1u);
  emit(" scl=");
  emit((lines >> 1) & 1u);
  report(result);
}

static void dumpRam() {
  uint8_t ram[8];
  int result = ht16c24a_read_ram(0, ram, sizeof ram);
  emit("ram00=");
  if (result == I2C_OK)
    for (unsigned i = 0; i < sizeof ram; i++) emitHex2(ram[i]);
  report(result);
}

static void handleLine(char *s) {
  while (*s == ' ' || *s == '\t') s++;
  if (!*s) return;
  char cmd = *s++;
  while (*s == ' ' || *s == '\t') s++;
  unsigned arg = 0;
  int result = I2C_OK;
  switch (cmd) {
  case 'h': help(); break;
  case 'p': probe(); break;
  case 'i':
    result = ht16c24a_init();
    emit("init");
    report(result);
    break;
  case 'o':
    result = ht16c24a_display(1);
    emit("on");
    report(result);
    break;
  case 'z':
    result = ht16c24a_display(0);
    emit("off");
    report(result);
    break;
  case 'a':
    result = ht16c24a_fill(0xFF);
    emit("all");
    report(result);
    break;
  case 'c':
    result = ht16c24a_fill(0);
    emit("clear");
    report(result);
    break;
  case 'm':
    result = ht16c24a_checkerboard();
    emit("checker");
    report(result);
    break;
  case 'C':
    if (!parseUint(s, &arg) || arg >= HT16C24A_COM_COUNT) {
      line("need C 0..15");
      PORT.flush();
      break;
    }
    result = ht16c24a_com_only(arg);
    emit("com=");
    emit(arg);
    report(result);
    break;
  case 'D':
    if (!parseUint(s, &arg) || arg >= HT16C24A_COM_COUNT) {
      line("need D 0..15");
      PORT.flush();
      break;
    }
    result = ht16c24a_com_half(arg);
    emit("com_half=");
    emit(arg);
    report(result);
    break;
  case 'S':
    if (!parseUint(s, &arg) || arg >= HT16C24A_SEG_COUNT) {
      line("need S 0..47");
      PORT.flush();
      break;
    }
    result = ht16c24a_seg_only(arg);
    emit("seg=");
    emit(arg);
    report(result);
    break;
  case 'T':
    if (!parseUint(s, &arg) || arg >= HT16C24A_SEG_COUNT) {
      line("need T 0..47");
      PORT.flush();
      break;
    }
    result = ht16c24a_seg_half(arg);
    emit("seg_half=");
    emit(arg);
    report(result);
    break;
  case 'b':
    if (!parseUint(s, &arg) || arg > 2u) {
      line("need b 0..2");
      PORT.flush();
      break;
    }
    result = ht16c24a_set_bias(arg);
    emit("bias=");
    emit(arg);
    report(result);
    break;
  case 'v':
    if (!parseUint(s, &arg) || arg > 63u) {
      line("need v 0..63");
      PORT.flush();
      break;
    }
    result = ht16c24a_set_iva((uint8_t)arg);
    emit("iva=");
    emit(arg);
    report(result);
    break;
  case 'r':
    dumpRam();
    break;
  default:
    break;
  }
}

void setup() {
  i2c_init();
  delay(2); /* Holtek: avoid I2C for 1 ms after power-on. */
  PORT.begin(115200);
  lineLen = 0;
  help();
}

void loop() {
  while (PORT.available()) {
    char c = PORT.read();
    if (c == '\r' || c == '\n') {
      if (!lineLen) continue; /* ignore bare CR/LF and CR+LF pairs */
      lineBuf[lineLen] = 0;
      handleLine(lineBuf);
      lineLen = 0;
      continue;
    }
    if (lineLen + 1 < LINE_MAX) lineBuf[lineLen++] = c;
  }
}
