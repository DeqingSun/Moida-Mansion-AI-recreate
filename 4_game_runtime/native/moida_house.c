#include "moida_house.h"
#include <string.h>
#include "decor_tables.inc"
typedef struct {MoidaHouse *house;MoidaDecoratedRoom *out;MoidaRoom *room;MoidaRandom *r;const MoidaRoom *neighbors[2];unsigned *pool_count;} Builder;
static unsigned random_b(MoidaRandom *r,unsigned max){return (unsigned)moida_random_bounded(r,max);}
static unsigned pick(MoidaRandom *r,const unsigned *items,unsigned count){return items[random_b(r,count-1)];}
static bool ancestor(unsigned icon,unsigned parent){while(icon){if(icon==parent)return true;icon=parents[icon];}return false;}
static bool overlap(const MoidaRoom *room,unsigned icon){for(unsigned i=0;i<room->icon_count;i++)if(spots[room->icons[i]]&spots[icon])return true;return false;}
static bool has_parent(const MoidaRoom *room,unsigned parent){for(unsigned i=0;i<room->icon_count;i++)if(ancestor(room->icons[i],parent))return true;return false;}
static bool all_sprites(const MoidaRoom *room,unsigned icon){
 MoidaDisplay d={0};for(unsigned i=0;i<room->icon_count;i++)moida_icon_set(&d,room->icons[i],true);
 for(unsigned i=sprite_offsets[icon];i<sprite_offsets[icon+1];i++)if(!moida_sprite_get(&d,sprites[i]))return false;return true;
}
static bool append(Builder *b,unsigned icon){if(*b->pool_count>=288||b->room->icon_count>=MOIDA_ROOM_ICONS)return false;b->room->icons[b->room->icon_count++]=(uint16_t)icon;(*b->pool_count)++;return true;}
static bool add_icon(Builder *b,unsigned icon,unsigned probability){
 if(!moida_probability(b->r,(int)probability)||overlap(b->room,icon))return false;
 if(sprite_offsets[icon+1]>sprite_offsets[icon])return append(b,icon);
 unsigned count=child_offsets[icon+1]-child_offsets[icon];if(!count)return false;
 for(unsigned i=0;i<6;i++){unsigned child=children[child_offsets[icon]+random_b(b->r,count-1)];if(!overlap(b->room,child)&&append(b,child))return true;}return false;
}
static bool neighbor_has(Builder *b,unsigned icon){for(unsigned j=0;j<2;j++)if(b->neighbors[j])for(unsigned i=0;i<b->neighbors[j]->icon_count;i++)if(b->neighbors[j]->icons[i]==icon)return true;return false;}
static unsigned dress(Builder *b,unsigned icon,unsigned count){
 unsigned start=b->room->icon_count;
 if(sprite_offsets[icon+1]==sprite_offsets[icon]){
  unsigned options[352],n=0;for(unsigned i=child_offsets[icon];i<child_offsets[icon+1];i++)if(!neighbor_has(b,children[i])&&!overlap(b->room,children[i]))options[n++]=children[i];
  for(unsigned i=0;i<count&&n;i++){unsigned index=random_b(b->r,n-1),child=options[index];memmove(options+index,options+index+1,(n-index-1)*sizeof *options);n--;add_icon(b,child,100);}
 }else if(count&&!neighbor_has(b,icon)&&!overlap(b->room,icon))add_icon(b,icon,100);
 return b->room->icon_count-start;
}
static bool put(Builder *b,unsigned icon,unsigned probability){return moida_probability(b->r,(int)probability)&&dress(b,icon,1)>0;}
static bool special(Builder *b,unsigned type,unsigned probability){
 if(!moida_probability(b->r,(int)probability))return false;
 if(type==0){if(put(b,88,70)||put(b,85,100)){put(b,206,50);return true;}return false;}
 unsigned a=type==1?132:203,c=type==1?131:204;
 if(!put(b,a,33)&&!put(b,c,33)){put(b,a,100);put(b,c,100);}return true;
}
static void populate(Builder *b,unsigned kind,bool friend){
 switch(kind){
 case 1:if(friend){unsigned options[]={312,31,36};put(b,pick(b->r,options,3),100);}break;
 case 6:put(b,39,100);put(b,197,50);put(b,214,50);put(b,170,30);put(b,84,30);break;
 case 3:put(b,305,20);put(b,5,100);put(b,130,10);put(b,214,50);special(b,0,40);put(b,36,friend?100:20);break;
 case 11:put(b,23,100);put(b,214,100);put(b,60,100);if(friend)put(b,312,100);else if(!put(b,53,40))put(b,312,20);special(b,0,40);put(b,242,60);put(b,170,30);put(b,41,60);put(b,26,80);put(b,28,100);break;
 case 7:put(b,207,100);put(b,45,100);put(b,224,100);put(b,41,10);special(b,1,100);special(b,2,100);break;
 case 9:put(b,20,100);special(b,0,90);if(friend){if(!put(b,31,50))put(b,312,100);}else if(!put(b,31,30)&&!put(b,170,30))put(b,312,20);if(!put(b,26,50))put(b,223,100);put(b,28,100);put(b,214,100);break;
 case 12:put(b,259,100);put(b,214,100);put(b,224,100);put(b,129,30);put(b,130,10);special(b,2,100);break;
 case 4:put(b,14,100);put(b,203,40);put(b,130,40);if(friend)put(b,36,100);break;
 case 10:put(b,312,100);break;
 case 8:put(b,57,100);put(b,55,100);put(b,59,100);put(b,41,33);put(b,130,20);special(b,2,100);break;
 case 5:put(b,305,100);put(b,36,100);put(b,223,100);put(b,129,100);break;
 default:break;
 }
}
static unsigned peep_count(Builder *b){
 unsigned free_exits=b->room->exits,n=0;
 for(unsigned i=0;i<b->room->entity_count;i++)if(b->room->entities[i].exit>=0)free_exits&=~(1u<<b->room->entities[i].exit);
 for(unsigned i=0;i<6;i++){unsigned overlap_exits=peeps[i].exits&b->room->exits;if((!overlap_exits||(!(overlap_exits&~free_exits)&&overlap_exits!=free_exits))&&all_sprites(b->room,peeps[i].spot))n++;}return n;
}
static bool is_friend(const MoidaPuzzleEntity *e){return e->kind==0&&e->contents==4;}
static MoidaRoomEntity entity(unsigned id,const MoidaPuzzleEntity *e){return (MoidaRoomEntity){.id=id,.kind=e->kind,.gate_kind=e->gate_kind,.gate_keys=e->gate_keys,.exit=e->exit};}
static bool add_entity(Builder *b,MoidaRoomEntity e){if(b->room->entity_count>=MOIDA_ROOM_ENTITIES)return false;b->room->entities[b->room->entity_count++]=e;return true;}
static bool used_container(const MoidaRoom *r,unsigned icon){for(unsigned i=0;i<r->entity_count;i++)if(r->entities[i].searchable==icon)return true;return false;}
static bool searchable(unsigned icon){return icon!=311&&!ancestor(icon,108)&&!ancestor(icon,64)&&!ancestor(icon,230)&&!ancestor(icon,262);}
static const Plan *plan(unsigned kind){for(unsigned i=0;i<12;i++)if(plans[i].kind==kind)return &plans[i];return &plans[0];}
static bool decorate(Builder *b,unsigned kind,unsigned coord,unsigned exits,unsigned left_style,unsigned right_style){
 const Plan *p=plan(kind);MoidaRoom *r=b->room;MoidaPuzzle *puzzle=&b->house->puzzle;
 b->out->kind=kind;r->coord=coord;r->name=p->name;r->exits=exits;
 if(kind!=2){add_icon(b,311,100);if(p->wainscot&&moida_probability(b->r,50))dress(b,310,1);dress(b,138,1);}
 static const unsigned locks[]={166,167,0,0},tunnels[]={264,265,263,263};
 for(unsigned dir=0;dir<4;dir++)if(exits&(1u<<dir)){
  unsigned icon=dir==0?children[child_offsets[65]+left_style]:dir==1?children[child_offsets[72]+right_style]:dir==2?236:231;
  int id=-1;for(unsigned i=0;i<puzzle->count;i++)if(puzzle->entities[i].coord==coord&&puzzle->entities[i].exit==(int)dir){id=(int)i;break;}
  if(id<0)add_icon(b,icon,100);
  else {MoidaRoomEntity e=entity((unsigned)id,&puzzle->entities[id]);
   if(e.kind==2){add_icon(b,icon,100);e.before[e.before_count++]=(uint16_t)locks[dir];add_entity(b,e);}
   else if(e.kind==1){add_icon(b,tunnels[dir],100);e.after[e.after_count++]=(uint16_t)tunnels[dir];add_entity(b,e);}
  }
 }
 bool friend=false;for(unsigned i=0;i<puzzle->count;i++)if(puzzle->entities[i].coord==coord&&is_friend(&puzzle->entities[i]))friend=true;
 unsigned floor=coord/4,suite=coord%4;
 if(kind!=2){populate(b,kind,friend);dress(b,108,2+random_b(b->r,3));const unsigned trims[]={70,20,70},extras[]={75,50,20};if(moida_probability(b->r,(int)trims[floor]))dress(b,329,1);if(moida_probability(b->r,(int)extras[floor]))dress(b,197,1);if(floor){if(suite==0)add_icon(b,349,100);if(suite==3)add_icon(b,350,100);add_icon(b,334,100);}if(floor==2)add_icon(b,1,100);}
 if((has_parent(r,141)||has_parent(r,153))&&moida_probability(b->r,50))dress(b,241,1);
 if(kind!=2&&peep_count(b)<2)add_icon(b,200,100);
 for(unsigned id=0;id<puzzle->count;id++)if(puzzle->entities[id].coord==coord&&is_friend(&puzzle->entities[id])){
  unsigned candidates[15],count=0;for(unsigned i=0;i<15;i++)if(has_parent(r,boxes[i].box))candidates[count++]=i;
  if(!count)return false;Box box=boxes[pick(b->r,candidates,count)];MoidaRoomEntity e=entity(id,&puzzle->entities[id]);
  for(unsigned i=0;i<r->icon_count;i++)if(ancestor(r->icons[i],box.box)){e.searchable=r->icons[i];break;}
  e.rustle=box.rustle;e.before[e.before_count++]=(uint16_t)box.lock;add_entity(b,e);
 }
 for(unsigned id=0;id<puzzle->count;id++){
  MoidaPuzzleEntity *def=&puzzle->entities[id];if(def->coord!=coord)continue;MoidaRoomEntity e=entity(id,def);
  if(def->kind==0){if(def->contents==4)continue;if(def->contents==5){add_icon(b,43,100);e.searchable=43;}
   else {unsigned choices[64],count=0;for(unsigned i=0;i<r->icon_count;i++)if(searchable(r->icons[i])&&!used_container(r,r->icons[i]))choices[count++]=i;if(!count)return false;e.searchable=r->icons[pick(b->r,choices,count)];}add_entity(b,e);
  }else if(def->kind==3){unsigned index=0;for(unsigned i=0;i<id;i++)if(puzzle->entities[i].kind==3)index++;e.searchable=fairies[index];e.after[e.after_count++]=(uint16_t)e.searchable;add_entity(b,e);}
  else if(def->kind==4)add_entity(b,e);
 }
 for(unsigned i=child_offsets[154];i<child_offsets[155];i++)if(all_sprites(r,children[i])){b->out->effect=1;break;}
 return true;
}
static unsigned choose_kind(MoidaRandom *r,unsigned allowed,unsigned floor,unsigned exits){
 unsigned options[12],weights[12],count=0,total=0;
 for(unsigned i=0;i<12;i++)if((allowed&(1u<<plans[i].kind))&&plans[i].weights[floor]&&!(exits&~plans[i].exits)){options[count]=plans[i].kind;weights[count]=plans[i].weights[floor];total+=weights[count++];}
 if(!count)return 1;if(count==1)return options[0];unsigned n=random_b(r,total);
 for(unsigned i=0;i<count;i++){if(n<weights[i])return options[i];n-=weights[i];}return count==12?options[11]:1;
}
bool moida_house_attempt(MoidaHouse *h,MoidaRandom *random){
 memset(h,0,sizeof *h);moida_layout_attempt(&h->layout,random);
 if(!moida_puzzle_place(&h->puzzle,&h->layout)){*random=h->layout.random;h->random=*random;return false;}
 *random=h->layout.random;for(unsigned i=0;i<3;i++)h->friend_assets[i]=i;
 for(unsigned i=2;i;i--){unsigned j=random_b(random,i),v=h->friend_assets[i];h->friend_assets[i]=h->friend_assets[j];h->friend_assets[j]=v;}
 unsigned friends=0;for(unsigned i=0;i<h->puzzle.count&&friends<3;i++)if(is_friend(&h->puzzle.entities[i]))h->friend_entities[friends++]=i;
 unsigned styles[12],kinds[12],allowed=8191u&~((1u<<0)|(1u<<1)|(1u<<6)),bedrooms=0;
 for(unsigned i=0;i<12;i++)styles[i]=random_b(random,child_offsets[73]-child_offsets[72]-1);
 const unsigned friend_allowed=(1u<<1)|(1u<<3)|(1u<<4)|(1u<<5)|(1u<<7)|(1u<<9)|(1u<<10)|(1u<<11)|(1u<<12);
 const unsigned item_allowed=8191u&~((1u<<0)|(1u<<1)|(1u<<2));
 for(unsigned c=0;c<12;c++){
  unsigned options=allowed;if(c==h->layout.entrance)kinds[c]=6;
  else{for(unsigned i=0;i<h->puzzle.count;i++)if(h->puzzle.entities[i].coord==c){if(is_friend(&h->puzzle.entities[i]))options&=friend_allowed;if(h->puzzle.entities[i].kind==0)options&=item_allowed;}kinds[c]=choose_kind(random,options,c/4,h->layout.map.exits[c]);}
  if(kinds[c]==3){if(++bedrooms>=2)allowed&=~(1u<<3);}else allowed&=~(1u<<kinds[c]);
 }
 unsigned pool_count=0;
 for(unsigned c=0;c<12;c++){
  Builder b={h,&h->rooms[c],&h->rooms[c].room,random,{NULL,NULL},&pool_count};unsigned exits=h->layout.map.exits[c];
  if((exits&1)&&c%4)b.neighbors[0]=&h->rooms[c-1].room;
  if((exits&8)&&c>=4)b.neighbors[1]=&h->rooms[c-4].room;
  if(!decorate(&b,kinds[c],c,exits,c%4?styles[c-1]:0,styles[c])){h->random=*random;return false;}
 }
 h->random=*random;h->valid=true;return true;
}
bool moida_house_generate(MoidaHouse *h,int64_t seed,unsigned max_attempts){
 MoidaRandom random;moida_random_seed(&random,seed);
 for(unsigned i=0;i<max_attempts;i++){bool ok=moida_house_attempt(h,&random);h->attempts=i+1;if(ok)return true;}return false;
}
