#include "moida_core.h"
#include <string.h>
#include "text_tables.inc"
void moida_text_clear(MoidaText *t) { t->count=0; }
void moida_text_append(MoidaText *t,unsigned strand,unsigned family,unsigned offset) {
  if(strand>=sizeof strand_first/sizeof *strand_first || family>=strand_counts[strand]) return;
  unsigned start=strand_starts[strand_first[strand]+family];
  unsigned end=strand_starts[strand_first[strand]+family+1];
  if(offset>=end-start) return;
  for(unsigned i=start+offset;i<end && t->count<13;i++) t->codes[t->count++]=strand_codes[i];
}
void moida_text_center(MoidaText *t) {
  int first=0,last=t->count;
  while(first<last && t->codes[first]==1) first++;
  while(last>first && t->codes[last-1]==1) last--;
  if(first || last<t->count) {
    MoidaText stripped={0};
    for(int i=first;i<last;i++) stripped.codes[stripped.count++]=t->codes[i];
    *t=stripped;
  }
  int pad=(13-t->count)/2;
  if(pad>0) {
    MoidaText centered={0};
    while(centered.count<pad) centered.codes[centered.count++]=1;
    for(int i=0;i<t->count && centered.count<13;i++) centered.codes[centered.count++]=t->codes[i];
    *t=centered;
  }
}
/* Font masks address individual sprites inside each text-position icon. */
extern void moida_font_position(MoidaDisplay *,unsigned,uint16_t);
void moida_text_draw(const MoidaText *t,MoidaDisplay *d) {
  for(int i=0;i<13;i++) {
    unsigned code=i<t->count?t->codes[i]:0;
    uint16_t mask=code<sizeof font_masks/sizeof *font_masks?font_masks[code]:0;
    moida_font_position(d,text_icons[i],mask);
  }
}
static void centered(MoidaOpening *g,unsigned strand) {
  moida_text_clear(&g->text);moida_text_append(&g->text,strand,0,0);
  moida_text_center(&g->text);moida_text_draw(&g->text,&g->display);
}
static int opening_steps(void *user,int id) {(void)user;(void)id;return 9;}
static void opening_step(void *user,MoidaRunner *runner,int id,int step) {
  (void)id;MoidaOpening *g=user;
  static const uint8_t greeting[]={64,63,64,0,0,0,0,0,0,0,61};
  switch(step) {
  case 0: moida_display_fill(&g->display,true);runner->wait=10;break;
  case 1: moida_display_fill(&g->display,false);runner->wait=2;break;
  case 2: centered(g,g->welcome_strand);runner->wait=20;moida_melody_set(&g->melody,greeting,sizeof greeting,60);break;
  case 3: moida_melody_set(&g->melody,theme_notes,sizeof theme_notes,60);moida_icon_set(&g->display,134,true);moida_icon_set(&g->display,136,true);centered(g,93);runner->wait=30;break;
  case 4: centered(g,95);runner->wait=10;break;
  case 5: centered(g,96);runner->wait=34;break;
  case 6: centered(g,94);runner->wait=34;break;
  case 7: centered(g,1);runner->wait=12;break;
  case 8: moida_text_clear(&g->text);moida_text_draw(&g->text,&g->display);break;
  }
}
void moida_opening_init(MoidaOpening *g,unsigned welcome_strand) {
  memset(g,0,sizeof *g);g->welcome_strand=welcome_strand;
  moida_runner_init(&g->runner);moida_runner_start(&g->runner,1);
}
bool moida_opening_tick(MoidaOpening *g) {
  if(g->complete) return false;
  MoidaRoutineEnv env={opening_steps,opening_step,g};
  g->beep_hz=0;g->beep_duration_ms=0;
  moida_runner_tick(&g->runner,&env);
  uint8_t note;
  if(moida_melody_pop(&g->melody,&note)) {
    g->beep_hz=moida_note_hz(note);g->beep_duration_ms=g->melody.duration_ms;
  }
  g->complete=g->runner.index<0;
  return true;
}
static unsigned strand_length(unsigned id) {
  if(id>=sizeof strand_first/sizeof *strand_first) return 0;
  return strand_starts[strand_first[id]+1]-strand_starts[strand_first[id]];
}
static void scroll_text(MoidaIntro *g,unsigned id) {
  MoidaText *t=&g->opening.text;
  g->scroll_skip%=strand_length(id)+4;
  moida_text_clear(t);
  for(unsigned i=g->scroll_skip;i<4;i++)moida_text_append(t,6,0,0);
  moida_text_append(t,id,0,g->scroll_skip<4?0:g->scroll_skip-4);
  for(unsigned i=0;i<4;i++)moida_text_append(t,6,0,0);
  moida_text_append(t,id,0,0);
  moida_text_draw(t,&g->opening.display);g->scroll_skip++;
}
static void speak_text(MoidaIntro *g) {
  MoidaOpening *o=&g->opening;unsigned length=strand_length(97);
  if(length<=13)centered(o,97);else scroll_text(g,97);
  if(g->speaker_frames<length && !(g->speaker_frames&1)) {
    moida_melody_clear(&o->melody);o->beep_hz=moida_note_hz(43);o->beep_duration_ms=50;
  }
  if(!o->runner.wait)moida_icon_set(&o->display,290,!(g->speaker_frames&1));
  g->speaker_frames++;
}
static int intro_steps(void *user,int id) {
  (void)user;return id==1?11:id==2?43:1;
}
static void intro_step(void *user,MoidaRunner *runner,int id,int step) {
  MoidaIntro *g=user;MoidaOpening *o=&g->opening;
  if(id==1 && step<9) {
    if(step==0)moida_runner_start(&g->loop,0);
    opening_step(o,runner,id,step);return;
  }
  if(id==1 && step==9) {
    g->scroll_skip=0;g->speaker_frames=0;o->runner.waiting_input=true;
    static const unsigned icons[]={287,286,288,290,289};
    for(unsigned i=0;i<sizeof icons/sizeof *icons;i++)moida_icon_set(&o->display,icons[i],false);
    moida_runner_queue(&o->runner,94,(int)strand_length(97));
    moida_runner_start(&g->loop,2);return;
  }
  if(id==2) {
    if(step==42) {moida_runner_queue(runner,2,0);return;}
    speak_text(g);runner->wait=1;
    if(step==0)moida_icon_set(&o->display,136,false);
    if(step==5)moida_icon_set(&o->display,137,true);
    if(step==20)moida_icon_set(&o->display,137,false);
    if(step==27)moida_icon_set(&o->display,136,true);
    return;
  }
  if(id==94)moida_runner_start(&g->loop,0);
}
void moida_intro_init(MoidaIntro *g,unsigned welcome_strand) {
  memset(g,0,sizeof *g);moida_opening_init(&g->opening,welcome_strand);
  moida_runner_init(&g->loop);
}
MoidaIntroStatus moida_intro_tick(MoidaIntro *g,uint8_t buttons) {
  if(g->status!=MOIDA_INTRO_RUNNING)return g->status;
  buttons&=15;
  if(buttons & (uint8_t)~g->previous_buttons) {
    /* Original starts routine 3 here, which immediately draws the generated house.
       Do not invent or replay that state until house logic is ported. */
    g->status=MOIDA_INTRO_NEED_HOUSE;return g->status;
  }
  g->previous_buttons=buttons;
  MoidaOpening *o=&g->opening;o->beep_hz=0;o->beep_duration_ms=0;
  MoidaRoutineEnv env={intro_steps,intro_step,g};
  moida_runner_tick(&o->runner,&env);moida_runner_tick(&g->loop,&env);
  uint8_t note;
  if(moida_melody_pop(&o->melody,&note)) {o->beep_hz=moida_note_hz(note);o->beep_duration_ms=o->melody.duration_ms;}
  return g->status;
}
