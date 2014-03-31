#Time Machine Hyperwall

1. [Setting up the master machine](#setup)
2. [Running the node.js server on the master](#run)
3. [Syncing up other machines](#sync)
4. [Installing the Android app](#installApp)

#### [Tutorial for the tablet controller](https://sites.google.com/a/gigapan.org/timelapse/creating-time-machines/time-machine-controller-for-hyperwall)

<a name="setup"></a>
## Setting up the master machine:
Download node.js and install it from http://nodejs.org/download/.

<a name="run"></a>
## Running the node.js server on the master:
- **Download the timemachine-hyperwall code from github.**
  ```
  git clone https://github.com/CMU-CREATE-Lab/timemachine-hyperwall.git
  ```
  OR [download a zip from GitHub](https://github.com/CMU-CREATE-Lab/timemachine-hyperwall/archive/master.zip)

- **In a terminal, go to the timemachine-hyperwall code folder on the master machine and start the server by typing:**
  
  ```
  node server.js
  ```

- **Go to a browser (Chrome recommended) on the master machine and type in the following address:**
  ```
  http://localhost:8080/hyperwall.html?master=true&showControls=true&fullControls=true&showMap=true&mapPosition=topRight
  ```

- **Settings after [http://localhost:8080/hyperwall.html?]()**
  - master = (true|false; is a master machine or not)
  - showControls = (true|false; show the control bar or not)
  - fullControls = (true|false; show the play/help button or not)
  - showMap = (true|false; show the google map or not)
  - mapPosition = (topRight|topLeft|bottomRight|bottomLeft; set the map position)

<a name="sync"></a>
## Syncing up other machines:
- **Connect each browser to the master**

  Go to the machine with a display to the right of the master and in your browser point to the following address:
  ```
  http://192.168.1.2:8080/hyperwall.html?yawOffset=1
  ```
  This assumes the IP address of the master machine is 192.168.1.2.
  
- **Setting up a 3x3 hyperwall:**

  After [http://192.168.1.2:8080/hyperwall.html?](), enter the following:
  - yawOffset=1 (right of the master)
  - yawOffset=-1 (left of the master)
  - pitchOffset=-1 (above the master)
  - pitchOffset=1 (below the master)
  - yawOffset=1&pitchOffset=-1 (top right corner)
  - yawOffset=-1&pitchOffset=-1 (top left corner)
  - yawOffset=1&pitchOffset=1 (bottom right corner)
  - yawOffset=-1&pitchOffset=1 (bottom left corner)

  pitchOffset is for above/below the master. Negative is above and positive is below. yawOffset is for left/right of the master. Negative is to the left and positive is to the right.

<a name="installApp"></a>

## Installing the Android app

- **Prerequisites**

  Officially we only support Android (latest - 1), which at this time is Android 4.4 and 4.3.
However, our app should still work on Android 4.2, with the requirement that you have **Google Maps installed** and you are running **at least version 7.4.0** of it. If you do have to upgrade your Maps to a later version, **you will need to reboot your device after installing it**. If there is also an update to Google Services for your device, you must install that too. Note that **Android 4.2 is the minimum version we support**.

- **[Download Android App](https://raw.github.com/CMU-CREATE-Lab/timemachine-hyperwall/master/androidCode/bin/timemachine-hyperwall.apk)**

  Download the apk file from the tablet with the link above and install it. You have to enable the following on your tablet to install the app.
  ```
  Settings -> Security -> Device Administration -> Unknown Sources
  ```

- **Set up the node server first** 

  The node server on the master machine needs to be running before you start the app. In addition, the Android tablet and the master machine need to be on the same network. Once you start the app, it will ask you the IP address of the master machine, e.g. 192.168.1.2. Once you enter the IP address, the tablet will be connected. For your convenience, the address will be saved for future runs of the app.
