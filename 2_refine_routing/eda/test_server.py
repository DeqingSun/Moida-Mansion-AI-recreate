"""Stable-file exchange regression tests; no live EDA or user project writes."""
import json, tempfile, unittest
from pathlib import Path
from unittest.mock import patch
import server
class StableExchange(unittest.TestCase):
    def test_stable_import_send_and_reopen(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder=Path(tmp)/'Moida-LCD';backups=Path(tmp)/'backups'
            project=json.loads((server.ROOT.parent/'Moida-routing.moida-routing_finished.json').read_text())
            server.convert('export',folder,project)
            with patch.object(server,'PROJECT_DIR',folder),patch.object(server,'PROJECT_FILE',folder/'Moida-LCD.eprj3'),patch.object(server,'BACKUPS',backups),patch.object(server,'project_session',return_value=None),patch.object(server,'open_project',return_value={'path':str(folder/'Moida-LCD.eprj3'),'session':'test'}):
                # Fresh browser, no registry/export ID, EDA closed.
                loaded=server.exchange('import',{'project':project})
                self.assertEqual(loaded['summary']['traceSegments'],3267)
                self.assertFalse(loaded['savedLive'])
                self.assertTrue(Path(loaded['backup']).exists())
                previous=(folder/'pcb/LCD.epcb2').read_bytes()
                invalid=json.loads(json.dumps(project));invalid['assignments']['C00S01']['top']=''
                with self.assertRaises(RuntimeError):server.exchange('export',{'project':invalid})
                self.assertEqual((folder/'pcb/LCD.epcb2').read_bytes(),previous)
                project['traces'][0]['widthMm']=.12
                sent=server.exchange('export',{'project':project})
                self.assertEqual(sent['path'],str(folder/'Moida-LCD.eprj3'))
                self.assertEqual((Path(sent['backup'])/'Moida-LCD/pcb/LCD.epcb2').read_bytes(),previous)
                self.assertEqual(len(list(Path(tmp).glob('Moida-LCD*'))),1)
                loaded=server.exchange('import',{})
                self.assertTrue(any(abs(t['widthMm']-.12)<1e-9 for t in loaded['project']['traces']))
if __name__=='__main__':unittest.main()
