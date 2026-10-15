#!/usr/bin/env python3
"""Invoke the installed EDA CLI and preserve its JSON response as evidence."""
import json,subprocess,sys,time
from pathlib import Path
EXE='/Applications/嘉立创EDA(专业版).app/Contents/MacOS/LCEDA-Pro'
ROOT=Path(__file__).resolve().parent

HTTP_API=None

def call(*args,timeout=180):
    if HTTP_API is not None:return HTTP_API.call(*args,timeout=timeout)
    result=subprocess.run([EXE,*args],capture_output=True,text=True,timeout=timeout)
    response=None
    for line in result.stdout.splitlines():
        try:
            item=json.loads(line)
            if isinstance(item,dict) and 'ok' in item: response=item
        except ValueError: pass
    evidence={'arguments':list(args),'response':response,'stderr':result.stderr,'exitCode':result.returncode}
    (ROOT/'evidence').mkdir(exist_ok=True)
    (ROOT/'evidence'/f'{time.time_ns()}.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2))
    if not response: raise RuntimeError('EDA CLI returned no JSON response (exit '+str(result.returncode)+'). See eda/evidence for details.')
    if not response.get('ok'):
        error=response.get('error',{})
        raise RuntimeError(str(error.get('code','EDA_ERROR'))+': '+str(error.get('message',error)))
    return response['value']
if __name__=='__main__':
    args=sys.argv[1:]
    if args[0]=='run-file':
        session,path=args[1:3]
        args=['invoke','--session',session,'--ext-uuid','eda','--code',Path(path).read_text(),'--timeout','60000']
    print(json.dumps(call(*args),ensure_ascii=False,indent=2))
