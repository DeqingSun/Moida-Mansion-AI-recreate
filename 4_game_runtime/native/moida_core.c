#include "packed_sprite.h"
#include "moida_core.h"
#include <string.h>
#include "rom_tables.inc"

/* Original next/initRand/rand in pureZrandom; uint64_t overflow is intentional. */
static uint64_t rotl(uint64_t x, unsigned n) { return (x << n) | (x >> (64 - n)); }
uint64_t moida_random_next(MoidaRandom *r) {
  uint64_t a = r->a0, b = r->a1, result = a + b;
  b ^= a; r->a0 = rotl(a,55) ^ b ^ (b << 14); r->a1 = rotl(b,36);
  return result;
}
void moida_random_seed(MoidaRandom *r, int64_t seed) {
  static const uint64_t jump[] = {UINT64_C(13739361407582206667),UINT64_C(15594563132006766882)};
  if (!seed) seed = INT64_C(2147483647);
  uint64_t bits = (uint64_t)seed;
  /* Explicit arithmetic shift to match signed BigInt even for negative seeds. */
  r->a0 = (bits >> 16) | (seed < 0 ? (UINT64_MAX << 48) : 0);
  r->a1 = bits & 65535;
  uint64_t a = 0, b = 0;
  for (unsigned i=0;i<2;i++) for (unsigned j=0;j<64;j++) {
    if (jump[i] & (UINT64_C(1)<<j)) { a ^= r->a0; b ^= r->a1; }
    (void)moida_random_next(r);
  }
  r->a0=a; r->a1=b; (void)moida_random_next(r);
}
uint64_t moida_random_bounded(MoidaRandom *r, uint64_t max) {
  if (!max) return 0; /* Original consumes no random value here. */
  if (max == UINT64_MAX) return moida_random_next(r);
  for (unsigned attempts=0;;attempts++) {
    uint64_t value=moida_random_next(r);
    /* Keep the original rejection formula and retry limit exactly. */
    if (value <= UINT64_MAX-UINT64_MAX%max || attempts>20) return value%(max+1);
  }
}
bool moida_probability(MoidaRandom *r, int percent) {
  /* Original uses <=, so prob(0) is NOT always false. */
  return percent>=100 || (int)moida_random_bounded(r,100)<=percent;
}
void moida_display_fill(MoidaDisplay *d, bool on) {
  for (unsigned i=0;i<MOIDA_WORDS;i++) d->data[i]=on ? UINT32_MAX : 0;
}
bool moida_sprite_set(MoidaDisplay *d,unsigned bit,bool on) {
  if(bit>=MOIDA_WORDS*32) return false;
  uint32_t mask=UINT32_C(1)<<(bit%32);
  if(on) d->data[bit/32]|=mask; else d->data[bit/32]&=~mask;
  return true;
}
bool moida_sprite_get(const MoidaDisplay *d,unsigned bit) {
  return bit<MOIDA_WORDS*32 && (d->data[bit/32] & (UINT32_C(1)<<(bit%32)))!=0;
}
bool moida_icon_set(MoidaDisplay *d,unsigned icon,bool on) {
  if(icon+1 >= sizeof icon_offsets/sizeof *icon_offsets || icon==UINT32_MAX) return false;
  for(unsigned i=icon_offsets[icon];i<icon_offsets[icon+1];i++) moida_sprite_set(d,moida_packed_sprite(icon_sprites,i),on);
  return true;
}
bool moida_icon_all(const MoidaDisplay *d,unsigned icon) {
  if(icon+1 >= sizeof icon_offsets/sizeof *icon_offsets || icon==UINT32_MAX) return false;
  for(unsigned i=icon_offsets[icon];i<icon_offsets[icon+1];i++) if(!moida_sprite_get(d,moida_packed_sprite(icon_sprites,i))) return false;
  return true;
}
void moida_melody_set(MoidaMelody *m,const uint8_t *notes,size_t count,int duration) {
  m->index=0; m->count=(unsigned)(count>128 ? 128 : count); m->duration_ms=duration;
  if(m->count) memcpy(m->notes,notes,m->count);
}
void moida_melody_clear(MoidaMelody *m) {m->count=0;m->index=0;}
bool moida_melody_pop(MoidaMelody *m,uint8_t *note) {
  if(m->index>=m->count) return false;
  *note=m->notes[m->index++];return true;
}
double moida_note_hz(unsigned note) {return note<sizeof note_hz/sizeof *note_hz ? note_hz[note] : 0;}
bool moida_just_pressed(uint8_t current,uint8_t previous,unsigned button) {
  return button<4 && (current & (1u<<button)) && !(previous & (1u<<button));
}
void moida_runner_init(MoidaRunner *r) {memset(r,0,sizeof *r);r->index=-1;}
bool moida_runner_push(MoidaRunner *r,int id) {
  for(int i=0;i<=r->index;i++) if(r->positions[i].routine==id) {
    r->index=i;r->positions[i].step=0;return true;
  }
  if(r->index>=MOIDA_STACK-1) return false;
  r->positions[++r->index]=(MoidaPosition){id,0};return true;
}
void moida_runner_start(MoidaRunner *r,int id) {
  r->queued=0;r->index=-1;r->wait=0;r->waiting_input=false;
  if(id) (void)moida_runner_push(r,id);
}
void moida_runner_queue(MoidaRunner *r,int id,int wait_first) {
  r->queued=id;r->queued_start=false;r->wait_first=wait_first;
}
static bool apply_go(MoidaRunner *r) {
  if(!r->queued) return false;
  if(r->queued_start) {moida_runner_start(r,r->queued);return false;}
  if(moida_runner_push(r,r->queued)) {r->queued=0;return true;}
  return false;
}
static bool has_current(const MoidaRunner *r,const MoidaRoutineEnv *env) {
  return r->index>=0 && r->positions[r->index].step<env->step_count(env->user,r->positions[r->index].routine);
}
void moida_runner_tick(MoidaRunner *r,const MoidaRoutineEnv *env) {
  if(r->wait>0) {r->wait--;return;}
  if(r->waiting_input) return;
  while(apply_go(r) || has_current(r,env)) {
    if(has_current(r,env)) {
      MoidaPosition p=r->positions[r->index];
      if(p.routine) {
        r->queued=0;env->execute(env->user,r,p.routine,p.step);
        /* Read the current top again, as in the original advance(). */
        MoidaPosition *top=&r->positions[r->index];
        if(top->step+1<env->step_count(env->user,top->routine)) top->step++;
        else if(r->index>=0) r->index--;
      }
      if(r->wait_first) {r->wait=r->wait_first;r->wait_first=0;break;}
      if(!r->queued) break;
    }
  }
}
/* Text geometry lives in the same translation unit as the extracted icon map. */
void moida_font_position(MoidaDisplay *d,unsigned icon,uint16_t mask) {
  if(icon>=sizeof icon_offsets/sizeof *icon_offsets-1) return;
  unsigned first=icon_offsets[icon];
  for(unsigned i=first;i<icon_offsets[icon+1];i++)
    moida_sprite_set(d,moida_packed_sprite(icon_sprites,i),i-first<16 && (mask&(1u<<(i-first)))!=0);
}
void moida_icon_clear_children(MoidaDisplay *d,unsigned icon) {
  if(icon>=sizeof icon_child_offsets/sizeof *icon_child_offsets-1)return;
  for(unsigned i=icon_child_offsets[icon];i<icon_child_offsets[icon+1];i++)moida_icon_set(d,icon_children[i],false);
}
void moida_erase_top(MoidaDisplay *d,unsigned percent) {
  int32_t cutoff=(int32_t)(3137*percent/100)+6;
  for(unsigned i=icon_offsets[351];i<icon_offsets[352];i++) {
    unsigned bit=moida_packed_sprite(icon_sprites,i);
    if(moida_sprite_get(d,bit)&&sprite_center_y[bit]<=cutoff)moida_sprite_set(d,bit,false);
  }
}
/* Direction ordering follows the house: left, right, up, down. */
void moida_erase_direction(MoidaDisplay *d,unsigned direction,unsigned percent) {
  if(direction>3)return;
  int32_t extent=direction<2?4414:3137,origin=direction<2?29:6;
  int32_t cutoff=extent*(int32_t)percent/100+origin;
  bool reverse=direction==1||direction==3;
  if(reverse)cutoff=extent+origin-cutoff;
  for(unsigned i=icon_offsets[351];i<icon_offsets[352];i++) {
    unsigned bit=moida_packed_sprite(icon_sprites,i);int32_t center=direction<2?sprite_center_x[bit]:sprite_center_y[bit];
    if(reverse?center>=cutoff:center<=cutoff)moida_sprite_set(d,bit,false);
  }
}

void moida_flicker_lights(MoidaDisplay *d,bool on){
 for(unsigned i=icon_child_offsets[154];i<icon_child_offsets[155];i++){
  unsigned fixture=icon_children[i];
  if(moida_icon_all(d,fixture))for(unsigned j=icon_child_offsets[fixture];j<icon_child_offsets[fixture+1];j++)moida_icon_set(d,icon_children[j],on);
 }
}
void moida_icon_reveal(MoidaDisplay *d,unsigned icon,unsigned percent){
 if(icon>=352)return;int32_t low=INT32_MAX,high=INT32_MIN;
 for(unsigned i=icon_offsets[icon];i<icon_offsets[icon+1];i++){int32_t y=sprite_bottom_y[moida_packed_sprite(icon_sprites,i)];if(y<low)low=y;if(y>high)high=y;}
 if(low==INT32_MAX)return;int32_t cutoff=low+(int32_t)((100-percent)*(unsigned)(high-low)/100);
 for(unsigned i=icon_offsets[icon];i<icon_offsets[icon+1];i++)if(sprite_bottom_y[moida_packed_sprite(icon_sprites,i)]>=cutoff)moida_sprite_set(d,moida_packed_sprite(icon_sprites,i),true);
 for(unsigned c=icon_child_offsets[icon];c<icon_child_offsets[icon+1];c++){unsigned child=icon_children[c];for(unsigned i=icon_offsets[child];i<icon_offsets[child+1];i++)if(sprite_bottom_y[moida_packed_sprite(icon_sprites,i)]>=cutoff)moida_sprite_set(d,moida_packed_sprite(icon_sprites,i),false);}
}

void moida_erase_border(MoidaDisplay *d,unsigned percent,unsigned icon){
 int x0=29+2207*(int)percent/100,x1=4443-2207*(int)percent/100;
 int y0=6+1568*(int)percent/100,y1=3143-1569*(int)percent/100;
 for(unsigned bit=0;bit<631;bit++)if(sprite_center_x[bit]<x0||sprite_center_x[bit]>x1||sprite_center_y[bit]<y0||sprite_center_y[bit]>y1)moida_sprite_set(d,bit,false);
 if(!icon)return;
 unsigned list[2]={311,icon};for(unsigned k=0;k<2;k++)for(unsigned i=icon_offsets[list[k]];i<icon_offsets[list[k]+1];i++){unsigned bit=moida_packed_sprite(icon_sprites,i);if(sprite_center_x[bit]<x0||sprite_center_x[bit]>x1||sprite_center_y[bit]<y0||sprite_center_y[bit]>y1)moida_sprite_set(d,bit,true);}
 moida_icon_clear_children(d,icon);
}

void moida_erase_ghost(MoidaDisplay *d,MoidaRandom *random){
 int x=29+(int)moida_random_bounded(random,3311),y=6+(int)moida_random_bounded(random,2092);
 for(unsigned i=icon_offsets[107];i<icon_offsets[108];i++){unsigned bit=moida_packed_sprite(icon_sprites,i);if(sprite_center_x[bit]>=x&&sprite_center_x[bit]<x+1103&&sprite_center_y[bit]>=y&&sprite_center_y[bit]<y+1045)moida_sprite_set(d,bit,false);}
}

unsigned moida_control_action(uint8_t pressed,bool escape,bool up,bool down){if(pressed&4)return 1;if(pressed&8)return 2;if(pressed&1)return up?3:down?4:escape?6:0;if(pressed&2)return 5;return 0;}
