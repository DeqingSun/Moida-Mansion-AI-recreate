#!/usr/bin/env python3
"""Loopback-only webpage / installed 嘉立创EDA bridge. No external packages."""
import json, os, shutil, subprocess, threading, time, uuid
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from cli import call
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parent.parent
PORT=int(os.environ.get('MOIDA_PORT','8766'))
NODE=shutil.which('node')
LOCK=threading.Lock()
REGISTRY=ROOT/'sessions.json'
ALLOWED={f'http://{host}:{port}' for host in ('localhost','127.0.0.1') for port in (8765,PORT)}

def registry():
    return json.loads(REGISTRY.read_text()) if REGISTRY.exists() else {}
def convert(op,folder,project=None):
    if not NODE: raise RuntimeError('Node.js is required. Install Node.js and restart the bridge.')
    p=subprocess.run([NODE,str(ROOT/'worker.cjs'),op,str(folder)],input=json.dumps(project) if project else '',capture_output=True,text=True,timeout=300)
    if p.returncode: raise RuntimeError(p.stderr[:3000])
    return json.loads(p.stdout)
def invoke(session,code):
    return call('invoke','--session',session,'--ext-uuid','eda','--code',code,'--timeout','60000')
def wait_project(session):
    time.sleep(10)  # Native renderer initialization is asynchronous after CLI open.
    # `open` returns before the folder project is loaded; opening a document
    # too early can leave the native editor waiting indefinitely.
    for attempt in range(30):
        info=invoke(session,'return await eda.dmt_Project.getCurrentProjectInfo();')
        if isinstance(info,dict) and info.get('data'):return
        time.sleep(1)
    raise RuntimeError('EDA project has not finished loading. Keep its window open and try again.')

def exchange(op,body):
    entries=registry()
    if op=='export':
        key=time.strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:6]
        folder=ROOT/'exports'/('Moida-LCD-'+key)
        result=convert('export',folder,body['project'])
        entry={'folder':str(folder),'session':None}
        entries[key]=entry;REGISTRY.write_text(json.dumps(entries,indent=2))
        session=call('open','--path',str(folder/(folder.name+'.eprj3')),'--editor','pcb','--visible','true')['sessionId']
        entry['session']=session;REGISTRY.write_text(json.dumps(entries,indent=2))
        wait_project(session)
        board=json.loads((folder/'moida-map.json').read_text())['boardId']
        invoke(session,'return await eda.dmt_EditorControl.openDocument('+json.dumps(board)+');')
        return {**result,'exportId':key,'path':str(folder/(folder.name+'.eprj3'))}
    if op=='import':
        key=body.get('exportId');entry=entries.get(key)
        if not entry: raise RuntimeError('Export not found. Open this layout in EDA first.')
        # Require a live session and a successful save; never silently import stale files.
        board=json.loads((Path(entry['folder'])/'moida-map.json').read_text())['boardId']
        invoke(entry['session'],'return await eda.dmt_EditorControl.openDocument('+json.dumps(board)+');')
        invoke(entry['session'],'return await eda.pcb_Document.save();')
        return convert('import',entry['folder'])
    raise RuntimeError('Unknown action')
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw):super().__init__(*args,directory=str(REPO),**kw)
    def allowed(self):
        return self.headers.get('Host') in {f'127.0.0.1:{PORT}',f'localhost:{PORT}'} and self.headers.get('Origin',f'http://127.0.0.1:{PORT}') in ALLOWED
    def end_headers(self):
        origin=self.headers.get('Origin')
        if origin in ALLOWED:self.send_header('Access-Control-Allow-Origin',origin);self.send_header('Vary','Origin')
        self.send_header('Cache-Control','no-store');super().end_headers()
    def send_json(self,status,value):
        data=json.dumps(value).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
    def do_OPTIONS(self):
        if not self.allowed():return self.send_json(403,{'error':'Local webpage origin required'})
        self.send_response(204);self.send_header('Access-Control-Allow-Methods','POST, GET, OPTIONS');self.send_header('Access-Control-Allow-Headers','Content-Type');self.end_headers()
    def do_GET(self):
        if not self.allowed():return self.send_json(403,{'error':'Local webpage origin required'})
        if self.path=='/api/eda/status':return self.send_json(200,{'ready':True,'node':bool(NODE)})
        super().do_GET()
    def do_POST(self):
        if not self.allowed():return self.send_json(403,{'error':'Local webpage origin required'})
        if self.headers.get('Content-Type','').split(';')[0]!='application/json':return self.send_json(415,{'error':'JSON required'})
        if self.path not in ('/api/eda/export','/api/eda/import'):return self.send_json(404,{'error':'Unknown endpoint'})
        if not LOCK.acquire(False):return self.send_json(409,{'error':'An EDA exchange is already running'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if not 0<length<=30000000:raise ValueError('Invalid request size')
            body=json.loads(self.rfile.read(length));result=exchange(self.path.rsplit('/',1)[1],body);self.send_json(200,result)
        except Exception as e:self.send_json(400,{'error':str(e)[:3000]})
        finally:LOCK.release()
if __name__=='__main__':
    print(f'Moida EDA bridge: http://127.0.0.1:{PORT}/2_refine_routing/index.html',flush=True)
    ThreadingHTTPServer(('127.0.0.1',PORT),Handler).serve_forever()
