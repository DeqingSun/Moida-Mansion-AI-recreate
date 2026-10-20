#!/usr/bin/env python3
"""Local desktop host for the native C intro. No JavaScript game logic used."""
import argparse
import json
import os
from pathlib import Path
import secrets
import subprocess
import tempfile
import time
import threading
import select
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8767)
    args = parser.parse_args()
    sessions = {}
    session_lock = threading.RLock()
    with tempfile.TemporaryDirectory(prefix='moida-native-') as directory:
        executable = Path(directory) / 'intro'
        subprocess.run([os.environ.get('CC', 'cc'), '-std=c11', '-O2', '-Wall', '-Wextra', '-Werror',
                        *(str(HERE / 'native' / f) for f in ('moida_core.c', 'moida_text.c', 'moida_room.c', 'moida_layout.c', 'moida_puzzle.c', 'moida_house.c', 'house_game.c')),
                        '-o', str(executable)], check=True)

        layout_executable = Path(directory) / 'layout'
        subprocess.run([os.environ.get('CC', 'cc'), '-std=c11', '-O2', '-Wall', '-Wextra', '-Werror',
                        *(str(HERE / 'native' / f) for f in ('moida_core.c', 'moida_layout.c', 'layout_demo.c')),
                        '-o', str(layout_executable)], check=True)

        puzzle_executable = Path(directory) / 'puzzle'
        subprocess.run([os.environ.get('CC', 'cc'), '-std=c11', '-O2', '-Wall', '-Wextra', '-Werror',
                        *(str(HERE / 'native' / f) for f in ('moida_core.c', 'moida_layout.c', 'moida_puzzle.c', 'puzzle_demo.c')),
                        '-o', str(puzzle_executable)], check=True)

        def remove(key):
            process, _ = sessions.pop(key)
            process.stdin.close()
            process.wait(timeout=2)
            process.stdout.close()

        class Handler(SimpleHTTPRequestHandler):
            def __init__(self, *a, **kw):
                super().__init__(*a, directory=str(ROOT), **kw)

            def setup(self):
                super().setup()
                self.connection.settimeout(5)

            def log_request(self, code='-', size='-'):
                # Ten successful ticks/second must not fill a captured stderr pipe.
                if isinstance(code, int) and code >= 400:
                    super().log_request(code, size)

            def reply(self, code, data):
                body = json.dumps(data).encode()
                self.send_response(code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Cache-Control', 'no-store')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def do_POST(self):
                # Only local, same-origin requests; no CORS permission granted.
                host = self.headers.get('Host', '')
                if host not in (f'127.0.0.1:{args.port}', f'localhost:{args.port}'):
                    return self.reply(403, {'error': 'Invalid host'})
                if self.headers.get('Origin') not in (None, f'http://{host}'):
                    return self.reply(403, {'error': 'Same-origin requests only'})
                try:
                    length = int(self.headers.get('Content-Length', '0'))
                    if not 0 < length <= 1024:
                        raise ValueError('Invalid request size')
                    data = json.loads(self.rfile.read(length))
                    if not isinstance(data, dict):
                        raise ValueError('Expected an object')
                    with session_lock:
                        for key, (_, used) in list(sessions.items()):
                            if time.monotonic() - used > 600:
                                remove(key)
                        if self.path == '/api/layout':
                            seed = data.get('seed')
                            if not isinstance(seed, str) or len(seed) > 20:
                                raise ValueError('Seed must be a signed 64-bit decimal string')
                            try:
                                numeric = int(seed)
                            except ValueError:
                                raise ValueError('Invalid seed') from None
                            if not -(1 << 63) <= numeric < (1 << 63):
                                raise ValueError('Seed exceeds signed 64-bit range')
                            result = subprocess.run([str(layout_executable)], input=f'{numeric}\n',
                                                    capture_output=True, text=True, timeout=3, check=True)
                            puzzle = subprocess.run([str(puzzle_executable)], input=f'{numeric}\n',
                                                    capture_output=True, text=True, timeout=3, check=True)
                            return self.reply(200, dict(json.loads(result.stdout), seed=str(numeric),
                                                        puzzle=json.loads(puzzle.stdout)))
                        if self.path == '/api/start':
                            old = data.get('session')
                            if isinstance(old, str) and old in sessions:
                                remove(old)
                            if len(sessions) >= 8:
                                return self.reply(429, {'error': 'Too many sessions; close old previews and wait 10 minutes'})
                            seed = data.get('seed', str(int(time.time() * 1000)))
                            if not isinstance(seed, str) or len(seed) > 20:
                                raise ValueError('Seed must be a signed 64-bit decimal string')
                            numeric = int(seed)
                            if not -(1 << 63) <= numeric < (1 << 63):
                                raise ValueError('Seed exceeds signed 64-bit range')
                            process = subprocess.Popen([str(executable), str(numeric)], stdin=subprocess.PIPE,
                                                       stdout=subprocess.PIPE, text=True, bufsize=1)
                            if not select.select([process.stdout], [], [], 3)[0]:
                                process.kill()
                                process.wait()
                                process.stdin.close()
                                process.stdout.close()
                                raise ValueError('Native house generation timed out')
                            ready = json.loads(process.stdout.readline())
                            if not ready.get('ready'):
                                process.stdin.close()
                                process.wait()
                                process.stdout.close()
                                raise ValueError(ready.get('error', 'House generation failed'))
                            key = secrets.token_hex(16)
                            sessions[key] = (process, time.monotonic())
                            return self.reply(200, dict(ready, session=key, seed=str(numeric)))
                        if self.path == '/api/tick':
                            key = data.get('session')
                            if not isinstance(key, str) or key not in sessions:
                                return self.reply(404, {'error': 'Session expired; press Reset'})
                            buttons = data.get('buttons', 0)
                            if type(buttons) is not int or not 0 <= buttons <= 15:
                                raise ValueError('Button mask must be 0..15')
                            direction = data.get('direction')
                            if direction is not None:
                                if type(direction) is not int or not 0 <= direction <= 3:
                                    raise ValueError('Direction must be 0..3')
                                buttons |= (direction + 1) << 4
                                if data.get('animate') is True:
                                    buttons |= 128
                            if data.get('ghosts') is True:
                                buttons |= 4096
                            if data.get('spiders') is True:
                                buttons |= 2048
                            if data.get('encounters') is True:
                                buttons |= 1024
                            if data.get('idleAnimation') is True:
                                buttons |= 512
                            if data.get('searchNext') is True:
                                buttons |= 256
                            process, _ = sessions[key]
                            process.stdin.write(f'{buttons}\n')
                            process.stdin.flush()
                            if not select.select([process.stdout], [], [], 2)[0]:
                                raise ValueError('Native C response timed out; press Reset')
                            frame = json.loads(process.stdout.readline())
                            sessions[key] = (process, time.monotonic())
                            return self.reply(200, frame)
                        self.reply(404, {'error': 'Unknown endpoint'})
                except (ValueError, BrokenPipeError) as error:
                    self.reply(400, {'error': str(error)})

        server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
        print(f'Live C intro: http://127.0.0.1:{args.port}/4_game_runtime/live.html', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            server.server_close()
            with session_lock:
                for key in list(sessions):
                    remove(key)


if __name__ == '__main__':
    main()
