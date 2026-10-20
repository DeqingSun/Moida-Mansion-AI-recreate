#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;unsigned coord,icon,mode;while(scanf("%" SCNd64 "%u%u%u",&seed,&coord,&icon,&mode)==4){MoidaHouse h;if(!moida_house_generate(&h,seed,11)||coord>=12)return 2;MoidaSearch s;moida_search_init(&s,&h.rooms[coord].room,icon);s.lock_icon=165;s.locked=mode==29;moida_runner_start(&s.runner,(int)mode);for(unsigned i=0;i<200&&!s.complete;i++){moida_search_tick(&s);printf("{\"words\":[");for(unsigned j=0;j<20;j++)printf("%s%" PRIu32,j?",":"",s.display.data[j]);printf("],\"beeperHz\":%.2f,\"beeperDurationInMs\":%d,\"complete\":%s}\n",s.hz,s.duration,s.complete?"true":"false");}if(!s.complete)return 3;}return 0;}
