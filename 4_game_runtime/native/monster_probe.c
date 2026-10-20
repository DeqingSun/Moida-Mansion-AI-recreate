#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;while(scanf("%" SCNd64,&seed)==1){MoidaHouse h;if(!moida_house_generate(&h,seed,11))return 2;moida_random_seed(&h.random,12345);MoidaEndingRooms e={.house=&h};for(unsigned c=0;c<12;c++)printf("%u\n",moida_monster_peeps(&h.rooms[c].room));moida_house_apply_used(&h,UINT64_MAX);moida_house_apply_collected(&h,UINT64_MAX);for(unsigned t=0;t<36;t++){MoidaDisplay d;moida_ending_room(&e,&d);printf("[%u,%u,%u,%u,[",e.coord,e.monster.icon,e.monster.spot,e.monster.guards);for(unsigned i=0;i<20;i++)printf("%s%" PRIu32,i?",":"",d.data[i]);puts("]]");}}return 0;}
