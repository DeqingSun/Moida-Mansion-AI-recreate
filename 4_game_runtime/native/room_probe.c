#include "room_io.h"
int main(void) {
  MoidaRoom room;unsigned mode,percent;uint64_t have,used;
  while(scanf("%u%u%" SCNu64 "%" SCNu64,&mode,&percent,&have,&used)==4) {
    if(!read_room(stdin,&room))return 2;
    MoidaDisplay display={0};
    if(mode==1)moida_room_draw_initial(&room,&display);else moida_room_draw(&room,&display,have,used);
    if(percent)moida_erase_top(&display,percent);
    printf("{\"words\":[");for(unsigned i=0;i<20;i++)printf("%s%" PRIu32,i?",":"",display.data[i]);
    printf("],\"moves\":[");for(unsigned i=0;i<4;i++){MoidaMove m=moida_room_can_move(&room,i,used);printf("%s[%u,%u,\"%" PRIu64 "\"]",i?",":"",m.kind,m.lock_icon,m.need_keys);}puts("]}");
  }
  return 0;
}
