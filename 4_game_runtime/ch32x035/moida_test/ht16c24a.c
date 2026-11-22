#include "ht16c24a.h"
#include "i2c.h"

/* Command bytes from Holtek HT16C24A datasheet. */
#define CMD_RAM   0x80u
#define CMD_MODE  0x82u
#define CMD_SYS   0x84u
#define CMD_FRAME 0x86u
#define CMD_BLINK 0x88u
#define CMD_IVA   0x8Au

/* 1/16 duty (Duty1=1) + 1/5 bias (Bias1=1) => 0b00001010. */
#define MODE_1_16_1_5 0x0Au
/* Oscillator / display: standby = both off (ISTB). */
#define SYS_STANDBY      0x00u
#define SYS_OSC_ON       0x02u
#define SYS_OSC_DISPLAY  0x03u
/* External VLCD via 1K to VDD: DE=0 VE=0 DA=0000, follower off. */
#define IVA_EXT_VLCD 0x00u

static uint8_t mode_byte = MODE_1_16_1_5;
static uint8_t iva_byte = IVA_EXT_VLCD;

int ht16c24a_cmd(uint8_t command, uint8_t setting) {
  uint8_t packet[2] = {command, setting};
  return i2c_write(HT16C24A_ADDR, packet, 2);
}

int ht16c24a_write_ram(uint8_t address, const uint8_t *data, unsigned count) {
  /* Page write: 0x80, pointer, then data. Cap at full 1/16 RAM window. */
  uint8_t packet[2 + HT16C24A_RAM_BYTES];
  if (count > HT16C24A_RAM_BYTES) return I2C_BUSY;
  packet[0] = CMD_RAM;
  packet[1] = address & 0x7Fu;
  for (unsigned i = 0; i < count; i++) packet[2 + i] = data[i];
  return i2c_write(HT16C24A_ADDR, packet, 2 + count);
}

int ht16c24a_read_ram(uint8_t address, uint8_t *data, unsigned count) {
  uint8_t set_pointer[2] = {CMD_RAM, address & 0x7Fu};
  return i2c_write_read(HT16C24A_ADDR, set_pointer, 2, data, count);
}

int ht16c24a_set_bias(unsigned bias_index) {
  /* Duty1 stays set; Bias1:Bias0 select 1/3, 1/4, or 1/5. */
  static const uint8_t bias_bits[] = {0x00u, 0x01u, 0x04u};
  if (bias_index > 2u) return I2C_BUSY;
  mode_byte = (uint8_t)(0x08u | bias_bits[bias_index]);
  return ht16c24a_cmd(CMD_MODE, mode_byte);
}

int ht16c24a_set_iva(uint8_t control) {
  iva_byte = (uint8_t)(control & 0x3Fu);
  return ht16c24a_cmd(CMD_IVA, iva_byte);
}

int ht16c24a_display(int on) {
  return ht16c24a_cmd(CMD_SYS, on ? SYS_OSC_DISPLAY : SYS_OSC_ON);
}

int ht16c24a_standby(void) {
  return ht16c24a_cmd(CMD_SYS, SYS_STANDBY);
}

int ht16c24a_fill(uint8_t value) {
  uint8_t ram[HT16C24A_RAM_BYTES];
  for (unsigned i = 0; i < HT16C24A_RAM_BYTES; i++) ram[i] = value;
  return ht16c24a_write_ram(0, ram, HT16C24A_RAM_BYTES);
}

int ht16c24a_checkerboard(void) {
  uint8_t ram[HT16C24A_RAM_BYTES];
  /* Alternate COM bits: even COM on in low nibble pattern across the matrix. */
  for (unsigned i = 0; i < HT16C24A_RAM_BYTES; i++)
    ram[i] = (i & 1u) ? 0xAAu : 0x55u;
  return ht16c24a_write_ram(0, ram, HT16C24A_RAM_BYTES);
}

int ht16c24a_com_only(unsigned com) {
  uint8_t ram[HT16C24A_RAM_BYTES];
  if (com >= HT16C24A_COM_COUNT) return I2C_BUSY;
  for (unsigned i = 0; i < HT16C24A_RAM_BYTES; i++) ram[i] = 0;
  /* Logical SEG s -> driver SEG12+s at addresses 2*s / 2*s+1. */
  for (unsigned s = 0; s < HT16C24A_SEG_COUNT; s++) {
    unsigned addr = 2u * s + (com >= 8u ? 1u : 0u);
    ram[addr] = (uint8_t)(1u << (com & 7u));
  }
  return ht16c24a_write_ram(0, ram, HT16C24A_RAM_BYTES);
}

int ht16c24a_seg_only(unsigned seg) {
  uint8_t ram[HT16C24A_RAM_BYTES];
  if (seg >= HT16C24A_SEG_COUNT) return I2C_BUSY;
  for (unsigned i = 0; i < HT16C24A_RAM_BYTES; i++) ram[i] = 0;
  ram[2u * seg] = 0xFFu;
  ram[2u * seg + 1u] = 0xFFu;
  return ht16c24a_write_ram(0, ram, HT16C24A_RAM_BYTES);
}

int ht16c24a_init(void) {
  int result;
  mode_byte = MODE_1_16_1_5;
  iva_byte = IVA_EXT_VLCD;
  if ((result = ht16c24a_cmd(CMD_MODE, mode_byte)) != I2C_OK) return result;
  if ((result = ht16c24a_cmd(CMD_IVA, iva_byte)) != I2C_OK) return result;
  if ((result = ht16c24a_cmd(CMD_FRAME, 0x00u)) != I2C_OK) return result; /* 80 Hz */
  if ((result = ht16c24a_cmd(CMD_BLINK, 0x00u)) != I2C_OK) return result;
  if ((result = ht16c24a_fill(0)) != I2C_OK) return result;
  return ht16c24a_cmd(CMD_SYS, SYS_OSC_DISPLAY);
}
