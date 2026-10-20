#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;uint64_t have;while(scanf("%" SCNd64 " %" SCNu64,&seed,&have)==2){MoidaHouse h;if(!moida_house_generate(&h,seed,11))return 2;MoidaResult r={0};unsigned routine=moida_rescue_followup(&h,have,&r);printf("[%u,%u,%u,%u,%d]\n",routine,r.help_strand,r.hint_strand,r.hint_icon,r.gift_id);}return 0;}
