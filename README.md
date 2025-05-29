# ntp-gps-oled

Raspberry Pi OLED screen display for an NTP server set by GPS

## Config

System files needed for configuration are in _config_ directory

## Verify

Various commands to verify things are working correctly

### Comms with GPS board

Verify that we are communicating with the GPS board

```bash
cat /dev/ttyAMA0
```

### Comms with PPS signal

Verify that we are receiving PPS data from pin-18

```bash
sudo ppstest /dev/pps0
```

### GPS is working

Verify that we are getting GPS satellites, a lat/lon and a PPS signal

```bash
gpsmon
```

### NTP is using GPS

Verify that the NTP server is using the GPS signal with PPS

```bash
ntpq -p -4
```

Should result in an _*_ and _o_ next to _SHM_ which is GPS and _PPS_ respectively:

```
*SHM(0)
oPPS(0)
```

### Time is accurate

Verify that your time is close to a known time server

```bash
ntpdate -q time.nist.gov
```

## References

- https://www.jacobdeane.com/iot/2020/building-a-gps-based-time-server/
- https://weberblog.net/ntp-server-via-gps-on-a-raspberry-pi/
- https://www.satsignal.eu/ntp/Raspberry-Pi-NTP.html
- https://www.ridgesolutions.ie/index.php/2023/11/30/ntp-with-gps-and-pps-working-without-network-clock/
- https://weberblog.net/why-should-i-run-own-ntp-servers/

### Manuals

- https://linux.die.net/man/5/ntp.conf
- https://linux.die.net/man/8/ntpdate
- https://www.eecis.udel.edu/~mills/ntp/html/drivers/driver28.html
- https://www.eecis.udel.edu/~mills/ntp/html/drivers/driver22.html
