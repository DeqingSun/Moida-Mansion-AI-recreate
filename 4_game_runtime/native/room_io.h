/* Desktop-only fixture reader; firmware supplies MoidaRoom directly. */
#ifndef ROOM_IO_H
#define ROOM_IO_H
#include "moida_room.h"
#include <stdio.h>
#include <inttypes.h>
static int read_room(FILE *f,MoidaRoom *r) {
  *r=(MoidaRoom){0};
  if(fscanf(f,"%u%u%u%u%u",&r->coord,&r->name,&r->exits,&r->icon_count,&r->entity_count)!=5)return 0;
  if(r->coord>=12||r->name>=101||r->exits>15||r->icon_count>MOIDA_ROOM_ICONS||r->entity_count>MOIDA_ROOM_ENTITIES)return 0;
  unsigned v;
  for(unsigned i=0;i<r->icon_count;i++){if(fscanf(f,"%u",&v)!=1||v>=352)return 0;r->icons[i]=(uint16_t)v;}
  for(unsigned i=0;i<r->entity_count;i++) {
    MoidaRoomEntity *e=&r->entities[i];
    if(fscanf(f,"%u%u%u%" SCNu64 "%d%u%u",&e->id,&e->kind,&e->gate_kind,&e->gate_keys,&e->exit,&e->before_count,&e->after_count)!=7)return 0;
    if(e->id>=64||e->exit < -1 || e->exit>3||e->before_count>2||e->after_count>2)return 0;
    for(unsigned j=0;j<e->before_count;j++){if(fscanf(f,"%u",&v)!=1||v>=352)return 0;e->before[j]=(uint16_t)v;}
    for(unsigned j=0;j<e->after_count;j++){if(fscanf(f,"%u",&v)!=1||v>=352)return 0;e->after[j]=(uint16_t)v;}
  }
  return 1;
}
#endif
