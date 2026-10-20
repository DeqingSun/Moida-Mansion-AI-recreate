/* Native intro plus diagnostic room walking. Full gameplay remains pending. */
#include "moida_house.h"
#include <stdio.h>
#include <stdlib.h>
#include <inttypes.h>
int main(int argc,char **argv){
 if(argc!=2)return 2;char *end;int64_t seed=strtoll(argv[1],&end,10);if(*end)return 2;
 MoidaHouse house;if(!moida_house_generate(&house,seed,11)){puts("{\"ready\":false,\"error\":\"House generation failed after 11 attempts; try another seed\"}");fflush(stdout);return 0;}
 unsigned welcome=91+(unsigned)moida_random_bounded(&house.random,1);
 printf("{\"ready\":true,\"entrance\":%u,\"attempts\":%u,\"welcome\":%u}\n",house.layout.entrance,house.attempts,welcome);fflush(stdout);
 MoidaIntro intro;moida_intro_init(&intro,welcome);MoidaReveal reveal;unsigned stage=0,buttons,coord=house.layout.entrance;MoidaDisplay *display=&intro.opening.display;
 while(scanf("%u",&buttons)==1){double hz=0;int duration=0;unsigned move_result=0;
  if(stage==2 && (buttons>>4)>=1 && (buttons>>4)<=4){
   unsigned direction=(buttons>>4)-1;
   MoidaMove move=moida_room_can_move(&house.rooms[coord].room,direction,0);
   move_result=move.kind;
   int next=moida_neighbor(coord,direction);
   if(move.kind==1 && next>=0){coord=(unsigned)next;moida_room_draw_initial(&house.rooms[coord].room,&reveal.display);}
  }
  buttons&=15;
  if(stage==0){if(moida_intro_tick(&intro,(uint8_t)buttons)==MOIDA_INTRO_NEED_HOUSE){moida_reveal_init(&reveal,&house.rooms[house.layout.entrance].room);stage=1;}else{hz=intro.opening.beep_hz;duration=intro.opening.beep_duration_ms;}}
  if(stage==1){moida_reveal_tick(&reveal);display=&reveal.display;hz=reveal.hz;duration=reveal.duration;if(reveal.complete)stage=2;}
  printf("{\"status\":%u,\"coord\":%u,\"moveResult\":%u,\"moves\":[",stage,coord,move_result);for(unsigned i=0;i<4;i++)printf("%s%u",i?",":"",moida_room_can_move(&house.rooms[coord].room,i,0).kind);printf("],\"words\":[");for(unsigned i=0;i<20;i++)printf("%s%" PRIu32,i?",":"",display->data[i]);printf("],\"beeperHz\":%.2f,\"beeperDurationInMs\":%d}\n",hz,duration);fflush(stdout);
 }
 return 0;
}
