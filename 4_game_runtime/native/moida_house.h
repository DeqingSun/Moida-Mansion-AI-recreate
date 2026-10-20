#ifndef MOIDA_HOUSE_H
#define MOIDA_HOUSE_H
#include "moida_puzzle.h"
#include "moida_room.h"
typedef struct {MoidaRoom room;unsigned kind,effect;} MoidaDecoratedRoom;
typedef struct {
 MoidaLayout layout;MoidaPuzzle puzzle;MoidaDecoratedRoom rooms[12];
 unsigned friend_assets[3],friend_entities[3],attempts;bool valid;MoidaRandom random;
} MoidaHouse;
bool moida_house_attempt(MoidaHouse *,MoidaRandom *);
bool moida_house_generate(MoidaHouse *,int64_t seed,unsigned max_attempts);
unsigned moida_search_next(const MoidaRoom *,unsigned current,uint64_t have);
const MoidaRoomEntity *moida_search_entity(const MoidaRoom *,unsigned icon,uint64_t used);
unsigned moida_search_collect(const MoidaHouse *,unsigned coord,unsigned icon,uint64_t *have,uint64_t used,int *latch);
void moida_house_draw_inventory(const MoidaHouse *,MoidaDisplay *,uint64_t have,uint64_t used);
bool moida_door_use_key(MoidaMove,uint64_t have,uint64_t *used);
void moida_house_apply_used(MoidaHouse *,uint64_t used);
void moida_house_ambient(const MoidaHouse *,unsigned coord,uint64_t have,MoidaAmbient *);
void moida_house_apply_collected(MoidaHouse *,uint64_t have);
unsigned moida_fairy_reward_icon(const MoidaHouse *,unsigned coord,unsigned icon);
unsigned moida_friend_rescue(const MoidaHouse *,unsigned coord,unsigned icon,uint64_t *have,uint64_t *used);
unsigned moida_rescue_followup(const MoidaHouse *,uint64_t have,MoidaResult *);
/* -1 means a friend is available, otherwise the held button entity ID. */
typedef struct {int buttons[3];bool got_crown;} MoidaCrown;
void moida_crown_init(MoidaCrown *);
/* Returns original outcome routine, or zero for a non-button target. */
unsigned moida_crown_search(const MoidaHouse *,unsigned entity,uint64_t *have,MoidaCrown *,int *friend_index);
typedef struct {unsigned mode,coord,icon,spot,guards,cooldown;} MoidaMonster;
unsigned moida_monster_peeps(const MoidaRoom *);
bool moida_monster_occupy(const MoidaHouse *,unsigned coord,MoidaRandom *,MoidaMonster *);
typedef struct {MoidaHouse *house;unsigned coord;MoidaMonster monster;} MoidaEndingRooms;
void moida_ending_room(void *,MoidaDisplay *);
bool moida_spider_after_move(MoidaRandom *,bool searched,unsigned room_kind);
unsigned moida_search_next_with_spider(const MoidaRoom *,unsigned current,uint64_t have,bool here,bool searched);
typedef struct {int entity,reveal;unsigned routine,next_step,reveal_icon;} MoidaGhostMove;
MoidaGhostMove moida_ghost_update(const MoidaHouse *,unsigned coord,uint64_t have,unsigned step);
#endif
