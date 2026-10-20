#ifndef MOIDA_CORE_H
#define MOIDA_CORE_H
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
/* Partial native port. No allocation, OS, browser, or JavaScript dependency. */
#define MOIDA_SEGMENTS 631
#define MOIDA_WORDS 20
#define MOIDA_STACK 20
typedef struct { uint64_t a0, a1; } MoidaRandom;
void moida_random_seed(MoidaRandom *, int64_t);
uint64_t moida_random_next(MoidaRandom *);
uint64_t moida_random_bounded(MoidaRandom *, uint64_t inclusive_max);
bool moida_probability(MoidaRandom *, int percent);
typedef struct { uint32_t data[MOIDA_WORDS]; } MoidaDisplay;
void moida_display_fill(MoidaDisplay *, bool);
bool moida_sprite_set(MoidaDisplay *, unsigned bit, bool on);
bool moida_sprite_get(const MoidaDisplay *, unsigned bit);
bool moida_icon_set(MoidaDisplay *, unsigned icon, bool on);
bool moida_icon_all(const MoidaDisplay *, unsigned icon);
typedef struct { uint8_t notes[128]; unsigned count, index; int duration_ms; } MoidaMelody;
void moida_melody_set(MoidaMelody *, const uint8_t *, size_t, int);
void moida_melody_clear(MoidaMelody *);
bool moida_melody_pop(MoidaMelody *, uint8_t *);
double moida_note_hz(unsigned);
bool moida_just_pressed(uint8_t current, uint8_t previous, unsigned button);
typedef struct { int routine, step; } MoidaPosition;
typedef struct {
  MoidaPosition positions[MOIDA_STACK];
  int index, wait, queued, wait_first;
  bool waiting_input, queued_start;
} MoidaRunner;
/* IDs are 1-based; 0 means no routine. Callbacks supply the game's script bodies. */
typedef struct {
  int (*step_count)(void *, int routine);
  void (*execute)(void *, MoidaRunner *, int routine, int step);
  void *user;
} MoidaRoutineEnv;
void moida_runner_init(MoidaRunner *);
void moida_runner_start(MoidaRunner *, int routine);
bool moida_runner_push(MoidaRunner *, int routine);
void moida_runner_queue(MoidaRunner *, int routine, int wait_first);
void moida_runner_tick(MoidaRunner *, const MoidaRoutineEnv *);
typedef struct { int count; uint16_t codes[13]; } MoidaText;
void moida_text_clear(MoidaText *);
void moida_text_append(MoidaText *, unsigned strand, unsigned family, unsigned offset);
void moida_text_center(MoidaText *);
void moida_text_draw(const MoidaText *, MoidaDisplay *);
/* Opening sequence only: stops before the interactive speech/house transition. */
typedef struct {
  MoidaDisplay display; MoidaText text; MoidaMelody melody; MoidaRunner runner;
  unsigned welcome_strand; bool complete;
  double beep_hz; int beep_duration_ms;
} MoidaOpening;
void moida_opening_init(MoidaOpening *, unsigned welcome_strand);
bool moida_opening_tick(MoidaOpening *);
/* Full attract/intro loop; NEED_HOUSE explicitly marks the unported boundary. */
typedef enum { MOIDA_INTRO_RUNNING=0, MOIDA_INTRO_NEED_HOUSE=1 } MoidaIntroStatus;
typedef struct {
  MoidaOpening opening;
  MoidaRunner loop;
  unsigned scroll_skip, speaker_frames;
  uint8_t previous_buttons;
  MoidaIntroStatus status;
} MoidaIntro;
void moida_intro_init(MoidaIntro *, unsigned welcome_strand);
MoidaIntroStatus moida_intro_tick(MoidaIntro *, uint8_t buttons);
#endif
