#include "moida_game.h"
#include <string.h>
static void crown_inventory(const MoidaHouse *h,const MoidaCrown *c,MoidaDisplay *d){static const unsigned faces[]={275,277,278};for(unsigned f=0;f<3;f++)if(c->buttons[f]>=0)moida_icon_set(d,faces[h->friend_assets[f]],false);if(c->got_crown)moida_icon_set(d,272,true);}
static unsigned crown_room_face(const MoidaHouse *h,const MoidaCrown *c,unsigned coord){static const unsigned faces[]={275,277,278};for(unsigned f=0;f<3;f++)if(c->buttons[f]>=0&&h->puzzle.entities[c->buttons[f]].coord==coord)return faces[h->friend_assets[f]];return 0;}
static bool can_escape(const MoidaHouse *h,const MoidaCrown *c,unsigned coord,uint64_t have){if(coord!=h->layout.entrance)return false;for(unsigned f=0;f<3;f++)if(c->buttons[f]>=0||!(have&(UINT64_C(1)<<h->friend_entities[f])))return false;return true;}
static void monster_result(MoidaResult *r,const MoidaDisplay *d,const MoidaMonster *m,unsigned routine,const MoidaRoom *room){moida_result_init(r,d,routine);r->monster_icon=m->icon;r->monster_spot=0;for(unsigned i=0;i<room->icon_count;i++){MoidaDisplay mask={0};moida_icon_set(&mask,room->icons[i],true);if(moida_icon_all(&mask,m->spot)){r->monster_spot=room->icons[i];break;}}}
static void game_draw(const MoidaHouse *h,const MoidaCrown *c,const MoidaMonster *m,unsigned coord,uint64_t have,uint64_t used,MoidaDisplay *d){moida_room_draw_initial(&h->rooms[coord].room,d);moida_house_draw_inventory(h,d,have,used);crown_inventory(h,c,d);if(m->mode&&m->coord==coord&&h->rooms[coord].kind!=2)moida_icon_set(d,m->icon,true);}

bool moida_game_init(MoidaGame *game,int64_t seed){
 if(!game)return false;
 memset(game,0,sizeof *game);
 if(!moida_house_generate(&game->house,seed,11))return false;
 game->welcome=91+(unsigned)moida_random_bounded(&game->house.random,1);
 game->ending_rooms.house=&game->house;
 moida_crown_init(&game->crown);
 game->latch=-1;
 moida_intro_init(&game->intro,game->welcome);
 game->coord=game->search_coord=game->house.layout.entrance;
 game->display=&game->intro.opening.display;
 game->ready=true;
 return true;
}

bool moida_game_tick_diagnostic(MoidaGame *game,unsigned buttons,MoidaFrame *frame){
 if(!game||!frame)return false;
 memset(frame,0,sizeof *frame);
 if(!game->ready)return false;
 bool fresh_melody=false;double hz=0;int duration=0;unsigned move_result=0;bool idle_tick=(buttons&512)!=0,encounters=(buttons&1024)!=0,spiders=(buttons&2048)!=0,ghosts=(buttons&4096)!=0;
  uint8_t raw_buttons=(uint8_t)(buttons&15),pressed=(uint8_t)(raw_buttons&~game->previous_buttons);game->previous_buttons=raw_buttons;
  if(game->stage!=0)buttons=(buttons&~15u)|pressed;
  bool warning_was_active=game->stage==12&&!game->result.dead;
  bool accepts_actions=game->stage==2||game->stage==4||(game->stage==12&&!game->result.dead);
  if(accepts_actions){unsigned action=moida_control_action(pressed,can_escape(&game->house,&game->crown,game->coord,game->have),moida_room_can_move(&game->house.rooms[game->coord].room,2,game->used).kind==1,moida_room_can_move(&game->house.rooms[game->coord].room,3,game->used).kind==1);buttons&=~15u;if(action>=1&&action<=4)buttons|=(action<<4)|128;else if(action==5)buttons|=256;else if(action==6)buttons|=1;}
  if(game->stage==4&&((buttons>>4)&7)>=1&&((buttons>>4)&7)<=4){unsigned kind=moida_room_can_move(&game->house.rooms[game->coord].room,((buttons>>4)&7)-1,game->used).kind;if(kind==1||kind==2)game->stage=2;}
  if(game->stage==12&&!game->result.dead&&(buttons&256))game->stage=2;
  /* The diagnostic toggle cancels a warning, but cannot undo an established death. */
  if(!encounters&&game->monster.mode){game->monster.mode=0;game->monster.cooldown=0;if(game->stage==2||game->stage==11||(game->stage==12&&!game->result.dead)){game->stage=2;game_draw(&game->house,&game->crown,&game->monster,game->coord,game->have,game->used,&game->reveal.display);game->display=&game->reveal.display;game->ambient_ready=false;}}
  if(game->stage==2&&(buttons&1)&&can_escape(&game->house,&game->crown,game->coord,game->have)){moida_result_init(&game->result,&game->reveal.display,90);game->ending_rooms.coord=game->house.layout.entrance;game->result.ending_room=moida_ending_room;game->result.ending_user=&game->ending_rooms;static const unsigned faces[]={275,277,278};for(unsigned f=0;f<3;f++)game->result.rescued_icons[f]=faces[game->house.friend_assets[f]];game->result.rescued_icons[3]=game->crown.got_crown?272:0;game->result.escape_spider=game->spider_searched?229:0;game->result.rescued_count=3+(game->crown.got_crown?1:0);game->result.stats[0]=game->move_count;game->result.stats[1]=game->search_count;game->result.stats[2]=game->attacks;game->stage=9;}
  if(game->stage==9){if(game->result.speaking&&(buttons&271)&&!game->result.runner.wait)game->result.runner.waiting_input=false;moida_result_tick(&game->result);game->reveal.display=game->result.display;game->display=&game->reveal.display;hz=game->result.hz;duration=game->result.duration;if(game->result.complete)game->stage=10;}
  if(encounters&&(game->stage==2||(game->stage==12&&!game->result.dead))&&((buttons>>4)&7)>=1&&((buttons>>4)&7)<=4){unsigned dir=((buttons>>4)&7)-1;if(moida_room_can_move(&game->house.rooms[game->coord].room,dir,game->used).kind==1&&game->monster.mode&&game->monster.coord==game->coord&&game->house.rooms[game->coord].kind!=2&&(game->monster.guards&(1u<<dir))){unsigned routine=game->stage==12&&game->result.runner.positions[0].routine==31?35:31;game->monster.cooldown=3;if(game->stage==12)moida_runner_queue(&game->result.runner,(int)routine,0);else{monster_result(&game->result,game->display,&game->monster,routine,&game->house.rooms[game->coord].room);if(game->ambient_ready&&idle_tick)game->result.room_ambient=&game->ambient;}game->stage=12;if(routine!=35)game->attacks++;buttons&=~112u;}else if(game->stage==12&&moida_room_can_move(&game->house.rooms[game->coord].room,dir,game->used).kind==1){game->stage=2;}}

  if(game->stage==2 && ((buttons>>4)&7)>=1 && ((buttons>>4)&7)<=4){
   unsigned direction=((buttons>>4)&7)-1;
   MoidaMove move=moida_room_can_move(&game->house.rooms[game->coord].room,direction,game->used);
   move_result=move.kind;
   int next=moida_neighbor(game->coord,direction);
   if(move.kind==2&&(buttons&128)){
    MoidaDisplay prior_display=*game->display;
    bool unlocked=moida_door_use_key(move,game->have,&game->used);if(unlocked)moida_house_apply_used(&game->house,game->used);
    game_draw(&game->house,&game->crown,&game->monster,game->coord,game->have,game->used,&game->reveal.display);
    moida_result_init(&game->result,&game->reveal.display,unlocked?41:40);game->result.display=prior_display;game->result.lock_icon=move.lock_icon;game->stage=unlocked?7:6;
   }
   if(move.kind==1 && next>=0){unsigned reminder=0;if((buttons&128)&&!(game->have&(UINT64_C(1)<<game->house.friend_entities[0]))){for(unsigned e=0;e<game->house.rooms[game->coord].room.entity_count;e++)if(game->house.rooms[game->coord].room.entities[e].id==game->house.friend_entities[0])reminder=game->house.rooms[game->coord].room.entities[e].rustle;}if(reminder){game->reminder_has_background=warning_was_active||game->search_has_background;if(game->reminder_has_background){game->reminder_background=warning_was_active?game->result:game->search_background;game->reminder_background.room_ambient=NULL;}moida_result_init(&game->result,&game->reveal.display,13);game->result.reward_icon=reminder;}game->search_has_background=false;game->move_count++;game->after_move=true;game->coord=(unsigned)next;for(unsigned c=0;c<12;c++)game->house.rooms[c].room.spider=false;game->house.rooms[game->coord].room.spider=spiders&&moida_spider_after_move(&game->house.random,game->spider_searched,game->house.rooms[game->coord].kind);if(!reminder)game->ambient_ready=false;game->ambient_blocked=false;if(buttons&128){game->stage=3;game->move_direction=direction;game->move_step=0;if(reminder)game->stage=15;}else game_draw(&game->house,&game->crown,&game->monster,game->coord,game->have,game->used,&game->reveal.display);}
  }
  if(game->stage==15){moida_result_tick(&game->result);hz=game->result.hz;duration=game->result.duration;
   if(game->ambient_ready&&idle_tick){moida_ambient_tick(&game->ambient,&game->result.display);if(game->ambient.duration){hz=game->ambient.hz;duration=game->ambient.duration;}}
   if(game->reminder_has_background){game->reminder_background.display=game->result.display;moida_melody_clear(&game->reminder_background.melody);moida_result_loop_tick(&game->reminder_background);game->result.display=game->reminder_background.display;if(game->reminder_background.duration){hz=game->reminder_background.hz;duration=game->reminder_background.duration;}}
   game->reveal.display=game->result.display;game->display=&game->reveal.display;if(game->result.complete){game->stage=3;game->move_step=0;game->ambient_ready=false;}goto output_frame;}
  if(game->stage==3){
   if(game->move_step<7)moida_room_move_frame(&game->house.rooms[game->coord].room,&game->reveal.display,game->move_direction,game->move_step,&hz,&duration);
   else if(game->move_step==7){game_draw(&game->house,&game->crown,&game->monster,game->coord,game->have,game->used,&game->reveal.display);game->stage=2;}
   game->move_step++;
  }
  if((game->stage==2||game->stage==4)&&(buttons&256)){
   if(warning_was_active){game->search_background=game->result;game->search_background.room_ambient=NULL;game->search_has_background=true;}else if(game->stage==2)game->search_has_background=false;
   const MoidaRoom *room=&game->house.rooms[game->coord].room;
   /* Returning to the last searched room continues that room's target cycle. */
   if(game->search_coord!=game->coord){game->search_icon=0;game->search_coord=game->coord;}
   game->search_icon=moida_search_next_with_spider(room,game->search_icon,game->have,room->spider,game->spider_searched);
   if(!game->search_icon)game->search_icon=moida_search_next_with_spider(room,0,game->have,room->spider,game->spider_searched);
   moida_room_draw_initial(room,&game->reveal.display);
   game->search_result=0;if(game->search_icon){const MoidaRoomEntity *target=moida_search_entity(room,game->search_icon,game->used);if(target&&target->kind==3)moida_search_fairy_init(&game->search,room,game->search_icon);else moida_search_init(&game->search,room,game->search_icon);game->stage=4;
    if(!(encounters&&game->monster.mode&&game->monster.coord==game->coord&&game->house.rooms[game->coord].kind!=2)&&target&&target->gate_kind==1&&(target->gate_keys&~game->used)){
     game->search.lock_icon=target->before_count?target->before[0]:0;
     if(!(target->gate_keys&~game->have)){game->used|=target->gate_keys;moida_house_apply_used(&game->house,game->used);moida_runner_start(&game->search.runner,27);game->stage=8;}
     else{game->search.locked=true;moida_runner_start(&game->search.runner,29);}
    }if(encounters&&game->monster.mode&&game->monster.coord==game->coord&&game->house.rooms[game->coord].kind!=2){game->monster.cooldown=3;moida_runner_start(&game->search.runner,target&&target->kind==3?26:28);game->stage=4;}}
  }
  if(game->stage==4||game->stage==8){game->search.preserve_completion=true;moida_search_tick(&game->search);moida_house_draw_inventory(&game->house,&game->search.display,game->have,game->used);crown_inventory(&game->house,&game->crown,&game->search.display);
   if(game->search.drew_room&&encounters&&game->monster.mode&&game->monster.coord==game->coord&&game->house.rooms[game->coord].kind!=2)moida_icon_set(&game->search.display,game->monster.icon,true);
   if(game->search_has_background&&!game->search.complete){game->search_background.display=game->search.display;if(game->search.duration)moida_melody_clear(&game->search_background.melody);moida_result_loop_tick(&game->search_background);game->search.display=game->search_background.display;if(game->search_background.duration){game->search.hz=game->search_background.hz;game->search.duration=game->search_background.duration;}}
   if(game->search.count_search)game->search_count++;if(game->stage==8&&game->search.runner.index>=0&&game->search.runner.positions[game->search.runner.index].routine!=27)game->stage=4;game->reveal.display=game->search.display;game->display=&game->reveal.display;hz=game->search.hz;duration=game->search.duration;if(game->search.complete&&game->search.attacked){monster_result(&game->result,&game->search.display,&game->monster,30,&game->house.rooms[game->coord].room);game->stage=12;game->attacks++;}if(game->search.complete&&!game->search.attacked){game->stage=2;unsigned friend_result=moida_friend_rescue(&game->house,game->coord,game->search_icon,&game->have,&game->used);
    game->search_result=friend_result==3?100:friend_result==2?42:friend_result==1?45:moida_search_collect(&game->house,game->coord,game->search_icon,&game->have,game->used,&game->latch);
    if(game->search_icon==229&&game->house.rooms[game->coord].room.spider&&!game->spider_searched){game->spider_searched=true;game->house.rooms[game->coord].room.spider=false;game->search_result=49;}
    int crown_friend=-1;unsigned crown_outcome=0;const MoidaRoomEntity *searched=moida_search_entity(&game->house.rooms[game->coord].room,game->search_icon,game->used);if(searched)crown_outcome=moida_crown_search(&game->house,searched->id,&game->have,&game->crown,&crown_friend);if(crown_outcome)game->search_result=crown_outcome;
    if(friend_result==3)moida_house_apply_used(&game->house,game->used);
    moida_house_apply_collected(&game->house,game->have);game_draw(&game->house,&game->crown,&game->monster,game->coord,game->have,game->used,&game->reveal.display);
    if(friend_result==3){moida_result_init(&game->result,&game->reveal.display,86);game->result.display=game->search.display;game->result.search_icon=game->search_icon;for(unsigned f=0;f<3;f++){unsigned id=game->house.friend_entities[f];for(unsigned e=0;e<game->house.rooms[game->coord].room.entity_count;e++)if(game->house.rooms[game->coord].room.entities[e].id==id&&game->house.rooms[game->coord].room.entities[e].searchable==game->search_icon){unsigned a=game->house.friend_assets[f];static const unsigned faces[]={275,277,278},talks[]={280,282,283};game->result.face_icon=faces[a];game->result.talk_icon=talks[a];game->result.rescued_strand=56+a;}}moida_runner_start(&game->result.runner,(int)moida_rescue_followup(&game->house,game->have,&game->result));game->stage=5;}
    if(crown_outcome&&crown_outcome!=42){moida_house_draw_inventory(&game->house,&game->reveal.display,game->have,game->used);crown_inventory(&game->house,&game->crown,&game->reveal.display);moida_result_init(&game->result,&game->reveal.display,crown_outcome);game->result.display=game->search.display;game->result.search_icon=game->search_icon;for(unsigned f=0;f<3;f++)if(game->crown.buttons[f]>=0)game->result.pushing_count++;if(crown_friend>=0){unsigned a=game->house.friend_assets[crown_friend];static const unsigned faces[]={275,277,278},talks[]={280,282,283};game->result.face_icon=faces[a];game->result.talk_icon=talks[a];game->result.crown_friend=faces[a];}game->stage=5;}
    if(game->search_result==49||game->search_result==42||game->search_result==44||game->search_result==46||game->search_result==47||game->search_result==48){moida_house_draw_inventory(&game->house,&game->reveal.display,game->have,game->used);moida_result_init(&game->result,&game->reveal.display,game->search_result);game->result.display=game->search.display;if(game->search_result==48){game->result.search_icon=game->search_icon;for(unsigned i=0;i<game->house.rooms[game->coord].room.entity_count;i++){const MoidaRoomEntity *e=&game->house.rooms[game->coord].room.entities[i];if(e->kind==1&&game->latch>=0&&e->gate_keys==(UINT64_C(1)<<game->latch)){game->result.tunnel_icon=e->after_count?e->after[0]:0;break;}}}
    if(game->search_result==47)game->result.reward_icon=moida_fairy_reward_icon(&game->house,game->coord,game->search_icon);game->stage=5;}}}
  if(game->stage==5||game->stage==6||game->stage==7||game->stage==16){if(game->result.speaking&&(buttons&271)&&!game->result.runner.wait)game->result.runner.waiting_input=false;moida_result_tick(&game->result);if(game->result.award_crown){game->crown.got_crown=true;}if(game->result.give_gift&&game->result.gift_id>=0){game->have|=UINT64_C(1)<<game->result.gift_id;game->result.give_gift=false;}game->reveal.display=game->result.display;game->display=&game->reveal.display;hz=game->result.hz;duration=game->result.duration;if(game->result.use_latch&&game->latch>=0){game->used|=(UINT64_C(1)<<game->latch)&game->have;game->latch=-1;moida_house_apply_used(&game->house,game->used);}
   if(game->result.complete&&game->stage==5&&game->search_result==42&&!(game->have&(UINT64_C(1)<<game->house.friend_entities[0]))&&!(++game->tip_count%2)){MoidaDisplay tip_base=game->result.base;moida_result_init(&game->result,&tip_base,43);game->stage=16;moida_result_tick(&game->result);game->reveal.display=game->result.display;hz=game->result.hz;duration=game->result.duration;}
   if(game->result.complete){if(game->stage!=6)game->ambient_ready=false;bool searched_result=game->stage==5||game->stage==16;if(searched_result)game->ghost_pending=true;game->stage=2;game_draw(&game->house,&game->crown,&game->monster,game->coord,game->have,game->used,&game->reveal.display);if(encounters&&searched_result){game->stage=17;game->post_wait=3;game->ghost_pending=false;}}}
  /* Routine 62 draws first, waits two full ticks, then consumes peep randomness. */
  if(game->stage==17){if(game->post_wait){if(game->post_wait<3){uint8_t note;if(moida_melody_pop(&game->result.melody,&note)){hz=moida_note_hz(note);duration=game->result.melody.duration_ms;}}game->post_wait--;}else{moida_monster_occupy(&game->house,game->coord,&game->house.random,&game->monster);game->monster.mode=1;game->monster.cooldown=3;monster_result(&game->result,&game->reveal.display,&game->monster,63,&game->house.rooms[game->coord].room);game->stage=11;}}
  if(game->after_move&&game->stage==2){game->after_move=false;game->ghost_pending=true;if(encounters&&game->monster.mode){moida_monster_occupy(&game->house,game->coord,&game->house.random,&game->monster);if(game->house.rooms[game->coord].kind!=2){if(game->monster.cooldown<=1){game->monster.mode=0;game->monster.cooldown=0;monster_result(&game->result,&game->reveal.display,&game->monster,64,&game->house.rooms[game->coord].room);}else{game->monster.cooldown--;monster_result(&game->result,&game->reveal.display,&game->monster,63,&game->house.rooms[game->coord].room);}game->stage=11;}}}
  if(game->stage==11||game->stage==12){if(game->result.speaking&&(buttons&271)&&!game->result.runner.wait)game->result.runner.waiting_input=false;moida_result_tick(&game->result);game->reveal.display=game->result.display;game->display=&game->reveal.display;hz=game->result.hz;duration=game->result.duration;if(game->result.complete){game->lingering=game->result.melody;fresh_melody=true;if(game->stage==11)game->ghost_pending=true;game->stage=game->result.dead?13:2;}}
  if(game->stage==2&&game->ghost_pending){game->ghost_pending=false;if(ghosts){MoidaGhostMove g=moida_ghost_update(&game->house,game->coord,game->have,game->ghost_step);game->ghost_step=g.next_step;game->ghost_routine=g.routine;if(g.routine){game_draw(&game->house,&game->crown,&game->monster,game->coord,game->have,game->used,&game->reveal.display);crown_inventory(&game->house,&game->crown,&game->reveal.display);if(encounters&&game->monster.mode&&game->monster.coord==game->coord)moida_icon_set(&game->reveal.display,game->monster.icon,true);moida_result_init(&game->result,&game->reveal.display,g.routine);game->result.ghost_random=&game->house.random;game->result.ghost_reveal_icon=g.reveal_icon;game->stage=14;}}}
  if(game->stage==14){moida_result_tick(&game->result);game->reveal.display=game->result.display;game->display=&game->reveal.display;hz=game->result.hz;duration=game->result.duration;if(game->result.complete){game->stage=2;game->ambient_blocked=game->ghost_routine<81;}}
  buttons&=15;
  if(game->stage==0){if(moida_intro_tick(&game->intro,raw_buttons)==MOIDA_INTRO_NEED_HOUSE){moida_reveal_init(&game->reveal,&game->house.rooms[game->house.layout.entrance].room);game->stage=1;}else{hz=game->intro.opening.beep_hz;duration=game->intro.opening.beep_duration_ms;}}
  if(game->stage==1){bool was_complete=game->reveal.complete;moida_reveal_tick(&game->reveal);game->display=&game->reveal.display;hz=game->reveal.hz;duration=game->reveal.duration;if(was_complete)game->stage=2;}
  if((game->stage==2||game->stage==6||game->stage==7)&&idle_tick&&!game->ambient_blocked){
   if(!game->ambient_ready){unsigned face=crown_room_face(&game->house,&game->crown,game->coord);if(can_escape(&game->house,&game->crown,game->coord,game->have))moida_ambient_init(&game->ambient,18,0);else if(face)moida_ambient_init(&game->ambient,61,face);else moida_house_ambient(&game->house,game->coord,game->have,&game->ambient);game->ambient_ready=true;}
   moida_ambient_tick(&game->ambient,game->display);if(game->ambient.hz){hz=game->ambient.hz;duration=game->ambient.duration;}if(game->stage==6||game->stage==7)game->result.display=*game->display;
  }else if(game->stage!=12)game->ambient_ready=false;
  if(game->stage>=2&&game->stage<9&&game->stage!=5&&game->stage!=6&&game->stage!=7){moida_house_draw_inventory(&game->house,game->display,game->have,game->used);crown_inventory(&game->house,&game->crown,game->display);if(game->stage==2&&idle_tick&&game->ambient.visible&&crown_room_face(&game->house,&game->crown,game->coord))moida_icon_set(game->display,game->ambient.icon,true); }
  if(game->stage==2&&encounters&&game->monster.mode&&game->monster.coord==game->coord&&game->house.rooms[game->coord].kind!=2)moida_icon_set(game->display,game->monster.icon,true);
 output_frame:
  if(!fresh_melody){if(hz)moida_melody_clear(&game->lingering);else{uint8_t note;if(moida_melody_pop(&game->lingering,&note)){hz=moida_note_hz(note);duration=game->lingering.duration_ms;}}}
  /* start() keeps the output frame and PRNG stream; it does not reseed. */
  if(game->stage==10||game->stage==13){
   MoidaDisplay last_display=*game->display;MoidaRandom next_random=game->house.random;bool built=false;
   for(unsigned attempt=0;attempt<11;attempt++){built=moida_house_attempt(&game->house,&next_random);game->house.attempts=attempt+1;if(built)break;}
   if(!built){game->ready=false;return false;}
   game->welcome=91+(unsigned)moida_random_bounded(&game->house.random,1);moida_melody_clear(&game->lingering);
   moida_intro_init(&game->intro,game->welcome);game->intro.previous_buttons=raw_buttons;game->intro.opening.display=last_display;
   game->display=&game->intro.opening.display;game->coord=game->house.layout.entrance;game->stage=0;game->cycle++;
   game->monster=(MoidaMonster){0};game->ambient=(MoidaAmbient){0};game->ambient_ready=false;game->ambient_blocked=false;moida_crown_init(&game->crown);
   game->after_move=false;game->search_has_background=false;game->spider_searched=false;game->ghost_pending=false;game->ghost_step=game->ghost_routine=0;
   game->have=game->used=0;game->latch=-1;game->search_result=game->search_icon=game->move_count=game->search_count=game->attacks=game->tip_count=0;
   game->move_step=0;game->search_coord=game->coord;game->ending_rooms.coord=game->coord;
  }
  game->idle_frames=game->stage==2?game->idle_frames+1:0;if(game->idle_frames>=80){hz=0;duration=0;}

 game->last_move_result=move_result;
 frame->display=*game->display;
 frame->beeper_hz=hz;
 frame->beeper_duration_ms=(uint32_t)duration;
 frame->next_tick_ms=MOIDA_TICK_MS;
 frame->cycle=game->cycle;
 return true;
}

bool moida_game_tick(MoidaGame *game,uint8_t buttons,MoidaFrame *frame){
 return moida_game_tick_diagnostic(game,(buttons&15u)|MOIDA_GAME_EFFECTS,frame);
}

bool moida_game_can_escape(const MoidaGame *game){return game&&game->ready&&game->stage==2&&can_escape(&game->house,&game->crown,game->coord,game->have);}
bool moida_game_waiting(const MoidaGame *game){return game&&game->ready&&(game->stage==5||game->stage==9||game->stage==12||game->stage==16)&&game->result.speaking&&!game->result.runner.wait;}
