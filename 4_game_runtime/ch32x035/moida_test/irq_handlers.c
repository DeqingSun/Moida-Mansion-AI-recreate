#include "piezo.h"
#include "ch32x035.h"

extern volatile uint64_t msTick;
void osSystickHandler(void);

void SysTick_Handler(void) __attribute__((interrupt("WCH-Interrupt-fast")));
void SysTick_Handler(void) {
  ++msTick;
  osSystickHandler();
  piezo_tick_1ms();
  SysTick->SR = 0;
}

/*
 * Weak USBFS stub: used when SimpleUsbSerial is not linked (standalone).
 * The CDC library provides a strong USBFS_IRQHandler that overrides this.
 */
void USBFS_IRQHandler(void) __attribute__((interrupt("WCH-Interrupt-fast"), weak));
void USBFS_IRQHandler(void) {}
