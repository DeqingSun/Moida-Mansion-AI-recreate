"""Package the current generated candidate and offline browser simulator."""
from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'electrode-design';O=ROOT/'output/electrodes';O.mkdir(exist_ok=True)
(O/'design-data.js').write_text('window.ELECTRODE_DESIGN='+ (D/'design.json').read_text()+';\n')
for src,dst in [('electrode-simulator.html','index.html'),('electrode-simulator.js','simulator.js')]:shutil.copy(ROOT/'scripts'/src,O/dst)
for name in ['front-electrodes.svg','rear-electrode.svg','contact-register.csv','validation.json','design-notes.md']:shutil.copy(D/name,O/name)
print(O/'index.html')
