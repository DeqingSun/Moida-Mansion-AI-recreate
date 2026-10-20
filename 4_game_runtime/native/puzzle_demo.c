#include "moida_puzzle.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;while(scanf("%" SCNd64,&seed)==1){
 MoidaLayout layout;MoidaPuzzle puzzle;moida_layout_generate(&layout,seed);moida_puzzle_place(&puzzle,&layout);
 printf("{\"valid\":%s,\"entrance\":%u,\"entities\":[",puzzle.valid?"true":"false",layout.entrance);
 for(unsigned i=0;i<puzzle.count;i++){MoidaPuzzleEntity *e=&puzzle.entities[i];printf("%s[%u,%u,%u,%u,\"%" PRIu64 "\",%d,%d,%d,%u,%u,%u,%u]",i?",":"",e->kind,e->coord,e->contents,e->gate_kind,e->gate_keys,e->exit,e->hint,e->reveal,e->path[0],e->path[1],e->path[2],e->path[3]);}
 printf("],\"random\":[\"%" PRIu64 "\",\"%" PRIu64 "\"]}\n",layout.random.a0,layout.random.a1);
}return 0;}
