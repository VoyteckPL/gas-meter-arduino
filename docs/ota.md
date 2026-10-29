# Update over the air (OTA)

From firmware 0.3.0 the meter can be updated without the cable. The cable is needed once, for the first OTA firmware.

## How it works

1. You upload the compiled `.bin` in the app (Serwis → Aktualizacja firmware) and click "Zaktualizuj przy najbliższym impulsie".
2. The app publishes a retained, signed message `Gaz/Gazomierz/config/ota` = `version|url|md5|size|signature`.
   The signature is HMAC-SHA256 with `ota_key` (app option) = `OTA_KEY` (secrets.h). The url is a random address on port 8098 of
   Home Assistant, valid only while the update is armed.
3. At the next pulse the meter sends its counter as always, reads the request and checks: signature, a version different from
   the running one, battery of at least 3.6 V, a size of 100 kB to 1.9 MB and at most 3 tries per image.
4. It downloads the image into the other app partition, checks the MD5, saves the counter and restarts.
5. The new firmware must send its counter and get it acknowledged by the broker. Only then it is confirmed, `config/ota` is cleared
   and `ota_status` says `ok, running <version>`.
6. After 2 crashes or 6 failed sessions the meter goes back to the previous firmware by itself and remembers the rejected image
   (`ota_status`: `rolled back ...`).

The meter does not stay awake and nothing is left switched on: an update that is not started (no pulse) simply waits.

## Preparing the firmware in the Arduino IDE

1. Board: *DFRobot FireBeetle 2 ESP32-E* (the UE has the same chip), ESP32 core 3.x, library "MQTT" by Joel Gaehwiler.
2. Tools → Partition Scheme: one **with OTA** (two app slots), for example *Default 4MB with spiffs (1.2MB APP/1.5MB SPIFFS)*
   or *Minimal SPIFFS (1.9MB APP with OTA/190KB SPIFFS)*. *No OTA* would make the update impossible. The scheme cannot be changed
   later over the air, so choose it for the cable flash.
3. In `secrets.h` (copied from `secrets.example.h`) uncomment and fill `OTA_KEY`. Put the same text into the `ota_key` option of the app.
4. In the sketch `FW_VERSION` is the version. Change it for every release ("0.3.1"...): the meter only installs a different version.
   `PRODUCTION 1` = no LED and no serial log (final installation), `0` = desk tests.
5. Sketch → Verify. At the end the IDE prints "Sketch uses N bytes (X%)": X must stay below 100 % of the app partition.
6. First time: upload by cable (Sketch → Upload). Later releases: Sketch → Export Compiled Binary, take `gas_meter.ino.bin`
   from the `build/...` folder next to the sketch (not `*.bootloader.bin`, `*.partitions.bin` or `*.merged.bin`).
7. In the app: Serwis → Aktualizacja firmware → choose the file → "Wgraj plik" → "Zaktualizuj przy najbliższym impulsie".
   Then make one pulse (a few seconds of heating, or a magnet at the reed).

`ota_host` (app option) is the IP address of Home Assistant in your network (for example 192.168.1.9). Left empty, the app tries to find it.
The port 8098 of the app must be reachable from the meter (the add-on maps it; no router change is needed in the same network).

## Safety notes

* The `.bin` contains the WiFi and MQTT passwords of `secrets.h`. It is served only while an update is armed, under a random address,
  and the file stays in the app's private data folder. Do not share the file.
* Anyone who could publish to the broker cannot install firmware without `OTA_KEY`.
* `config/ota` is also cleared when the update is cancelled in the app.
