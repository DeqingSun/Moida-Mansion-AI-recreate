#ifndef MOIDA_PUZZLE_H
#define MOIDA_PUZZLE_H
#include "moida_layout.h"
/* IDs are the index in entities. -1 means absent for optional fields. */
typedef struct {
 unsigned kind,coord,contents,gate_kind; uint64_t gate_keys;
 int exit,hint,reveal; unsigned path[4];
} MoidaPuzzleEntity;
typedef struct { bool valid; unsigned count; MoidaPuzzleEntity entities[32]; } MoidaPuzzle;
/* Continue after native layout generation, preserving its PRNG state. */
bool moida_puzzle_place(MoidaPuzzle *,MoidaLayout *);
#endif
