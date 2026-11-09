#ifndef I2C_H
#define I2C_H
#include <stdint.h>
/* Polled I2C1 master, 100 kHz: SDA=PC18, SCL=PC19 (remap 011).
   i2c_init() disables SWD so those pins can carry I2C; flash over USB. */
enum { I2C_OK, I2C_NACK, I2C_BUSY, I2C_TIMEOUT };
void i2c_init(void);
/* Address-only write transfer: does a device acknowledge addr7? */
int i2c_probe(uint8_t addr7);
/* Pin levels: bit 0 = SDA (PC18), bit 1 = SCL (PC19). */
uint8_t i2c_lines(void);
#endif
