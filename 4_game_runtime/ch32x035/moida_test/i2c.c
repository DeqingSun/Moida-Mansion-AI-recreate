#include "i2c.h"
#include "ch32x035.h"

/* The header's AFIO_PCFR1_* macros follow the V30x layout; these follow the X035 RM. */
#define PCFR1_I2C1_RM_MASK (7u << 2)
#define PCFR1_I2C1_RM_011  (3u << 2)  /* SCL/PC19, SDA/PC18 */
#define PCFR1_SW_CFG_MASK  (7u << 24)
#define PCFR1_SW_CFG_OFF   (4u << 24) /* SWD off: PC18/PC19 become ordinary pins */
#define I2C_BUS_MHZ 48u
#define I2C_CCR_100KHZ (I2C_BUS_MHZ * 1000000u / (2u * 100000u))
/* Several milliseconds at 48 MHz; a 100 kHz address byte takes about 90 us. */
#define I2C_SPIN 20000u

static void i2c_reset(void) {
  I2C1->CTLR1 = I2C_CTLR1_SWRST;
  I2C1->CTLR1 = 0;
  I2C1->CTLR2 = I2C_BUS_MHZ;
  I2C1->CKCFGR = I2C_CCR_100KHZ;
  I2C1->CTLR1 = I2C_CTLR1_PE;
}

void i2c_init(void) {
  RCC->APB2PCENR |= RCC_AFIOEN | RCC_IOPCEN;
  RCC->APB1PCENR |= RCC_I2C1EN;
  AFIO->PCFR1 = (AFIO->PCFR1 & ~(PCFR1_I2C1_RM_MASK | PCFR1_SW_CFG_MASK))
              | PCFR1_I2C1_RM_011 | PCFR1_SW_CFG_OFF;
  GPIOC->CFGXR = (GPIOC->CFGXR & ~(0xFFu << 8)) | (0xBBu << 8); /* PC18, PC19 AF (I2C open-drain) */
  i2c_reset();
}

static int wait_star1(uint16_t bit) {
  for (uint32_t i = 0; i < I2C_SPIN; i++) if (I2C1->STAR1 & bit) return 1;
  return 0;
}

int i2c_probe(uint8_t addr7) {
  uint32_t i;
  for (i = 0; i < I2C_SPIN && (I2C1->STAR2 & I2C_STAR2_BUSY); i++) {}
  if (i == I2C_SPIN) { i2c_reset(); return I2C_BUSY; }
  int result = I2C_TIMEOUT;
  I2C1->CTLR1 |= I2C_CTLR1_START;
  if (wait_star1(I2C_STAR1_SB)) {
    (void)I2C1->STAR1;
    I2C1->DATAR = (uint16_t)(addr7 << 1);
    for (i = 0; i < I2C_SPIN; i++) {
      uint16_t status = I2C1->STAR1;
      if (status & I2C_STAR1_ADDR) { (void)I2C1->STAR2; result = I2C_OK; break; }
      if (status & I2C_STAR1_AF) { I2C1->STAR1 = (uint16_t)~I2C_STAR1_AF; result = I2C_NACK; break; }
      if (status & (I2C_STAR1_ARLO | I2C_STAR1_BERR)) { result = I2C_BUSY; break; }
    }
  }
  I2C1->CTLR1 |= I2C_CTLR1_STOP;
  for (i = 0; i < I2C_SPIN && (I2C1->CTLR1 & I2C_CTLR1_STOP); i++) {}
  if (result == I2C_TIMEOUT || result == I2C_BUSY || i == I2C_SPIN) i2c_reset();
  return result;
}

uint8_t i2c_lines(void) {
  return (uint8_t)((GPIOC->INDR >> 18) & 3u);
}
