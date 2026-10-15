"""One authenticated loopback MCP process shared by all bridge requests."""
import json, os, secrets, socket, subprocess, time, urllib.request
from pathlib import Path

class EdaHttpApi:
    def __init__(self, executable, root, port=None):
        self.executable=executable; self.root=Path(root)
        self.port=int(port or os.environ.get('MOIDA_EDA_API_PORT','3030'))
        self.token=secrets.token_urlsafe(32); self.process=None; self.log=None
        self.prefix=None; self.sequence=0
    def rpc(self, method, params=None, timeout=180):
        self.sequence+=1
        payload={'jsonrpc':'2.0','id':self.sequence,'method':method,'params':params or {}}
        req=urllib.request.Request(f'http://127.0.0.1:{self.port}/',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','Authorization':'Bearer '+self.token})
        # Never send loopback requests through environment proxies.
        with urllib.request.build_opener(urllib.request.ProxyHandler({})).open(req,timeout=timeout) as r: response=json.load(r)
        if 'error' in response: raise RuntimeError('EDA HTTP API: '+str(response['error']))
        return response['result']
    def tool(self, name, arguments, timeout=180):
        result=self.rpc('tools/call',{'name':name,'arguments':arguments},timeout)
        texts=[c['text'] for c in result.get('content',[]) if c.get('type')=='text']
        value=json.loads('\n'.join(texts))
        if result.get('isError') or value.get('ok') is False:
            raise RuntimeError('EDA HTTP API: '+str(value.get('error',value)))
        return value
    def start(self):
        if self.process and self.process.poll() is None:return self
        # Refuse to attach to an unrelated/untrusted service on this port.
        with socket.socket() as probe:
            probe.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
            probe.bind(('127.0.0.1',self.port))
        evidence=self.root/'evidence';evidence.mkdir(exist_ok=True)
        self.log=open(evidence/'http-api.log','ab')
        try:
            self.process=subprocess.Popen([self.executable,'--mcp','http','--host','127.0.0.1','--port',str(self.port),'--token',self.token],stdout=self.log,stderr=subprocess.STDOUT)
            deadline=time.monotonic()+30
            while True:
                if self.process.poll() is not None:raise RuntimeError('EDA HTTP API exited; see eda/evidence/http-api.log')
                try:
                    self.rpc('initialize',{'protocolVersion':'2025-06-18','capabilities':{},'clientInfo':{'name':'moida-bridge','version':'1'}},timeout=1)
                    break
                except (OSError,TimeoutError):
                    if time.monotonic()>deadline:raise RuntimeError('EDA HTTP API did not become ready within 30 seconds')
                    time.sleep(.2)
            tools=self.rpc('tools/list')['tools']
            self.prefix=next(t['name'][:-5] for t in tools if t['name'].endswith('.call'))
            self.tool(self.prefix+'.help',{})
            return self
        except BaseException:
            self.stop();raise
    def call(self,*args,timeout=180):
        if not self.process or self.process.poll() is not None:raise RuntimeError('EDA HTTP API stopped. Restart the Python bridge; the command was not retried.')
        path=[];params={};i=0
        while i<len(args) and not args[i].startswith('--'):path.append(args[i]);i+=1
        while i<len(args):
            key=args[i][2:].split('-');key=key[0]+''.join(w.title() for w in key[1:]);value=args[i+1];i+=2
            if value in ('true','false'):value=value=='true'
            elif key in ('timeout','renderId'):value=int(value)
            params[key]=value
        result=self.tool(self.prefix+'.call',{'path':'.'.join(path),'input':params},timeout)
        return result.get('data')
    def stop(self):
        if self.process and self.process.poll() is None:
            self.process.terminate()
            try:self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:self.process.kill();self.process.wait()
        if self.log:self.log.close();self.log=None
