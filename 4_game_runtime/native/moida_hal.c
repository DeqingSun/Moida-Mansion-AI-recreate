#include "moida_hal.h"
bool moida_host_init(MoidaHost *host,int64_t seed,const MoidaHal *hal){
 if(!host||!hal||!hal->present)return false;
 /* Copy first: callers may pass &host->hal when resetting. */
 MoidaHal callbacks=*hal;
 host->hal=callbacks;host->clock_started=false;host->last_ms=0;
 return moida_game_init(&host->game,seed);
}
bool moida_host_step_diagnostic(MoidaHost *host,unsigned commands){
 if(!host||!host->hal.present)return false;
 MoidaFrame frame;
 if(!moida_game_tick_diagnostic(&host->game,commands,&frame))return false;
 host->hal.present(host->hal.user,&frame);
 return true;
}
bool moida_host_step(MoidaHost *host,uint8_t buttons){
 if(!host||!host->hal.present)return false;
 MoidaFrame frame;
 if(!moida_game_tick(&host->game,buttons,&frame))return false;
 host->hal.present(host->hal.user,&frame);
 return true;
}
int moida_host_poll(MoidaHost *host){
 if(!host||!host->hal.now_ms||!host->hal.read_buttons||!host->hal.present||!host->game.ready)return -1;
 uint32_t now=host->hal.now_ms(host->hal.user);
 if(host->clock_started&&(uint32_t)(now-host->last_ms)<MOIDA_TICK_MS)return 0;
 host->last_ms=now;host->clock_started=true;
 return moida_host_step(host,host->hal.read_buttons(host->hal.user))?1:-1;
}
