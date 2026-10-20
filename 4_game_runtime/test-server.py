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
    session = post('/api/start', {'seed': '1700000000000'})
    # Leave stderr undrained deliberately, as happens with background tool sessions.
    for i in range(1500):
        frame = post('/api/tick', dict(session, buttons=0))
        assert frame['status'] == 0
    assert post('/api/tick', dict(session, buttons=1))['status'] == 1
    for _ in range(11):
        frame = post('/api/tick', dict(session, buttons=0))
    assert frame['status'] == 2
    direction = frame['moves'].index(1)
    original = frame['coord']
    frame = post('/api/tick', dict(session, direction=direction))
    assert frame['coord'] == original + [-1, 1, 4, -4][direction]
    assert frame['moveResult'] == 1
    frame = post('/api/tick', dict(session, direction=direction ^ 1))
    assert frame['coord'] == original
    session = post('/api/start', {'session': session['session'], 'seed': '1700001234567'})
    assert post('/api/tick', dict(session, buttons=0))['status'] == 0
    print('PASS: seeded native layouts and puzzles, idle preconnect, 1500 ticks with undrained logs, native room reveal, and session reset')
finally:
    if idle:
        idle.close()
    server.send_signal(2)
    try:
        server.communicate(timeout=5)
    except subprocess.TimeoutExpired:
        server.kill()
        server.communicate()
