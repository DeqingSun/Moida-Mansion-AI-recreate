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
  moida_display_fill(d,false);moida_room_draw(r,d,0,0);
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
