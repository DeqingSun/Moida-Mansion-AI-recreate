"""Regression: idle browser connections and undrained logs must not block ticks."""
import json
from pathlib import Path
import socket
import subprocess
import sys
import time
from urllib.request import Request, urlopen

with socket.socket() as allocator:
    allocator.bind(('127.0.0.1', 0))
    port = allocator.getsockname()[1]
server = subprocess.Popen([sys.executable, str(Path(__file__).with_name('serve.py')), '--port', str(port)],
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)
base = f'http://127.0.0.1:{port}'
def post(path, data):
    with urlopen(Request(base+path, json.dumps(data).encode(), {'Content-Type': 'application/json'}), timeout=3) as r:
        return json.load(r)
idle = None
try:
    deadline = time.monotonic()+10
    while True:
        try:
            with urlopen(base+'/4_game_runtime/live.html', timeout=.5) as r:
                assert r.status == 200
            break
        except OSError:
            if time.monotonic()>deadline:
                raise
            time.sleep(.05)
    # Browser preconnect: TCP established, no HTTP request sent.
    idle = socket.create_connection(('127.0.0.1', port))
    time.sleep(.1)
    with urlopen(base+'/4_game_runtime/live.js', timeout=2) as r:
        assert r.status == 200
    layout = post('/api/layout', {'seed': '1700000000000'})
    assert layout == post('/api/layout', {'seed': '1700000000000'})
    assert layout['exits'] != post('/api/layout', {'seed': '1700001234567'})['exits']
    assert len(layout['exits']) == 12
    assert layout['puzzle']['valid']
    entities = layout['puzzle']['entities']
    assert sum(e[0] == 0 and e[2] == 4 for e in entities) == 3
    assert sum(e[0] == 0 and e[2] == 5 for e in entities) == 4
    # Raw original controls: press edges, ignored held input, shared stairs key,
    # search cancellation, and the first-friend departure reminder.
    control = post('/api/start', {'seed': '1700000000000'})
    def control_tick(buttons=0):
        return post('/api/tick', dict(control, buttons=buttons))
    control_tick(1)
    for _ in range(20):
        f = control_tick()
    assert f['coord'] == 5 and f['status'] == 2
    # Every second empty search before the first rescue shows tutorial 43.
    for attempt in range(2):
        f = control_tick(2)
        saw_tip = False
        for _ in range(600):
            saw_tip |= f['status'] == 16
            if f.get('waitingForInput'):
                before = f['coord']
                f = control_tick(4)  # Acknowledge only; do not walk left.
                assert f['coord'] == before
                control_tick()
            else:
                f = control_tick()
            if f['status'] == 2:
                break
        assert f['status'] == 2 and f['coord'] == 5
        assert saw_tip == (attempt == 1)
    f = control_tick(4)  # Left, not a diagnostic direction.
    for _ in range(20):
        f = control_tick(4)
    assert f['coord'] == 4 and f['status'] == 2
    control_tick()
    f = control_tick(8)
    assert f['status'] == 15 and f['beeperHz'] > 0
    for _ in range(20):
        f = control_tick()
    assert f['coord'] == 5 and f['status'] == 2
    f = control_tick(2)
    assert f['status'] == 4
    f = control_tick(4)  # Moving cancels a search.
    for _ in range(20):
        f = control_tick()
    assert f['coord'] == 4 and f['status'] == 2
    f = control_tick(1)  # Shared Stairs/Exit button chooses upstairs.
    for _ in range(25):
        f = control_tick(1)
    assert f['coord'] == 8 and f['status'] == 2
    session = post('/api/start', {'seed': '1700000000000'})
    # Leave stderr undrained deliberately, as happens with background tool sessions.
    for i in range(1500):
        frame = post('/api/tick', dict(session, buttons=0))
        assert frame['status'] == 0
    assert post('/api/tick', dict(session, buttons=1))['status'] == 1
    for _ in range(11):
        frame = post('/api/tick', dict(session, buttons=0))
    assert frame['status'] == 2
    post('/api/tick', dict(session, direction=0))
    idle_frames = [post('/api/tick', dict(session, idleAnimation=True)) for _ in range(45)]
    assert any(f['beeperHz'] for f in idle_frames)
    assert len({tuple(f['words']) for f in idle_frames}) > 1
    frame = post('/api/tick', dict(session, direction=1))
    post('/api/tick', dict(session, direction=1))
    frame = post('/api/tick', dict(session, direction=3))
    assert frame['coord'] == 2
    light_frames = [post('/api/tick', dict(session, idleAnimation=True)) for _ in range(20)]
    assert len({tuple(f['words']) for f in light_frames}) > 1
    assert not any(f['beeperHz'] for f in light_frames)
    post('/api/tick', dict(session, direction=2))
    frame = post('/api/tick', dict(session, direction=0))
    restored_words = frame['words']
    frame = post('/api/tick', dict(session, searchNext=True))
    assert frame['status'] == 4
    first_target = frame['searchIcon']
    frame = post('/api/tick', dict(session, searchNext=True))
    assert frame['status'] == 4 and frame['searchIcon'] != first_target
    for _ in range(100):
        frame = post('/api/tick', dict(session, buttons=0))
        if frame['status'] == 2:
            break
    assert frame['status'] == 2
    assert frame['words'] == restored_words
    direction = frame['moves'].index(1)
    original = frame['coord']
    frame = post('/api/tick', dict(session, direction=direction))
    assert frame['coord'] == original + [-1, 1, 4, -4][direction]
    assert frame['moveResult'] == 1
    frame = post('/api/tick', dict(session, direction=direction ^ 1))
    assert frame['coord'] == original
    frame = post('/api/tick', dict(session, direction=1))
    assert frame['coord'] == 6 and frame['moves'][1] == 2
    locked_base = frame['words']
    frame = post('/api/tick', dict(session, direction=1, animate=True))
    assert frame['status'] == 6 and frame['coord'] == 6
    for _ in range(20):
        frame = post('/api/tick', dict(session, buttons=0))
        if frame['status'] == 2:
            break
    assert frame['status'] == 2 and frame['coord'] == 6
    assert frame['words'] == locked_base
    # From room 6, reach the ordinary key in room 11 without crossing the lock.
    for direction in [0, 0, 2, 1, 1, 1]:
        frame = post('/api/tick', dict(session, direction=direction))
    assert frame['coord'] == 11
    for _ in range(7):
        frame = post('/api/tick', dict(session, searchNext=True))
    assert frame['searchIcon'] == 28
    for _ in range(110):
        frame = post('/api/tick', dict(session, buttons=0))
        if frame['status'] == 2:
            break
    assert frame['searchResult'] == 44 and int(frame['inventory']) != 0
    for direction in [0, 0, 0, 3, 1, 1]:
        frame = post('/api/tick', dict(session, direction=direction))
    assert frame['coord'] == 6
    frame = post('/api/tick', dict(session, direction=1, animate=True))
    assert frame['status'] == 7 and frame['coord'] == 6
    for _ in range(20):
        frame = post('/api/tick', dict(session, buttons=0))
        if frame['status'] == 2:
            break
    assert frame['status'] == 2 and frame['moves'][1] == 1
    frame = post('/api/tick', dict(session, direction=1))
    assert frame['coord'] == 7 and frame['moves'][0] == 1
    frame = post('/api/tick', dict(session, direction=0))
    assert frame['coord'] == 6
    session = post('/api/start', {'session': session['session'], 'seed': '1700001234567'})
    assert post('/api/tick', dict(session, buttons=0))['status'] == 0
    session = post('/api/start', {'session': session['session'], 'seed': '1700002469134'})
    post('/api/tick', dict(session, buttons=1))
    for _ in range(11):
        frame = post('/api/tick', dict(session, buttons=0))
    for direction in [0, 2]:
        frame = post('/api/tick', dict(session, direction=direction))
    assert frame['coord'] == 9 and frame['moves'][1] == 3
    for _ in range(4):
        frame = post('/api/tick', dict(session, searchNext=True))
    assert frame['searchIcon'] == 61
    for _ in range(160):
        frame = post('/api/tick', dict(session, buttons=0))
        if frame['status'] == 2:
            break
    assert frame['status'] == 2 and frame['searchResult'] == 48
    assert frame['moves'][1] == 1
    frame = post('/api/tick', dict(session, direction=1))
    assert frame['coord'] == 10 and frame['moves'][0] == 1
    frame = post('/api/tick', dict(session, direction=0))
    assert frame['coord'] == 9
    session = post('/api/start', {'session': session['session'], 'seed': '1700000000000'})
    post('/api/tick', dict(session, buttons=1))
    for _ in range(11):
        post('/api/tick', dict(session, buttons=0))
    frame = post('/api/tick', dict(session, direction=0))
    assert frame['coord'] == 4
    for _ in range(2):
        frame = post('/api/tick', dict(session, searchNext=True))
    assert frame['searchIcon'] == 327
    for _ in range(600):
        frame = post('/api/tick', dict(session, searchNext=frame.get('waitingForInput', False)))
        if frame['status'] == 2:
            break
    assert frame['searchResult'] == 100 and int(frame['inventory']) & 1
    rescued_words = frame['words']
    idle_frames = [post('/api/tick', dict(session, idleAnimation=True)) for _ in range(45)]
    assert not any(f['beeperHz'] for f in idle_frames)
    # Lighting may take over once friend rustling no longer has priority.
    post('/api/tick', dict(session, direction=1))
    frame = post('/api/tick', dict(session, direction=0))
    assert frame['words'] == rescued_words
    # A locked friend must reject search before its code is collected.
    for direction in [1, 1, 3, 0]:
        frame = post('/api/tick', dict(session, direction=direction))
    assert frame['coord'] == 1
    def select_target(icon):
        for _ in range(25):
            current = post('/api/tick', dict(session, searchNext=True))
            if current['searchIcon'] == icon:
                return current
        raise AssertionError(f'target {icon} not found')
    def finish_search():
        current = {}
        for _ in range(600):
            current = post('/api/tick', dict(session, searchNext=current.get('waitingForInput', False)))
            if current['status'] == 2:
                return current
        raise AssertionError('search did not finish')
    frame = select_target(36)
    assert frame['status'] == 4
    frame = finish_search()
    assert not (int(frame['inventory']) & (1 << 4))
    for direction in [1, 2, 0, 0, 2, 1, 1, 1]:
        frame = post('/api/tick', dict(session, direction=direction))
    assert frame['coord'] == 11
    select_target(62)
    frame = finish_search()
    assert frame['searchResult'] == 46 and int(frame['inventory']) & (1 << 5)
    for direction in [0, 0, 0, 3, 1, 1, 3, 0]:
        frame = post('/api/tick', dict(session, direction=direction))
    assert frame['coord'] == 1
    frame = select_target(36)
    assert frame['status'] == 8
    # Unlock animation ignores target switching until it hands off to search.
    frame = post('/api/tick', dict(session, searchNext=True))
    assert frame['status'] == 8 and frame['searchIcon'] == 36
    frame = finish_search()
    assert frame['searchResult'] == 100 and int(frame['inventory']) & (1 << 4)
    # Complete the crown puzzle using only normal navigation/search API calls.
    def navigate(target):
        visited = set()
        def visit():
            global frame
            if frame['coord'] == target:
                return True
            visited.add(frame['coord'])
            for direction, kind in enumerate(frame['moves'][:]):
                neighbor = frame['coord'] + [-1, 1, 4, -4][direction]
                if kind != 1 or neighbor in visited:
                    continue
                frame = post('/api/tick', dict(session, direction=direction))
                if visit():
                    return True
                frame = post('/api/tick', dict(session, direction=direction ^ 1))
            return False
        assert visit(), f'cannot reach room {target}'
    navigate(11)
    select_target(28)
    frame = finish_search()
    assert frame['searchResult'] == 44
    navigate(6)
    frame = post('/api/tick', dict(session, direction=1, animate=True))
    frame = finish_search()
    assert frame['moves'][1] == 1
    navigate(7)
    select_target(319)
    frame = finish_search()
    assert frame['searchResult'] == 100
    navigate(5)
    assert frame['canEscape'] and not frame['gotCrown']
    for room in [0, 2, 8]:
        navigate(room)
        select_target(43)
        frame = finish_search()
        assert frame['searchResult'] == 59 and not frame['gotCrown']
    # Releasing and reassigning a helper must preserve the other assignments.
    held = frame['buttonHolders'][:]
    select_target(43)
    frame = finish_search()
    assert frame['searchResult'] == 60
    assert sum(x >= 0 for x in frame['buttonHolders']) == 2
    select_target(43)
    frame = finish_search()
    assert frame['buttonHolders'] == held
    navigate(5)
    assert not frame['canEscape']
    navigate(10)
    select_target(43)
    frame = finish_search()
    assert frame['searchResult'] == 53 and frame['gotCrown']
    assert frame['buttonHolders'] == [-1, -1, -1]
    select_target(43)
    frame = finish_search()
    assert frame['searchResult'] == 42 and frame['gotCrown']
    navigate(5)
    assert frame['canEscape']
    frame = post('/api/tick', dict(session, buttons=1))
    assert frame['status'] == 9
    for _ in range(600):
        frame = post('/api/tick', dict(session, searchNext=frame.get('waitingForInput', False)))
        if frame['status'] == 10:
            break
    assert frame['status'] == 10 and frame['gotCrown']
    final_words = frame['words']
    frame = post('/api/tick', dict(session, direction=0, searchNext=True))
    assert frame['status'] == 10 and frame['words'] == final_words
    session = post('/api/start', {'session': session['session'], 'seed': '1700000000000'})
    def encounter_tick(**kwargs):
        return post('/api/tick', dict(session, encounters=True, **kwargs))
    encounter_tick(buttons=1)
    for _ in range(11):
        frame = encounter_tick()
    frame = encounter_tick(searchNext=True)
    for _ in range(600):
        frame = encounter_tick(searchNext=frame.get('waitingForInput', False))
        if frame['status'] == 2:
            break
    assert frame['monsterMode'] == 1
    frame = encounter_tick(searchNext=True)
    for _ in range(30):
        frame = encounter_tick()
        if frame['status'] == 12:
            break
    assert frame['status'] == 12
    warning_coord = frame['coord']
    frame = post('/api/tick', dict(session, encounters=False))
    assert frame['status'] == 2 and frame['monsterMode'] == 0 and frame['coord'] == warning_coord
    # Re-enable and provoke another warning for the existing escape/death checks.
    encounter_tick(searchNext=True)
    for _ in range(600):
        frame = encounter_tick(searchNext=frame.get('waitingForInput', False))
        if frame['status'] == 2:
            break
    encounter_tick(searchNext=True)
    for _ in range(30):
        frame = encounter_tick()
        if frame['status'] == 12:
            break
    assert frame['status'] == 12
    safe = next(d for d,k in enumerate(frame['moves']) if k == 1 and not (frame['monsterGuards'] & (1 << d)))
    old_coord = frame['coord']
    frame = encounter_tick(direction=safe, animate=True)
    for _ in range(30):
        frame = encounter_tick()
        if frame['status'] == 2:
            break
    assert frame['status'] == 2 and frame['coord'] != old_coord
    frame = encounter_tick(searchNext=True)
    saw_attack = False
    for _ in range(600):
        frame = encounter_tick(searchNext=frame.get('waitingForInput', False))
        saw_attack |= frame['status'] == 12
        if frame.get('monsterDying') and not frame.get('waitingForInput'):
            stuck_coord = frame['coord']
            frame = encounter_tick(direction=0)
            assert frame['coord'] == stuck_coord and frame['status'] in (12, 13), frame
        if frame['status'] == 13:
            break
    assert saw_attack and frame['status'] == 13
    session = post('/api/start', {'session': session['session'], 'seed': '1700000000000'})
    def spider_tick(**kwargs):
        return post('/api/tick', dict(session, spiders=True, **kwargs))
    spider_tick(buttons=1)
    for _ in range(11):
        frame = spider_tick()
    for i in range(100):
        frame = spider_tick(direction=0 if i % 2 == 0 else 1)
        if frame['spiderHere']:
            break
    assert frame['spiderHere'] and not frame['spiderSearched']
    for _ in range(30):
        frame = spider_tick(searchNext=True)
        if frame['searchIcon'] == 229:
            break
    assert frame['searchIcon'] == 229
    for _ in range(150):
        frame = spider_tick()
        if frame['status'] == 2:
            break
    assert frame['searchResult'] == 49 and frame['spiderSearched'] and not frame['spiderHere']
    for _ in range(30):
        direction = 1 if frame['coord'] == 4 else 0
        frame = spider_tick(direction=direction)
        assert not frame['spiderHere'] and frame['spiderSearched']
    print('PASS: seeded native layouts and puzzles, idle preconnect, 1500 ticks with undrained logs, native room reveal, search results, key collection, two-way door unlocking, latch/tunnel discovery and travel, persistent friend rescue, code-locked rescue, friend button assignment/release, full crown acquisition, escape ending, monster attack/escape/death, spider search/persistence, and session reset')
finally:
    if idle:
        idle.close()
    server.send_signal(2)
    try:
        server.communicate(timeout=5)
    except subprocess.TimeoutExpired:
        server.kill()
        server.communicate()
