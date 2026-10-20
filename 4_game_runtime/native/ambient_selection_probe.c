#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;uint64_t have;while(scanf("%" SCNd64 "%" SCNu64,&seed,&have)==2){MoidaHouse h;if(!moida_house_generate(&h,seed,11))return 2;for(unsigned c=0;c<12;c++){MoidaAmbient a;moida_house_ambient(&h,c,have,&a);printf("[%d,%u]\n",a.runner.index<0?0:a.runner.positions[a.runner.index].routine,a.icon);}}return 0;}
