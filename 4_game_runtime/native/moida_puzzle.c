#include "moida_puzzle.h"
#include <string.h>
static unsigned bits(const MoidaZone *z){unsigned mask=0;for(unsigned i=0;i<12;i++)if(z->nodes[i].depth>=0)mask|=1u<<i;return mask;}
static unsigned cardinal(unsigned mask){unsigned n=0;for(;mask;mask>>=1)n+=mask&1;return n;}
static int choose(MoidaRandom *r,unsigned mask){if(!mask)return -1;unsigned index=(unsigned)moida_random_bounded(r,cardinal(mask)-1);for(unsigned i=0;i<12;i++)if(mask&(1u<<i)){if(!index)return (int)i;index--;}return -1;}
static MoidaMap block(MoidaMap map,MoidaPassage p){if(p.valid){int c=moida_neighbor(p.coord,p.direction);map.exits[p.coord]&=(uint8_t)~(1u<<p.direction);if(c>=0)map.exits[c]&=(uint8_t)~(1u<<(p.direction^1));}return map;}
static MoidaZone zone(MoidaMap map,unsigned root){MoidaZone z;moida_zone_build(&z,&map,root);return z;}
static int add(MoidaPuzzle *p,unsigned kind,unsigned coord,unsigned contents){
 if(p->count>=32)return -1;
 unsigned id=p->count++;p->entities[id]=(MoidaPuzzleEntity){.kind=kind,.coord=coord,.contents=contents,.exit=-1,.hint=-1,.reveal=-1};return (int)id;
}
static void gate(MoidaPuzzleEntity *e,unsigned kind,int key){e->gate_kind=kind;e->gate_keys=UINT64_C(1)<<(unsigned)key;}
static bool has_ghost(const MoidaPuzzle *p){for(unsigned i=0;i<p->count;i++)if(p->entities[i].kind==4)return true;return false;}
static unsigned weighted(MoidaRandom *r,const unsigned *values,const unsigned *weights,unsigned count,unsigned total){
 unsigned pick=(unsigned)moida_random_bounded(r,total);
 for(unsigned i=0;i<count;i++){if(pick<weights[i])return values[i];pick-=weights[i];}return values[count-1];
}
static int neighbor_choice(const MoidaMap *map,MoidaRandom *r,unsigned coord,unsigned valid){
 unsigned mask=0;for(unsigned dir=0;dir<4;dir++)if(map->exits[coord]&(1u<<dir)){int n=moida_neighbor(coord,dir);if(n>=0&&(valid&(1u<<n)))mask|=1u<<(unsigned)n;}return choose(r,mask);
}
static bool ghost(MoidaPuzzle *p,MoidaLayout *g,const MoidaZone *search,int previous_friend,int friend_id,int key){
 unsigned valid=bits(search),end=p->entities[key].coord,avoid=p->entities[previous_friend].coord;
 for(unsigned attempt=0;attempt<10;attempt++){
  int c=neighbor_choice(&g->map,&g->random,end,valid&~(1u<<end));if(c<0)continue;
  int b=neighbor_choice(&g->map,&g->random,(unsigned)c,valid&~((1u<<c)|(1u<<end)));if(b<0)continue;
  int a=neighbor_choice(&g->map,&g->random,(unsigned)b,valid&~((1u<<b)|(1u<<c)|(1u<<avoid)));if(a<0)continue;
  int id=add(p,4,(unsigned)a,0);if(id<0)return false;
  MoidaPuzzleEntity *e=&p->entities[id];e->path[0]=(unsigned)a;e->path[1]=(unsigned)b;e->path[2]=(unsigned)c;e->path[3]=end;
  gate(e,2,previous_friend);e->reveal=key;p->entities[friend_id].hint=id;
  gate(&p->entities[friend_id],1,key);gate(&p->entities[key],3,previous_friend);return true;
 }
 return false;
}
static void passage_entity(MoidaPuzzle *p,unsigned kind,MoidaPassage passage,int key){int id=add(p,kind,passage.coord,0);if(id<0)return;p->entities[id].exit=(int)passage.direction;gate(&p->entities[id],kind==2?1:2,key);}
static bool trunk(MoidaPuzzle *p,MoidaLayout *g,const MoidaZone *search,unsigned location,unsigned blocker,MoidaPassage passage){
 int previous=0;for(unsigned i=0;i<p->count;i++)if(p->entities[i].kind==0&&p->entities[i].contents==4)previous=(int)i;
 int friend_id=add(p,0,location,4);if(friend_id<0)return false;
 MoidaRandom *r=&g->random;unsigned valid=bits(search);
 if(blocker==0){
  const unsigned values[]={0,1,3},weights[]={3,1,2};unsigned method=weighted(r,values,weights,3,6);int key;
  if(method==0||(method==3&&has_ghost(p))){int loc=choose(r,valid);if(loc<0)return false;key=add(p,0,(unsigned)loc,1);p->entities[friend_id].hint=key;}
  else if(method==3){int loc=choose(r,valid);if(loc<0)return false;key=add(p,0,(unsigned)loc,1);if(!ghost(p,g,search,previous,friend_id,key))return false;}
  else {key=add(p,5,0,1);p->entities[friend_id].hint=key;}
  if(!passage.valid)return false;passage_entity(p,2,passage,key);
 }else if(blocker==1){
  if(!passage.valid)return false;int key=add(p,0,passage.coord,3);
  passage_entity(p,1,passage,key);
  MoidaPassage reverse={true,(unsigned)moida_neighbor(passage.coord,passage.direction),passage.direction^1};passage_entity(p,1,reverse,key);
  const unsigned values[]={0,3},weights[]={3,1};unsigned method=weighted(r,values,weights,2,4);
  if(method==0||(method==3&&has_ghost(p)))p->entities[friend_id].hint=key;
  else if(!ghost(p,g,search,previous,friend_id,key))return false;
 }else{
  const unsigned values[]={0,2,1,3},weights[]={1,4,2,2};unsigned method=weighted(r,values,weights,4,9);
  if(method==0||(method==3&&has_ghost(p))){int loc=choose(r,valid);if(loc<0)return false;int key=add(p,0,(unsigned)loc,2);p->entities[friend_id].hint=key;gate(&p->entities[friend_id],1,key);}
  else if(method==3){int loc=choose(r,valid);if(loc<0)return false;int key=add(p,0,(unsigned)loc,2);if(!ghost(p,g,search,previous,friend_id,key))return false;}
  else if(method==2){
   int a=choose(r,valid);if(a<0)return false;int b=choose(r,valid&~(1u<<a));if(b<0)return false;int c=choose(r,valid&~((1u<<a)|(1u<<b)));if(c<0)return false;
   unsigned coords[]={(unsigned)a,(unsigned)b,(unsigned)c};uint64_t keys=0;int first=-1;
   for(unsigned i=0;i<3;i++){int id=add(p,3,coords[i],0);if(first<0)first=id;gate(&p->entities[id],2,previous);keys|=UINT64_C(1)<<id;}
   p->entities[friend_id].hint=first;p->entities[friend_id].gate_kind=1;p->entities[friend_id].gate_keys=keys;
  }else{int key=add(p,5,0,2);p->entities[friend_id].hint=key;gate(&p->entities[friend_id],1,key);}
 }
 return true;
}
bool moida_puzzle_place(MoidaPuzzle *p,MoidaLayout *g){
 memset(p,0,sizeof *p);if(!g->locks.valid)return false;
 static const unsigned blocker_a[]={0,0,1,1,1,2,2},blocker_b[]={1,2,0,2,1,0,1};
 unsigned ba=blocker_a[g->spec],bb=blocker_b[g->spec];MoidaPassage a=g->locks.a,b=g->locks.b,last=g->locks.order?b:a;
 MoidaMap ma=block(g->map,a);if(g->locks.order==2)ma=block(ma,b);
 MoidaZone reach_a=zone(ma,g->entrance),reach_b=zone(g->locks.order?block(g->map,b):bb==2?g->map:block(g->map,a),g->entrance);
 MoidaZone key_a=ba==1?zone((MoidaMap){0},a.coord):reach_a,key_b=bb==1?zone((MoidaMap){0},last.coord):reach_b;
 MoidaZone friend_b=ba==2?reach_a:zone(block(block(g->map,a),b),(unsigned)moida_neighbor(a.coord,a.direction));
 MoidaZone friend_c=bb==2?zone(g->map,g->entrance):zone(block(g->map,last),(unsigned)moida_neighbor(last.coord,last.direction));
 unsigned ka=bits(&key_a),kb=bits(&key_b);if(cardinal(ka)!=1)ka=0;if(cardinal(kb)!=1)kb=0;
 unsigned excluded=1u<<g->entrance;
 int fa=choose(&g->random,bits(&reach_a)&~excluded);if(fa<0)return false;excluded|=1u<<fa;
 int fb=choose(&g->random,bits(&friend_b)&~(excluded|ka));if(fb<0)return false;excluded|=1u<<fb;
 int fc=choose(&g->random,bits(&friend_c)&~(excluded|kb));if(fc<0)return false;excluded|=1u<<fc;
 add(p,0,(unsigned)fa,4);
 if(!trunk(p,g,&reach_a,(unsigned)fb,ba,a))return false;
 if(!trunk(p,g,&reach_b,(unsigned)fc,bb,last))return false;
 unsigned available=4095u&~excluded;
 /* Original chooses all four locations before adding entities. */
 unsigned crown[4];for(unsigned i=0;i<4;i++){int c=choose(&g->random,available);if(c<0)return false;crown[i]=(unsigned)c;available&=~(1u<<c);}
 for(unsigned i=0;i<4;i++)add(p,0,crown[i],5);
 p->valid=true;return true;
}
