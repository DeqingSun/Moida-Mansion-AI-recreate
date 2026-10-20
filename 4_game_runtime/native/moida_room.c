#include "moida_room.h"
#include <string.h>
static bool gated(const MoidaRoomEntity *e,uint64_t used) {return e->gate_kind && (e->gate_keys & ~used);}
MoidaMove moida_room_can_move(const MoidaRoom *r,unsigned direction,uint64_t used) {
  if(direction>=4 || !(r->exits&(1u<<direction)))return (MoidaMove){0,0,0};
  for(unsigned i=0;i<r->entity_count;i++) {
    const MoidaRoomEntity *e=&r->entities[i];
    if(e->exit!=(int)direction)continue;
    if(gated(e,used)) {
      if(e->kind==2)return (MoidaMove){2,e->before[0],e->gate_keys};
      if(e->kind==1)return (MoidaMove){3,0,0};
    }
    break;
  }
  return (MoidaMove){1,0,0};
}
void moida_room_draw(const MoidaRoom *r,MoidaDisplay *d,uint64_t have,uint64_t used) {
  for(unsigned i=0;i<r->entity_count;i++) {
    const MoidaRoomEntity *e=&r->entities[i];
    if(gated(e,used))for(unsigned j=0;j<e->before_count;j++)moida_icon_set(d,e->before[j],true);
    else if(!(e->kind==3&&(have&(UINT64_C(1)<<e->id))))
      for(unsigned j=0;j<e->after_count;j++)moida_icon_set(d,e->after[j],true);
  }
  for(unsigned i=0;i<r->icon_count;i++) {
    unsigned icon=r->icons[i];if(icon==263||icon==264||icon==265)continue;
    moida_icon_set(d,icon,true);moida_icon_clear_children(d,icon);
  }
}
void moida_room_draw_initial(const MoidaRoom *r,MoidaDisplay *d) {
  moida_display_fill(d,false);moida_room_draw(r,d,0,0);if(r->spider)moida_icon_set(d,229,true);
  moida_icon_set(d,284,true);moida_icon_set(d,293+r->coord,true);
  static const unsigned arrows[]={286,287,290,289};
  for(unsigned direction=0;direction<4;direction++) {
    unsigned kind=moida_room_can_move(r,direction,0).kind;
    if(kind==1||kind==2)moida_icon_set(d,arrows[direction],true);
  }
  moida_icon_set(d,288,true);
  MoidaText text={0};moida_text_append(&text,r->name,0,0);moida_text_center(&text);moida_text_draw(&text,d);
}
static int reveal_count(void *u,int id){(void)u;(void)id;return 4;}
static void reveal_step(void *u,MoidaRunner *runner,int id,int step) {
  (void)id;MoidaReveal *g=u;static const unsigned notes[]={22,35,43,56};
  moida_room_draw_initial(g->room,&g->display);
  if(step<3)moida_erase_top(&g->display,(unsigned)(75-25*step));
  g->hz=moida_note_hz(notes[step]);g->duration=50;runner->wait=2;
}
void moida_reveal_init(MoidaReveal *g,const MoidaRoom *room) {
  memset(g,0,sizeof *g);g->room=room;moida_runner_init(&g->runner);moida_runner_start(&g->runner,3);
}
bool moida_reveal_tick(MoidaReveal *g) {
  if(g->complete)return false;
  g->hz=0;g->duration=0;
  MoidaRoutineEnv env={reveal_count,reveal_step,g};moida_runner_tick(&g->runner,&env);
  /* Preserve the final two wait ticks before reporting the unported boundary. */
  if(g->runner.index<0&&g->runner.wait==0)g->complete=true;
  return true;
}

void moida_room_move_frame(const MoidaRoom *destination,MoidaDisplay *d,unsigned direction,unsigned step,double *hz,int *duration) {
  *hz=0;*duration=0;if(direction>3||step>6)return;
  static const unsigned arrows[]={286,287,290,289};
  if(step<4)moida_erase_direction(d,direction,25*(step+1));
  else {moida_room_draw_initial(destination,d);moida_erase_direction(d,direction^1,100-25*(step-3));}
  if(step==0||step>=4)moida_icon_clear_children(d,285);
  if(step!=6)moida_icon_set(d,arrows[direction],true);
  if(step==0||step==3||step==6){
    unsigned note=35;if(direction==2)note=step==0?35:step==3?43:56;
    if(direction==3)note=step==0?56:step==3?43:35;
    *hz=moida_note_hz(note);*duration=50;
  }
}

static int search_count(void *u,int id){(void)u;return (id==28||id==26)?2:id==27?17:id==29?10:id==23?2:id==24?7:id==25?11:id==22?2:id==20?5:id==19?6:21;}
static void search_step(void *u,MoidaRunner *runner,int id,int step){
 MoidaSearch *s=u;
 if(id==28||id==26){if(step==0)moida_runner_queue(runner,id==28?20:24,0);else{s->attacked=true;s->complete=true;}return;}
 if((id==21&&step==0)||(id==25&&step==0)||(id==29&&step==1))s->count_search=true;
 if(id==29){
  if(step==0){moida_runner_queue(runner,20,0);return;}
  if(step==9){s->complete=true;return;}
  MoidaText text={0};if(step%2){moida_text_append(&text,51,0,0);moida_text_center(&text);}moida_text_draw(&text,&s->display);moida_icon_set(&s->display,s->lock_icon,step%2!=0);runner->wait=1;
  if(step%2||step==2){s->hz=moida_note_hz(step==2?4:5);s->duration=50;}return;
 }
 if(id==27){
  if(step==16){moida_runner_queue(runner,23,0);return;}
  if(step==0||step==2){moida_room_draw_initial(s->room,&s->display);MoidaText text={0};moida_text_append(&text,step==0?28:52,0,0);if(step==2)moida_text_center(&text);moida_text_draw(&text,&s->display);}
  if(step==0){moida_icon_set(&s->display,s->icon,false);moida_icon_set(&s->display,s->lock_icon,false);moida_icon_set(&s->display,288,false);s->hz=moida_note_hz(43);s->duration=50;}
  else if(step==1){s->hz=moida_note_hz(43);s->duration=50;runner->wait=1;}
  else if(step==2){moida_icon_set(&s->display,s->lock_icon,true);runner->wait=3;}
  else if(step<=8){bool on=step%2==0;moida_icon_set(&s->display,s->lock_icon,on);moida_icon_set(&s->display,271,!on);if(on)runner->wait=3;else{s->hz=moida_note_hz(step==3?10:step==5?5:17);s->duration=50;}}
  else if(step==9){static const uint8_t notes[]={22,28,34,38,43};moida_melody_set(&s->melody,notes,5,60);moida_icon_set(&s->display,s->lock_icon,true);moida_icon_set(&s->display,271,false);runner->wait=1;}
  else if(step<=14)moida_icon_set(&s->display,s->lock_icon,step%2!=0);
  else runner->wait=5;
  return;
 }
 if(id==25&&step==0){moida_runner_queue(runner,24,0);return;}
 if(id==25&&step==10){s->complete=true;return;}
 if(id==24||id==25){
  if(id==24&&step==0){moida_room_draw_initial(s->room,&s->display);MoidaText text={0};moida_text_draw(&text,&s->display);}
  bool on=id==24?step%2==0:step==2||step==5||step==8;
  moida_icon_set(&s->display,s->icon,on);static const unsigned notes[]={52,61,64};s->hz=moida_note_hz(notes[step%3]);s->duration=50;return;
 }
 if(id==22||id==23){moida_runner_queue(runner,step?21:id==23?19:20,0);return;}
 if(id==20&&step==4){moida_runner_queue(runner,19,0);return;}
 if(id==21&&step==20){s->complete=true;return;}
 unsigned strand=28,note=0;
 bool draw=true,hide=false;
 if(id==20){
  if(step==0){hide=true;note=64;}
  if(step==1){draw=false;note=64;runner->wait=1;}
  if(step==2)runner->wait=3;
  if(step==3){note=51;runner->wait=1;}
 }else{strand=(id==19?29:32)+(unsigned)step/2;hide=step%2==0;note=hide?47:51;runner->wait=1;}
 if(draw){moida_room_draw_initial(s->room,&s->display);if(hide){moida_icon_set(&s->display,s->icon,false);if(s->locked)moida_icon_set(&s->display,s->lock_icon,false);}
  if(id==20&&step==0)moida_icon_set(&s->display,288,false);
  MoidaText text={0};moida_text_append(&text,strand,0,0);moida_text_draw(&text,&s->display);
 }
 if(note){s->hz=moida_note_hz(note);s->duration=50;}
}
void moida_search_init(MoidaSearch *s,const MoidaRoom *room,unsigned icon){
 memset(s,0,sizeof *s);s->room=room;s->icon=icon;moida_room_draw_initial(room,&s->display);
 moida_runner_init(&s->runner);moida_runner_start(&s->runner,22);
}
bool moida_search_tick(MoidaSearch *s){
 if(s->complete)return false;s->hz=0;s->duration=0;s->count_search=false;
 MoidaRoutineEnv env={search_count,search_step,s};moida_runner_tick(&s->runner,&env);
 uint8_t note;if(moida_melody_pop(&s->melody,&note)){s->hz=moida_note_hz(note);s->duration=s->melody.duration_ms;}
 if(s->complete)moida_room_draw_initial(s->room,&s->display);
 return true;
}

#define RESULT_MELODY(...) do{const uint8_t notes[]={__VA_ARGS__};moida_melody_set(&s->melody,notes,sizeof notes,60);}while(0)
static void result_text(MoidaResult *s,unsigned id){MoidaText t={0};if(id){moida_text_append(&t,id,0,0);moida_text_center(&t);}moida_text_draw(&t,&s->display);}
static void result_input_clear(MoidaResult *s){for(unsigned i=286;i<=290;i++)moida_icon_set(&s->display,i,false);}
static void result_speak(MoidaResult *s,MoidaRunner *r,unsigned id){s->speech_strand=id;s->speaking=true;s->speech_frames=0;s->scroll_skip=0;r->waiting_input=true;result_input_clear(s);moida_runner_queue(r,94,(int)moida_strand_length(id));moida_runner_start(&s->loop,92);}
static void result_button_beep(MoidaResult *s,unsigned n,bool all){static const unsigned notes[]={47,51,52,56};moida_melody_clear(&s->melody);s->hz=moida_note_hz((all||n<=s->pushing_count)&&n<4?notes[n]:5);s->duration=100;}
static int result_count(void *u,int id){(void)u;return id==43?5:id==13?2: id==65?1:((id>=66&&id<=68)||(id>=75&&id<=83))?2:(id==69||id==70||id==73)?4:(id==71||id==72)?5:id==74?3:id==84?13:id==85?4:id==49?2:id==63?4:id==64?2:id==30?4:id==31?2:(id>=32&&id<=34)?3:id==35?9:id==36?5:id==37?3:id==39?9:id==91?22:id==90?29:id==50?3:id==51?1:id==52?7:id==53?35:(id>=54&&id<=56)?7:(id==57||id==58)?3:id==59?9:id==60?6:id==87?6:id==88?15:id==89?4:id==93?9:id==86?32:id==92?3:id==94?1:id==48?28:id==41?8:id==40?7:id==42?2:12;}
static void result_step(void *u,MoidaRunner *r,int id,int step){
 MoidaResult *s=u;
 if(id==13){moida_icon_set(&s->display,s->reward_icon,step==0);moida_melody_clear(&s->melody);s->hz=moida_note_hz(step==0?22:21);s->duration=50;if(step==1)s->complete=true;return;}
 if(id==43){if(step==0){moida_display_fill(&s->display,false);moida_icon_set(&s->display,311,true);RESULT_MELODY(31,59,64);r->wait=20;}else if(step==1||step==2){s->talk_icon=step==1?0:222;result_speak(s,r,step==1?98:99);moida_runner_start(&s->loop,93);}else if(step==3){RESULT_MELODY(64,59,31);}else{s->complete=true;s->display=s->base;}return;}
 if(id>=65&&id<=85){
  if(id==65){s->display=s->base;moida_icon_set(&s->display,93,true);RESULT_MELODY(17,16,0,14);r->wait=10;return;}
  if((id>=66&&id<=68)||(id>=75&&id<=83)){
   static const unsigned pairs[18][2]={{65,72},{65,71},{65,73},{0,0},{0,0},{0,0},{0,0},{0,0},{0,0},{69,72},{69,73},{70,71},{70,73},{74,71},{74,72},{69,84},{70,84},{74,84}};
   moida_runner_queue(r,(int)pairs[id-66][step],0);return;
  }
  if(id>=69&&id<=74){
   s->display=s->base;unsigned icon=id==69?98+step:id==70?103+step:id==71?(step<4?101-step:0):id==72?(step<4?106-step:0):id==73?(step<3?93+step:0):95-step;
   if(icon)moida_icon_set(&s->display,icon,true);moida_melody_clear(&s->melody);s->hz=moida_note_hz(13);s->duration=50;r->wait=2;return;
  }
  if(id==84){if(step==0){moida_icon_set(&s->display,93,true);r->wait=10;}else if(step==1){moida_runner_queue(r,94,40);moida_runner_start(&s->loop,85);}else if(step==2){s->display=s->base;RESULT_MELODY(59,58,0,56,0,38,37,0,35,0,17,16,0,14);}else if(step<12){moida_icon_set(&s->display,s->ghost_reveal_icon,step%2!=0);r->wait=1;}else{s->complete=true;s->display=s->base;}return;}
  if(id==85){if(step==3){moida_runner_queue(r,id,0);return;}s->display=s->base;if(s->ghost_random)moida_erase_ghost(&s->display,s->ghost_random);static const unsigned notes[]={59,58,56};moida_melody_clear(&s->melody);s->hz=moida_note_hz(notes[step]);s->duration=50;return;}
 }
 if(id==49){if(step==0){s->display=s->base;result_text(s,100);RESULT_MELODY(19,40,61);r->wait=30;}else{s->complete=true;s->display=s->base;}return;}
 if(id==63){if(step==0){RESULT_MELODY(40,38,40);}else if(step<=2)moida_icon_set(&s->display,s->monster_icon,step==2);else s->complete=true;return;}
 if(id==64){if(step==0){RESULT_MELODY(40,38,34);}else s->complete=true;return;}
 if(id==30||id==31){if(step==(id==30?3:1)){s->dead=true;moida_runner_queue(r,35,0);}else{moida_runner_queue(r,94,id==30&&step==0?8:20);moida_runner_start(&s->loop,id==30?32+step:34);}return;}
 if(id>=32&&id<=34){if(step==2){moida_runner_queue(r,id,0);return;}moida_icon_set(&s->display,s->monster_icon,step!=0);if(id==32){RESULT_MELODY(40,38);r->wait=1;}else{result_text(s,step?0:id==33?55:54);moida_melody_clear(&s->melody);s->hz=moida_note_hz(id==33?40:61);s->duration=50;}return;}
 if(id==35){
  if(step==0){s->dead=true;moida_display_fill(&s->display,false);moida_icon_set(&s->display,311,true);moida_icon_set(&s->display,s->monster_spot,true);moida_icon_set(&s->display,s->monster_icon,true);moida_runner_queue(r,94,20);moida_runner_start(&s->loop,36);}
  else if(step==1){moida_display_fill(&s->display,false);moida_icon_set(&s->display,177,true);moida_icon_set(&s->display,176,true);moida_runner_queue(r,94,20);moida_runner_start(&s->loop,37);RESULT_MELODY(21,63,19,61,17,59,16,58,14,56,13,55,10,52,9,51,7,49,5,47,4,46);}
  else if(step==2){moida_display_fill(&s->display,false);moida_icon_set(&s->display,177,true);moida_icon_set(&s->display,176,true);r->wait=10;}
  else if(step==3||step==4){result_text(s,73+step);if(step==3){RESULT_MELODY(22,1);}else{RESULT_MELODY(30,9);}r->wait=10;}
  else if(step==5){result_text(s,78);moida_melody_clear(&s->melody);s->hz=moida_note_hz(31);s->duration=50;}
  else if(step==6){moida_theme_melody(&s->melody);moida_runner_queue(r,94,120);moida_runner_start(&s->loop,39);}
  else if(step==7){s->talk_icon=0;result_speak(s,r,90);}
  else s->complete=true;return;
 }
 if(id==36){if(step==4){moida_runner_queue(r,id,0);return;}moida_icon_set(&s->display,s->monster_icon,step%2==0);moida_icon_set(&s->display,177,step%2==0);if(step==0){RESULT_MELODY(64,55,51,43);}return;}
 if(id==37){if(step==2){moida_runner_queue(r,id,0);return;}moida_icon_set(&s->display,176,step==0);moida_icon_set(&s->display,177,step==0);return;}
 if(id==39){if(step==8){moida_runner_queue(r,id,0);return;}result_text(s,step%2?78:0);r->wait=step%2?3:1;return;}
 if(id==90){
  if(step==0){moida_runner_start(&s->loop,0);moida_display_fill(&s->display,false);moida_icon_set(&s->display,134,true);if(s->escape_spider)moida_icon_set(&s->display,s->escape_spider,true);moida_icon_set(&s->display,136,true);RESULT_MELODY(1,7,10,22,28,31,43,49,52,64);r->wait=20;}
  else if(step>=1&&step<=3){if(step==1){RESULT_MELODY(1,5,7,5,1,5,7,5,1,5,7,5,1,5,7,5);result_text(s,88);}else if(step==2){RESULT_MELODY(5,7,10,7,5,7,10,7,5,7,10,7,5,7,10,7);}else{RESULT_MELODY(14,17,19,17,14,17,19,17,14,17,19,17,14,17,19,17);}r->wait=15;}
  else if(step==4){RESULT_MELODY(22,0,0,17,0,0,19,0,0,22,0,0,19);}
  else if(step==5)r->wait=20;
  else if(step==6)moida_theme_melody(&s->melody);
  else if(step>=7&&step<=23){if(step==7)moida_stat_text(&s->display,82,0,83+s->rescued_count);for(unsigned f=0;f<4;f++)if(s->rescued_icons[f])moida_icon_set(&s->display,s->rescued_icons[f],step%2!=0);r->wait=1;}
  else if(step<=26){moida_stat_text(&s->display,step==24?79:step==25?80:81,s->stats[step-24],0);r->wait=30;}
  else if(step==27){s->talk_icon=0;result_speak(s,r,89);if(s->ending_room)moida_runner_start(&s->loop,91);}
  else{s->complete=true;}return;
 }
 if(id==50){if(step==0){result_input_clear(s);moida_icon_set(&s->display,s->search_icon,true);result_text(s,48);RESULT_MELODY(51,52);r->wait=20;}else if(step==1){moida_icon_set(&s->display,s->search_icon,false);RESULT_MELODY(17,38);}else{moida_icon_set(&s->display,s->search_icon,true);r->wait=10;}return;}
 if(id==51){result_text(s,43);RESULT_MELODY(55,34,13);r->wait=20;return;}
 if(id==52||id==59){
  if(step==0)moida_runner_queue(r,50,0);
  else if(step<=4){result_button_beep(s,(unsigned)(step-(id==52?1:0)),false);r->wait=step==4?20:5;if(step==1)result_text(s,0);}
  else if(step==5)moida_runner_queue(r,51,0);
  else if(id==59&&step==6){RESULT_MELODY(28,28,38);moida_icon_set(&s->display,s->talk_icon,true);r->wait=2;}
  else if(id==59&&step==7)result_speak(s,r,71);
  else{s->complete=true;s->display=s->base;}return;
 }
 if(id==60){
  if(step==0){s->display=s->base;RESULT_MELODY(28,28,38);moida_icon_set(&s->display,s->talk_icon,true);r->wait=2;}
  else if(step==1){moida_icon_set(&s->display,s->crown_friend,true);result_speak(s,r,72);}
  else if(step==2){result_text(s,0);moida_icon_set(&s->display,s->talk_icon,false);moida_icon_set(&s->display,s->search_icon,false);RESULT_MELODY(17,38);}
  else if(step==3){moida_icon_set(&s->display,s->search_icon,true);r->wait=10;}
  else if(step==4){RESULT_MELODY(55,34,13);r->wait=20;}
  else{s->complete=true;s->display=s->base;}return;
 }
 if(id>=54&&id<=56){if(step==6){moida_runner_queue(r,id,0);return;}moida_icon_set(&s->display,133,step%2==0);if(step==0){moida_display_fill(&s->display,false);moida_icon_set(&s->display,133,true);moida_icon_set(&s->display,276,true);unsigned n=id==54?19:id==55?21:22;uint8_t notes[]={(uint8_t)n,(uint8_t)(n+21),(uint8_t)(n+42),(uint8_t)n,(uint8_t)(n+21),(uint8_t)(n+42)};moida_melody_set(&s->melody,notes,6,60);}return;}
 if(id==57||id==58){if(step==2){moida_runner_queue(r,id,0);return;}moida_icon_set(&s->display,44,step==0);if(id==58)moida_icon_set(&s->display,281,step==0);r->wait=1;return;}
 if(id==53){
  if(step==0)result_input_clear(s);
  else if(step==1){result_text(s,48);RESULT_MELODY(51,52);r->wait=20;}
  else if(step==2){moida_icon_set(&s->display,s->search_icon,false);RESULT_MELODY(17,38);}
  else if(step==3){moida_icon_set(&s->display,s->search_icon,true);r->wait=10;}
  else if(step<=7){result_button_beep(s,(unsigned)(step-4),true);r->wait=step==7?20:10;if(step==4)result_text(s,0);}
  else if(step<=11){moida_erase_border(&s->display,(unsigned)(step-7)*20,311);if(step==8){RESULT_MELODY(1,22,43,64);}else{moida_icon_set(&s->display,43,true);moida_icon_set(&s->display,276,true);}}
  else if(step==12||step==21){moida_display_fill(&s->display,false);moida_icon_set(&s->display,311,true);moida_icon_set(&s->display,276,true);if(step==12)moida_icon_set(&s->display,43,true);}
  else if(step==13)r->wait=20;
  else if(step<=16){moida_runner_queue(r,94,12);moida_runner_start(&s->loop,step+40);}
  else if(step==17){moida_icon_set(&s->display,311,true);RESULT_MELODY(22,1);r->wait=20;}
  else if(step==18){moida_icon_set(&s->display,42,true);RESULT_MELODY(26,31,35,40,47,56,52,56,47,52,56,61);}
  else if(step==19||step==20){moida_runner_queue(r,94,40);moida_runner_start(&s->loop,step+38);if(step==20){result_text(s,74);RESULT_MELODY(28,28,38);moida_icon_set(&s->display,43,false);}}
  else if(step==22)s->award_crown=true;
  else if(step==23){s->display=s->base;result_text(s,0);moida_icon_set(&s->display,272,false);r->wait=1;RESULT_MELODY(17,38,59);}
  else if(step<=32){moida_icon_set(&s->display,272,step%2==0);r->wait=1;if(step>=26&&step%2==0){moida_melody_clear(&s->melody);s->hz=moida_note_hz(59);s->duration=50;}}
  else if(step==33){RESULT_MELODY(28,28,38);s->talk_icon=281;result_speak(s,r,73);}
  else{s->complete=true;s->display=s->base;}return;
 }
 if(id==94){moida_runner_start(&s->loop,0);s->speaking=false;return;}
 if(id==87||id==88||id==89){
  if(step==0){moida_runner_queue(r,86,0);return;}
  if(step==1||(id==87&&step==3)||(id==88&&step==13)){
   s->speech_strand=step==1?(id==89?73:s->help_strand):s->hint_strand;
   s->speaking=true;s->speech_frames=0;s->scroll_skip=0;r->waiting_input=true;
   for(unsigned icon=286;icon<=290;icon++)moida_icon_set(&s->display,icon,false);
   moida_runner_queue(r,94,(int)moida_strand_length(s->speech_strand));moida_runner_start(&s->loop,step==1?92:93);return;
  }
  if((id==87&&step==5)||(id==88&&step==14)||(id==89&&step==3)){s->complete=true;s->display=s->base;return;}
  if(id==88){moida_icon_set(&s->display,s->hint_icon,step%2==0);if(step==2){s->give_gift=true;moida_icon_set(&s->display,s->face_icon,true);static const uint8_t notes[]={55,49,43,38,43,49,55,59};moida_melody_set(&s->melody,notes,8,60);}return;}
  if(id==87&&step==2){moida_display_fill(&s->display,false);moida_icon_set(&s->display,311,true);moida_icon_set(&s->display,s->face_icon,true);static const uint8_t notes[]={31,59,64};moida_melody_set(&s->melody,notes,3,60);r->wait=20;}
  else{static const uint8_t notes[]={64,59,31};moida_melody_set(&s->melody,notes,3,60);}return;
 }
 if(id==91||id==92||id==93){
  if(step==(id==91?21:id==92?2:8)){moida_runner_queue(r,id,0);return;}
  if(id==91){if(step==0&&s->ending_room)s->ending_room(s->ending_user,&s->display);}else moida_icon_set(&s->display,s->talk_icon,step%2==0);
  unsigned len=moida_strand_length(s->speech_strand);MoidaText text={0};
  if(len<=13){moida_text_append(&text,s->speech_strand,0,0);moida_text_center(&text);}
  else{s->scroll_skip%=len+4;for(unsigned i=s->scroll_skip;i<4;i++)moida_text_append(&text,6,0,0);moida_text_append(&text,s->speech_strand,0,s->scroll_skip<4?0:s->scroll_skip-4);for(unsigned i=0;i<4;i++)moida_text_append(&text,6,0,0);moida_text_append(&text,s->speech_strand,0,0);s->scroll_skip++;}
  moida_text_draw(&text,&s->display);
  if(s->speech_frames<len&&!(s->speech_frames&1)){moida_melody_clear(&s->melody);s->hz=moida_note_hz(43);s->duration=50;}
  if(!s->runner.wait)moida_icon_set(&s->display,287,!(s->speech_frames&1));
  s->speech_frames++;r->wait=1;if(id==93&&step%2==0)moida_icon_set(&s->display,s->hint_icon,step%4==0);return;
 }
 if(id==86){
  if(step==0){moida_icon_set(&s->display,285,false);moida_icon_clear_children(&s->display,285);static const uint8_t notes[]={26,31,35,40,47,56,52,56,47,52,56,61};moida_melody_set(&s->melody,notes,12,60);}
  else if(step>=2&&step<=11)moida_erase_border(&s->display,(unsigned)(step-1)*10,s->search_icon);
  else if(step==12)r->wait=10;
  else if(step==13){MoidaText text={0};moida_text_append(&text,s->rescued_strand,0,0);moida_text_center(&text);moida_text_draw(&text,&s->display);moida_icon_set(&s->display,s->search_icon,false);moida_icon_set(&s->display,s->face_icon,true);static const uint8_t notes[]={52,59,64,0,59,0,64};moida_melody_set(&s->melody,notes,7,60);}
  else if(step>=14&&step<=29){moida_icon_set(&s->display,s->face_icon,step%2!=0);if(step%2==0)moida_icon_set(&s->display,s->search_icon,step%4==0);if(step==29)r->wait=4;}
  else if(step==30){s->speech_strand=62;s->scroll_skip=0;s->speaking=true;s->speech_frames=0;r->waiting_input=true;for(unsigned icon=286;icon<=290;icon++)moida_icon_set(&s->display,icon,false);moida_runner_queue(r,94,12);moida_runner_start(&s->loop,92);}
  else if(step==31){s->hz=moida_note_hz(64);s->duration=50;}
  return;
 }
 if(id==48){
  if(step==27){s->complete=true;s->display=s->base;return;}
  if(step==0){MoidaText text={0};moida_text_append(&text,46,0,0);moida_text_center(&text);moida_text_draw(&text,&s->display);for(unsigned icon=286;icon<=290;icon++)moida_icon_set(&s->display,icon,false);static const uint8_t notes[]={55,49,43,38,43,49,55,59};moida_melody_set(&s->melody,notes,8,60);}
  else if(step<=12){moida_icon_set(&s->display,s->search_icon,step%2==0);if(step==10)r->wait=5;if(step==11){static const uint8_t notes[]={17,38};moida_melody_set(&s->melody,notes,2,60);}if(step==12)r->wait=10;}
  else if(step<=21){moida_icon_reveal(&s->display,s->tunnel_icon,(unsigned)(step-11)*10);if(step==13){static const uint8_t notes[]={22,28,34,38,43};moida_melody_set(&s->melody,notes,5,60);}if(step==21)s->use_latch=true;}
  else {MoidaText text={0};moida_text_append(&text,53,0,0);moida_text_center(&text);moida_text_draw(&text,&s->display);static const unsigned notes[]={22,28,34,38,43};s->hz=moida_note_hz(notes[step-22]);s->duration=50;r->wait=step==26?10:2;}return;
 }
 if(id==41){
  if(step==7){s->complete=true;s->display=s->base;return;}
  moida_icon_set(&s->display,s->lock_icon,step%2!=0);moida_icon_set(&s->display,291,step%2!=0);r->wait=1;
  if(step==0){static const uint8_t notes[]={22,28,34,38,43};moida_melody_set(&s->melody,notes,5,60);}return;
 }
 if(id==40){
  if(step==6){s->complete=true;s->display=s->base;return;}
  MoidaText text={0};if(step%2==0){moida_text_append(&text,50,0,0);moida_text_center(&text);}moida_text_draw(&text,&s->display);
  moida_icon_set(&s->display,s->lock_icon,step%2==0);r->wait=1;
  if(step%2==0||step==1){s->hz=moida_note_hz(step==1?4:5);s->duration=50;}return;
 }
 if((id==42&&step==1)||(id!=42&&step==11)){s->complete=true;s->display=s->base;return;}
 if(step==0){
  s->display=s->base;MoidaText text={0};moida_text_append(&text,id==42?42:id==44?45:id==47?49:47,0,0);moida_text_center(&text);moida_text_draw(&text,&s->display);
  static const uint8_t part[]={40,43,49,52,61};
  static const uint8_t empty[]={55,34,13},found[]={55,49,43,38,43,49,55,59};
  moida_melody_set(&s->melody,id==42?empty:id==47?part:found,id==42?3:id==47?5:8,60);
  if(id==42)r->wait=20;else if(id==44)moida_icon_set(&s->display,291,true);
 }else{moida_icon_set(&s->display,id==44?291:s->reward_icon,step%2==0);r->wait=step==10?10:1;}
}
void moida_result_init(MoidaResult *s,const MoidaDisplay *base,unsigned outcome){
 memset(s,0,sizeof *s);s->base=*base;s->display=*base;s->reward_icon=271;moida_runner_init(&s->loop);moida_runner_init(&s->runner);moida_runner_start(&s->runner,(int)outcome);
}
void moida_result_tick(MoidaResult *s){
 s->hz=0;s->duration=0;if(s->complete)return;
 MoidaRoutineEnv env={result_count,result_step,s};moida_runner_tick(&s->runner,&env);moida_runner_tick(&s->loop,&env);if(s->runner.index<0&&!s->complete){s->complete=true;s->display=s->base;}
 uint8_t note;if(moida_melody_pop(&s->melody,&note)){s->hz=moida_note_hz(note);s->duration=s->melody.duration_ms;}
}

static int ambient_count(void *u,int id){(void)u;return id==18?6:id==61?3:id==12?9:5;}
static void ambient_step(void *u,MoidaRunner *r,int id,int step){
 MoidaAmbient *s=u;
 if(id==18){if(step==0){r->wait=10;return;}if(step==5){moida_runner_queue(r,id,0);return;}MoidaText t={0};if(step%2==0){moida_text_append(&t,75,0,0);moida_text_center(&t);}moida_text_draw(&t,s->target);moida_icon_set(s->target,289,step%2==0);s->hz=moida_note_hz(step%2==0?51:43);s->duration=50;return;}
 if(id==61){if(step==2){moida_runner_queue(r,id,0);return;}s->visible=step==0;moida_icon_set(s->target,s->icon,s->visible);moida_icon_set(s->target,43,s->visible);r->wait=step==0?5:1;return;}
 if(id==11){if(step==4)moida_runner_queue(r,id,0);else if(step==1||step==3)r->wait=2;else moida_flicker_lights(s->target,step==0);return;}
 if((id==10&&step==4)||(id==12&&step==8)){moida_runner_queue(r,id,0);return;}
 if(id==10){s->visible=step%2!=0;if(step==3)r->wait=10;return;}
 if(step==0){r->wait=20;return;}if(step==3){r->wait=10;return;}
 s->visible=step==1||step==4||step==6;s->hz=moida_note_hz(s->visible?22:21);s->duration=50;
}
void moida_ambient_init(MoidaAmbient *s,unsigned routine,unsigned icon){memset(s,0,sizeof *s);s->icon=icon;s->visible=routine==10;moida_runner_init(&s->runner);if(routine)moida_runner_start(&s->runner,(int)routine);}
void moida_ambient_tick(MoidaAmbient *s,MoidaDisplay *d){s->hz=0;s->duration=0;if(!s->icon)return;s->target=d;MoidaRoutineEnv env={ambient_count,ambient_step,s};moida_runner_tick(&s->runner,&env);if(s->icon!=154)moida_icon_set(d,s->icon,s->visible);}

void moida_search_fairy_init(MoidaSearch *s,const MoidaRoom *room,unsigned icon){moida_search_init(s,room,icon);moida_runner_start(&s->runner,25);}
