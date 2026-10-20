#ifndef MOIDA_HAL_H
#define MOIDA_HAL_H
#include "moida_game.h"

/* Callbacks must return promptly. present() receives a borrowed frame; copy it
   if transmission is asynchronous. A display backend maps logical segments to
   its own LCD/bitmap; the game never sees physical SEG/COM addresses. */
typedef struct {
 void *user;
 uint32_t (*now_ms)(void *);
 uint8_t (*read_buttons)(void *);
 void (*present)(void *,const MoidaFrame *);
} MoidaHal;
typedef struct {
 MoidaGame game;
 MoidaHal hal;
 uint32_t last_ms;
 bool clock_started;
} MoidaHost;
bool moida_host_init(MoidaHost *,int64_t seed,const MoidaHal *);
/* External-clock/USB stepping: one command, one tick, one output callback. */
bool moida_host_step(MoidaHost *,uint8_t buttons);
bool moida_host_step_diagnostic(MoidaHost *,unsigned commands);
/* Real-time backend: 1=tick delivered, 0=not due, -1=error.
   First poll ticks immediately. Uses unsigned wrap-safe elapsed time. A late
   poll advances once and drops backlog, avoiding rapid catch-up audio bursts.
   Choose either poll or step for a run; do not mix their clock ownership. */
int moida_host_poll(MoidaHost *);
#endif
