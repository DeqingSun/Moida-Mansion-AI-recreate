#include "power_sleep.h"
#include "ch32x035.h"

#define BUTTON_MASK   0x0Fu
#define PB12_BIT      (1u << 12)
#define EXTI_USB_WAKE (1u << 28)

extern uint32_t SystemCoreClock;
extern volatile uint64_t msTick;

void EXTI7_0_IRQHandler(void) __attribute__((interrupt("WCH-Interrupt-fast")));
void EXTI7_0_IRQHandler(void) { EXTI->INTFR = BUTTON_MASK; }

void dcdc_init(void) {
  RCC->APB2PCENR |= RCC_IOPBEN;
  (void)RCC->APB2PCENR;
  /* PB12 push-pull 50 MHz; leave PB8–PB11 / PB13–PB15 alone (piezo uses PB9). */
  GPIOB->CFGHR = (GPIOB->CFGHR & ~(0xFu << 16)) | (0x3u << 16);
}

void dcdc_on(void)  { GPIOB->BSHR = PB12_BIT; }
void dcdc_off(void) { GPIOB->BCR = PB12_BIT; }

static int any_button_pressed(void) {
  return (int)((~GPIOA->INDR) & BUTTON_MASK);
}

static void buttons_and_exti(void) {
  unsigned i;
  RCC->APB2PCENR |= RCC_IOPAEN | RCC_AFIOEN;
  (void)RCC->APB2PCENR;
  GPIOA->CFGLR = (GPIOA->CFGLR & ~0xFFFFu) | 0x8888u;
  GPIOA->OUTDR |= BUTTON_MASK;
  for (i = 0; i < 4u; i++) {
    uint32_t shift = 2u * i;
    AFIO->EXTICR[0] = (AFIO->EXTICR[0] & ~(3u << shift));
  }
  EXTI->RTENR &= ~BUTTON_MASK;
  EXTI->FTENR |= BUTTON_MASK;
  EXTI->EVENR &= ~BUTTON_MASK;
  EXTI->INTENR |= BUTTON_MASK;
  EXTI->INTFR = BUTTON_MASK;
  NVIC_EnableIRQ(EXTI7_0_IRQn);
  NVIC_ClearPendingIRQ(EXTI7_0_IRQn);
}

static void usb_deinit(void) {
  NVIC_DisableIRQ(USBFS_IRQn);
  NVIC_DisableIRQ(USBFSWakeUp_IRQn);
  NVIC_ClearPendingIRQ(USBFS_IRQn);
  NVIC_ClearPendingIRQ(USBFSWakeUp_IRQn);
  USBFSD->INT_EN = 0;
  USBFSD->INT_FG = 0xFF;
  USBFSD->BASE_CTRL = 0;
  USBFSD->UDEV_CTRL = 0;
  EXTI->INTENR &= ~EXTI_USB_WAKE;
  EXTI->EVENR &= ~EXTI_USB_WAKE;
  EXTI->RTENR &= ~EXTI_USB_WAKE;
  EXTI->FTENR &= ~EXTI_USB_WAKE;
  EXTI->INTFR = EXTI_USB_WAKE;
  RCC->AHBPCENR &= ~RCC_USBFS;
}

static void clear_button_wake(void) {
  EXTI->INTFR = BUTTON_MASK | EXTI_USB_WAKE;
  NVIC_ClearPendingIRQ(EXTI7_0_IRQn);
  NVIC_ClearPendingIRQ(USBFS_IRQn);
  NVIC_ClearPendingIRQ(USBFSWakeUp_IRQn);
}

static void systick_resume(void) {
  SysTick->CMP = SystemCoreClock / 1000u - 1u;
  SysTick->CNT = 0;
  SysTick->SR = 0;
  SysTick->CTLR = 0xFu;
}

static void enter_stop_until_button(void) {
  RCC->APB1PCENR |= RCC_PWREN;
  (void)RCC->APB1PCENR;
  for (;;) {
    clear_button_wake();
    if (any_button_pressed()) return;
    SysTick->CTLR = 0;
    PWR->CTLR &= (uint32_t)~PWR_CTLR_PDDS;
    NVIC->SCTLR |= (1u << 2);
    clear_button_wake();
    __WFI();
    NVIC->SCTLR &= ~(1u << 2);
    clear_button_wake();
    if (any_button_pressed()) return;
  }
}

static int button_held_ms(uint32_t ms) {
  uint32_t start;
  systick_resume();
  start = (uint32_t)msTick;
  while ((uint32_t)((uint32_t)msTick - start) < ms) {
    if (!any_button_pressed()) return 0;
  }
  return any_button_pressed();
}

static void busy_wait_release(void) {
  while (any_button_pressed()) {
    volatile uint32_t i;
    for (i = 0; i < 8000u; i++) {}
  }
}

void power_enter_deep_sleep(uint32_t wake_hold_ms) {
  usb_deinit();
  buttons_and_exti();
  busy_wait_release();
  for (;;) {
    dcdc_off();
    enter_stop_until_button();
    if (button_held_ms(wake_hold_ms)) {
      dcdc_on();
      NVIC_SystemReset();
    }
    /* Short tap: go back to STOP. */
  }
}
