#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;unsigned coord,current;uint64_t have,used;MoidaHouse h;int64_t last=0;bool loaded=false;
 while(scanf("%" SCNd64 "%u%u%" SCNu64 "%" SCNu64,&seed,&coord,&current,&have,&used)==5){
  if(!loaded||last!=seed){if(!moida_house_generate(&h,seed,11))return 2;last=seed;loaded=true;}
  if(coord>=12)return 3;const MoidaRoom *r=&h.rooms[coord].room;const MoidaRoomEntity *e=moida_search_entity(r,current,used);
  printf("[%u,%d]\n",moida_search_next(r,current,have),e?(int)e->id:-1);
 }return 0;}
