/* Line protocol for desktop integration. Each input is one button mask/tick. */
#include "moida_core.h"
#include <stdio.h>
#include <stdlib.h>
#include <inttypes.h>
int main(int argc,char **argv) {
  MoidaIntro g;moida_intro_init(&g,argc>1?(unsigned)strtoul(argv[1],NULL,10):91);
  unsigned buttons;
  while(scanf("%u",&buttons)==1) {
    MoidaIntroStatus status=moida_intro_tick(&g,(uint8_t)buttons);
    printf("{\"status\":%d,\"words\":[",status);
    for(unsigned i=0;i<20;i++)printf("%s%" PRIu32,i?",":"",g.opening.display.data[i]);
    printf("],\"beeperHz\":%.2f,\"beeperDurationInMs\":%d}\n",status?0:g.opening.beep_hz,status?0:g.opening.beep_duration_ms);
    fflush(stdout);
  }
  return 0;
}
