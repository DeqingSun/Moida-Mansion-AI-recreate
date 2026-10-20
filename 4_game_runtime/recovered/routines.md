# Recovered original routine descriptions

Verbatim strings embedded in the Nim-generated JavaScript. These describe the scripts; they are not the complete game source.

## 1: intro

Procedure: `Game_routine_intro_proc__game_u2167`

0. `stop_room_anim() ; stop_loop_anim() ; clear() ; show_all() ; wait(10)`
1. `clear() ; wait(2)`
2. `centered_text(VAR_SID_intro_welcome) ; wait(20) ; melody([C6, B5, C6, N0, N0, N0, N0, N0, N0, N0, As5])`
3. `melody(kMelodyTheme) ; icon_add(ICN_intro) ; icon_add(ICN_intro_monsta_0) ; centered_text(SID_intro_moida) ; wait(30)`
4. `centered_text(SID_intro_by) ; wait(10)`
5. `centered_text(SID_intro_author) ; wait(34)`
6. `centered_text(SID_intro_copy) ; wait(34)`
7. `centered_text(SID_version) ; wait(12)`
8. `clear_text()`
9. `speak(RT_Game_intro_idle, ICN_none, SID_intro_rescue)`
10. `play_once RT_Game_intro_end`

## 2: intro_idle

Procedure: `Game_routine_intro_idle_proc__game_u2225`

0. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1) ; icon_sub(ICN_intro_monsta_0)`
1. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
2. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
3. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
4. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
5. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1) ; icon_add(ICN_intro_monsta_1)`
6. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
7. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
8. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
9. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
10. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
11. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
12. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
13. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
14. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
15. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
16. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
17. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
18. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
19. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
20. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1) ; icon_sub(ICN_intro_monsta_1)`
21. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
22. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
23. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
24. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
25. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
26. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
27. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1) ; icon_add(ICN_intro_monsta_0)`
28. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
29. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
30. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
31. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
32. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
33. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
34. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
35. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
36. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
37. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
38. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
39. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
40. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
41. `speak_text(VAR_SID_speech, ICN_ui_input_stairs_u) ; wait(1)`
42. `loop()`

## 3: intro_end

Procedure: `Game_routine_intro_end_proc__game_u2228`

0. `stop_loop_anim() ; clear() ; reveal_top(25) ; beep(C4) ; wait(2)`
1. `reveal_top(50) ; beep(G4) ; wait(2)`
2. `reveal_top(75) ; beep(C5) ; wait(2)`
3. `draw_house() ; beep(G5) ; wait(2)`
4. `play_once RT_Game_main`

## 4: main

Procedure: `Game_routine_main_proc__game_u2231`

0. `draw_house() ; stop_loop_anim() ; start_room_anim()`

## 5: move_right

Procedure: `Game_routine_move_right_proc__game_u2234`

0. `stop_loop_anim() ; erase_right(25) ; beep(G4) ; stop_room_anim() ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_arrow_r)`
1. `erase_right(50) ; icon_add(ICN_ui_input_arrow_r)`
2. `erase_right(75) ; icon_add(ICN_ui_input_arrow_r)`
3. `erase_right(100) ; icon_add(ICN_ui_input_arrow_r) ; beep(G4)`
4. `reveal_left(25) ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_arrow_r)`
5. `reveal_left(50) ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_arrow_r)`
6. `reveal_left(75) ; icon_subr(ICN_ui_input) ; beep(G4)`
7. `play_once RT_Game_post_move`

## 6: move_left

Procedure: `Game_routine_move_left_proc__game_u2237`

0. `stop_loop_anim() ; erase_left(25) ; beep(G4) ; stop_room_anim() ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_arrow_l)`
1. `erase_left(50) ; icon_add(ICN_ui_input_arrow_l)`
2. `erase_left(75) ; icon_add(ICN_ui_input_arrow_l)`
3. `erase_left(100) ; icon_add(ICN_ui_input_arrow_l) ; beep(G4)`
4. `reveal_right(25) ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_arrow_l)`
5. `reveal_right(50) ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_arrow_l)`
6. `reveal_right(75) ; icon_subr(ICN_ui_input) ; beep(G4)`
7. `play_once RT_Game_post_move`

## 7: move_up

Procedure: `Game_routine_move_up_proc__game_u2240`

0. `stop_loop_anim() ; erase_top(25) ; beep(G4) ; stop_room_anim() ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_stairs_u)`
1. `erase_top(50) ; icon_add(ICN_ui_input_stairs_u)`
2. `erase_top(75) ; icon_add(ICN_ui_input_stairs_u)`
3. `erase_top(100) ; icon_add(ICN_ui_input_stairs_u) ; beep(C5)`
4. `reveal_bottom(25) ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_stairs_u)`
5. `reveal_bottom(50) ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_stairs_u)`
6. `reveal_bottom(75) ; icon_subr(ICN_ui_input) ; beep(G5)`
7. `play_once RT_Game_post_move`

## 8: move_down

Procedure: `Game_routine_move_down_proc__game_u2243`

0. `stop_loop_anim() ; erase_bottom(25) ; beep(G5) ; stop_room_anim() ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_stairs_d)`
1. `erase_bottom(50) ; icon_add(ICN_ui_input_stairs_d)`
2. `erase_bottom(75) ; icon_add(ICN_ui_input_stairs_d)`
3. `erase_bottom(100) ; icon_add(ICN_ui_input_stairs_d) ; beep(C5)`
4. `reveal_top(25) ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_stairs_d)`
5. `reveal_top(50) ; icon_subr(ICN_ui_input) ; icon_add(ICN_ui_input_stairs_d)`
6. `reveal_top(75) ; icon_subr(ICN_ui_input) ; beep(G4)`
7. `play_once RT_Game_post_move`

## 9: post_move

Procedure: `Game_routine_post_move_proc__game_u2246`

0. `draw_house() ; update_after_move()`

## 10: room_fairy

Procedure: `Game_routine_room_fairy_proc__game_u2249`

0. `icon_sub(VAR_ICN_fairy)`
1. `icon_add(VAR_ICN_fairy)`
2. `icon_sub(VAR_ICN_fairy)`
3. `icon_add(VAR_ICN_fairy) ; wait(10)`
4. `loop()`

## 11: room_flicker_lights

Procedure: `Game_routine_room_flicker_lights_proc__game_u2252`

0. `flicker_lights(true)`
1. `wait(2)`
2. `flicker_lights(false)`
3. `wait(2)`
4. `loop()`

## 12: room_rustle

Procedure: `Game_routine_room_rustle_proc__game_u2255`

0. `wait(20)`
1. `icon_add(VAR_ICN_rustle) ; beep(C4)`
2. `icon_sub(VAR_ICN_rustle) ; beep(B3)`
3. `wait(10)`
4. `icon_add(VAR_ICN_rustle) ; beep(C4)`
5. `icon_sub(VAR_ICN_rustle) ; beep(B3)`
6. `icon_add(VAR_ICN_rustle) ; beep(C4)`
7. `icon_sub(VAR_ICN_rustle) ; beep(B3)`
8. `loop()`

## 13: rustle_move_beginning

Procedure: `Game_routine_rustle_move_beginning_proc__game_u2258`

0. `icon_add(VAR_ICN_rustle) ; beep(C4)`
1. `icon_sub(VAR_ICN_rustle) ; beep(B3)`

## 14: rustle_move_up

Procedure: `Game_routine_rustle_move_up_proc__game_u2261`

0. `play_once RT_Game_rustle_move_beginning`
1. `play_once RT_Game_move_up`

## 15: rustle_move_down

Procedure: `Game_routine_rustle_move_down_proc__game_u2264`

0. `play_once RT_Game_rustle_move_beginning`
1. `play_once RT_Game_move_down`

## 16: rustle_move_left

Procedure: `Game_routine_rustle_move_left_proc__game_u2267`

0. `play_once RT_Game_rustle_move_beginning`
1. `play_once RT_Game_move_left`

## 17: rustle_move_right

Procedure: `Game_routine_rustle_move_right_proc__game_u2270`

0. `play_once RT_Game_rustle_move_beginning`
1. `play_once RT_Game_move_right`

## 18: room_escape

Procedure: `Game_routine_room_escape_proc__game_u2273`

0. `wait(10)`
1. `clear_text() ; icon_sub(ICN_ui_input_stairs_d) ; beep(C5)`
2. `centered_text(SID_escape) ; icon_add(ICN_ui_input_stairs_d) ; beep(E5)`
3. `clear_text() ; icon_sub(ICN_ui_input_stairs_d) ; beep(C5)`
4. `centered_text(SID_escape) ; icon_add(ICN_ui_input_stairs_d) ; beep(E5)`
5. `loop()`

## 19: search_beginning_immediate

Procedure: `Game_routine_search_beginning_immediate_proc__game_u2276`

0. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_01) ; wait(1) ; beep(D5)`
1. `draw_house() ; text(SID_searching_01) ; wait(1) ; beep(E5)`
2. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_02) ; wait(1) ; beep(D5)`
3. `draw_house() ; text(SID_searching_02) ; wait(1) ; beep(E5)`
4. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_03) ; wait(1) ; beep(D5)`
5. `draw_house() ; text(SID_searching_03) ; wait(1) ; beep(E5)`

## 20: search_beginning

Procedure: `Game_routine_search_beginning_proc__game_u2279`

0. `draw_house() ; stop_room_anim() ; icon_sub(VAR_ICN_search_item) ; icon_sub(ICN_ui_input_search) ; text(SID_searching_00) ; beep(C6)`
1. `beep(C6) ; wait(1)`
2. `draw_house() ; text(SID_searching_00) ; wait(3)`
3. `draw_house() ; text(SID_searching_00) ; wait(1) ; beep(E5)`
4. `play_once RT_Game_search_beginning_immediate`

## 21: search_ending

Procedure: `Game_routine_search_ending_proc__game_u2282`

0. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_04) ; wait(1) ; beep(D5) ; inc_stat(Searches)`
1. `draw_house() ; text(SID_searching_04) ; wait(1) ; beep(E5)`
2. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_05) ; wait(1) ; beep(D5)`
3. `draw_house() ; text(SID_searching_05) ; wait(1) ; beep(E5)`
4. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_06) ; wait(1) ; beep(D5)`
5. `draw_house() ; text(SID_searching_06) ; wait(1) ; beep(E5)`
6. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_07) ; wait(1) ; beep(D5)`
7. `draw_house() ; text(SID_searching_07) ; wait(1) ; beep(E5)`
8. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_08) ; wait(1) ; beep(D5)`
9. `draw_house() ; text(SID_searching_08) ; wait(1) ; beep(E5)`
10. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_09) ; wait(1) ; beep(D5)`
11. `draw_house() ; text(SID_searching_09) ; wait(1) ; beep(E5)`
12. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_10) ; wait(1) ; beep(D5)`
13. `draw_house() ; text(SID_searching_10) ; wait(1) ; beep(E5)`
14. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_11) ; wait(1) ; beep(D5)`
15. `draw_house() ; text(SID_searching_11) ; wait(1) ; beep(E5)`
16. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_12) ; wait(1) ; beep(D5)`
17. `draw_house() ; text(SID_searching_12) ; wait(1) ; beep(E5)`
18. `draw_house() ; icon_sub(VAR_ICN_search_item) ; text(SID_searching_13) ; wait(1) ; beep(D5)`
19. `draw_house() ; text(SID_searching_13) ; wait(1) ; beep(E5)`
20. `apply_search_found()`

## 22: search

Procedure: `Game_routine_search_proc__game_u2285`

0. `play_once(RT_Game_search_beginning)`
1. `play_once(RT_Game_search_ending)`

## 23: search_immediate

Procedure: `Game_routine_search_immediate_proc__game_u2288`

0. `play_once(RT_Game_search_beginning_immediate)`
1. `play_once(RT_Game_search_ending)`

## 24: search_fairy_beginning

Procedure: `Game_routine_search_fairy_beginning_proc__game_u2291`

0. `draw_house() ; clear_text() ; icon_add(VAR_ICN_fairy) ; beep(F5)`
1. `icon_sub(VAR_ICN_fairy) ; beep(As5)`
2. `icon_add(VAR_ICN_fairy) ; beep(C6)`
3. `icon_sub(VAR_ICN_fairy) ; beep(F5)`
4. `icon_add(VAR_ICN_fairy) ; beep(As5)`
5. `icon_sub(VAR_ICN_fairy) ; beep(C6)`
6. `icon_add(VAR_ICN_fairy) ; beep(F5)`

## 25: search_fairy

Procedure: `Game_routine_search_fairy_proc__game_u2294`

0. `play_once RT_Game_search_fairy_beginning ; inc_stat(Searches)`
1. `icon_sub(VAR_ICN_fairy) ; beep(As5)`
2. `icon_add(VAR_ICN_fairy) ; beep(C6)`
3. `icon_sub(VAR_ICN_fairy) ; beep(F5)`
4. `icon_sub(VAR_ICN_fairy) ; beep(As5)`
5. `icon_add(VAR_ICN_fairy) ; beep(C6)`
6. `icon_sub(VAR_ICN_fairy) ; beep(F5)`
7. `icon_sub(VAR_ICN_fairy) ; beep(As5)`
8. `icon_add(VAR_ICN_fairy) ; beep(C6)`
9. `icon_sub(VAR_ICN_fairy) ; beep(F5)`
10. `apply_search_found()`

## 26: search_fairy_attacked

Procedure: `Game_routine_search_fairy_attacked_proc__game_u2297`

0. `play_once RT_Game_search_fairy_beginning`
1. `monsta_go_attack()`

## 27: search_unlocked

Procedure: `Game_routine_search_unlocked_proc__game_u2300`

0. `draw_house() ; stop_room_anim() ; icon_sub(VAR_ICN_search_item) ; icon_sub(VAR_ICN_lock) ; icon_sub(ICN_ui_input_search) ; text(SID_searching_00) ; beep(C5)`
1. `beep(C5) ; wait(1)`
2. `draw_house() ; centered_text(SID_unlocking) ; icon_add(VAR_ICN_lock) ; wait(3)`
3. `icon_sub(VAR_ICN_lock) ; icon_add(VAR_ICN_key) ; beep(F3)`
4. `icon_add(VAR_ICN_lock) ; icon_sub(VAR_ICN_key) ; wait(3)`
5. `icon_sub(VAR_ICN_lock) ; icon_add(VAR_ICN_key) ; beep(D3)`
6. `icon_add(VAR_ICN_lock) ; icon_sub(VAR_ICN_key) ; wait(3)`
7. `icon_sub(VAR_ICN_lock) ; icon_add(VAR_ICN_key) ; beep(A3)`
8. `icon_add(VAR_ICN_lock) ; icon_sub(VAR_ICN_key) ; wait(3)`
9. `icon_add(VAR_ICN_lock) ; icon_sub(VAR_ICN_key) ; wait(1) ; melody([C4, Ds4, Fs4, A4, C5])`
10. `icon_sub(VAR_ICN_lock)`
11. `icon_add(VAR_ICN_lock)`
12. `icon_sub(VAR_ICN_lock)`
13. `icon_add(VAR_ICN_lock)`
14. `icon_sub(VAR_ICN_lock)`
15. `wait(5)`
16. `play_once RT_Game_search_immediate`

## 28: search_attacked

Procedure: `Game_routine_search_attacked_proc__game_u2323`

0. `play_once RT_Game_search_beginning`
1. `monsta_go_attack()`

## 29: search_locked

Procedure: `Game_routine_search_locked_proc__game_u2326`

0. `play_once(RT_Game_search_beginning)`
1. `centered_text(VAR_SID_locked) ; wait(1) ; icon_add(VAR_ICN_lock) ; beep(D3) ; inc_stat(Searches)`
2. `clear_text() ; wait(1) ; icon_sub(VAR_ICN_lock) ; beep(Cs3)`
3. `centered_text(VAR_SID_locked) ; wait(1) ; icon_add(VAR_ICN_lock) ; beep(D3)`
4. `clear_text() ; wait(1) ; icon_sub(VAR_ICN_lock)`
5. `centered_text(VAR_SID_locked) ; wait(1) ; icon_add(VAR_ICN_lock) ; beep(D3)`
6. `clear_text() ; wait(1) ; icon_sub(VAR_ICN_lock)`
7. `centered_text(VAR_SID_locked) ; wait(1) ; icon_add(VAR_ICN_lock) ; beep(D3)`
8. `clear_text() ; wait(1) ; icon_sub(VAR_ICN_lock)`
9. `play_once RT_Game_post_found`

## 30: attack

Procedure: `Game_routine_attack_proc__game_u2329`

0. `play_loop_anim(RT_Game_loop_attack_0, 8)`
1. `play_loop_anim(RT_Game_loop_attack_1, 20)`
2. `play_loop_anim(RT_Game_loop_attack_2, 20)`
3. `monsta_go_moida()`

## 31: attack_quick

Procedure: `Game_routine_attack_quick_proc__game_u2332`

0. `play_loop_anim(RT_Game_loop_attack_2, 20)`
1. `monsta_go_moida()`

## 32: loop_attack_0

Procedure: `Game_routine_loop_attack_0_proc__game_u2335`

0. `melody([As4, A4]) ; icon_sub(VAR_ICN_monsta) ; wait(1)`
1. `melody([As4, A4]) ; icon_add(VAR_ICN_monsta) ; wait(1)`
2. `loop()`

## 33: loop_attack_1

Procedure: `Game_routine_loop_attack_1_proc__game_u2362`

0. `centered_text(SID_monsta) ; beep(As4) ; icon_sub(VAR_ICN_monsta)`
1. `clear_text() ; beep(As4) ; icon_add(VAR_ICN_monsta)`
2. `loop()`

## 34: loop_attack_2

Procedure: `Game_routine_loop_attack_2_proc__game_u2365`

0. `centered_text(SID_run) ; beep(As5) ; icon_sub(VAR_ICN_monsta)`
1. `clear_text() ; beep(As5) ; icon_add(VAR_ICN_monsta)`
2. `loop()`

## 35: moidad

Procedure: `Game_routine_moidad_proc__game_u2368`

0. `clear() ; stop_room_anim() ; icon_add(ICN_walls) ; icon_add(VAR_ICN_monsta_spot) ; icon_add(VAR_ICN_monsta) ; play_loop_anim(RT_Game_loop_monsta_rip_0, 20)`
1. `clear() ; icon_add(ICN_monsta_hand) ; icon_add(ICN_monsta_blood) ; play_loop_anim(RT_Game_loop_monsta_rip_1, 20) ; melody([B3, B5, As3, As5, A3, A5, Gs3, Gs5, G3, G5, Fs3, Fs5, F3, F5, E3, E5, ;         Ds3, Ds5, D3, D5, Cs3, Cs5])`
2. `clear() ; wait(10) ; icon_add(ICN_monsta_hand) ; icon_add(ICN_monsta_blood)`
3. `centered_text(SID_moida_0) ; melody([C4, C3]) ; wait(10)`
4. `centered_text(SID_moida_1) ; melody([E4, E3]) ; wait(10)`
5. `centered_text(SID_moida_2) ; beep(F4)`
6. `melody(kMelodyTheme) ; play_loop_anim(RT_Game_loop_monsta_rip_3, 120)`
7. `speak(RT_Game_speak_loop, ICN_none, SID_try_again)`
8. `que_restart()`

## 36: loop_monsta_rip_0

Procedure: `Game_routine_loop_monsta_rip_0_proc__game_u2403`

0. `icon_add(VAR_ICN_monsta) ; icon_add(ICN_monsta_hand) ; melody([C6, Fs5, E5, C5])`
1. `icon_sub(VAR_ICN_monsta) ; icon_sub(ICN_monsta_hand)`
2. `icon_add(VAR_ICN_monsta) ; icon_add(ICN_monsta_hand)`
3. `icon_sub(VAR_ICN_monsta) ; icon_sub(ICN_monsta_hand)`
4. `loop()`

## 37: loop_monsta_rip_1

Procedure: `Game_routine_loop_monsta_rip_1_proc__game_u2410`

0. `icon_add(ICN_monsta_blood) ; icon_add(ICN_monsta_hand)`
1. `icon_sub(ICN_monsta_blood) ; icon_sub(ICN_monsta_hand)`
2. `loop()`

## 38: loop_monsta_rip_2

Procedure: `Game_routine_loop_monsta_rip_2_proc__game_u2413`

0. `icon_add(ICN_monsta_blood) ; wait(1)`
1. `icon_sub(ICN_monsta_blood) ; wait(1)`
2. `icon_add(ICN_monsta_blood) ; wait(1)`
3. `icon_sub(ICN_monsta_blood) ; icon_sub(ICN_monsta_hand)`
4. `icon_add(ICN_monsta_blood) ; icon_add(ICN_monsta_hand) ; wait(1)`
5. `icon_add(ICN_monsta_blood) ; wait(1)`
6. `icon_sub(ICN_monsta_blood) ; wait(1)`
7. `icon_add(ICN_monsta_blood) ; wait(1)`
8. `icon_sub(ICN_monsta_blood) ; icon_sub(ICN_monsta_hand)`
9. `icon_add(ICN_monsta_blood) ; icon_add(ICN_monsta_hand) ; wait(1)`
10. `loop()`

## 39: loop_monsta_rip_3

Procedure: `Game_routine_loop_monsta_rip_3_proc__game_u2416`

0. `clear_text() ; wait(1)`
1. `centered_text(SID_moida_2) ; wait(3)`
2. `clear_text() ; wait(1)`
3. `centered_text(SID_moida_2) ; wait(3)`
4. `clear_text() ; wait(1)`
5. `centered_text(SID_moida_2) ; wait(3)`
6. `clear_text() ; wait(1)`
7. `centered_text(SID_moida_2) ; wait(3)`
8. `loop()`

## 40: show_locked

Procedure: `Game_routine_show_locked_proc__game_u2419`

0. `centered_text(VAR_SID_locked) ; wait(1) ; icon_add(VAR_ICN_lock) ; beep(D3)`
1. `clear_text() ; wait(1) ; icon_sub(VAR_ICN_lock) ; beep(Cs3)`
2. `centered_text(VAR_SID_locked) ; wait(1) ; icon_add(VAR_ICN_lock) ; beep(D3)`
3. `clear_text() ; wait(1) ; icon_sub(VAR_ICN_lock)`
4. `centered_text(VAR_SID_locked) ; wait(1) ; icon_add(VAR_ICN_lock) ; beep(D3)`
5. `clear_text() ; wait(1) ; icon_sub(VAR_ICN_lock)`
6. `draw_house()`

## 41: show_unlock

Procedure: `Game_routine_show_unlock_proc__game_u2422`

0. `icon_sub(VAR_ICN_lock) ; icon_sub(VAR_ICN_key) ; wait(1) ; melody([C4, Ds4, Fs4, A4, C5])`
1. `icon_add(VAR_ICN_lock) ; icon_add(VAR_ICN_key) ; wait(1)`
2. `icon_sub(VAR_ICN_lock) ; icon_sub(VAR_ICN_key) ; wait(1)`
3. `icon_add(VAR_ICN_lock) ; icon_add(VAR_ICN_key) ; wait(1)`
4. `icon_sub(VAR_ICN_lock) ; icon_sub(VAR_ICN_key) ; wait(1)`
5. `icon_add(VAR_ICN_lock) ; icon_add(VAR_ICN_key) ; wait(1)`
6. `icon_sub(VAR_ICN_lock) ; icon_sub(VAR_ICN_key) ; wait(1)`
7. `play_once RT_Game_main`

## 42: found_nothing

Procedure: `Game_routine_found_nothing_proc__game_u2429`

0. `draw_house() ; centered_text(SID_nothing) ; melody([Fs5, Fs4, Fs3]) ; wait(20)`
1. `check_want_search_tip(yes = RT_Game_found_nothing_search_tip, ;                       no = RT_Game_post_found)`

## 43: found_nothing_search_tip

Procedure: `Game_routine_found_nothing_search_tip_proc__game_u2452`

0. `stop_room_anim() ; stop_loop_anim() ; clear() ; melody([F4, A5, C6]) ; icon_add(ICN_walls) ; wait(20)`
1. `speak(RT_Game_hint_loop, ICN_none, SID_search_tip_0)`
2. `speak(RT_Game_hint_loop, ICN_search_tip, SID_search_tip_1)`
3. `melody([C6, A5, F4])`
4. `play_once RT_Game_post_found`

## 44: found_key

Procedure: `Game_routine_found_key_proc__game_u2463`

0. `draw_house() ; centered_text(SID_hidden_key) ; melody([Fs5, Ds5, C5, A4, C5, Ds5, Fs5, A5]) ; icon_add(ICN_ui_key)`
1. `icon_sub(ICN_ui_key) ; wait(1)`
2. `icon_add(ICN_ui_key) ; wait(1)`
3. `icon_sub(ICN_ui_key) ; wait(1)`
4. `icon_add(ICN_ui_key) ; wait(1)`
5. `icon_sub(ICN_ui_key) ; wait(1)`
6. `icon_add(ICN_ui_key) ; wait(1)`
7. `icon_sub(ICN_ui_key) ; wait(1)`
8. `icon_add(ICN_ui_key) ; wait(1)`
9. `icon_sub(ICN_ui_key) ; wait(1)`
10. `icon_add(ICN_ui_key) ; wait(10)`
11. `play_once RT_Game_post_found`

## 45: found_lock

Procedure: `Game_routine_found_lock_proc__game_u2486`

0. `draw_house() ; centered_text(VAR_SID_locked)`
1. `play_once RT_Game_post_found`

## 46: found_code

Procedure: `Game_routine_found_code_proc__game_u2489`

0. `centered_text(SID_hidden_code) ; melody([Fs5, Ds5, C5, A4, C5, Ds5, Fs5, A5])`
1. `icon_sub(VAR_ICN_key) ; wait(1)`
2. `icon_add(VAR_ICN_key) ; wait(1)`
3. `icon_sub(VAR_ICN_key) ; wait(1)`
4. `icon_add(VAR_ICN_key) ; wait(1)`
5. `icon_sub(VAR_ICN_key) ; wait(1)`
6. `icon_add(VAR_ICN_key) ; wait(1)`
7. `icon_sub(VAR_ICN_key) ; wait(1)`
8. `icon_add(VAR_ICN_key) ; wait(1)`
9. `icon_sub(VAR_ICN_key) ; wait(1)`
10. `icon_add(VAR_ICN_key) ; wait(10)`
11. `play_once RT_Game_post_found`

## 47: found_code_part

Procedure: `Game_routine_found_code_part_proc__game_u2496`

0. `centered_text(SID_code_part) ; melody([As4, C5, Ds5, F5, As5])`
1. `icon_sub(VAR_ICN_key) ; wait(1)`
2. `icon_add(VAR_ICN_key) ; wait(1)`
3. `icon_sub(VAR_ICN_key) ; wait(1)`
4. `icon_add(VAR_ICN_key) ; wait(1)`
5. `icon_sub(VAR_ICN_key) ; wait(1)`
6. `icon_add(VAR_ICN_key) ; wait(1)`
7. `icon_sub(VAR_ICN_key) ; wait(1)`
8. `icon_add(VAR_ICN_key) ; wait(1)`
9. `icon_sub(VAR_ICN_key) ; wait(1)`
10. `icon_add(VAR_ICN_key) ; wait(10)`
11. `play_once RT_Game_post_found`

## 48: found_latch

Procedure: `Game_routine_found_latch_proc__game_u2503`

0. `draw_house() ; centered_text(SID_hidden_latch) ; melody([Fs5, Ds5, C5, A4, C5, Ds5, Fs5, A5]) ; erase_ui_input()`
1. `icon_sub(VAR_ICN_search_item)`
2. `icon_add(VAR_ICN_search_item)`
3. `icon_sub(VAR_ICN_search_item)`
4. `icon_add(VAR_ICN_search_item)`
5. `icon_sub(VAR_ICN_search_item)`
6. `icon_add(VAR_ICN_search_item)`
7. `icon_sub(VAR_ICN_search_item)`
8. `icon_add(VAR_ICN_search_item)`
9. `icon_sub(VAR_ICN_search_item)`
10. `icon_add(VAR_ICN_search_item) ; wait(5)`
11. `icon_sub(VAR_ICN_search_item) ; melody([A3, A4])`
12. `icon_add(VAR_ICN_search_item) ; wait(10)`
13. `icon_reveal(VAR_ICN_hidden_passage, 20) ; melody([C4, Ds4, Fs4, A4, C5])`
14. `icon_reveal(VAR_ICN_hidden_passage, 30)`
15. `icon_reveal(VAR_ICN_hidden_passage, 40)`
16. `icon_reveal(VAR_ICN_hidden_passage, 50)`
17. `icon_reveal(VAR_ICN_hidden_passage, 60)`
18. `icon_reveal(VAR_ICN_hidden_passage, 70)`
19. `icon_reveal(VAR_ICN_hidden_passage, 80)`
20. `icon_reveal(VAR_ICN_hidden_passage, 90)`
21. `icon_reveal(VAR_ICN_hidden_passage, 100) ; use_found_latch_key()`
22. `centered_text(SID_passage) ; wait(2) ; beep(C4)`
23. `centered_text(SID_passage) ; wait(2) ; beep(Ds4)`
24. `centered_text(SID_passage) ; wait(2) ; beep(Fs4)`
25. `centered_text(SID_passage) ; wait(2) ; beep(A4)`
26. `centered_text(SID_passage) ; wait(10) ; beep(C5)`
27. `play_once RT_Game_post_found`

## 49: found_spider

Procedure: `Game_routine_found_spider_proc__game_u2518`

0. `draw_house() ; centered_text(SID_spider_ran) ; melody([As3, As4, As5]) ; wait(30)`
1. `play_once RT_Game_post_found`

## 50: found_crown_button_beginning_0

Procedure: `Game_routine_found_crown_button_beginning_0_proc__game_u2525`

0. `erase_ui_input() ; icon_add(VAR_ICN_search_item) ; centered_text(SID_crown_button) ; melody([E5, F5]) ; wait(20)`
1. `icon_sub(VAR_ICN_search_item) ; melody([A3, A4])`
2. `icon_add(VAR_ICN_search_item) ; wait(10)`

## 51: found_crown_button_beginning_1

Procedure: `Game_routine_found_crown_button_beginning_1_proc__game_u2536`

0. `centered_text(SID_nothing_q) ; melody([Fs5, Fs4, Fs3]) ; wait(20)`

## 52: found_crown_button

Procedure: `Game_routine_found_crown_button_proc__game_u2543`

0. `play_once RT_Game_found_crown_button_beginning_0`
1. `melody_crown_button(0, false) ; wait(5) ; clear_text()`
2. `melody_crown_button(1, false) ; wait(5)`
3. `melody_crown_button(2, false) ; wait(5)`
4. `melody_crown_button(3, false) ; wait(20)`
5. `play_once RT_Game_found_crown_button_beginning_1`
6. `play_once RT_Game_post_found`

## 53: found_crown_button_pushing_all

Procedure: `Game_routine_found_crown_button_pushing_all_proc__game_u2546`

0. `stop_room_anim() ; erase_ui_input()`
1. `centered_text(SID_crown_button) ; melody([E5, F5]) ; wait(20)`
2. `icon_sub(VAR_ICN_search_item) ; melody([A3, A4])`
3. `icon_add(VAR_ICN_search_item) ; wait(10)`
4. `melody_crown_button(0, true) ; wait(10) ; clear_text()`
5. `melody_crown_button(1, true) ; wait(10)`
6. `melody_crown_button(2, true) ; wait(10)`
7. `melody_crown_button(3, true) ; wait(20)`
8. `erase_border(20, ICN_walls) ; melody([C3, C4, C5, C6])`
9. `erase_border(40, ICN_walls) ; icon_add(ICN_crown_button) ; icon_add(ICN_ui_friend_face_all)`
10. `erase_border(60, ICN_walls) ; icon_add(ICN_crown_button) ; icon_add(ICN_ui_friend_face_all)`
11. `erase_border(80, ICN_walls) ; icon_add(ICN_crown_button) ; icon_add(ICN_ui_friend_face_all)`
12. `clear() ; icon_add(ICN_walls) ; icon_add(ICN_crown_button) ; icon_add(ICN_ui_friend_face_all)`
13. `wait(20)`
14. `play_loop_anim(RT_Game_loop_crown_warp_0, 12)`
15. `play_loop_anim(RT_Game_loop_crown_warp_1, 12)`
16. `play_loop_anim(RT_Game_loop_crown_warp_2, 12)`
17. `icon_add(ICN_walls) ; melody([C4, C3]) ; wait(20)`
18. `icon_add(ICN_crown) ; melody([D4, F4, G4, As4, D5, G5, F5, G5, D5, F5, G5, As5])`
19. `play_loop_anim(RT_Game_loop_crown_flash_0, 40)`
20. `centered_text(SID_got_crown) ; play_loop_anim(RT_Game_loop_crown_flash_1, 40) ; melody([Ds4, Ds4, A4]) ; icon_sub(ICN_crown_button)`
21. `clear() ; icon_add(ICN_walls) ; icon_add(ICN_ui_friend_face_all)`
22. `apply_got_crown()`
23. `draw_house() ; clear_text() ; icon_sub(ICN_ui_crown) ; wait(1) ; melody([A3, A4, A5])`
24. `icon_add(ICN_ui_crown) ; wait(1)`
25. `icon_sub(ICN_ui_crown) ; wait(1)`
26. `icon_add(ICN_ui_crown) ; wait(1) ; beep(A5)`
27. `icon_sub(ICN_ui_crown) ; wait(1)`
28. `icon_add(ICN_ui_crown) ; wait(1) ; beep(A5)`
29. `icon_sub(ICN_ui_crown) ; wait(1)`
30. `icon_add(ICN_ui_crown) ; wait(1) ; beep(A5)`
31. `icon_sub(ICN_ui_crown) ; wait(1)`
32. `icon_add(ICN_ui_crown) ; wait(1) ; beep(A5)`
33. `melody([Ds4, Ds4, A4]) ; speak(RT_Game_speak_loop, ICN_ui_friend_talk_all, SID_lets_escape)`
34. `play_once RT_Game_post_found`

## 54: loop_crown_warp_0

Procedure: `Game_routine_loop_crown_warp_0_proc__game_u2597`

0. `clear() ; icon_add(ICN_hyper) ; icon_add(ICN_ui_friend_face_all) ; melody([As3, As4, As5, As3, As4, As5])`
1. `icon_sub(ICN_hyper)`
2. `icon_add(ICN_hyper)`
3. `icon_sub(ICN_hyper)`
4. `icon_add(ICN_hyper)`
5. `icon_sub(ICN_hyper)`
6. `loop()`

## 55: loop_crown_warp_1

Procedure: `Game_routine_loop_crown_warp_1_proc__game_u2620`

0. `clear() ; icon_add(ICN_hyper) ; icon_add(ICN_ui_friend_face_all) ; melody([B3, B4, B5, B3, B4, B5])`
1. `icon_sub(ICN_hyper)`
2. `icon_add(ICN_hyper)`
3. `icon_sub(ICN_hyper)`
4. `icon_add(ICN_hyper)`
5. `icon_sub(ICN_hyper)`
6. `loop()`

## 56: loop_crown_warp_2

Procedure: `Game_routine_loop_crown_warp_2_proc__game_u2627`

0. `clear() ; icon_add(ICN_hyper) ; icon_add(ICN_ui_friend_face_all) ; melody([C4, C5, C6, C4, C5, C6])`
1. `icon_sub(ICN_hyper)`
2. `icon_add(ICN_hyper)`
3. `icon_sub(ICN_hyper)`
4. `icon_add(ICN_hyper)`
5. `icon_sub(ICN_hyper)`
6. `loop()`

## 57: loop_crown_flash_0

Procedure: `Game_routine_loop_crown_flash_0_proc__game_u2634`

0. `icon_add(ICN_crown_sparkle) ; wait(1)`
1. `icon_sub(ICN_crown_sparkle) ; wait(1)`
2. `loop()`

## 58: loop_crown_flash_1

Procedure: `Game_routine_loop_crown_flash_1_proc__game_u2637`

0. `icon_add(ICN_ui_friend_talk_all) ; icon_add(ICN_crown_sparkle) ; wait(1)`
1. `icon_sub(ICN_ui_friend_talk_all) ; icon_sub(ICN_crown_sparkle) ; wait(1)`
2. `loop()`

## 59: friend_crown_button_push

Procedure: `Game_routine_friend_crown_button_push_proc__game_u2640`

0. `play_once RT_Game_found_crown_button_beginning_0`
1. `melody_crown_button(1, false) ; wait(5) ; clear_text()`
2. `melody_crown_button(2, false) ; wait(5)`
3. `melody_crown_button(3, false) ; wait(5)`
4. `melody_crown_button(4, false) ; wait(20)`
5. `play_once RT_Game_found_crown_button_beginning_1`
6. `melody([Ds4, Ds4, A4]) ; icon_add(VAR_ICN_friend_talk) ; wait(2)`
7. `speak(RT_Game_speak_loop, VAR_ICN_friend_talk, SID_button_hold)`
8. `play_once RT_Game_post_found`

## 60: friend_crown_button_release

Procedure: `Game_routine_friend_crown_button_release_proc__game_u2647`

0. `draw_house() ; melody([Ds4, Ds4, A4]) ; icon_add(VAR_ICN_friend_talk) ; wait(2)`
1. `icon_add(VAR_ICN_crown_friend) ; speak(RT_Game_speak_loop, VAR_ICN_friend_talk, SID_button_release)`
2. `clear_text() ; icon_sub(VAR_ICN_friend_talk) ; icon_sub(VAR_ICN_search_item) ; melody([A3, A4])`
3. `icon_add(VAR_ICN_search_item) ; wait(10)`
4. `melody([Fs5, Fs4, Fs3]) ; wait(20)`
5. `play_once RT_Game_post_found`

## 61: room_friend_crown_button

Procedure: `Game_routine_room_friend_crown_button_proc__game_u2662`

0. `icon_add(VAR_ICN_crown_friend) ; icon_add(ICN_crown_button) ; wait(5)`
1. `icon_sub(VAR_ICN_crown_friend) ; icon_sub(ICN_crown_button) ; wait(1)`
2. `loop()`

## 62: post_found

Procedure: `Game_routine_post_found_proc__game_u2665`

0. `draw_house() ; wait(2)`
1. `monsta_go_peep() ; play_once RT_Game_monsta_peep`

## 63: monsta_peep

Procedure: `Game_routine_monsta_peep_proc__game_u2668`

0. `melody([As4, A4, As4])`
1. `icon_sub(VAR_ICN_monsta)`
2. `icon_add(VAR_ICN_monsta)`
3. `update_after_monsta()`

## 64: monsta_hide

Procedure: `Game_routine_monsta_hide_proc__game_u2675`

0. `melody([As4, A4, Fs4]) ; monsta_go_hide()`
1. `update_after_monsta()`

## 65: ghost_start

Procedure: `Game_routine_ghost_start_proc__game_u2682`

0. `draw_house() ; icon_add(ICN_ghost_cs_0) ; melody([A3, Gs3, N0, G3]) ; wait(10)`

## 66: ghost_start_CR

Procedure: `Game_routine_ghost_start_CR_proc__game_u2689`

0. `play_once RT_Game_ghost_start`
1. `play_once RT_Game_ghost_CR`

## 67: ghost_start_CL

Procedure: `Game_routine_ghost_start_CL_proc__game_u2692`

0. `play_once RT_Game_ghost_start`
1. `play_once RT_Game_ghost_CL`

## 68: ghost_start_CS

Procedure: `Game_routine_ghost_start_CS_proc__game_u2695`

0. `play_once RT_Game_ghost_start`
1. `play_once RT_Game_ghost_CS`

## 69: ghost_LC

Procedure: `Game_routine_ghost_LC_proc__game_u2698`

0. `draw_house() ; icon_add(ICN_ghost_lc_0) ; wait(2) ; beep(Fs3)`
1. `draw_house() ; icon_add(ICN_ghost_lc_1) ; wait(2) ; beep(Fs3)`
2. `draw_house() ; icon_add(ICN_ghost_lc_2) ; wait(2) ; beep(Fs3)`
3. `draw_house() ; icon_add(ICN_ghost_lc_3) ; wait(2) ; beep(Fs3)`

## 70: ghost_RC

Procedure: `Game_routine_ghost_RC_proc__game_u2701`

0. `draw_house() ; icon_add(ICN_ghost_rc_0) ; wait(2) ; beep(Fs3)`
1. `draw_house() ; icon_add(ICN_ghost_rc_1) ; wait(2) ; beep(Fs3)`
2. `draw_house() ; icon_add(ICN_ghost_rc_2) ; wait(2) ; beep(Fs3)`
3. `draw_house() ; icon_add(ICN_ghost_rc_3) ; wait(2) ; beep(Fs3)`

## 71: ghost_CL

Procedure: `Game_routine_ghost_CL_proc__game_u2704`

0. `draw_house() ; icon_add(ICN_ghost_lc_3) ; wait(2) ; beep(Fs3)`
1. `draw_house() ; icon_add(ICN_ghost_lc_2) ; wait(2) ; beep(Fs3)`
2. `draw_house() ; icon_add(ICN_ghost_lc_1) ; wait(2) ; beep(Fs3)`
3. `draw_house() ; icon_add(ICN_ghost_lc_0) ; wait(2) ; beep(Fs3)`
4. `draw_house() ; wait(2) ; beep(Fs3)`

## 72: ghost_CR

Procedure: `Game_routine_ghost_CR_proc__game_u2707`

0. `draw_house() ; icon_add(ICN_ghost_rc_3) ; wait(2) ; beep(Fs3)`
1. `draw_house() ; icon_add(ICN_ghost_rc_2) ; wait(2) ; beep(Fs3)`
2. `draw_house() ; icon_add(ICN_ghost_rc_1) ; wait(2) ; beep(Fs3)`
3. `draw_house() ; icon_add(ICN_ghost_rc_0) ; wait(2) ; beep(Fs3)`
4. `draw_house() ; wait(2) ; beep(Fs3)`

## 73: ghost_CS

Procedure: `Game_routine_ghost_CS_proc__game_u2710`

0. `draw_house() ; icon_add(ICN_ghost_cs_0) ; wait(2) ; beep(Fs3)`
1. `draw_house() ; icon_add(ICN_ghost_cs_1) ; wait(2) ; beep(Fs3)`
2. `draw_house() ; icon_add(ICN_ghost_cs_2) ; wait(2) ; beep(Fs3)`
3. `draw_house() ; wait(2) ; beep(Fs3)`

## 74: ghost_SC

Procedure: `Game_routine_ghost_SC_proc__game_u2713`

0. `draw_house() ; icon_add(ICN_ghost_cs_2) ; wait(2) ; beep(Fs3)`
1. `draw_house() ; icon_add(ICN_ghost_cs_1) ; wait(2) ; beep(Fs3)`
2. `draw_house() ; icon_add(ICN_ghost_cs_0) ; wait(2) ; beep(Fs3)`

## 75: ghost_LR

Procedure: `Game_routine_ghost_LR_proc__game_u2716`

0. `play_once RT_Game_ghost_LC`
1. `play_once RT_Game_ghost_CR`

## 76: ghost_LS

Procedure: `Game_routine_ghost_LS_proc__game_u2719`

0. `play_once RT_Game_ghost_LC`
1. `play_once RT_Game_ghost_CS`

## 77: ghost_RL

Procedure: `Game_routine_ghost_RL_proc__game_u2722`

0. `play_once RT_Game_ghost_RC`
1. `play_once RT_Game_ghost_CL`

## 78: ghost_RS

Procedure: `Game_routine_ghost_RS_proc__game_u2725`

0. `play_once RT_Game_ghost_RC`
1. `play_once RT_Game_ghost_CS`

## 79: ghost_SL

Procedure: `Game_routine_ghost_SL_proc__game_u2728`

0. `play_once RT_Game_ghost_SC`
1. `play_once RT_Game_ghost_CL`

## 80: ghost_SR

Procedure: `Game_routine_ghost_SR_proc__game_u2731`

0. `play_once RT_Game_ghost_SC`
1. `play_once RT_Game_ghost_CR`

## 81: ghost_end_LC

Procedure: `Game_routine_ghost_end_LC_proc__game_u2734`

0. `play_once RT_Game_ghost_LC`
1. `play_once RT_Game_ghost_end`

## 82: ghost_end_RC

Procedure: `Game_routine_ghost_end_RC_proc__game_u2737`

0. `play_once RT_Game_ghost_RC`
1. `play_once RT_Game_ghost_end`

## 83: ghost_end_SC

Procedure: `Game_routine_ghost_end_SC_proc__game_u2740`

0. `play_once RT_Game_ghost_SC`
1. `play_once RT_Game_ghost_end`

## 84: ghost_end

Procedure: `Game_routine_ghost_end_proc__game_u2743`

0. `icon_add(ICN_ghost_cs_0) ; wait(10)`
1. `play_loop_anim(RT_Game_loop_ghost_wild, 40)`
2. `draw_house() ; melody([A5, Gs5, N0, G5, N0, A4, Gs4, N0, G4, N0, A3, Gs3, N0, G3])`
3. `icon_add(VAR_ICN_ghost_item) ; wait(1)`
4. `icon_sub(VAR_ICN_ghost_item) ; wait(1)`
5. `icon_add(VAR_ICN_ghost_item) ; wait(1)`
6. `icon_sub(VAR_ICN_ghost_item) ; wait(1)`
7. `icon_add(VAR_ICN_ghost_item) ; wait(1)`
8. `icon_sub(VAR_ICN_ghost_item) ; wait(1)`
9. `icon_add(VAR_ICN_ghost_item) ; wait(1)`
10. `icon_sub(VAR_ICN_ghost_item) ; wait(1)`
11. `icon_add(VAR_ICN_ghost_item) ; wait(1)`
12. `playonce RT_Game_main`

## 85: loop_ghost_wild

Procedure: `Game_routine_loop_ghost_wild_proc__game_u2766`

0. `draw_house() ; erase_ghost() ; beep(A5)`
1. `draw_house() ; erase_ghost() ; beep(Gs5)`
2. `draw_house() ; erase_ghost() ; beep(G5)`
3. `loop()`

## 86: rescue_beginning

Procedure: `Game_routine_rescue_beginning_proc__game_u2769`

0. `icon_subr(ICN_ui_input) ; melody([D4, F4, G4, As4, D5, G5, F5, G5, D5, F5, G5, As5])`
1. `stop_room_anim()`
2. `erase_border(10, VAR_ICN_search_item)`
3. `erase_border(20, VAR_ICN_search_item)`
4. `erase_border(30, VAR_ICN_search_item)`
5. `erase_border(40, VAR_ICN_search_item)`
6. `erase_border(50, VAR_ICN_search_item)`
7. `erase_border(60, VAR_ICN_search_item)`
8. `erase_border(70, VAR_ICN_search_item)`
9. `erase_border(80, VAR_ICN_search_item)`
10. `erase_border(90, VAR_ICN_search_item)`
11. `erase_border(100, VAR_ICN_search_item)`
12. `wait(10)`
13. `centered_text(VAR_SID_rescued) ; icon_sub(VAR_ICN_search_item) ; icon_add(VAR_ICN_friend_face) ; melody([F5, A5, C6, N0, A5, N0, C6])`
14. `icon_sub(VAR_ICN_friend_face) ; icon_sub(VAR_ICN_search_item)`
15. `icon_add(VAR_ICN_friend_face)`
16. `icon_sub(VAR_ICN_friend_face) ; icon_add(VAR_ICN_search_item)`
17. `icon_add(VAR_ICN_friend_face)`
18. `icon_sub(VAR_ICN_friend_face) ; icon_sub(VAR_ICN_search_item)`
19. `icon_add(VAR_ICN_friend_face)`
20. `icon_sub(VAR_ICN_friend_face) ; icon_add(VAR_ICN_search_item)`
21. `icon_add(VAR_ICN_friend_face)`
22. `icon_sub(VAR_ICN_friend_face) ; icon_sub(VAR_ICN_search_item)`
23. `icon_add(VAR_ICN_friend_face)`
24. `icon_sub(VAR_ICN_friend_face) ; icon_add(VAR_ICN_search_item)`
25. `icon_add(VAR_ICN_friend_face)`
26. `icon_sub(VAR_ICN_friend_face) ; icon_sub(VAR_ICN_search_item)`
27. `icon_add(VAR_ICN_friend_face)`
28. `icon_sub(VAR_ICN_friend_face) ; icon_add(VAR_ICN_search_item)`
29. `icon_add(VAR_ICN_friend_face) ; wait(4)`
30. `speak(RT_Game_speak_loop, VAR_ICN_friend_talk, SID_thank_you)`
31. `beep(C6)`

## 87: rescue_then_hint

Procedure: `Game_routine_rescue_then_hint_proc__game_u2796`

0. `play_once RT_Game_rescue_beginning`
1. `speak(RT_Game_speak_loop, VAR_ICN_friend_talk, VAR_SID_rescued_help_next)`
2. `clear() ; melody([F4, A5, C6]) ; icon_add(ICN_walls) ; icon_add(VAR_ICN_friend_face) ; wait(20)`
3. `speak(RT_Game_hint_loop, VAR_ICN_friend_talk, VAR_SID_rescued_hint)`
4. `melody([C6, A5, F4])`
5. `play_once RT_Game_post_found`

## 88: rescue_then_gift

Procedure: `Game_routine_rescue_then_gift_proc__game_u2807`

0. `play_once RT_Game_rescue_beginning`
1. `speak(RT_Game_speak_loop, VAR_ICN_friend_talk, VAR_SID_rescued_help_next)`
2. `icon_add(VAR_ICN_friend_face) ; icon_add(VAR_ICN_hint_item) ; give_next_gift() ; melody([Fs5, Ds5, C5, A4, C5, Ds5, Fs5, A5])`
3. `icon_sub(VAR_ICN_hint_item)`
4. `icon_add(VAR_ICN_hint_item)`
5. `icon_sub(VAR_ICN_hint_item)`
6. `icon_add(VAR_ICN_hint_item)`
7. `icon_sub(VAR_ICN_hint_item)`
8. `icon_add(VAR_ICN_hint_item)`
9. `icon_sub(VAR_ICN_hint_item)`
10. `icon_add(VAR_ICN_hint_item)`
11. `icon_sub(VAR_ICN_hint_item)`
12. `icon_add(VAR_ICN_hint_item)`
13. `speak(RT_Game_hint_loop, VAR_ICN_friend_talk, VAR_SID_rescued_hint)`
14. `play_once RT_Game_post_found`

## 89: rescue_then_leave

Procedure: `Game_routine_rescue_then_leave_proc__game_u2814`

0. `play_once RT_Game_rescue_beginning`
1. `speak(RT_Game_speak_loop, VAR_ICN_friend_talk, SID_lets_escape)`
2. `melody([C6, A5, F4])`
3. `play_once RT_Game_post_found`

## 90: escape

Procedure: `Game_routine_escape_proc__game_u2821`

0. `stop_loop_anim() ; stop_room_anim() ; clear() ; icon_add(ICN_intro) ; icon_add(VAR_ICN_escape_spider) ; icon_add(ICN_intro_monsta_0) ; melody([C3, Ds3, F3, C4, Ds4, F4, C5, Ds5, F5, C6]) ; wait(20)`
1. `melody([C3, D3, Ds3, D3, C3, D3, Ds3, D3, C3, D3, Ds3, D3, C3, D3, Ds3, D3]) ; wait(15) ; centered_text(SID_escaped)`
2. `melody([D3, Ds3, F3, Ds3, D3, Ds3, F3, Ds3, D3, Ds3, F3, Ds3, D3, Ds3, F3, Ds3]) ; wait(15)`
3. `melody([G3, A3, As3, A3, G3, A3, As3, A3, G3, A3, As3, A3, G3, A3, As3, A3]) ; wait(15)`
4. `melody([C4, N0, N0, A3, N0, N0, As3, N0, N0, C4, N0, N0, As3])`
5. `wait(20)`
6. `melody(kMelodyTheme)`
7. `prep_stats() ; stat_text(Rescues) ; icon_add(VAR_ICN_friends_rescued_0) ; icon_add(VAR_ICN_friends_rescued_1) ; wait(1)`
8. `icon_sub(VAR_ICN_friends_rescued_0) ; icon_sub(VAR_ICN_friends_rescued_1) ; wait(1)`
9. `icon_add(VAR_ICN_friends_rescued_0) ; icon_add(VAR_ICN_friends_rescued_1) ; wait(1)`
10. `icon_sub(VAR_ICN_friends_rescued_0) ; icon_sub(VAR_ICN_friends_rescued_1) ; wait(1)`
11. `icon_add(VAR_ICN_friends_rescued_0) ; icon_add(VAR_ICN_friends_rescued_1) ; wait(1)`
12. `icon_sub(VAR_ICN_friends_rescued_0) ; icon_sub(VAR_ICN_friends_rescued_1) ; wait(1)`
13. `icon_add(VAR_ICN_friends_rescued_0) ; icon_add(VAR_ICN_friends_rescued_1) ; wait(1)`
14. `icon_sub(VAR_ICN_friends_rescued_0) ; icon_sub(VAR_ICN_friends_rescued_1) ; wait(1)`
15. `icon_add(VAR_ICN_friends_rescued_0) ; icon_add(VAR_ICN_friends_rescued_1) ; wait(1)`
16. `icon_sub(VAR_ICN_friends_rescued_0) ; icon_sub(VAR_ICN_friends_rescued_1) ; wait(1)`
17. `icon_add(VAR_ICN_friends_rescued_0) ; icon_add(VAR_ICN_friends_rescued_1) ; wait(1)`
18. `icon_sub(VAR_ICN_friends_rescued_0) ; icon_sub(VAR_ICN_friends_rescued_1) ; wait(1)`
19. `icon_add(VAR_ICN_friends_rescued_0) ; icon_add(VAR_ICN_friends_rescued_1) ; wait(1)`
20. `icon_sub(VAR_ICN_friends_rescued_0) ; icon_sub(VAR_ICN_friends_rescued_1) ; wait(1)`
21. `icon_add(VAR_ICN_friends_rescued_0) ; icon_add(VAR_ICN_friends_rescued_1) ; wait(1)`
22. `icon_sub(VAR_ICN_friends_rescued_0) ; icon_sub(VAR_ICN_friends_rescued_1) ; wait(1)`
23. `icon_add(VAR_ICN_friends_rescued_0) ; icon_add(VAR_ICN_friends_rescued_1) ; wait(1)`
24. `stat_text(Moves) ; wait(30)`
25. `stat_text(Searches) ; wait(30)`
26. `stat_text(Attacks) ; wait(30)`
27. `speak(RT_Game_gameover_good_loop, ICN_none, SID_congrats)`
28. `que_restart()`

## 91: gameover_good_loop

Procedure: `Game_routine_gameover_good_loop_proc__game_u2896`

0. `clear() ; draw_next_escape_room() ; icon_add(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1)`
1. `speak_text(VAR_SID_speech) ; wait(1)`
2. `speak_text(VAR_SID_speech) ; wait(1)`
3. `speak_text(VAR_SID_speech) ; wait(1)`
4. `speak_text(VAR_SID_speech) ; wait(1)`
5. `speak_text(VAR_SID_speech) ; wait(1)`
6. `speak_text(VAR_SID_speech) ; wait(1)`
7. `speak_text(VAR_SID_speech) ; wait(1)`
8. `speak_text(VAR_SID_speech) ; wait(1)`
9. `speak_text(VAR_SID_speech) ; wait(1)`
10. `speak_text(VAR_SID_speech) ; wait(1)`
11. `speak_text(VAR_SID_speech) ; wait(1)`
12. `speak_text(VAR_SID_speech) ; wait(1)`
13. `speak_text(VAR_SID_speech) ; wait(1)`
14. `speak_text(VAR_SID_speech) ; wait(1)`
15. `speak_text(VAR_SID_speech) ; wait(1)`
16. `speak_text(VAR_SID_speech) ; wait(1)`
17. `speak_text(VAR_SID_speech) ; wait(1)`
18. `speak_text(VAR_SID_speech) ; wait(1)`
19. `speak_text(VAR_SID_speech) ; wait(1)`
20. `speak_text(VAR_SID_speech) ; wait(1)`
21. `loop()`

## 92: speak_loop

Procedure: `Game_routine_speak_loop_proc__game_u2899`

0. `icon_add(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1)`
1. `icon_sub(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1)`
2. `loop()`

## 93: hint_loop

Procedure: `Game_routine_hint_loop_proc__game_u2902`

0. `icon_add(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1) ; icon_add(VAR_ICN_hint_item)`
1. `icon_sub(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1)`
2. `icon_add(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1) ; icon_sub(VAR_ICN_hint_item)`
3. `icon_sub(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1)`
4. `icon_add(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1) ; icon_add(VAR_ICN_hint_item)`
5. `icon_sub(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1)`
6. `icon_add(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1) ; icon_sub(VAR_ICN_hint_item)`
7. `icon_sub(VAR_ICN_speaker_talk) ; speak_text(VAR_SID_speech) ; wait(1)`
8. `loop()`

## 94: util_stop_loop_anim

Procedure: `Game_routine_util_stop_loop_anim_proc__game_u2905`

0. `stop_loop_anim()`
