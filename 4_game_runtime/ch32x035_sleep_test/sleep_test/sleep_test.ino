// CH32X035 sleep/wake bring-up with USB serial.
//
// PC3:  LED (active-high)
// PA0..PA3: buttons to GND (internal pull-up)
// PB12: EN_DCDC kept high during STOP (button levels need boost rail)
// PC16/PC17: USB (alive ~5s for upload, then deinit before STOP)
//
// Boot: LED on + USB window -> LED off -> USB deinit -> STOP
// Real button wake (pin still low) -> SystemReset -> window again.

#include <Arduino.h>
#include <SimpleUsbSerial.h>
#define PORT SerialUSB
#if !defined(SYSCLK_FREQ_48MHz_HSI)
#error "Select CH32X035 internal 48 MHz clock."
#endif

#define BUTTON_MASK 0x0Fu
#define PB12_BIT    (1u << 12)
#define PC3_BIT     (1u << 3)
#define EXTI_USB_WAKE (1u << 28) /* EXTI28 = USB wake */

extern "C" {
extern volatile uint64_t msTick;
void osSystickHandler(void);
void SysTick_Handler(void) __attribute__((interrupt("WCH-Interrupt-fast")));
void SysTick_Handler(void) { ++msTick; osSystickHandler(); SysTick->SR = 0; }

void EXTI7_0_IRQHandler(void) __attribute__((interrupt("WCH-Interrupt-fast")));
void EXTI7_0_IRQHandler(void) { EXTI->INTFR = BUTTON_MASK; }
}

static void emit(const char *s) {
  while (*s) PORT.write((uint8_t)*s++);
}

static void dcdc_init(void) {
  RCC->APB2PCENR |= RCC_IOPBEN;
  (void)RCC->APB2PCENR;
  GPIOB->CFGHR = (GPIOB->CFGHR & ~(0xFu << 16)) | (0x3u << 16);
}

static void dcdc_on(void) { GPIOB->BSHR = PB12_BIT; }

static void led_init(void) {
  RCC->APB2PCENR |= RCC_IOPCEN;
  (void)RCC->APB2PCENR;
  GPIOC->CFGLR = (GPIOC->CFGLR & ~(0xFu << 12)) | (0x3u << 12);
  GPIOC->BCR = PC3_BIT;
}

static void led_on(void)  { GPIOC->BSHR = PC3_BIT; }
static void led_off(void) { GPIOC->BCR = PC3_BIT; }

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

/* Tear down CDC so SOF/suspend IRQs cannot keep waking STOP. */
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

/*
 * STOP until a button is actually held after wake. Instant WFI returns with
 * pins high are treated as spurious (USB leftovers) and retried.
 */
static void enter_stop_until_button(void) {
  RCC->APB1PCENR |= RCC_PWREN;
  (void)RCC->APB1PCENR;
  for (;;) {
    clear_button_wake();
    if (any_button_pressed()) return; /* already held = real wake intent */
    SysTick->CTLR = 0;
    PWR->CTLR &= (uint32_t)~PWR_CTLR_PDDS;
    NVIC->SCTLR |= (1u << 2);
    clear_button_wake();
    __WFI();
    NVIC->SCTLR &= ~(1u << 2);
    clear_button_wake();
    if (any_button_pressed()) return;
    /* Spurious wake: sleep again. */
  }
}

void setup() {
  dcdc_init();
  dcdc_on(); /* stay on through STOP for valid button levels */
  led_init();
  led_on(); /* steady on during upload window */

  PORT.begin(115200);
  emit("sleep_test: awake 5s (upload window), then sleep\n");
  PORT.flush();
  delay(5000); /* USB stays up for reflash */

  led_off();
  emit("sleep_test: sleeping (button wakes)\n");
  PORT.flush();
  delay(50);

  buttons_and_exti();
  while (any_button_pressed()) delay(10);

  usb_deinit();
  clear_button_wake();
  enter_stop_until_button();

  NVIC_SystemReset();
}

void loop() {}
