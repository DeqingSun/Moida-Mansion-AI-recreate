/* Desktop session: native intro + native reveal of a reference-generated room. */
#include "room_io.h"
#include <stdlib.h>
int main(int argc,char **argv) {
  if(argc!=3)return 2;
  FILE *file=fopen(argv[2],"r");if(!file)return 2;
  MoidaRoom room;int valid=read_room(file,&room);fclose(file);if(!valid)return 2;
  MoidaIntro intro;moida_intro_init(&intro,(unsigned)strtoul(argv[1],NULL,10));
  MoidaReveal reveal;unsigned stage=0,buttons;MoidaDisplay *display=&intro.opening.display;
  while(scanf("%u",&buttons)==1) {
    double hz=0;int duration=0;
    if(stage==0) {
      if(moida_intro_tick(&intro,(uint8_t)buttons)==MOIDA_INTRO_NEED_HOUSE) {moida_reveal_init(&reveal,&room);stage=1;}
      else {hz=intro.opening.beep_hz;duration=intro.opening.beep_duration_ms;}
    }
    if(stage==1) {
      (void)moida_reveal_tick(&reveal);display=&reveal.display;hz=reveal.hz;duration=reveal.duration;
      if(reveal.complete)stage=2;
    }
    printf("{\"status\":%u,\"words\":[",stage);
    for(unsigned i=0;i<20;i++)printf("%s%" PRIu32,i?",":"",display->data[i]);
    printf("],\"beeperHz\":%.2f,\"beeperDurationInMs\":%d}\n",hz,duration);fflush(stdout);
  }
  return 0;
}
