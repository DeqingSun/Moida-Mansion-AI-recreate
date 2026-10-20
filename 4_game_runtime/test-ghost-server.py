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
    session = post('/api/start', {'seed': '1700001234567'})
    encounters_enabled = False
    def tick(**kwargs):
        return post('/api/tick', dict(session, ghosts=True, encounters=encounters_enabled, **kwargs))
    def settle():
        global frame
        for _ in range(800):
            if frame['status'] == 2:
                return
            frame = tick(searchNext=frame.get('waitingForInput', False))
        raise AssertionError('action did not finish')
    frame = tick(buttons=1)
    settle()
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
                frame = tick(direction=direction)
                settle()
                if visit():
                    return True
                frame = tick(direction=direction ^ 1)
                settle()
            return False
        assert visit(), f'cannot reach {target}'
    def search(icon):
        global frame
        for _ in range(30):
            frame = tick(searchNext=True)
            if frame['searchIcon'] == icon:
                break
        assert frame['searchIcon'] == icon
        settle()
    navigate(11)
    assert frame['ghostRoutine'] == 0  # Prerequisite friend not rescued.
    navigate(8)
    search(313)
    assert frame['searchResult'] == 100
    for room, icon in [(11,82),(9,83),(3,80)]:
        navigate(room)
        search(icon)
        assert frame['searchResult'] in (46,47)
    navigate(1)
    search(319)
    assert frame['searchResult'] == 100
    navigate(11)
    # Start the route with a fresh entry if navigation already advanced it.
    frame = tick(direction=0)
    settle()
    frame = tick(direction=1)
    settle()
    assert frame['ghostStep'] == 0  # Wrong room relative to expected route.
    # A post-search monster appearance must finish before the ghost starts.
    encounters_enabled = True
    frame = tick(searchNext=True)
    saw_peep = saw_ghost = False
    for _ in range(300):
        frame = tick()
        saw_peep |= frame['status'] == 11
        if frame['status'] == 14:
            assert saw_peep
            saw_ghost = True
        if frame['status'] == 2:
            break
    assert saw_peep and saw_ghost and frame['monsterMode'] == 1
    assert frame['ghostRoutine'] == 67 and frame['ghostStep'] == 1
    encounters_enabled = False
    for expected_room, expected_step in [(10,2),(9,3),(8,0)]:
        frame = tick(direction=0)
        assert frame['status'] == 14
        settle()
        assert frame['coord'] == expected_room and frame['ghostStep'] == expected_step
    assert frame['ghostRoutine'] == 82
    assert not (int(frame['inventory']) & (1 << 6))  # Reveal is a clue, not collection.
    search(1)
    assert frame['searchResult'] == 48 and int(frame['inventory']) & (1 << 6)
    assert frame['moves'][3] == 1
    frame = tick(direction=3)
    settle()
    assert frame['coord'] == 4
    search(260)
    assert frame['searchResult'] == 100 and int(frame['inventory']) & (1 << 5)
    navigate(11)
    assert frame['ghostRoutine'] == 0  # Collected reward stops the ghost.
    print('PASS: ghost prerequisite, wrong-turn reset, four-room trail, item reveal, latch collection, tunnel opening, final friend rescue, and ghost disappearance; no state injection.')
finally:
    if idle:
        idle.close()
    server.send_signal(2)
    try:
        server.communicate(timeout=5)
    except subprocess.TimeoutExpired:
        server.kill()
        server.communicate()
