#ifndef MOIDA_ROOM_H
#define MOIDA_ROOM_H
#include "moida_core.h"
#define MOIDA_ROOM_ICONS 64
#define MOIDA_ROOM_ENTITIES 16
/* Bounds checked by fixture exporter/reader; original IDs must fit 0..63. */
typedef struct {
  unsigned id, kind, gate_kind, searchable, rustle;
  uint64_t gate_keys;
  int exit;
  unsigned before_count, after_count;
  uint16_t before[2], after[2];
} MoidaRoomEntity;
typedef struct {
  bool spider;
  unsigned coord, name, exits, icon_count, entity_count;
  uint16_t icons[MOIDA_ROOM_ICONS];
  MoidaRoomEntity entities[MOIDA_ROOM_ENTITIES];
} MoidaRoom;
typedef struct { unsigned kind, lock_icon; uint64_t need_keys; } MoidaMove;
void moida_icon_clear_children(MoidaDisplay *,unsigned icon);
void moida_erase_direction(MoidaDisplay *,unsigned direction,unsigned percent);
void moida_erase_border(MoidaDisplay *,unsigned percent,unsigned icon);
void moida_erase_top(MoidaDisplay *,unsigned percent);
MoidaMove moida_room_can_move(const MoidaRoom *,unsigned direction,uint64_t used);
void moida_room_draw(const MoidaRoom *,MoidaDisplay *,uint64_t have,uint64_t used);
/* Base room + map/arrows/name for empty inventory, no monster/friend overlays. */
void moida_room_draw_initial(const MoidaRoom *,MoidaDisplay *);
/* Four reveal stages, followed by a stop before routine 4 (main gameplay). */
typedef struct { MoidaDisplay display; MoidaRunner runner; const MoidaRoom *room; double hz; int duration; bool complete; } MoidaReveal;
void moida_reveal_init(MoidaReveal *,const MoidaRoom *);
bool moida_reveal_tick(MoidaReveal *);
/* Seven original directional wipe frames; caller handles post-move gameplay. */
void moida_room_move_frame(const MoidaRoom *destination,MoidaDisplay *,unsigned direction,unsigned step,double *hz,int *duration);
typedef struct {MoidaDisplay display;MoidaRunner runner;MoidaMelody melody;const MoidaRoom *room;unsigned icon,lock_icon;bool locked,count_search,attacked;double hz;int duration;bool complete;} MoidaSearch;
void moida_search_fairy_init(MoidaSearch *,const MoidaRoom *,unsigned icon);
void moida_search_init(MoidaSearch *,const MoidaRoom *,unsigned icon);
bool moida_search_tick(MoidaSearch *);
typedef struct {MoidaDisplay display,base;MoidaRunner runner,loop;MoidaMelody melody;unsigned face_icon,talk_icon,rescued_strand,speech_frames,speech_strand,scroll_skip,help_strand,hint_strand,hint_icon;int gift_id;bool give_gift,award_crown,dead;MoidaRandom *ghost_random;unsigned ghost_reveal_icon;unsigned monster_icon,monster_spot,escape_spider;void (*ending_room)(void *,MoidaDisplay *);void *ending_user;unsigned pushing_count,crown_friend,stats[3],rescued_count,rescued_icons[4];bool speaking;unsigned lock_icon,reward_icon,search_icon,tunnel_icon;bool use_latch;double hz;int duration;bool complete;} MoidaResult;
void moida_icon_reveal(MoidaDisplay *,unsigned icon,unsigned percent);
void moida_result_init(MoidaResult *,const MoidaDisplay *,unsigned outcome);
void moida_result_tick(MoidaResult *);
typedef struct {MoidaRunner runner;MoidaDisplay *target;unsigned icon;bool visible;double hz;int duration;} MoidaAmbient;
void moida_flicker_lights(MoidaDisplay *,bool on);
void moida_ambient_init(MoidaAmbient *,unsigned routine,unsigned icon);
void moida_ambient_tick(MoidaAmbient *,MoidaDisplay *);
#endif
