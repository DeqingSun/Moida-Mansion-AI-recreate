#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){uint64_t need,have,used;while(scanf("%" SCNu64 "%" SCNu64 "%" SCNu64,&need,&have,&used)==3){bool ok=moida_door_use_key((MoidaMove){2,166,need},have,&used);printf("[%u,\"%" PRIu64 "\"]\n",ok?41:40,used);}return 0;}
