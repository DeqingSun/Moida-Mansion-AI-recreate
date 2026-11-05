#!/usr/bin/env python3
"""Browser LCD/button bridge for the existing CH32 diagnostic sketch (no reflashing)."""
import argparse,json,re,threading,time
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
import serial
ROOT=Path(__file__).resolve().parents[2]

class SerialLink:
 def __init__(self,path):self.path=path;self.device=None
 def close(self):
  device,self.device=self.device,None
  if device is not None:
   try:device.close()
   except OSError:pass
 def reconnect(self):
  self.close()
  self.device=serial.Serial(self.path,115200,timeout=.1,write_timeout=1,exclusive=True)
  try:
   time.sleep(.2);self.device.reset_input_buffer()
  except Exception:
   self.close();raise
 def write(self,command):
  if self.device is None:raise serial.SerialException('USB disconnected. Replug and press Start / Reset.')
  try:self.device.write(command);self.device.flush()
  except OSError:
   self.close();raise
 def start_game(self,enabled=True):
  if type(enabled) is not bool:raise ValueError('Expected enabled boolean')
  self.reconnect()
  status=self.reply_line(b'i',r'ready=.*')
  if re.search(r'(?:^| )sound=([01])(?: |$)',status):
   self.set_sound(enabled)
  elif not enabled:
   raise ValueError('Update CH32X035 firmware before starting muted')
  result=self.reply_line(b'r',r'ready=.*')
  if re.search(r'(?:^| )sound=([01])(?: |$)',status):
   confirmed=re.search(r'(?:^| )sound=([01])(?: |$)',result)
   if not confirmed or bool(int(confirmed[1]))!=enabled:
    self.set_sound(False)
    raise ValueError('Sound setting changed during reset; board muted. Update firmware and retry.')
  return result
 def set_sound(self,enabled):
  if type(enabled) is not bool:raise ValueError('Expected enabled boolean')
  line=self.reply_line(b'u' if enabled else b'm',r'ready=.*')
  sound=re.search(r'(?:^| )sound=([01])(?: |$)',line)
  if not sound or bool(int(sound[1]))!=enabled:raise ValueError('Board did not confirm the piezo setting')
  return enabled
 def reply_line(self,command,pattern):
  try:
   self.write(command)
   deadline=time.monotonic()+2;pending=b''
   while time.monotonic()<deadline:
    pending+=self.device.read_until(b'\n')
    if len(pending)>4096:raise TimeoutError('Invalid MCU response; press Start / Reset to reconnect.')
    if not pending.endswith(b'\n'):continue
    line=pending.decode('ascii',errors='replace').strip();pending=b''
    if re.fullmatch(pattern,line):return line
   raise TimeoutError('MCU response timed out. Replug USB and press Start / Reset; close other serial monitors.')
  except (OSError,TimeoutError):
   self.close();raise

def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('--device',default='/dev/cu.usbmodemCH32V30x1')
 p.add_argument('--port',type=int,default=8768)
 args=p.parse_args()
 lock=threading.Lock()
 link=SerialLink(args.device)
 # Keep HTTP alive even when the board is absent. Reset opens a fresh USB handle.
 reply_line=link.reply_line
 state={'started':False,'paused':True,'sound':None}
 class Handler(SimpleHTTPRequestHandler):
  def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
  def log_request(self,code='-',size='-'):
   if isinstance(code,int) and code>=400:super().log_request(code,size)
  def reply(self,code,data):
   body=json.dumps(data).encode();self.send_response(code)
   self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store')
   self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
  def do_GET(self):
   if self.path=='/api/mcu/capabilities':
    return self.reply(200,{'soundBeforeStart':True})
   super().do_GET()
  def do_POST(self):
   host=self.headers.get('Host','')
   if host not in (f'127.0.0.1:{args.port}',f'localhost:{args.port}') or self.headers.get('Origin') not in (None,f'http://{host}'):
    return self.reply(403,{'error':'Local same-origin requests only'})
   try:
    n=int(self.headers.get('Content-Length','0'))
    if not 0<n<=256:raise ValueError('Invalid request size')
    data=json.loads(self.rfile.read(n))
    if not isinstance(data,dict):raise ValueError('Expected object')
    with lock:
     if self.path=='/api/mcu/start':
      state.update(started=False,paused=True)
      line=link.start_game(data.get('enabled',True))
      if not line.startswith('ready=1 '):raise ValueError(line)
      sound=re.search(r'(?:^| )sound=([01])(?: |$)',line)
      state.update(started=True,paused=False,sound=bool(int(sound[1])) if sound else None)
      return self.reply(200,dict(state,status=line))
     if self.path=='/api/mcu/sound':
      if not state['started']:raise ValueError('Start the game first')
      if state['sound'] is None:raise ValueError('Update the CH32X035 firmware to enable piezo control')
      enabled=data.get('enabled')
      if type(enabled) is not bool:raise ValueError('Expected enabled boolean')
      state['sound']=link.set_sound(enabled)
      return self.reply(200,dict(state))
     if self.path=='/api/mcu/pause':
      if not state['started']:raise ValueError('Start the game first')
      desired=data.get('paused')
      if type(desired) is not bool:raise ValueError('Expected paused boolean')
      if desired!=state['paused']:
       reply_line(b'p',r'ready=.*');state['paused']=desired
      return self.reply(200,dict(state))
     if self.path=='/api/mcu/button':
      command={'left':b'a','right':b'f','stairs':b'w','search':b's'}.get(data.get('button'))
      if command is None:raise ValueError('Unknown button')
      if not state['started'] or state['paused']:raise ValueError('Start/resume the game first')
      link.write(command)
      return self.reply(200,{'ok':True})
     if self.path=='/api/mcu/frame':
      if not state['started']:return self.reply(200,dict(state,words=[0]*20))
      line=reply_line(b'd',r'[0-9A-Fa-f]{1,8}(?:\s+[0-9A-Fa-f]{1,8}){19}')
      return self.reply(200,dict(state,words=[int(x,16) for x in line.split()]))
     return self.reply(404,{'error':'Unknown endpoint'})
   except (OSError,TimeoutError) as e:
    with lock:
     link.close();state.update(started=False,paused=True)
    self.reply(503,{'error':str(e)})
   except ValueError as e:self.reply(400,{'error':str(e)})
 server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
 print(f'MCU simulator: http://127.0.0.1:{args.port}/4_game_runtime/mcu.html',flush=True)
 try:server.serve_forever()
 except KeyboardInterrupt:pass
 finally:
  server.server_close();link.close()
if __name__=='__main__':main()
