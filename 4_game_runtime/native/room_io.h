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
    unsigned id,kind,gate,before,after; int exit;
    if(fscanf(f,"%u%u%u%" SCNu64 "%d%u%u",&id,&kind,&gate,&e->gate_keys,&exit,&before,&after)!=7)return 0;
    if(id>=64||kind>4||gate>3||exit < -1||exit>3||before>2||after>2)return 0;
    e->id=id;e->kind=kind;e->gate_kind=gate;e->exit=exit;
    e->before_count=before;e->after_count=after;
    for(unsigned j=0;j<e->before_count;j++){if(fscanf(f,"%u",&v)!=1||v>=352)return 0;e->before[j]=(uint16_t)v;}
    for(unsigned j=0;j<e->after_count;j++){if(fscanf(f,"%u",&v)!=1||v>=352)return 0;e->after[j]=(uint16_t)v;}
  }
  return 1;
}
#endif
