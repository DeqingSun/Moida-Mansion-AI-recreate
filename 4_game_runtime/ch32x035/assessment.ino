// Resource measurement harness only. Not hardware-tested firmware.
// Define ASSESS_USB to include the installed SimpleUsbSerial backend.
#include <Arduino.h>
#ifdef ASSESS_USB
#include <SimpleUsbSerial.h>
#endif
extern "C" {
#include "moida_hal.h"
}
static MoidaHost host;
volatile uint32_t output_checksum;
volatile uint8_t input_buttons;
static uint32_t clock_ms(void*) { return millis(); }
static uint8_t buttons(void*) {
#ifdef ASSESS_USB
  if (SerialUSB.available()) input_buttons = SerialUSB.read() & 15;
#endif
  return input_buttons;
}
static void present(void*, const MoidaFrame *f) {
  const unsigned char *p = (const unsigned char *)f;
  for (unsigned i=0;i<sizeof(*f);i++) {
    output_checksum ^= p[i]; // Retain all frame outputs during optimization.
#ifdef ASSESS_USB
    SerialUSB.write(p[i]); // Exercise TX linkage; not a portable wire protocol.
#endif
  }
}
void setup() {
#ifdef ASSESS_USB
  SerialUSB.begin(115200);
#endif
  MoidaHal hal = {nullptr,clock_ms,buttons,present};
  moida_host_init(&host,1700000000000LL,&hal);
}
void loop() { moida_host_poll(&host); }
