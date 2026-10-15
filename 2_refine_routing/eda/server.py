#!/usr/bin/env python3
"""Loopback-only webpage / installed 嘉立创EDA bridge. No external packages."""
import json, os, shutil, subprocess, threading, time, uuid, tempfile, hashlib
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from cli import call
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parent.parent
PORT=int(os.environ.get('MOIDA_PORT','8766'))
NODE=shutil.which('node')
LOCK=threading.Lock()
PROJECT_DIR=ROOT/'exports'/'Moida-LCD'
PROJECT_FILE=PROJECT_DIR/'Moida-LCD.eprj3'
BACKUPS=ROOT/'backups'
ALLOWED={f'http://{host}:{port}' for host in ('localhost','127.0.0.1') for port in (8765,PORT)}

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

def project_session():
    """Find this exact file, including a project opened manually in the EDA UI."""
    matches=[]
    expected=hashlib.sha256(str(PROJECT_FILE.resolve()).encode()).hexdigest()
    for session in call('session','list'):
        if session.get('status')=='closed':continue
        file=session.get('path')
        if file:
            if Path(file).resolve()==PROJECT_FILE.resolve():matches.append(session['sessionId'])
        else:
            info=call('invoke','--session',session['sessionId'],'--ext-uuid','eda','--code',
                      'return await eda.dmt_Project.getCurrentProjectInfo();','--timeout','10000')
            if isinstance(info,dict) and info.get('uuid')==expected:matches.append(session['sessionId'])
    if len(matches)>1:raise RuntimeError('The permanent Moida-LCD project is open in several EDA windows. Close the extra copies before exchanging edits.')
    return matches[0] if matches else None

def activate(session):
    board=json.loads((PROJECT_DIR/'moida-map.json').read_text())['boardId']
    invoke(session,'return await eda.dmt_EditorControl.openDocument('+json.dumps(board)+');')

def open_project():
    session=project_session()
    if not session:
        session=call('open','--path',str(PROJECT_FILE),'--editor','pcb','--visible','true')['sessionId']
        wait_project(session)
    activate(session)
    return {'path':str(PROJECT_FILE),'session':session}

def save_project(session):
    activate(session)
    if invoke(session,'return await eda.pcb_Document.save();') is False:
        raise RuntimeError('EDA could not save the permanent PCB. Import stopped.')

def backup_folder(label):
    dest=BACKUPS/(time.strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:6]+'-'+label)
    dest.mkdir(parents=True)
    return dest

def exchange(op,body):
    if op=='open':return open_project()
    if op=='export':
        # Validate/build first. A failed conversion cannot damage the working PCB.
        with tempfile.TemporaryDirectory(prefix='.prepare-',dir=ROOT) as temporary:
            stage=Path(temporary)/'Moida-LCD'
            result=convert('export',stage,body['project'])
            session=project_session()
            if session:save_project(session)
            backup=backup_folder('before-send')
            shutil.copytree(PROJECT_DIR,backup/'Moida-LCD')
            if session:call('session','close','--session',session,'--destroy','true')
            try:
                for relative in ('pcb/LCD.epcb2','moida-map.json','Moida-LCD.eprj3'):
                    os.replace(stage/relative,PROJECT_DIR/relative)
            except Exception:
                shutil.copytree(backup/'Moida-LCD',PROJECT_DIR,dirs_exist_ok=True)
                raise
        opened=open_project()
        return {**result,**opened,'folder':str(PROJECT_DIR),'backup':str(backup)}
    if op=='import':
        session=project_session()
        if session:save_project(session)
        # Closed EDA is fine: the Git working file is the source of truth.
        result=convert('import',PROJECT_DIR)
        backup=None
        if body.get('project'):
            backup=backup_folder('before-import')/'webpage.json'
            backup.write_text(json.dumps(body['project'],ensure_ascii=False))
        return {**result,'path':str(PROJECT_FILE),'savedLive':bool(session),'backup':str(backup) if backup else None}
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
        if self.path=='/api/eda/status':return self.send_json(200,{'ready':True,'node':bool(NODE),'path':str(PROJECT_FILE)})
        super().do_GET()
    def do_POST(self):
        if not self.allowed():return self.send_json(403,{'error':'Local webpage origin required'})
        if self.headers.get('Content-Type','').split(';')[0]!='application/json':return self.send_json(415,{'error':'JSON required'})
        if self.path not in ('/api/eda/open','/api/eda/export','/api/eda/import'):return self.send_json(404,{'error':'Unknown endpoint'})
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
