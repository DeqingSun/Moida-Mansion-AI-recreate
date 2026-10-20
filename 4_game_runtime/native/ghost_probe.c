#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;unsigned coord,step;uint64_t have;while(scanf("%" SCNd64 " %u %" SCNu64 " %u",&seed,&coord,&have,&step)==4){MoidaHouse h;if(!moida_house_generate(&h,seed,11))return 2;MoidaGhostMove g=moida_ghost_update(&h,coord,have,step);printf("[%u,%u]\n",g.routine,g.next_step);}return 0;}
