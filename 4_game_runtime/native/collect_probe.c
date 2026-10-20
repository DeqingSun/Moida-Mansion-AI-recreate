#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;unsigned coord,icon;uint64_t have,used;MoidaHouse h;int64_t last=0;bool loaded=false;
while(scanf("%" SCNd64 "%u%u%" SCNu64 "%" SCNu64,&seed,&coord,&icon,&have,&used)==5){if(!loaded||last!=seed){if(!moida_house_generate(&h,seed,11))return 2;loaded=true;last=seed;}int latch=-1;unsigned result=moida_search_collect(&h,coord,icon,&have,used,&latch);printf("[%u,\"%" PRIu64 "\",%d]\n",result,have,latch);}return 0;}
