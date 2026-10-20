#include "moida_layout.h"
#include <stdio.h>
#include <inttypes.h>
int main(void) {
 int64_t seed;
 while(scanf("%" SCNd64,&seed)==1){
  MoidaLayout g;moida_layout_generate(&g,seed);
  printf("{\"entrance\":%u,\"spec\":%u,\"exits\":[",g.entrance,g.spec);
  for(unsigned i=0;i<12;i++)printf("%s%u",i?",":"",g.map.exits[i]);
  printf("],\"nodes\":[");
  for(unsigned i=0;i<12;i++){MoidaNode *n=&g.zone.nodes[i];printf("%s[%d,%d,%d,%d,%d,%d]",i?",":"",n->depth,n->parent,n->children[0],n->children[1],n->children[2],n->children[3]);}
  printf("],\"locks\":{\"valid\":%s,\"order\":%u,\"a\":[%d,%u,%u],\"b\":[%d,%u,%u]},\"random\":[\"%" PRIu64 "\",\"%" PRIu64 "\"]}\n",g.locks.valid?"true":"false",g.locks.order,g.locks.a.valid,g.locks.a.coord,g.locks.a.direction,g.locks.b.valid,g.locks.b.coord,g.locks.b.direction,g.random.a0,g.random.a1);
 }
 return 0;
}
