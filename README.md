# node-red-contrib-usbhid

A node-hid (USB HID device access library) wrapper for nodered

Credit goes to node-hid. 

You can look up either git to find information on setup, Prerequisites and Platforms to get the node working:
https://github.com/node-hid/node-hid


### Prerequisites:

* [Node.js](https://nodejs.org/) v0.8 - v4.x+
* Mac OS X 10.8, Linux (kernel 2.6+), and Windows XP+
* libudev-dev, libusb-1.0-0-dev (if Linux, see Compile below)
* [git](https://git-scm.com/)

node-hid uses node-pre-gyp to store pre-built binary bundles, so usually no compiler is needed to install.

Platforms we pre-build binaries for:
- Mac OS X x64: v0.10, v0.12, v4.2.x
- Windows x64 & x86: v0.10, v0.12, v4.2.x
- Linux Debian/Ubuntu x64: v4.2.x
- Raspberry Pi arm: v4.2.x

## How to Install on Windows

This package works natively with Windows.

Manual installation is the current way to get the node.  It will be added to the pallette manager in the future.

### Install from source
From github:
Navigate to the your home directory on linux and windows it is typically ~/.node-red/node-modules
```powershell
git clone https://github.com/gdziuba/node-red-contrib-usbhid.git
```
```powershell
cd node-red-contrib-usbhid
npm install
```

## How to Install on Linux

### HID ( USB ) read/write access for non root users ( in my case for user pi on an raspberry pi 2 running nodered )

**Install libraries for Linux**

```sudo apt install libusb-1.0-0 libusb-1.0-0-dev libudev-dev```

The Pd-extended [hid] object allows you to access Human Interface Devices such as mice, keyboards, and joysticks. However, in most Linux distributions, these devices are setup to where they cannot be read/written directly by Pd unless you run it as root.

Running a non-system process as root is considered a security risk, so an alternative is to change the permissions of the input devices so that pd can read/write them.

```
sudo mkdir -p /etc/udev/rules.d
sudo nano /etc/udev/rules.d/85-pure-data.rules
```
Now add the following rules to /etc/udev/rules.d/85-pure-data.rules making sure to updated **KERNEL to your hidraw\* device**:

```
SUBSYSTEM=="input", GROUP="input", MODE="0777"
SUBSYSTEM=="usb", MODE:="777", GROUP="input"
KERNEL=="hidraw0", MODE="0777", GROUP="input"
```
**Make sure no existing rules compete.  I found existing file on Raspberry pi that needed updating.  I added above code instead of creating a new file**

Then create an "input" group and add yourself to it:

```
sudo groupadd -f input
sudo gpasswd -a $USER input
```

Reloads rules:
```
udevadm control --reload-rules
```

Reboot your machine for the rules to take effect.
Your nodejs / nodered has now FULL ACCESS !! to you usb devides. Feel free to adjust the permissions to fit your needs.


## How to Use

Leverage this [Flow](https://flows.nodered.org/flow/3e08565bc0e024e81325dc028c5da792) to get started.
