#include "i2c.h"
#include "ch32x035.h"

/* The header's AFIO_PCFR1_* macros follow the V30x layout; these follow the X035 RM. */
#define PCFR1_I2C1_RM_MASK (7u << 2)
#define PCFR1_I2C1_RM_011  (3u << 2)  /* SCL/PC19, SDA/PC18 */
#define PCFR1_SW_CFG_MASK  (7u << 24)
#define PCFR1_SW_CFG_OFF   (4u << 24) /* SWD off: PC18/PC19 become ordinary pins */
#define I2C_BUS_MHZ 48u
#define I2C_CCR_100KHZ (I2C_BUS_MHZ * 1000000u / (2u * 100000u))
/* Several milliseconds at 48 MHz; a 100 kHz byte takes about 90 us. */
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

/* Wait for any STAR1 bit in `want`; a NACK or bus error ends the wait early. */
static int wait_star1(uint16_t want) {
  for (uint32_t i = 0; i < I2C_SPIN; i++) {
    uint16_t status = I2C1->STAR1;
    if (status & I2C_STAR1_AF) { I2C1->STAR1 = (uint16_t)~I2C_STAR1_AF; return I2C_NACK; }
    if (status & (I2C_STAR1_ARLO | I2C_STAR1_BERR)) return I2C_BUSY;
    if (status & want) return I2C_OK;
  }
  return I2C_TIMEOUT;
}

/* START (or repeated START) plus address byte; ADDR is left set for the caller. */
static int start(uint8_t address_byte) {
  I2C1->CTLR1 |= I2C_CTLR1_START;
  int result = wait_star1(I2C_STAR1_SB);
  if (result != I2C_OK) return result;
  (void)I2C1->STAR1;
  I2C1->DATAR = address_byte;
  return wait_star1(I2C_STAR1_ADDR);
}

static int finish(int result) {
  uint32_t i;
  I2C1->CTLR1 &= (uint16_t)~I2C_CTLR1_ACK;
  if (I2C1->STAR2 & I2C_STAR2_MSL) I2C1->CTLR1 |= I2C_CTLR1_STOP;
  for (i = 0; i < I2C_SPIN && (I2C1->CTLR1 & I2C_CTLR1_STOP); i++) {}
  if (result == I2C_TIMEOUT || result == I2C_BUSY || i == I2C_SPIN) i2c_reset();
  return result;
}

static int bus_idle(void) {
  for (uint32_t i = 0; i < I2C_SPIN; i++) if (!(I2C1->STAR2 & I2C_STAR2_BUSY)) return 1;
  i2c_reset();
  return 0;
}

static int send(const uint8_t *data, unsigned count) {
  for (unsigned i = 0; i < count; i++) {
    int result = wait_star1(I2C_STAR1_TXE);
    if (result != I2C_OK) return result;
    I2C1->DATAR = data[i];
  }
  return count ? wait_star1(I2C_STAR1_BTF) : I2C_OK;
}

int i2c_write(uint8_t addr7, const uint8_t *data, unsigned count) {
  if (!bus_idle()) return I2C_BUSY;
  int result = start((uint8_t)(addr7 << 1));
  if (result == I2C_OK) {
    (void)I2C1->STAR2;
    result = send(data, count);
  }
  return finish(result);
}

int i2c_probe(uint8_t addr7) {
  return i2c_write(addr7, 0, 0);
}

int i2c_write_read(uint8_t addr7, const uint8_t *tx, unsigned tx_count,
                   uint8_t *rx, unsigned rx_count) {
  if (!rx_count) return i2c_write(addr7, tx, tx_count);
  if (!bus_idle()) return I2C_BUSY;
  int result = start((uint8_t)(addr7 << 1));
  if (result != I2C_OK) return finish(result);
  (void)I2C1->STAR2;
  if ((result = send(tx, tx_count)) != I2C_OK) return finish(result);
  if ((result = start((uint8_t)(addr7 << 1 | 1u))) != I2C_OK) return finish(result);
  if (rx_count == 1) {
    /* NACK and STOP must be queued before the single byte finishes shifting in. */
    __disable_irq();
    I2C1->CTLR1 &= (uint16_t)~I2C_CTLR1_ACK;
    (void)I2C1->STAR2;
    I2C1->CTLR1 |= I2C_CTLR1_STOP;
    __enable_irq();
    if ((result = wait_star1(I2C_STAR1_RXNE)) == I2C_OK) rx[0] = (uint8_t)I2C1->DATAR;
    return finish(result);
  }
  I2C1->CTLR1 |= I2C_CTLR1_ACK;
  (void)I2C1->STAR2;
  for (unsigned i = 0; i + 2 < rx_count; i++) {
    if ((result = wait_star1(I2C_STAR1_RXNE)) != I2C_OK) return finish(result);
    rx[i] = (uint8_t)I2C1->DATAR;
  }
  if ((result = wait_star1(I2C_STAR1_RXNE)) != I2C_OK) return finish(result);
  /* The final byte is already shifting in: NACK it and queue STOP before it ends. */
  __disable_irq();
  I2C1->CTLR1 = (uint16_t)((I2C1->CTLR1 & ~I2C_CTLR1_ACK) | I2C_CTLR1_STOP);
  rx[rx_count - 2] = (uint8_t)I2C1->DATAR;
  __enable_irq();
  if ((result = wait_star1(I2C_STAR1_RXNE)) == I2C_OK) rx[rx_count - 1] = (uint8_t)I2C1->DATAR;
  return finish(result);
}

uint8_t i2c_lines(void) {
  return (uint8_t)((GPIOC->INDR >> 18) & 3u);
}
