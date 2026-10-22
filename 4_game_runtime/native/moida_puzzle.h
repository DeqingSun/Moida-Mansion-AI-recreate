#ifndef MOIDA_PUZZLE_H
#define MOIDA_PUZZLE_H
#include "moida_layout.h"
/* IDs are the index in entities. -1 means absent for optional fields. */
typedef struct {
 /* 32 entity slots; room/path coordinates 0..11; kinds/contents 0..5,
    gates 0..3. Optional IDs preserve -1, exits are -1..3. */
 uint64_t gate_keys;
 uint8_t kind,coord,contents,gate_kind;
 int8_t exit,hint,reveal;
 uint8_t path[4];
} MoidaPuzzleEntity;
typedef struct { bool valid; unsigned count; MoidaPuzzleEntity entities[32]; } MoidaPuzzle;
/* Continue after native layout generation, preserving its PRNG state. */
bool moida_puzzle_place(MoidaPuzzle *,MoidaLayout *);
#endif
