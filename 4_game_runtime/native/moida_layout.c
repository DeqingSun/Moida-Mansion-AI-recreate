#include "moida_layout.h"
#include <string.h>
int moida_neighbor(unsigned c,unsigned dir) {
  if(c>=12||dir>=4)return -1;
  if(dir==0)return c%4?(int)c-1:-1;
  if(dir==1)return c%4<3?(int)c+1:-1;
  if(dir==2)return c<8?(int)c+4:-1;
  return c>=4?(int)c-4:-1;
}
static void edge(MoidaMap *m,unsigned c,unsigned dir,bool on) {
  int to=moida_neighbor(c,dir);if(to<0)return;
  unsigned opposite=dir^1u;
  if(on){m->exits[c]|=(uint8_t)(1u<<dir);m->exits[to]|=(uint8_t)(1u<<opposite);}
  else{m->exits[c]&=(uint8_t)~(1u<<dir);m->exits[to]&=(uint8_t)~(1u<<opposite);}
}
static unsigned sample_mask(MoidaRandom *r,unsigned mask) {
  unsigned count=0;for(unsigned i=0;i<12;i++)if(mask&(1u<<i))count++;
  unsigned index=(unsigned)moida_random_bounded(r,count-1);
  for(unsigned i=0;i<12;i++)if(mask&(1u<<i)){if(!index)return i;index--;}
  return 0;
}
static void visit(MoidaZone *z,unsigned c,int parent,int depth) {
  MoidaNode *n=&z->nodes[c];n->parent=parent;n->depth=depth;
  for(unsigned d=0;d<4;d++)if(z->map.exits[c]&(1u<<d)) {
    int next=moida_neighbor(c,d);
    if(next>=0&&z->nodes[next].depth<0){visit(z,(unsigned)next,(int)c,depth+1);n->children[d]=next;}
  }
}
void moida_zone_build(MoidaZone *z,const MoidaMap *map,unsigned root) {
  z->map=*map;z->root=root;
  for(unsigned i=0;i<12;i++){z->nodes[i].parent=-1;z->nodes[i].depth=-1;for(unsigned d=0;d<4;d++)z->nodes[i].children[d]=-1;}
  visit(z,root,-1,0);
}
static unsigned reachable(const MoidaMap *m,unsigned root) {
  MoidaZone z;moida_zone_build(&z,m,root);unsigned n=0;
  for(unsigned i=0;i<12;i++)if(z.nodes[i].depth>=0)n++;
  return n;
}
void moida_map_generate(MoidaMap *m,MoidaRandom *r,unsigned entrance) {
  memset(m,0,sizeof *m);
  for(unsigned floor=0;floor<3;floor++)for(unsigned x=0;x<3;x++)edge(m,4*floor+x,1,true);
  unsigned columns=15u&~(1u<<(entrance%4));
  for(unsigned floor=0;floor<2;floor++){unsigned x=sample_mask(r,columns);columns&=~(1u<<x);edge(m,4*floor+x,2,true);}
  unsigned extras=(unsigned)moida_random_bounded(r,1);
  for(unsigned extra=0;extra<extras;extra++) {
    unsigned x=sample_mask(r,columns);columns&=~(1u<<x);
    unsigned floor=(unsigned)moida_random_bounded(r,1);edge(m,4*floor+x,2,true);
    for(unsigned removal=0;removal<=extra+1;removal++) {
      unsigned coords[6];for(unsigned i=0;i<3;i++){coords[2*i]=4*floor+i;coords[2*i+1]=4*(floor+1)+i;}
      for(unsigned i=5;i>0;i--){unsigned j=(unsigned)moida_random_bounded(r,i),v=coords[i];coords[i]=coords[j];coords[j]=v;}
      for(unsigned i=0;i<6;i++){edge(m,coords[i],1,false);if(reachable(m,entrance)==12)break;edge(m,coords[i],1,true);}
    }
  }
}
static int max_depth(const MoidaZone *z) {int d=0;for(unsigned i=0;i<12;i++)if(z->nodes[i].depth>d)d=z->nodes[i].depth;return d;}
static int loc_depth(const MoidaZone *z,MoidaRandom *r,int depth) {
  unsigned mask=0;for(unsigned i=0;i<12;i++)if(z->nodes[i].depth==depth)mask|=1u<<i;
  return mask?(int)sample_mask(r,mask):-1;
}
static MoidaPassage ancestor(const MoidaZone *z,unsigned c,int distance) {
  for(int i=0;i<distance-1;i++){if(z->nodes[c].parent<0)break;c=(unsigned)z->nodes[c].parent;}
  int parent=z->nodes[c].parent;if(parent<0)return (MoidaPassage){0};
  for(unsigned d=0;d<4;d++)if(z->nodes[parent].children[d]==(int)c)return (MoidaPassage){true,(unsigned)parent,d};
  return (MoidaPassage){0};
}
static MoidaPassage ancestor_oriented(const MoidaZone *z,unsigned c,int distance,unsigned orientations) {
  for(int i=distance;i>=1;i--){MoidaPassage p=ancestor(z,c,i);if(p.valid&&(orientations&(1u<<(p.direction/2))))return p;}
  return (MoidaPassage){0};
}
static MoidaPassage random_passage(const MoidaZone *z,MoidaRandom *r,int low,int high,unsigned orientations) {
  MoidaPassage candidates[48];unsigned count=0;
  for(unsigned c=0;c<12;c++)if(z->nodes[c].depth>=0&&z->nodes[c].depth>=low&&z->nodes[c].depth<=high)
    for(unsigned d=0;d<4;d++)if(z->nodes[c].children[d]>=0&&(orientations&(1u<<(d/2))))candidates[count++]=(MoidaPassage){true,c,d};
  return count?candidates[moida_random_bounded(r,count-1)]:(MoidaPassage){0};
}
static MoidaMap blocked(const MoidaMap *m,MoidaPassage p){MoidaMap result=*m;if(p.valid)edge(&result,p.coord,p.direction,false);return result;}
static MoidaLocks locks(const MoidaZone *z,MoidaRandom *r,unsigned spec) {
  /* Masks: horizontal=1, vertical=2. Original layout-spec order is significant. */
  static const unsigned count[]={2,1,2,1,2,1,1},aorient[]={1,1,3,3,3,1,3},borient[]={3,0,1,0,3,0,0};
  MoidaLocks result={0};int depth=max_depth(z);
  if(count[spec]==1){result.a=random_passage(z,r,1,depth-2,aorient[spec]);result.valid=result.a.valid;return result;}
  if(moida_probability(r,50)) {
    result.order=1;if(depth<3)return result;
    int leaf=loc_depth(z,r,depth);if(leaf<0)return result;
    MoidaPassage a=ancestor_oriented(z,(unsigned)leaf,depth-2>3?depth-2:3,aorient[spec]);if(!a.valid)return result;
    MoidaMap map=blocked(&z->map,a);MoidaZone next;
    moida_zone_build(&next,&map,(unsigned)moida_neighbor(a.coord,a.direction));
    int last=max_depth(&next);leaf=loc_depth(&next,r,last);if(leaf<0)return result;
    int distance=(int)moida_random_bounded(r,(uint64_t)(last-1));if(distance<1)distance=1;
    MoidaPassage b=ancestor_oriented(&next,(unsigned)leaf,distance,borient[spec]);if(!b.valid)return result;
    result.a=a;result.b=b;result.valid=true;
  }else{
    result.order=2;MoidaPassage a=random_passage(z,r,2,depth-2,aorient[spec]);if(!a.valid)return result;
    MoidaMap map=blocked(&z->map,a);
    if(z->nodes[a.coord].depth>1){MoidaPassage p=ancestor(z,a.coord,z->nodes[a.coord].depth-1);if(!p.valid)return result;map=blocked(&map,p);}
    MoidaZone next;moida_zone_build(&next,&map,z->root);
    MoidaPassage b=random_passage(&next,r,2,max_depth(&next)-2,borient[spec]);if(!b.valid)return result;
    result.a=a;result.b=b;result.valid=true;
  }
  return result;
}
void moida_layout_attempt(MoidaLayout *g,MoidaRandom *r) {
  memset(g,0,sizeof *g);g->random=*r;
  unsigned choice=(unsigned)moida_random_bounded(&g->random,100),suite=3;
  static const unsigned weights[]={10,40,40};
  for(unsigned i=0;i<3;i++){if(choice<weights[i]){suite=i;break;}choice-=weights[i];}
  g->entrance=4+suite;moida_map_generate(&g->map,&g->random,g->entrance);
  g->spec=(unsigned)moida_random_bounded(&g->random,6);
  moida_zone_build(&g->zone,&g->map,g->entrance);
  g->locks=locks(&g->zone,&g->random,g->spec);*r=g->random;
}

void moida_layout_generate(MoidaLayout *g,int64_t seed){MoidaRandom r;moida_random_seed(&r,seed);moida_layout_attempt(g,&r);}
