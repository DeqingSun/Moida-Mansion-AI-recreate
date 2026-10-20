#ifndef MOIDA_LAYOUT_H
#define MOIDA_LAYOUT_H
#include "moida_core.h"
typedef struct { uint8_t exits[12]; } MoidaMap;
typedef struct { int parent, depth, children[4]; } MoidaNode;
typedef struct { MoidaMap map; MoidaNode nodes[12]; unsigned root; } MoidaZone;
typedef struct { bool valid; unsigned coord, direction; } MoidaPassage;
typedef struct { bool valid; unsigned order; MoidaPassage a,b; } MoidaLocks;
typedef struct {
  MoidaRandom random; MoidaMap map; MoidaZone zone; MoidaLocks locks;
  unsigned entrance, spec;
} MoidaLayout;
int moida_neighbor(unsigned coord,unsigned direction);
void moida_map_generate(MoidaMap *,MoidaRandom *,unsigned entrance);
void moida_zone_build(MoidaZone *,const MoidaMap *,unsigned root);
void moida_layout_attempt(MoidaLayout *,MoidaRandom *);
void moida_layout_generate(MoidaLayout *,int64_t seed);
#endif
