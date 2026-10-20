/* Differential-test protocol, desktop only. Not needed in firmware. */
#include "moida_core.h"
#include <inttypes.h>
#include <stdio.h>
static int count(void *u,int id) {(void)u;return id==1?3:id==2?4:id==3?2:1;}
static uint32_t events;
static void execute(void *u,MoidaRunner *r,int id,int step) {
  (void)u;events=events*31u+(uint32_t)(id*100+step);
  if(id==1 && step==1) moida_runner_queue(r,2,2);
  if(id==2 && step==0) r->wait=1;
  if(id==2 && step==2) moida_runner_queue(r,3,0);
  if(id==3 && step==0) moida_runner_queue(r,1,0);
}
int main(void) {
  MoidaRandom random={0};MoidaDisplay display={0};MoidaMelody melody={0};
  MoidaText text={0};
  MoidaRunner runner;moida_runner_init(&runner);
  MoidaRoutineEnv env={count,execute,NULL};
  char op;
  while(scanf(" %c",&op)==1) {
    unsigned a,b;int id,wait;uint64_t max;int64_t seed;
    switch(op) {
    case 'l': moida_text_clear(&text);break;
    case 'a': if(scanf("%u%u%d",&a,&b,&id)!=3 || id<0)return 2;moida_text_append(&text,a,b,(unsigned)id);break;
    case 'c': moida_text_center(&text);break;
    case 'd': moida_text_draw(&text,&display);break;
    case 'v': printf("%d",text.count);for(int i=0;i<text.count;i++)printf(" %u",text.codes[i]);puts("");break;
    case 'S': if(scanf("%" SCNd64,&seed)!=1)return 2;moida_random_seed(&random,seed);printf("%" PRIu64 " %" PRIu64 "\n",random.a0,random.a1);break;
    case 'R': printf("%" PRIu64 "\n",moida_random_next(&random));break;
    case 'B': if(scanf("%" SCNu64,&max)!=1)return 2;printf("%" PRIu64 "\n",moida_random_bounded(&random,max));break;
    case 'P': if(scanf("%d",&id)!=1)return 2;printf("%d\n",moida_probability(&random,id));break;
    case 'F': if(scanf("%u",&a)!=1)return 2;moida_display_fill(&display,a!=0);break;
    case 'D': if(scanf("%u%u",&a,&b)!=2)return 2;moida_sprite_set(&display,a,b!=0);break;
    case 'I': if(scanf("%u%u",&a,&b)!=2)return 2;moida_icon_set(&display,a,b!=0);break;
    case 'A': if(scanf("%u",&a)!=1)return 2;printf("%d\n",moida_icon_all(&display,a));break;
    case 'V': for(unsigned i=0;i<20;i++) printf("%s%" PRIu32,i?" ":"",display.data[i]);puts("");break;
    case 'M': {if(scanf("%u%d",&a,&id)!=2 || a>256)return 2;uint8_t notes[256];for(unsigned i=0;i<a;i++){if(scanf("%u",&b)!=1)return 2;notes[i]=(uint8_t)b;}moida_melody_set(&melody,notes,a,id);break;}
    case 'C': moida_melody_clear(&melody);break;
    case 'N': {uint8_t note=0;bool has=moida_melody_pop(&melody,&note);printf("%d %u %u %u %d\n",has,note,melody.index,melody.count,melody.duration_ms);break;}
    case 'H': if(scanf("%u",&a)!=1)return 2;printf("%.2f\n",moida_note_hz(a));break;
    case 'J': if(scanf("%u%u%d",&a,&b,&id)!=3)return 2;printf("%d\n",moida_just_pressed((uint8_t)a,(uint8_t)b,(unsigned)id));break;
    case 'X': if(scanf("%d",&id)!=1)return 2;moida_runner_start(&runner,id);break;
    case 'Q': if(scanf("%d%d",&id,&wait)!=2)return 2;moida_runner_queue(&runner,id,wait);break;
    case 'Z': if(scanf("%d",&id)!=1)return 2;printf("%d\n",moida_runner_push(&runner,id));break;
    case 'W': if(scanf("%d",&wait)!=1)return 2;runner.wait=wait;break;
    case 'E': if(scanf("%u",&a)!=1)return 2;runner.waiting_input=a!=0;break;
    case 'G': if(scanf("%u",&a)!=1)return 2;runner.queued_start=a!=0;break;
    case 'T': moida_runner_tick(&runner,&env);break;
    case 'O': printf("%d %d %d %d %d %d %" PRIu32,runner.index,runner.wait,runner.queued,runner.wait_first,runner.waiting_input,runner.queued_start,events);for(int i=0;i<=runner.index;i++)printf(" %d %d",runner.positions[i].routine,runner.positions[i].step);puts("");break;
    default: return 3;
    }
  }
  return 0;
}
