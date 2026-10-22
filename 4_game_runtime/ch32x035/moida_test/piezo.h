#ifndef PIEZO_H
#define PIEZO_H
#include <stdint.h>
/* Bridged passive piezo on TIM1: CH1=PB9 and CH1N=PB6 (default TIM1 mapping).
   Silence holds both pins low, so the element never sits at a DC bias. */
void piezo_init(void);
/* Replaces any current note. hz<=0 or ms==0 silences. */
void piezo_play(double hz, uint32_t ms);
void piezo_stop(void);
/* Call once per millisecond from SysTick_Handler. */
void piezo_tick_1ms(void);
#endif
