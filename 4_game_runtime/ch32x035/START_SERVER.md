# Start the computer preview

Flash the CH32X035 game firmware and connect its USB cable. Close Arduino Serial
Monitor or any other application using the serial port.

Open Terminal and run:

```sh
cd ~/Documents/GitHub/Moida-Mansion-AI-recreate
python3 4_game_runtime/ch32v307/serial_server.py --device /dev/cu.usbmodemCH32X0351
```

The server lives in the `ch32v307` folder but supports the CH32X035 firmware too.

Open this page:

**http://127.0.0.1:8768/4_game_runtime/mcu.html**

Click **Start / Reset**. This starts a fresh game on both the real LCD and the
computer preview. Keep Terminal open. Press **Ctrl+C** in Terminal to stop the
server; the board can keep playing independently.

## If it cannot connect

Find the actual USB serial port:

```sh
ls /dev/cu.usbmodem*
```

Replace `/dev/cu.usbmodemCH32X0351` in the command with the listed port for your
board. After unplugging/replugging USB, click **Start / Reset** again. Restart
the server with the new device path if the port name changed.

If Python reports `No module named serial`, install the dependency:

```sh
python3 -m pip install pyserial
```

If port 8768 is already in use, the server may already be running: try opening
the page first. To deliberately run a second server on another port, add
`--port 8769` and open the same URL using port 8769.

`live.html` runs the separate desktop simulation. Use **mcu.html** to view the
actual board's game.
