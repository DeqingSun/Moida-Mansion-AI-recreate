"""Build an offline viewer from the extracted final-DXF geometry and results."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = here / 'resistance-area'
geometry = json.loads((data / 'geometry.json').read_text())
results = json.loads((data / 'results.json').read_text())
assert geometry['source_sha256'] == results['source_sha256']
payload = {'geometry': geometry, 'results': results}
template = (here / 'segment-viewer.template.html').read_text()
output = here.parent / 'outputs/lcd-resistance-area-20261124/Moida-LCD-segment-viewer.html'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(template.replace('__EMBEDDED_DATA__', json.dumps(payload, separators=(',', ':')).replace('</', '<\\/')))
print(output)
