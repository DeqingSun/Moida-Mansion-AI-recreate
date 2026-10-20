/* Native gameplay host. Low four input bits are original buttons; higher bits
   enable optional diagnostic behavior. Full-session tests use all gameplay effects. */
#include "moida_house.h"
#include <stdio.h>
#include <stdlib.h>
#include <inttypes.h>
#include <string.h>
static void crown_inventory(const MoidaHouse *h,const MoidaCrown *c,MoidaDisplay *d){static const unsigned faces[]={275,277,278};for(unsigned f=0;f<3;f++)if(c->buttons[f]>=0)moida_icon_set(d,faces[h->friend_assets[f]],false);if(c->got_crown)moida_icon_set(d,272,true);}
static unsigned crown_room_face(const MoidaHouse *h,const MoidaCrown *c,unsigned coord){static const unsigned faces[]={275,277,278};for(unsigned f=0;f<3;f++)if(c->buttons[f]>=0&&h->puzzle.entities[c->buttons[f]].coord==coord)return faces[h->friend_assets[f]];return 0;}
static bool can_escape(const MoidaHouse *h,const MoidaCrown *c,unsigned coord,uint64_t have){if(coord!=h->layout.entrance)return false;for(unsigned f=0;f<3;f++)if(c->buttons[f]>=0||!(have&(UINT64_C(1)<<h->friend_entities[f])))return false;return true;}
static void monster_result(MoidaResult *r,const MoidaDisplay *d,const MoidaMonster *m,unsigned routine,const MoidaRoom *room){moida_result_init(r,d,routine);r->monster_icon=m->icon;r->monster_spot=0;for(unsigned i=0;i<room->icon_count;i++){MoidaDisplay mask={0};moida_icon_set(&mask,room->icons[i],true);if(moida_icon_all(&mask,m->spot)){r->monster_spot=room->icons[i];break;}}}
static void game_draw(const MoidaHouse *h,const MoidaCrown *c,const MoidaMonster *m,unsigned coord,uint64_t have,uint64_t used,MoidaDisplay *d){moida_room_draw_initial(&h->rooms[coord].room,d);moida_house_draw_inventory(h,d,have,used);crown_inventory(h,c,d);if(m->mode&&m->coord==coord&&h->rooms[coord].kind!=2)moida_icon_set(d,m->icon,true);}
int main(int argc,char **argv){
 if(argc!=2)return 2;char *end;int64_t seed=strtoll(argv[1],&end,10);if(*end)return 2;
 MoidaHouse house;if(!moida_house_generate(&house,seed,11)){puts("{\"ready\":false,\"error\":\"House generation failed after 11 attempts; try another seed\"}");fflush(stdout);return 0;}
 unsigned welcome=91+(unsigned)moida_random_bounded(&house.random,1);
 printf("{\"ready\":true,\"entrance\":%u,\"attempts\":%u,\"welcome\":%u}\n",house.layout.entrance,house.attempts,welcome);fflush(stdout);
 MoidaEndingRooms ending_rooms={.house=&house};MoidaMonster monster={0};bool after_move=false,spider_searched=false,ghost_pending=false;unsigned ghost_step=0,ghost_routine=0;unsigned attacks=0,tip_count=0,idle_frames=0,cycle=0,post_wait=0;uint8_t previous_buttons=0;MoidaCrown crown;moida_crown_init(&crown);uint64_t have=0,used=0;int latch=-1;unsigned search_result=0,move_count=0,search_count=0;
 MoidaMelody lingering={0};MoidaAmbient ambient={0};bool ambient_ready=false,ambient_blocked=false;
 MoidaIntro intro;moida_intro_init(&intro,welcome);MoidaReveal reveal;MoidaSearch search;MoidaResult result,reminder_background,search_background;bool reminder_has_background=false,search_has_background=false;unsigned stage=0,buttons,coord=house.layout.entrance,move_direction=0,move_step=0,search_icon=0,search_coord=house.layout.entrance; MoidaDisplay *display=&intro.opening.display;
 while(scanf("%u",&buttons)==1){bool fresh_melody=false;double hz=0;int duration=0;unsigned move_result=0;bool idle_tick=(buttons&512)!=0,encounters=(buttons&1024)!=0,spiders=(buttons&2048)!=0,ghosts=(buttons&4096)!=0;
  uint8_t raw_buttons=(uint8_t)(buttons&15),pressed=(uint8_t)(raw_buttons&~previous_buttons);previous_buttons=raw_buttons;
  if(stage!=0)buttons=(buttons&~15u)|pressed;
  bool warning_was_active=stage==12&&!result.dead;
  bool accepts_actions=stage==2||stage==4||(stage==12&&!result.dead);
  if(accepts_actions){unsigned action=moida_control_action(pressed,can_escape(&house,&crown,coord,have),moida_room_can_move(&house.rooms[coord].room,2,used).kind==1,moida_room_can_move(&house.rooms[coord].room,3,used).kind==1);buttons&=~15u;if(action>=1&&action<=4)buttons|=(action<<4)|128;else if(action==5)buttons|=256;else if(action==6)buttons|=1;}
  if(stage==4&&((buttons>>4)&7)>=1&&((buttons>>4)&7)<=4){unsigned kind=moida_room_can_move(&house.rooms[coord].room,((buttons>>4)&7)-1,used).kind;if(kind==1||kind==2)stage=2;}
  if(stage==12&&!result.dead&&(buttons&256))stage=2;
  /* The diagnostic toggle cancels a warning, but cannot undo an established death. */
  if(!encounters&&monster.mode){monster.mode=0;monster.cooldown=0;if(stage==2||stage==11||(stage==12&&!result.dead)){stage=2;game_draw(&house,&crown,&monster,coord,have,used,&reveal.display);display=&reveal.display;ambient_ready=false;}}
  if(stage==2&&(buttons&1)&&can_escape(&house,&crown,coord,have)){moida_result_init(&result,&reveal.display,90);ending_rooms.coord=house.layout.entrance;result.ending_room=moida_ending_room;result.ending_user=&ending_rooms;static const unsigned faces[]={275,277,278};for(unsigned f=0;f<3;f++)result.rescued_icons[f]=faces[house.friend_assets[f]];result.rescued_icons[3]=crown.got_crown?272:0;result.escape_spider=spider_searched?229:0;result.rescued_count=3+(crown.got_crown?1:0);result.stats[0]=move_count;result.stats[1]=search_count;result.stats[2]=attacks;stage=9;}
  if(stage==9){if(result.speaking&&(buttons&271)&&!result.runner.wait)result.runner.waiting_input=false;moida_result_tick(&result);reveal.display=result.display;display=&reveal.display;hz=result.hz;duration=result.duration;if(result.complete)stage=10;}
  if(encounters&&(stage==2||(stage==12&&!result.dead))&&((buttons>>4)&7)>=1&&((buttons>>4)&7)<=4){unsigned dir=((buttons>>4)&7)-1;if(moida_room_can_move(&house.rooms[coord].room,dir,used).kind==1&&monster.mode&&monster.coord==coord&&house.rooms[coord].kind!=2&&(monster.guards&(1u<<dir))){unsigned routine=stage==12&&result.runner.positions[0].routine==31?35:31;monster.cooldown=3;if(stage==12)moida_runner_queue(&result.runner,(int)routine,0);else{monster_result(&result,display,&monster,routine,&house.rooms[coord].room);if(ambient_ready&&idle_tick)result.room_ambient=&ambient;}stage=12;if(routine!=35)attacks++;buttons&=~112u;}else if(stage==12&&moida_room_can_move(&house.rooms[coord].room,dir,used).kind==1){stage=2;}}

  if(stage==2 && ((buttons>>4)&7)>=1 && ((buttons>>4)&7)<=4){
   unsigned direction=((buttons>>4)&7)-1;
   MoidaMove move=moida_room_can_move(&house.rooms[coord].room,direction,used);
   move_result=move.kind;
   int next=moida_neighbor(coord,direction);
   if(move.kind==2&&(buttons&128)){
    MoidaDisplay prior_display=*display;
    bool unlocked=moida_door_use_key(move,have,&used);if(unlocked)moida_house_apply_used(&house,used);
    game_draw(&house,&crown,&monster,coord,have,used,&reveal.display);
    moida_result_init(&result,&reveal.display,unlocked?41:40);result.display=prior_display;result.lock_icon=move.lock_icon;stage=unlocked?7:6;
   }
   if(move.kind==1 && next>=0){unsigned reminder=0;if((buttons&128)&&!(have&(UINT64_C(1)<<house.friend_entities[0]))){for(unsigned e=0;e<house.rooms[coord].room.entity_count;e++)if(house.rooms[coord].room.entities[e].id==house.friend_entities[0])reminder=house.rooms[coord].room.entities[e].rustle;}if(reminder){reminder_has_background=warning_was_active||search_has_background;if(reminder_has_background){reminder_background=warning_was_active?result:search_background;reminder_background.room_ambient=NULL;}moida_result_init(&result,&reveal.display,13);result.reward_icon=reminder;}search_has_background=false;move_count++;after_move=true;coord=(unsigned)next;for(unsigned c=0;c<12;c++)house.rooms[c].room.spider=false;house.rooms[coord].room.spider=spiders&&moida_spider_after_move(&house.random,spider_searched,house.rooms[coord].kind);if(!reminder)ambient_ready=false;ambient_blocked=false;if(buttons&128){stage=3;move_direction=direction;move_step=0;if(reminder)stage=15;}else game_draw(&house,&crown,&monster,coord,have,used,&reveal.display);}
  }
  if(stage==15){moida_result_tick(&result);hz=result.hz;duration=result.duration;
   if(ambient_ready&&idle_tick){moida_ambient_tick(&ambient,&result.display);if(ambient.duration){hz=ambient.hz;duration=ambient.duration;}}
   if(reminder_has_background){reminder_background.display=result.display;moida_melody_clear(&reminder_background.melody);moida_result_loop_tick(&reminder_background);result.display=reminder_background.display;if(reminder_background.duration){hz=reminder_background.hz;duration=reminder_background.duration;}}
   reveal.display=result.display;display=&reveal.display;if(result.complete){stage=3;move_step=0;ambient_ready=false;}goto output_frame;}
  if(stage==3){
   if(move_step<7)moida_room_move_frame(&house.rooms[coord].room,&reveal.display,move_direction,move_step,&hz,&duration);
   else if(move_step==7){game_draw(&house,&crown,&monster,coord,have,used,&reveal.display);stage=2;}
   move_step++;
  }
  if((stage==2||stage==4)&&(buttons&256)){
   if(warning_was_active){search_background=result;search_background.room_ambient=NULL;search_has_background=true;}else if(stage==2)search_has_background=false;
   const MoidaRoom *room=&house.rooms[coord].room;
   /* Returning to the last searched room continues that room's target cycle. */
   if(search_coord!=coord){search_icon=0;search_coord=coord;}
   search_icon=moida_search_next_with_spider(room,search_icon,have,room->spider,spider_searched);
   if(!search_icon)search_icon=moida_search_next_with_spider(room,0,have,room->spider,spider_searched);
   moida_room_draw_initial(room,&reveal.display);
   search_result=0;if(search_icon){const MoidaRoomEntity *target=moida_search_entity(room,search_icon,used);if(target&&target->kind==3)moida_search_fairy_init(&search,room,search_icon);else moida_search_init(&search,room,search_icon);stage=4;
    if(!(encounters&&monster.mode&&monster.coord==coord&&house.rooms[coord].kind!=2)&&target&&target->gate_kind==1&&(target->gate_keys&~used)){
     search.lock_icon=target->before_count?target->before[0]:0;
     if(!(target->gate_keys&~have)){used|=target->gate_keys;moida_house_apply_used(&house,used);moida_runner_start(&search.runner,27);stage=8;}
     else{search.locked=true;moida_runner_start(&search.runner,29);}
    }if(encounters&&monster.mode&&monster.coord==coord&&house.rooms[coord].kind!=2){monster.cooldown=3;moida_runner_start(&search.runner,target&&target->kind==3?26:28);stage=4;}}
  }
  if(stage==4||stage==8){search.preserve_completion=true;moida_search_tick(&search);moida_house_draw_inventory(&house,&search.display,have,used);crown_inventory(&house,&crown,&search.display);
   if(search.drew_room&&encounters&&monster.mode&&monster.coord==coord&&house.rooms[coord].kind!=2)moida_icon_set(&search.display,monster.icon,true);
   if(search_has_background&&!search.complete){search_background.display=search.display;if(search.duration)moida_melody_clear(&search_background.melody);moida_result_loop_tick(&search_background);search.display=search_background.display;if(search_background.duration){search.hz=search_background.hz;search.duration=search_background.duration;}}
   if(search.count_search)search_count++;if(stage==8&&search.runner.index>=0&&search.runner.positions[search.runner.index].routine!=27)stage=4;reveal.display=search.display;display=&reveal.display;hz=search.hz;duration=search.duration;if(search.complete&&search.attacked){monster_result(&result,&search.display,&monster,30,&house.rooms[coord].room);stage=12;attacks++;}if(search.complete&&!search.attacked){stage=2;unsigned friend_result=moida_friend_rescue(&house,coord,search_icon,&have,&used);
    search_result=friend_result==3?100:friend_result==2?42:friend_result==1?45:moida_search_collect(&house,coord,search_icon,&have,used,&latch);
    if(search_icon==229&&house.rooms[coord].room.spider&&!spider_searched){spider_searched=true;house.rooms[coord].room.spider=false;search_result=49;}
    int crown_friend=-1;unsigned crown_outcome=0;const MoidaRoomEntity *searched=moida_search_entity(&house.rooms[coord].room,search_icon,used);if(searched)crown_outcome=moida_crown_search(&house,searched->id,&have,&crown,&crown_friend);if(crown_outcome)search_result=crown_outcome;
    if(friend_result==3)moida_house_apply_used(&house,used);
    moida_house_apply_collected(&house,have);game_draw(&house,&crown,&monster,coord,have,used,&reveal.display);
    if(friend_result==3){moida_result_init(&result,&reveal.display,86);result.display=search.display;result.search_icon=search_icon;for(unsigned f=0;f<3;f++){unsigned id=house.friend_entities[f];for(unsigned e=0;e<house.rooms[coord].room.entity_count;e++)if(house.rooms[coord].room.entities[e].id==id&&house.rooms[coord].room.entities[e].searchable==search_icon){unsigned a=house.friend_assets[f];static const unsigned faces[]={275,277,278},talks[]={280,282,283};result.face_icon=faces[a];result.talk_icon=talks[a];result.rescued_strand=56+a;}}moida_runner_start(&result.runner,(int)moida_rescue_followup(&house,have,&result));stage=5;}
    if(crown_outcome&&crown_outcome!=42){moida_house_draw_inventory(&house,&reveal.display,have,used);crown_inventory(&house,&crown,&reveal.display);moida_result_init(&result,&reveal.display,crown_outcome);result.display=search.display;result.search_icon=search_icon;for(unsigned f=0;f<3;f++)if(crown.buttons[f]>=0)result.pushing_count++;if(crown_friend>=0){unsigned a=house.friend_assets[crown_friend];static const unsigned faces[]={275,277,278},talks[]={280,282,283};result.face_icon=faces[a];result.talk_icon=talks[a];result.crown_friend=faces[a];}stage=5;}
    if(search_result==49||search_result==42||search_result==44||search_result==46||search_result==47||search_result==48){moida_house_draw_inventory(&house,&reveal.display,have,used);moida_result_init(&result,&reveal.display,search_result);result.display=search.display;if(search_result==48){result.search_icon=search_icon;for(unsigned i=0;i<house.rooms[coord].room.entity_count;i++){const MoidaRoomEntity *e=&house.rooms[coord].room.entities[i];if(e->kind==1&&latch>=0&&e->gate_keys==(UINT64_C(1)<<latch)){result.tunnel_icon=e->after_count?e->after[0]:0;break;}}}
    if(search_result==47)result.reward_icon=moida_fairy_reward_icon(&house,coord,search_icon);stage=5;}}}
  if(stage==5||stage==6||stage==7||stage==16){if(result.speaking&&(buttons&271)&&!result.runner.wait)result.runner.waiting_input=false;moida_result_tick(&result);if(result.award_crown){crown.got_crown=true;}if(result.give_gift&&result.gift_id>=0){have|=UINT64_C(1)<<result.gift_id;result.give_gift=false;}reveal.display=result.display;display=&reveal.display;hz=result.hz;duration=result.duration;if(result.use_latch&&latch>=0){used|=(UINT64_C(1)<<latch)&have;latch=-1;moida_house_apply_used(&house,used);}
   if(result.complete&&stage==5&&search_result==42&&!(have&(UINT64_C(1)<<house.friend_entities[0]))&&!(++tip_count%2)){MoidaDisplay tip_base=result.base;moida_result_init(&result,&tip_base,43);stage=16;moida_result_tick(&result);reveal.display=result.display;hz=result.hz;duration=result.duration;}
   if(result.complete){if(stage!=6)ambient_ready=false;bool searched_result=stage==5||stage==16;if(searched_result)ghost_pending=true;stage=2;game_draw(&house,&crown,&monster,coord,have,used,&reveal.display);if(encounters&&searched_result){stage=17;post_wait=3;ghost_pending=false;}}}
  /* Routine 62 draws first, waits two full ticks, then consumes peep randomness. */
  if(stage==17){if(post_wait){if(post_wait<3){uint8_t note;if(moida_melody_pop(&result.melody,&note)){hz=moida_note_hz(note);duration=result.melody.duration_ms;}}post_wait--;}else{moida_monster_occupy(&house,coord,&house.random,&monster);monster.mode=1;monster.cooldown=3;monster_result(&result,&reveal.display,&monster,63,&house.rooms[coord].room);stage=11;}}
  if(after_move&&stage==2){after_move=false;ghost_pending=true;if(encounters&&monster.mode){moida_monster_occupy(&house,coord,&house.random,&monster);if(house.rooms[coord].kind!=2){if(monster.cooldown<=1){monster.mode=0;monster.cooldown=0;monster_result(&result,&reveal.display,&monster,64,&house.rooms[coord].room);}else{monster.cooldown--;monster_result(&result,&reveal.display,&monster,63,&house.rooms[coord].room);}stage=11;}}}
  if(stage==11||stage==12){if(result.speaking&&(buttons&271)&&!result.runner.wait)result.runner.waiting_input=false;moida_result_tick(&result);reveal.display=result.display;display=&reveal.display;hz=result.hz;duration=result.duration;if(result.complete){lingering=result.melody;fresh_melody=true;if(stage==11)ghost_pending=true;stage=result.dead?13:2;}}
  if(stage==2&&ghost_pending){ghost_pending=false;if(ghosts){MoidaGhostMove g=moida_ghost_update(&house,coord,have,ghost_step);ghost_step=g.next_step;ghost_routine=g.routine;if(g.routine){game_draw(&house,&crown,&monster,coord,have,used,&reveal.display);crown_inventory(&house,&crown,&reveal.display);if(encounters&&monster.mode&&monster.coord==coord)moida_icon_set(&reveal.display,monster.icon,true);moida_result_init(&result,&reveal.display,g.routine);result.ghost_random=&house.random;result.ghost_reveal_icon=g.reveal_icon;stage=14;}}}
  if(stage==14){moida_result_tick(&result);reveal.display=result.display;display=&reveal.display;hz=result.hz;duration=result.duration;if(result.complete){stage=2;ambient_blocked=ghost_routine<81;}}
  buttons&=15;
  if(stage==0){if(moida_intro_tick(&intro,raw_buttons)==MOIDA_INTRO_NEED_HOUSE){moida_reveal_init(&reveal,&house.rooms[house.layout.entrance].room);stage=1;}else{hz=intro.opening.beep_hz;duration=intro.opening.beep_duration_ms;}}
  if(stage==1){bool was_complete=reveal.complete;moida_reveal_tick(&reveal);display=&reveal.display;hz=reveal.hz;duration=reveal.duration;if(was_complete)stage=2;}
  if((stage==2||stage==6||stage==7)&&idle_tick&&!ambient_blocked){
   if(!ambient_ready){unsigned face=crown_room_face(&house,&crown,coord);if(can_escape(&house,&crown,coord,have))moida_ambient_init(&ambient,18,0);else if(face)moida_ambient_init(&ambient,61,face);else moida_house_ambient(&house,coord,have,&ambient);ambient_ready=true;}
   moida_ambient_tick(&ambient,display);if(ambient.hz){hz=ambient.hz;duration=ambient.duration;}if(stage==6||stage==7)result.display=*display;
  }else if(stage!=12)ambient_ready=false;
  if(stage>=2&&stage<9&&stage!=5&&stage!=6&&stage!=7){moida_house_draw_inventory(&house,display,have,used);crown_inventory(&house,&crown,display);if(stage==2&&idle_tick&&ambient.visible&&crown_room_face(&house,&crown,coord))moida_icon_set(display,ambient.icon,true); }
  if(stage==2&&encounters&&monster.mode&&monster.coord==coord&&house.rooms[coord].kind!=2)moida_icon_set(display,monster.icon,true);
 output_frame:
  if(!fresh_melody){if(hz)moida_melody_clear(&lingering);else{uint8_t note;if(moida_melody_pop(&lingering,&note)){hz=moida_note_hz(note);duration=lingering.duration_ms;}}}
  /* start() keeps the output frame and PRNG stream; it does not reseed. */
  if(stage==10||stage==13){
   MoidaDisplay last_display=*display;MoidaRandom next_random=house.random;bool built=false;
   for(unsigned attempt=0;attempt<11;attempt++){built=moida_house_attempt(&house,&next_random);house.attempts=attempt+1;if(built)break;}
   if(!built)return 3;
   welcome=91+(unsigned)moida_random_bounded(&house.random,1);moida_melody_clear(&lingering);
   moida_intro_init(&intro,welcome);intro.previous_buttons=raw_buttons;intro.opening.display=last_display;
   display=&intro.opening.display;coord=house.layout.entrance;stage=0;cycle++;
   monster=(MoidaMonster){0};ambient=(MoidaAmbient){0};ambient_ready=false;ambient_blocked=false;moida_crown_init(&crown);
   after_move=false;search_has_background=false;spider_searched=false;ghost_pending=false;ghost_step=ghost_routine=0;
   have=used=0;latch=-1;search_result=search_icon=move_count=search_count=attacks=tip_count=0;
   move_step=0;search_coord=coord;ending_rooms.coord=coord;
  }
  idle_frames=stage==2?idle_frames+1:0;if(idle_frames>=80){hz=0;duration=0;}
  printf("{\"cycle\":%u,",cycle);
  if(getenv("MOIDA_SESSION_TRACE"))printf("\"random\":[\"%" PRIu64 "\",\"%" PRIu64 "\"],\"used\":\"%" PRIu64 "\",\"stats\":[%u,%u,%u],",house.random.a0,house.random.a1,used,move_count,search_count,attacks);
  printf("\"ghostStep\":%u,\"ghostRoutine\":%u,",ghost_step,ghost_routine);
  printf("\"spiderHere\":%s,\"spiderSearched\":%s,",house.rooms[coord].room.spider?"true":"false",spider_searched?"true":"false");
  printf("\"monsterDying\":%s,\"monsterMode\":%u,\"monsterGuards\":%u,",(stage==12&&result.dead)?"true":"false",monster.mode,monster.guards);
  printf("\"canEscape\":%s,",(stage==2&&can_escape(&house,&crown,coord,have))?"true":"false");
  printf("\"gotCrown\":%s,\"buttonHolders\":[%d,%d,%d],",crown.got_crown?"true":"false",crown.buttons[0],crown.buttons[1],crown.buttons[2]);
  printf("\"waitingForInput\":%s,\"searchResult\":%u,\"inventory\":\"%" PRIu64 "\",",((stage==5||stage==9||stage==12||stage==16)&&result.speaking&&!result.runner.wait)?"true":"false",search_result,have);
  printf("\"status\":%u,\"coord\":%u,\"moveResult\":%u,\"moves\":[",stage,coord,move_result);for(unsigned i=0;i<4;i++)printf("%s%u",i?",":"",moida_room_can_move(&house.rooms[coord].room,i,used).kind);printf("],\"searchIcon\":%u,\"words\":[",search_icon);for(unsigned i=0;i<20;i++)printf("%s%" PRIu32,i?",":"",display->data[i]);printf("],\"beeperHz\":%.2f,\"beeperDurationInMs\":%d}\n",hz,duration);fflush(stdout);
 }
 return 0;
}
