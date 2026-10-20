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
#endif
