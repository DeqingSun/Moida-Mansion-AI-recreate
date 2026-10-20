#ifndef MOIDA_GAME_H
#define MOIDA_GAME_H
#include "moida_house.h"

#define MOIDA_TICK_MS 100u
#define MOIDA_GAME_EFFECTS (512u|1024u|2048u|4096u)
enum { MOIDA_BUTTON_STAIRS=1, MOIDA_BUTTON_SEARCH=2,
       MOIDA_BUTTON_LEFT=4, MOIDA_BUTTON_RIGHT=8 };
/* Segment IDs retain original artwork order. Bits 631..639 are reserved.
   duration==0 means no new audio event; a zero-Hz event is a silent note.
   The receiving backend must finish a note after its supplied duration. */
typedef struct {
 MoidaDisplay display;
 double beeper_hz;
 uint32_t beeper_duration_ms,next_tick_ms,cycle;
} MoidaFrame;

/* Caller-owned storage: allocate statically on MCU. Fields are implementation
   details, not a save-file/serial format. Do not copy/move a live game: internal
   pointers reference this storage. Separate instances can be ticked independently. */
typedef struct {
 bool ready;
 MoidaHouse house;
 unsigned welcome;
 MoidaEndingRooms ending_rooms;
 MoidaMonster monster;
 bool after_move,spider_searched,ghost_pending;
 unsigned ghost_step,ghost_routine,attacks,tip_count,idle_frames,cycle,post_wait;
 uint8_t previous_buttons;
 MoidaCrown crown;
 uint64_t have,used;
 int latch;
 unsigned search_result,move_count,search_count;
 MoidaMelody lingering;
 MoidaAmbient ambient;
 bool ambient_ready,ambient_blocked;
 MoidaIntro intro;
 MoidaReveal reveal;
 MoidaSearch search;
 MoidaResult result,reminder_background,search_background;
 bool reminder_has_background,search_has_background;
 unsigned stage,coord,move_direction,move_step,search_icon,search_coord,last_move_result;
 MoidaDisplay *display;
} MoidaGame;

bool moida_game_init(MoidaGame *,int64_t seed);
/* Exactly one deterministic 100-ms tick; pass the current held-button mask. */
bool moida_game_tick(MoidaGame *,uint8_t buttons,MoidaFrame *);
bool moida_game_can_escape(const MoidaGame *);
bool moida_game_waiting(const MoidaGame *);
/* Compatibility/debug interface for the existing desktop diagnostics.
   Production hardware and USB STEP should use moida_game_tick. */
bool moida_game_tick_diagnostic(MoidaGame *,unsigned commands,MoidaFrame *);
#endif
