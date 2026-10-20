#include "moida_house.h"
#include <stdio.h>
#include <inttypes.h>
int main(void){int64_t seed;unsigned attempts;while(scanf("%" SCNd64 "%u",&seed,&attempts)==2){
 MoidaHouse h;moida_house_generate(&h,seed,attempts);
 printf("{\"valid\":%s,\"attempts\":%u,\"entrance\":%u,\"assets\":[%u,%u,%u],\"friends\":[%u,%u,%u],\"rooms\":[",h.valid?"true":"false",h.attempts,h.layout.entrance,h.friend_assets[0],h.friend_assets[1],h.friend_assets[2],h.friend_entities[0],h.friend_entities[1],h.friend_entities[2]);
 for(unsigned c=0;c<12;c++){MoidaDecoratedRoom *d=&h.rooms[c];MoidaRoom *r=&d->room;
 printf("%s{\"kind\":%u,\"name\":%u,\"coord\":%u,\"effect\":%u,\"exits\":%u,\"icons\":[",c?",":"",d->kind?d->kind:1,r->name,r->coord,d->effect,r->exits);
 for(unsigned i=0;i<r->icon_count;i++)printf("%s%u",i?",":"",r->icons[i]);printf("],\"entities\":[");
 for(unsigned i=0;i<r->entity_count;i++){MoidaRoomEntity *e=&r->entities[i];printf("%s[%u,%u,%u,[",i?",":"",e->id,e->searchable,e->rustle);for(unsigned j=0;j<e->before_count;j++)printf("%s%u",j?",":"",e->before[j]);printf("],[");for(unsigned j=0;j<e->after_count;j++)printf("%s%u",j?",":"",e->after[j]);printf("]]");}printf("]}");
 }
 printf("],\"random\":[\"%" PRIu64 "\",\"%" PRIu64 "\"]}\n",h.random.a0,h.random.a1);
}return 0;}
