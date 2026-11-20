#ifndef HT16C24A_H
#define HT16C24A_H
#include <stdint.h>
/* HT16C24A at 0x3D, 1/16 duty drive for a 16 COM x 48 SEG glass.
   Logical SEG0..47 map to driver SEG12..SEG59 (RAM 0x00..0x5F).
   Each SEG uses two bytes: even=COM0..7 as D0..D7, odd=COM8..15. */
enum { HT16C24A_ADDR = 0x3D };
enum { HT16C24A_COM_COUNT = 16, HT16C24A_SEG_COUNT = 48 };
enum { HT16C24A_RAM_BYTES = 120 }; /* 0x00..0x77 in 1/16 mode */

/* Bias index for ht16c24a_set_bias: 0=1/3, 1=1/4, 2=1/5. Duty stays 1/16. */
int ht16c24a_cmd(uint8_t command, uint8_t setting);
int ht16c24a_init(void);
int ht16c24a_display(int on); /* osc stays on; on=0 blanks the glass */
int ht16c24a_set_bias(unsigned bias_index);
int ht16c24a_set_iva(uint8_t control); /* DE/VE/DA packed in low 6 bits */
int ht16c24a_write_ram(uint8_t address, const uint8_t *data, unsigned count);
int ht16c24a_read_ram(uint8_t address, uint8_t *data, unsigned count);
int ht16c24a_fill(uint8_t value);
int ht16c24a_checkerboard(void);
int ht16c24a_com_only(unsigned com); /* 0..15, all SEGs */
int ht16c24a_seg_only(unsigned seg); /* 0..47, all COMs */
#endif
