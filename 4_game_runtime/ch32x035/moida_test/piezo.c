#include "piezo.h"
#include <string.h>
#include "ch32x035.h"

#define PIEZO_TIMER_HZ 4000000u
/* ~5.3 us at 48 MHz: both pins low between edges, halving the peak charge current. */
#define PIEZO_DEAD_TIME 0xC0u
/* MOE=0 with OSSI=1 drives OC1/OC1N to their idle levels (OIS1=OIS1N=0: low). */
#define PIEZO_IDLE (TIM_OSSI | PIEZO_DEAD_TIME)

extern uint32_t SystemCoreClock;
/* The ISR touches BDTR only while this is nonzero; main code zeroes it first. */
static volatile uint32_t remaining_ms;

void piezo_init(void) {
  RCC->APB2PCENR |= RCC_IOPBEN | RCC_TIM1EN;
  TIM1->CTLR1 = TIM_ARPE;
  TIM1->CTLR2 = 0;
  TIM1->PSC = (uint16_t)(SystemCoreClock / PIEZO_TIMER_HZ - 1u);
  TIM1->ATRLR = 0xFFFF;
  TIM1->CH1CVR = 0x8000;
  TIM1->CHCTLR1 = TIM_OC1M_2 | TIM_OC1M_1 | TIM_OC1PE; /* PWM mode 1 */
  TIM1->CCER = TIM_CC1E | TIM_CC1NE;
  TIM1->BDTR = PIEZO_IDLE;
  TIM1->SWEVGR = TIM_UG;
  TIM1->CTLR1 = TIM_ARPE | TIM_CEN;
  /* Hand the pins to the timer only once it is already driving idle-low. */
  GPIOB->CFGLR = (GPIOB->CFGLR & ~(0xFu << 24)) | (0xBu << 24); /* PB6 AF push-pull */
  GPIOB->CFGHR = (GPIOB->CFGHR & ~(0xFu << 4)) | (0xBu << 4);   /* PB9 AF push-pull */
}

void piezo_stop(void) {
  remaining_ms = 0;
  TIM1->BDTR = PIEZO_IDLE;
}

/* hz * 1024, truncated, read straight from the IEEE-754 bits; 0 outside 1..2^20 Hz.
   Any double arithmetic here links ~4 KB of soft-float code, which X035 flash lacks. */
static uint32_t hz_q10(double hz) {
  uint64_t bits;
  memcpy(&bits, &hz, sizeof bits);
  if (bits >> 63) return 0;
  int exponent = (int)(bits >> 52 & 0x7FF) - 1023;
  if (exponent < 0 || exponent > 20) return 0;
  uint64_t mantissa = (bits & ((UINT64_C(1) << 52) - 1)) | UINT64_C(1) << 52;
  return (uint32_t)(mantissa >> (42 - exponent));
}

void piezo_play(double hz, uint32_t ms) {
  piezo_stop();
  uint32_t q10 = hz_q10(hz);
  if (!q10 || !ms) return;
  /* PIEZO_TIMER_HZ << 10 = 4,096,000,000 still fits in 32 bits. */
  uint32_t ticks = ((PIEZO_TIMER_HZ << 10) + q10 / 2u) / q10;
  if (ticks < 4u || ticks > 65536u) return;
  TIM1->ATRLR = (uint16_t)(ticks - 1u);
  TIM1->CH1CVR = (uint16_t)(ticks / 2u);
  TIM1->SWEVGR = TIM_UG; /* Load preloaded period/compare and restart at zero. */
  TIM1->BDTR = PIEZO_IDLE | TIM_MOE;
  remaining_ms = ms;
}

void piezo_tick_1ms(void) {
  if (remaining_ms && !--remaining_ms) TIM1->BDTR = PIEZO_IDLE;
}
