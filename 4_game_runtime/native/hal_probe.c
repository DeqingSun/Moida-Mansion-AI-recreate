/* Fake hardware exercises the same HAL that a board/USB transport implements. */
#include "moida_hal.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>
typedef struct {uint32_t now;uint8_t buttons;unsigned frames;MoidaFrame frame;} Fake;
static uint32_t clock_ms(void *user){return ((Fake *)user)->now;}
static uint8_t buttons(void *user){return ((Fake *)user)->buttons;}
static void present(void *user,const MoidaFrame *frame){Fake *f=user;f->frame=*frame;f->frames++;}
static void same(const MoidaFrame *a,const MoidaFrame *b){assert(!memcmp(a,b,sizeof *a));assert(a->next_tick_ms==100);}
static MoidaGame reference,noise;
static MoidaHost host;
int main(void){
 Fake fake={0};MoidaFrame expected,other;
 MoidaHal hal={.user=&fake,.now_ms=clock_ms,.read_buttons=buttons,.present=present};
 assert(!moida_host_init(NULL,0,&hal));assert(!moida_host_init(&host,0,NULL));
 MoidaHal invalid={0};assert(!moida_host_init(&host,0,&invalid));
 assert(!moida_game_tick(NULL,0,&expected));assert(!moida_game_tick(&reference,0,&expected));
 assert(moida_game_init(&reference,1700000000000LL));
 assert(moida_game_init(&noise,1700001234567LL));
 assert(moida_host_init(&host,1700000000000LL,&hal));
 for(unsigned i=0;i<3000;i++){
  uint8_t mask=i==0?1:i%11<3?(uint8_t)(1u<<((i/11)%4)):0;
  assert(moida_game_tick(&reference,mask,&expected));
  /* A differently seeded game is interleaved and reset independently. */
  if(i==700||i==1700)assert(moida_game_init(&noise,(int64_t)i));
  for(unsigned j=0;j<3;j++)assert(moida_game_tick(&noise,(uint8_t)((i+j)&15),&other));
  assert(moida_host_step(&host,mask));same(&fake.frame,&expected);
 }
 assert(fake.frames==3000);
 /* Reinitialize in place, including passing the existing callback table. */
 assert(moida_host_init(&host,123456,&host.hal));
 assert(moida_game_init(&reference,123456));fake.frames=0;
 fake.now=UINT32_MAX-150;
 for(unsigned i=0;i<1000;i++){
  fake.buttons=i==0?1:i%17==0?2:0;
  assert(moida_host_poll(&host)==1);
  assert(moida_game_tick(&reference,fake.buttons,&expected));same(&fake.frame,&expected);
  assert(moida_host_poll(&host)==0);
  fake.now+=99;assert(moida_host_poll(&host)==0);fake.now++;
 }
 assert(fake.frames==1000);
 fake.now+=5000;assert(moida_host_poll(&host)==1);
 assert(moida_game_tick(&reference,fake.buttons,&expected));same(&fake.frame,&expected);
 assert(moida_host_poll(&host)==0);assert(fake.frames==1001);
 /* Clockless USB/host stepping needs only a presentation callback. */
 hal.now_ms=NULL;hal.read_buttons=NULL;
 assert(moida_host_init(&host,7,&hal));assert(moida_host_poll(&host)==-1);
 assert(moida_host_step(&host,MOIDA_BUTTON_SEARCH));
 printf("PASS: independent game instances, reset, HAL stepping, timer rollover, no catch-up bursts; game storage %zu bytes, host %zu bytes, frame %zu bytes on this build.\n",sizeof(MoidaGame),sizeof(MoidaHost),sizeof(MoidaFrame));
}
