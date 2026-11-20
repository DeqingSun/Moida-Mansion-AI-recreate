import unittest
from unittest.mock import MagicMock,patch
from serial_server import SerialLink, STATUS_PATTERN

class ReconnectTests(unittest.TestCase):
 def test_status_accepts_lcd_prefix_but_not_lcd_ready_alone(self):
  import re
  self.assertIsNone(re.fullmatch(STATUS_PATTERN,'lcd_ready=1'))
  for status in ['ready=1','ready=1 sound=0','lcd_ready=1 lcd_result=0 ready=1 sound=0']:
   dev=MagicMock();dev.read_until.return_value=(status+'\n').encode()
   link=SerialLink('/dev/test');link.device=dev
   self.assertEqual(link.reply_line(b'i',STATUS_PATTERN),status)

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
class SoundTests(unittest.TestCase):
 def test_mute_is_acknowledged_before_start(self):
  link=SerialLink('/dev/test');link.reconnect=MagicMock()
  link.reply_line=MagicMock(side_effect=['ready=1 sound=1','ready=1 sound=0','ready=1 sound=0'])
  link.start_game(False)
  self.assertEqual([c.args[0] for c in link.reply_line.call_args_list],[b'i',b'm',b'r'])
 def test_reset_must_preserve_acknowledged_mute(self):
  link=SerialLink('/dev/test');link.reconnect=MagicMock()
  link.reply_line=MagicMock(side_effect=['ready=1 sound=1','ready=1 sound=0','ready=1 sound=1','ready=1 sound=0'])
  with self.assertRaisesRegex(ValueError,'changed during reset'):link.start_game(False)
  self.assertEqual([c.args[0] for c in link.reply_line.call_args_list],[b'i',b'm',b'r',b'm'])
 def test_unsupported_mute_does_not_start(self):
  link=SerialLink('/dev/test');link.reconnect=MagicMock()
  link.reply_line=MagicMock(return_value='ready=1')
  with self.assertRaisesRegex(ValueError,'before starting muted'):link.start_game(False)
  self.assertEqual([c.args[0] for c in link.reply_line.call_args_list],[b'i'])
 def test_older_firmware_can_start_with_sound_default(self):
  link=SerialLink('/dev/test');link.reconnect=MagicMock()
  link.reply_line=MagicMock(return_value='ready=1')
  link.start_game(True)
  self.assertEqual([c.args[0] for c in link.reply_line.call_args_list],[b'i',b'r'])

 def test_mute_and_unmute_require_board_acknowledgement(self):
  link=SerialLink('/dev/test')
  link.reply_line=MagicMock(side_effect=['ready=1 sound=0 ticks=10','ready=1 sound=1 ticks=10'])
  self.assertIs(link.set_sound(False),False)
  self.assertIs(link.set_sound(True),True)
  self.assertEqual([c.args[0] for c in link.reply_line.call_args_list],[b'm',b'u'])
 def test_missing_or_wrong_acknowledgement_is_rejected(self):
  link=SerialLink('/dev/test')
  for response in ['ready=1 ticks=10','ready=1 sound=1 ticks=10']:
   link.reply_line=MagicMock(return_value=response)
   with self.assertRaisesRegex(ValueError,'did not confirm'):link.set_sound(False)
 def test_non_boolean_is_rejected_without_serial_write(self):
  link=SerialLink('/dev/test');link.reply_line=MagicMock()
  with self.assertRaises(ValueError):link.set_sound('false')
  link.reply_line.assert_not_called()
if __name__=='__main__':unittest.main()

