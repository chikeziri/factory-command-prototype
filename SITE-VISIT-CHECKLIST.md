# SIFOS — Factory Site Visit Checklist

**Location:** Factory Floor, Ikeduru, Imo State, Nigeria  
**Visit:** Site tour with CCTV Engineer  
**Follow-up:** Conference call with Owner + CCTV Engineer (same day or next)

**Goal:** Collect everything needed to integrate all systems into SIFOS in one build — no phased MVP.

**Live app (Owner tests from Australia):** https://frontend-inky-sigma-27.vercel.app  
**Backend:** https://humorous-recreation-production-a691.up.railway.app

---

## How to use this document

1. Walk the factory **in this order** (matches Owner’s architecture diagram).
2. Fill **one block per device/system** (copy the block below as many times as needed).
3. Take photos of **nameplates, control panels, serial labels, and network ports**.
4. Ask the **CCTV Engineer** to confirm technical items marked **[Ask Engineer]**.
5. After the tour, use the **Conference Call Checklist** at the bottom with Owner + Engineer.

---

## Universal fields (every item)

Copy this block for each machine, camera, door, sensor, etc.

```
Item #: ___
Category: [ ] CCTV  [ ] Access Control  [ ] Attendance  [ ] Production Machine
         [ ] Inventory  [ ] Environmental Sensor  [ ] Company Laptop/Asset
         [ ] Network / Gateway  [ ] NVR/DVR / Storage  [ ] Other: ___________

Area / Location: _______________
Device / Machine name: _______________
Brand: _______________
Model: _______________
Serial number (if visible): _______________
Quantity (if multiple identical): ___

What it measures or controls: _______________
How staff use it today: _______________
Who is responsible (name/role): _______________

Power source: [ ] Mains  [ ] PoE  [ ] Battery  [ ] Other: ___
Installed date / age (approx): _______________
Working condition: [ ] Good  [ ] Faulty  [ ] Unknown

Can it connect to network?  [ ] Yes  [ ] No  [ ] Unknown
Connection type (if known): [ ] Ethernet  [ ] WiFi  [ ] RS485  [ ] Relay/I/O
                            [ ] Proprietary cable  [ ] Not connectable  [ ] Other: ___

Has API / SDK / open protocol?  [ ] Yes  [ ] No  [ ] Unknown  [ ] Ask Engineer
Protocol / software (if known): _______________
Integration notes from engineer: _______________

Photo of device (wide shot):        [ ] Taken  [ ] No
Photo of control panel / screen:    [ ] Taken  [ ] No
Photo of nameplate / serial label:  [ ] Taken  [ ] No
Photo of network port / cable run:  [ ] Taken  [ ] No

Priority: [ ] High  [ ] Med  [ ] Low
Must be live in SIFOS at launch?   [ ] Yes  [ ] No
Owner wants remote control/view?   [ ] Yes  [ ] No  [ ] View only

Notes: _______________________________________________
```

---

## Extra fields — CCTV Cameras **[Ask Engineer]**

Add these on the same item block (or below it):

```
Camera type: [ ] Dome  [ ] Bullet  [ ] PTZ  [ ] Other: ___
Indoor / Outdoor: [ ] Indoor  [ ] Outdoor
Mounting height & angle (approx): _______________
Coverage area (what it sees): _______________
Resolution (1080p / 4MP / 4K): _______________
Night vision / IR: [ ] Yes  [ ] No
Audio (mic/speaker): [ ] Yes  [ ] No
PoE or separate power: _______________
Connected to NVR channel #: ___
Local viewing app/software name: _______________
Remote viewing already working?  [ ] Yes  [ ] No
RTSP / ONVIF supported?  [ ] Yes  [ ] No  [ ] Unknown
Need live stream in SIFOS web app?  [ ] Yes  [ ] Snapshots only  [ ] Alerts only
Recording retention needed (days): ___
```

---

## Extra fields — NVR / DVR / CCTV Storage **[Ask Engineer]**

```
Brand / Model: _______________
Number of channels used / total: ___ / ___
Storage capacity (TB): ___
RAFT / HDD count: ___
Cloud upload today?  [ ] Yes  [ ] No
Where is NVR physically located (room/rack): _______________
UPS / backup power on NVR?  [ ] Yes  [ ] No
Static IP or DHCP on LAN: _______________
Admin access — who has login: _______________
Can we get API / SDK / RTSP gateway access?  [ ] Yes  [ ] No  [ ] Unknown
AWS storage planned by owner?  [ ] Yes  [ ] No  [ ] Discuss on call
```

---

## Extra fields — Access Control (doors, gates, turnstiles)

```
Access point name (for SIFOS): _______________
Door type: [ ] Swing  [ ] Sliding  [ ] Turnstile  [ ] Gate  [ ] Roller shutter
Entry method today: [ ] Key  [ ] RFID card  [ ] Fingerprint  [ ] Face  [ ] PIN  [ ] Guard
Controller brand/model: _______________
Reader brand/model: _______________
Can door be unlocked remotely?  [ ] Yes  [ ] No  [ ] Unknown
Lock type (maglock / strike / motor): _______________
Fail-safe or fail-secure (if known): _______________
Log of entries today?  [ ] Yes  [ ] No  [ ] Paper only
Number of users enrolled: ___
Integration: Wiegand / RS485 / IP / proprietary: _______________
```

---

## Extra fields — Attendance System

```
Device type: [ ] Fingerprint  [ ] Face  [ ] RFID  [ ] Mobile app  [ ] Manual register
Brand / Model: _______________
Number of devices & locations: ___
Staff enrolled (approx): ___
Shift patterns (times): _______________
Exports data how? [ ] USB  [ ] Excel  [ ] Software  [ ] Cloud  [ ] None
Software name (if any): _______________
Can it push to network/API?  [ ] Yes  [ ] No  [ ] Unknown
Late / absent rules owner expects: _______________
```

---

## Extra fields — Production Machines

```
Machine name (for SIFOS): _______________
Line / hall location: _______________
Manufacturer & model: _______________
Year installed: _______________
Status signals available: [ ] Running  [ ] Idle  [ ] Fault  [ ] Maintenance  [ ] None
Output count available?  [ ] Yes  [ ] No  [ ] Manual only
Output unit (pieces / kg / cycles): _______________
PLC / HMI brand (if any): _______________
HMI screen — can it show OEE?  [ ] Yes  [ ] No
Maintenance schedule today: [ ] Paper  [ ] Excel  [ ] None
Target output per shift: _______________
Operator name / shift: _______________
Safety — can we tap electrical signal (with electrician)?  [ ] Yes  [ ] No  [ ] TBD
```

---

## Extra fields — Inventory System

```
What is tracked: [ ] Raw materials  [ ] WIP  [ ] Finished goods  [ ] Spare parts
Storage location name: _______________
Tracking method today: [ ] Paper  [ ] Excel  [ ] Software  [ ] Visual only
Software name (if any): _______________
Barcode / QR / RFID used?  [ ] Yes  [ ] No
Weighing scales? Brand: _______________
Who updates stock (role): _______________
Reorder alerts needed?  [ ] Yes  [ ] No
Typical low-stock items to demo live: _______________
```

---

## Extra fields — Environmental Sensors

```
Sensor type: [ ] Temperature  [ ] Humidity  [ ] Air quality  [ ] Noise  [ ] Dust  [ ] Other
Brand / Model: _______________
Mounting location (room/line): _______________
Wired or wireless: _______________
Current reading method: [ ] Manual  [ ] Local display  [ ] Network  [ ] None
Min / max acceptable range: _______________
Alert who when out of range: _______________
Calibration / last service date: _______________
Battery-powered? Battery life: _______________
```

---

## Extra fields — Company Laptops / Assets

```
Asset type: [ ] Laptop  [ ] Desktop  [ ] Tablet  [ ] Printer  [ ] Tool  [ ] Other
Assigned to (name/dept): _______________
Asset tag / serial: _______________
Condition: [ ] Good  [ ] Fair  [ ] Poor
Used for production / office / both: _______________
Need track in SIFOS Assets module?  [ ] Yes  [ ] No
```

---

## Extra fields — Network, Firewall, Gateway (critical for everything)

```
Internet provider on site: [ ] Starlink  [ ] Fiber  [ ] LTE  [ ] Other: ___
Download / upload speed (speed test if possible): ___ / ___ Mbps
WiFi coverage in production floor: [ ] Good  [ ] Partial  [ ] Poor  [ ] None
Enterprise WiFi brand: _______________
LAN switch brand / port count: _______________
Firewall / router brand & model: _______________
Who manages network (name/phone): _______________
Can devices reach cloud HTTPS outbound?  [ ] Yes  [ ] No  [ ] Unknown
Static IP or dynamic public IP: _______________
VPN already in use?  [ ] Yes  [ ] No
Space for site gateway PC/box (24/7 power): [ ] Yes  [ ] No  [ ] Location: ___
Photo of rack / router / switch: [ ] Taken  [ ] No
```

---

## Suggested walk order (Ikeduru factory)

Check off areas as you visit them:

- [ ] **Main gate / perimeter** — CCTV, access control
- [ ] **Reception / admin** — attendance, laptops, network rack
- [ ] **Production Hall A** — machines, sensors, cameras
- [ ] **Production Hall B** — machines, sensors, cameras
- [ ] **Packaging / finishing** — machines, inventory
- [ ] **Raw materials store** — inventory, sensors, access
- [ ] **Finished goods warehouse** — inventory, access, cameras
- [ ] **Spare parts store** — inventory
- [ ] **Quality / lab** — sensors, cameras
- [ ] **Security / guard post** — access logs, CCTV monitor
- [ ] **NVR / server room** — NVR, storage, firewall **[with CCTV Engineer]**
- [ ] **External areas** — outdoor cameras, gate motors

---

## Minimum photo list (don’t leave without these)

- [ ] Every **CCTV camera** (wide + label if any)
- [ ] **NVR/DVR** front and back (ports visible)
- [ ] Every **access reader** and **door controller**
- [ ] **Attendance device** screen and brand plate
- [ ] Each **production machine** nameplate + control panel
- [ ] Any **environmental sensor** or wall monitor
- [ ] **Network cabinet** — router, switch, firewall
- [ ] **Floor sketch** (phone photo of hand-drawn map is fine)

---

## Conference call checklist (Owner + CCTV Engineer)

After the tour, confirm on the call:

### Architecture (Owner’s diagram)
- [ ] Confirm all floor systems listed in diagram are present at Ikeduru
- [ ] Confirm Owner still wants **AWS** for CCTV storage + ERP, or happy with current cloud for dashboard
- [ ] Confirm **Owner login from Australia** is the primary use case
- [ ] Confirm **remote door unlock** is required at launch
- [ ] Confirm **live CCTV in web browser** is required (not just alerts)

### CCTV (Engineer)
- [ ] Camera count and NVR model confirmed
- [ ] RTSP or ONVIF available for each camera? 
- [ ] Can engineer provide **admin credentials** or integration API documentation?
- [ ] Bandwidth needed for live streams to cloud (Starlink upload sufficient?)
- [ ] Recording stays local, cloud, or both?
- [ ] Who installs/opens firewall ports if needed?
- [ ] Timeline for engineer to support integration (remote/on-site)

### Integration / IoT
- [ ] Is a **site gateway PC** approved (small computer on LAN 24/7)?
- [ ] Who is the **factory IT contact** for network access?
- [ ] Who is the **electrician** for machine signal taps (if needed)?
- [ ] Who approves **physical changes** to doors/machines?

### SIFOS accounts & roles
- [ ] Owner email for production login
- [ ] Manager email(s)
- [ ] Security staff email(s)
- [ ] Operator email(s)

### Launch expectations
- [ ] Target go-live date
- [ ] Which alerts must notify Owner immediately (SMS/email/WhatsApp later?)
- [ ] Operating hours / timezone (Nigeria WAT vs Owner in Australia)

---

## Quick reference — what each thing becomes in SIFOS

| Factory item | SIFOS module | Owner can… |
|--------------|--------------|------------|
| CCTV | Alerts + future live view | Watch / get motion alerts |
| Access control | Access Control | Remote lock/unlock, see logs |
| Attendance | Attendance | See who is present |
| Production machines | Production + Dashboard OEE | See status & efficiency |
| Inventory | Inventory | See stock & low-stock alerts |
| Environmental sensors | Environment | See readings & breaches |
| Company laptops | Assets | Track assignments |
| All alerts | Alerts | Acknowledge & monitor |
| User actions | Activity Logs | Audit trail + export CSV |
| Staff accounts | Team & Accounts | Create roles (Owner only) |

---

## Item log sheet (quick copy)

| # | Category | Area | Device | Brand/Model | Network? | Photos? | Priority | Notes |
|---|----------|------|--------|-------------|----------|---------|----------|-------|
| 1 | | | | | | | | |
| 2 | | | | | | | | |
| 3 | | | | | | | | |
| 4 | | | | | | | | |
| 5 | | | | | | | | |
| 6 | | | | | | | | |
| 7 | | | | | | | | |
| 8 | | | | | | | | |
| 9 | | | | | | | | |
| 10 | | | | | | | | |

_Add rows on your phone notes app if you run out of space._

---

**End of checklist — good luck on site tomorrow.**
