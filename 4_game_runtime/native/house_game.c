/* Desktop line transport. The reusable core and HAL contain no stdio. */
#include "moida_hal.h"
#include <stdio.h>
#include <stdlib.h>
#include <inttypes.h>
#include <errno.h>
static void present(void *user,const MoidaFrame *frame){
 const MoidaGame *game=user;
  printf("{\"cycle\":%u,",frame->cycle);
  if(getenv("MOIDA_SESSION_TRACE"))printf("\"random\":[\"%" PRIu64 "\",\"%" PRIu64 "\"],\"used\":\"%" PRIu64 "\",\"stats\":[%u,%u,%u],",game->house.random.a0,game->house.random.a1,game->used,game->move_count,game->search_count,game->attacks);
  printf("\"ghostStep\":%u,\"ghostRoutine\":%u,",game->ghost_step,game->ghost_routine);
  printf("\"spiderHere\":%s,\"spiderSearched\":%s,",game->house.rooms[game->coord].room.spider?"true":"false",game->spider_searched?"true":"false");
  printf("\"monsterDying\":%s,\"monsterMode\":%u,\"monsterGuards\":%u,",(game->stage==12&&game->result.dead)?"true":"false",game->monster.mode,game->monster.guards);
  printf("\"canEscape\":%s,",moida_game_can_escape(game)?"true":"false");
  printf("\"gotCrown\":%s,\"buttonHolders\":[%d,%d,%d],",game->crown.got_crown?"true":"false",game->crown.buttons[0],game->crown.buttons[1],game->crown.buttons[2]);
  printf("\"waitingForInput\":%s,\"searchResult\":%u,\"inventory\":\"%" PRIu64 "\",",moida_game_waiting(game)?"true":"false",game->search_result,game->have);
  printf("\"status\":%u,\"coord\":%u,\"moveResult\":%u,\"moves\":[",game->stage,game->coord,game->last_move_result);for(unsigned i=0;i<4;i++)printf("%s%u",i?",":"",moida_room_can_move(&game->house.rooms[game->coord].room,i,game->used).kind);printf("],\"searchIcon\":%u,\"words\":[",game->search_icon);for(unsigned i=0;i<20;i++)printf("%s%" PRIu32,i?",":"",frame->display.data[i]);printf("],\"beeperHz\":%.2f,\"beeperDurationInMs\":%d}\n",frame->beeper_hz,(int)frame->beeper_duration_ms);fflush(stdout);
}
int main(int argc,char **argv){
 if(argc!=2)return 2;
 char *end;errno=0;int64_t seed=strtoll(argv[1],&end,10);if(errno||*end||end==argv[1])return 2;
 static MoidaHost host;
 MoidaHal hal={.user=&host.game,.present=present};
 if(!moida_host_init(&host,seed,&hal)){puts("{\"ready\":false,\"error\":\"House generation failed after 11 attempts; try another seed\"}");fflush(stdout);return 0;}
 printf("{\"ready\":true,\"entrance\":%u,\"attempts\":%u,\"welcome\":%u}\n",host.game.house.layout.entrance,host.game.house.attempts,host.game.welcome);fflush(stdout);
 unsigned command;
 while(scanf("%u",&command)==1)if(!moida_host_step_diagnostic(&host,command))return 3;
 return 0;
}
