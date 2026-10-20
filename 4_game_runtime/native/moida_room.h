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
  unsigned coord, name, exits, icon_count, entity_count;
  uint16_t icons[MOIDA_ROOM_ICONS];
  MoidaRoomEntity entities[MOIDA_ROOM_ENTITIES];
} MoidaRoom;
typedef struct { unsigned kind, lock_icon; uint64_t need_keys; } MoidaMove;
void moida_icon_clear_children(MoidaDisplay *,unsigned icon);
void moida_erase_top(MoidaDisplay *,unsigned percent);
MoidaMove moida_room_can_move(const MoidaRoom *,unsigned direction,uint64_t used);
void moida_room_draw(const MoidaRoom *,MoidaDisplay *,uint64_t have,uint64_t used);
/* Base room + map/arrows/name for empty inventory, no monster/friend overlays. */
void moida_room_draw_initial(const MoidaRoom *,MoidaDisplay *);
/* Four reveal stages, followed by a stop before routine 4 (main gameplay). */
typedef struct { MoidaDisplay display; MoidaRunner runner; const MoidaRoom *room; double hz; int duration; bool complete; } MoidaReveal;
void moida_reveal_init(MoidaReveal *,const MoidaRoom *);
bool moida_reveal_tick(MoidaReveal *);
#endif
