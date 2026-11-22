// Minimal CH32X035 sleep/wake bring-up. No USB serial.
//
// PC3:  LED (active-high)
// PA0..PA3: buttons to GND (internal pull-up)
// PB12: EN_DCDC (kept high — button levels need the boost rail on this board)
//
// Boot: blink LED 50 ms -> STOP sleep -> any button EXTI wake -> SystemReset -> blink again.

#include <Arduino.h>
#if !defined(SYSCLK_FREQ_48MHz_HSI)
#error "Select CH32X035 internal 48 MHz clock."
#endif

#define BUTTON_MASK 0x0Fu
#define PB12_BIT    (1u << 12)
#define PC3_BIT     (1u << 3)

extern "C" {
extern volatile uint64_t msTick;
void osSystickHandler(void);
void SysTick_Handler(void) __attribute__((interrupt("WCH-Interrupt-fast")));
void SysTick_Handler(void) { ++msTick; osSystickHandler(); SysTick->SR = 0; }

void EXTI7_0_IRQHandler(void) __attribute__((interrupt("WCH-Interrupt-fast")));
void EXTI7_0_IRQHandler(void) { EXTI->INTFR = BUTTON_MASK; }
}

static void delay_ms(uint32_t ms) {
  while (ms--) {
    for (volatile uint32_t i = 0; i < 16000u; i++) {}
  }
}

static void dcdc_on(void) {
  RCC->APB2PCENR |= RCC_IOPBEN;
  (void)RCC->APB2PCENR;
  /* PB12 CFGHR nibble bits 16..19: 50 MHz push-pull. */
  GPIOB->CFGHR = (GPIOB->CFGHR & ~(0xFu << 16)) | (0x3u << 16);
  GPIOB->BSHR = PB12_BIT;
}

static void led_init(void) {
  RCC->APB2PCENR |= RCC_IOPCEN;
  (void)RCC->APB2PCENR;
  /* PC3 CFGLR nibble bits 12..15: 50 MHz push-pull. */
  GPIOC->CFGLR = (GPIOC->CFGLR & ~(0xFu << 12)) | (0x3u << 12);
  GPIOC->BCR = PC3_BIT; /* off (active-high) */
}

static void led_on(void)  { GPIOC->BSHR = PC3_BIT; }
static void led_off(void) { GPIOC->BCR = PC3_BIT; }

static void led_blink(void) {
  led_on();
  delay_ms(50);
  led_off();
}

static void buttons_and_exti(void) {
  unsigned i;
  RCC->APB2PCENR |= RCC_IOPAEN | RCC_AFIOEN;
  (void)RCC->APB2PCENR;
  /* PA0..PA3 input pull-up. */
  GPIOA->CFGLR = (GPIOA->CFGLR & ~0xFFFFu) | 0x8888u;
  GPIOA->OUTDR |= BUTTON_MASK;
  /* EXTI0..3 -> PA (2-bit port fields). */
  for (i = 0; i < 4u; i++) {
    uint32_t shift = 2u * i;
    AFIO->EXTICR[0] = (AFIO->EXTICR[0] & ~(3u << shift));
  }
  EXTI->RTENR &= ~BUTTON_MASK;
  EXTI->FTENR |= BUTTON_MASK;   /* falling edge = press */
  EXTI->EVENR &= ~BUTTON_MASK;
  EXTI->INTENR |= BUTTON_MASK;
  EXTI->INTFR = BUTTON_MASK;
  NVIC_EnableIRQ(EXTI7_0_IRQn);
  NVIC_ClearPendingIRQ(EXTI7_0_IRQn);
}

static void enter_stop(void) {
  SysTick->CTLR = 0; /* no 1 ms wakes */
  RCC->APB1PCENR |= RCC_PWREN;
  (void)RCC->APB1PCENR;
  PWR->CTLR &= (uint32_t)~PWR_CTLR_PDDS; /* STOP, not standby */
  NVIC->SCTLR |= (1u << 2);              /* SLEEPDEEP */
  EXTI->INTFR = BUTTON_MASK;
  NVIC_ClearPendingIRQ(EXTI7_0_IRQn);
  __WFI();
  NVIC->SCTLR &= ~(1u << 2);
  EXTI->INTFR = BUTTON_MASK;
}

void setup() {
  dcdc_on();
  led_init();
  led_blink();
  buttons_and_exti();
  enter_stop();
  NVIC_SystemReset();
}

void loop() {}
