#ifndef POWER_SLEEP_H
#define POWER_SLEEP_H
#include <stdint.h>
/* PB12 EN_DCDC for ME2107A33M5G. Only touches the PB12 CFGHR nibble. */
void dcdc_init(void);
void dcdc_on(void);
void dcdc_off(void);
/* After piezo stop + LCD standby: USB quiet, EXTI buttons, DCDC off, STOP.
   Holding any button for wake_hold_ms triggers SystemReset. Does not return. */
void power_enter_deep_sleep(uint32_t wake_hold_ms);
#endif
