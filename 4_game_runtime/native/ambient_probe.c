#include "moida_room.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){const unsigned routines[]={10,11,12,61,18};for(unsigned k=0;k<5;k++){unsigned routine=routines[k];MoidaAmbient s;moida_ambient_init(&s,routine,routine==11?154:100);MoidaDisplay d={0};if(routine==11)moida_display_fill(&d,true);for(unsigned t=0;t<300;t++){moida_ambient_tick(&s,&d);printf("{\"words\":[");for(unsigned j=0;j<20;j++)printf("%s%" PRIu32,j?",":"",d.data[j]);printf("],\"hz\":%.2f,\"duration\":%d}\n",s.hz,s.duration);}}return 0;}
