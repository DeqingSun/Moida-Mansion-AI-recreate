#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;while(scanf("%" SCNd64,&seed)==1){MoidaHouse h;if(!moida_house_generate(&h,seed,11))return 2;MoidaRandom random;moida_random_seed(&random,seed);for(unsigned n=0;n<120;n++){bool yes=moida_spider_after_move(&random,n%7==0,n%3);printf("[%s,\"%" PRIu64 "\",\"%" PRIu64 "\"]\n",yes?"true":"false",random.a0,random.a1);}for(unsigned c=0;c<12;c++)for(unsigned k=0;k<52;k++)for(unsigned v=0;v<3;v++)printf("%u\n",moida_search_next_with_spider(&h.rooms[c].room,k==51?229:k*7,0,v!=0,v==2));}return 0;}
