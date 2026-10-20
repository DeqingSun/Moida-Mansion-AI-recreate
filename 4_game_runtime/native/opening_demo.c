#include "moida_core.h"
#include <stdio.h>
#include <stdlib.h>
#include <inttypes.h>
int main(int argc,char **argv) {
  MoidaOpening g;moida_opening_init(&g,argc>1?(unsigned)strtoul(argv[1],NULL,10):91);
  puts("[");bool first=true;
  while(moida_opening_tick(&g)) {
    printf("%s{\"words\":[",first?"":",\n");first=false;
    for(unsigned i=0;i<20;i++)printf("%s%" PRIu32,i?",":"",g.display.data[i]);
    printf("],\"beeperHz\":%.2f,\"beeperDurationInMs\":%d}",g.beep_hz,g.beep_duration_ms);
  }
  puts("\n]");return 0;
}
