import unittest
from unittest.mock import Mock
from http_api import EdaHttpApi
class HttpApiTests(unittest.TestCase):
    def test_mapping_and_process_reuse(self):
        api=EdaHttpApi('/unused','/tmp');api.process=Mock();api.process.poll.return_value=None;api.prefix='LCEDA-Pro';api.tool=Mock(return_value={'ok':True,'data':True})
        self.assertTrue(api.call('session','close','--session','abc','--destroy','true'))
        api.tool.assert_called_with('LCEDA-Pro.call',{'path':'session.close','input':{'session':'abc','destroy':True}},180)
        api.call('invoke','--session','abc','--ext-uuid','eda','--code','return 1;','--timeout','60000')
        self.assertEqual(api.tool.call_args.args[1]['input'],{'session':'abc','extUuid':'eda','code':'return 1;','timeout':60000})
    def test_dead_process_not_restarted(self):
        api=EdaHttpApi('/unused','/tmp');api.process=Mock();api.process.poll.return_value=1
        with self.assertRaisesRegex(RuntimeError,'not retried'):api.call('session','list')
    def test_error_is_not_success(self):
        api=EdaHttpApi('/unused','/tmp');api.rpc=Mock(return_value={'isError':True,'content':[{'type':'text','text':'{"ok":false,"error":{"code":"FAILED"}}'}]})
        with self.assertRaisesRegex(RuntimeError,'FAILED'):api.tool('LCEDA-Pro.call',{})
if __name__=='__main__':unittest.main()
