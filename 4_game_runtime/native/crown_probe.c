#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;uint64_t have;unsigned entity,got;int a,b,c;while(scanf("%" SCNd64 " %" SCNu64 " %u %u %d %d %d",&seed,&have,&entity,&got,&a,&b,&c)==7){MoidaHouse h;if(!moida_house_generate(&h,seed,11))return 2;MoidaCrown s;moida_crown_init(&s);s.got_crown=got!=0;s.buttons[0]=a;s.buttons[1]=b;s.buttons[2]=c;int friend_index;unsigned outcome=moida_crown_search(&h,entity,&have,&s,&friend_index);printf("[%u,\"%" PRIu64 "\",%d,%d,%d]\n",outcome,have,s.buttons[0],s.buttons[1],s.buttons[2]);}return 0;}
