import unittest
from unittest.mock import MagicMock,patch
from serial_server import SerialLink

class ReconnectTests(unittest.TestCase):
 def test_reset_reopens_and_closes_old_handle(self):
  old,new=MagicMock(),MagicMock()
  new.read_until.return_value=b'ready=1\r\n'
  with patch('serial_server.serial.Serial',side_effect=[old,new]) as factory,patch('serial_server.time.sleep'):
   link=SerialLink('/dev/test');link.reconnect();link.reconnect()
   old.close.assert_called_once()
   self.assertEqual(link.reply_line(b'r',r'ready=.*'),'ready=1')
   self.assertEqual(factory.call_count,2)
   new.reset_input_buffer.assert_called_once()
 def test_unplug_invalidates_handle_then_can_reconnect(self):
  old,new=MagicMock(),MagicMock()
  old.write.side_effect=OSError('unplugged')
  with patch('serial_server.serial.Serial',side_effect=[old,new]),patch('serial_server.time.sleep'):
   link=SerialLink('/dev/test');link.reconnect()
   with self.assertRaises(OSError):link.write(b'd')
   self.assertIsNone(link.device);old.close.assert_called_once()
   link.reconnect();link.write(b'r');new.write.assert_called_once_with(b'r')
 def test_timeout_closes_stale_handle(self):
  link=SerialLink('/dev/test');dev=MagicMock();link.device=dev
  with patch('serial_server.time.monotonic',side_effect=[0,3]):
   with self.assertRaises(TimeoutError):link.reply_line(b'd','.*')
  self.assertIsNone(link.device);dev.close.assert_called_once()
if __name__=='__main__':unittest.main()
