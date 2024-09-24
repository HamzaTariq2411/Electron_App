const { app, BrowserWindow, desktopCapturer, ipcMain } = require("electron");
const path = require("node:path");
const { GlobalKeyboardListener } = require("node-global-key-listener");
import Store from "electron-store";
require("dotenv").config();
import axios from "axios";
// Initialize a new instance of Store
const store = new Store();


let mainWindow;
let newWindow;
let loginWindow;
let timeDelayWindow;
let screenshotInterval = null;
let keyPresses = 0;
let mouseClicks = 0;
let startTime = null;
let inactivityTimeout = null;
let keyListener = null;
let ctrlPressed = false;
let altPressed = false;
let trackingActive = false;
let elapsedTime = 0; // Track cumulative elapsed time
let isLogin;
// Key combinations for starting and stopping tracking
const START_TRACKING_KEY = { ctrl: true, alt: false, key: "S" };
const STOP_TRACKING_KEY = { ctrl: true, alt: true, key: "S" };

const MAX_ACTIONS_PER_MINUTE = 300;
const INACTIVITY_THRESHOLD = 60000; // 1 minute in milliseconds

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 250,
    height: 210,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: true,
    },
    // transparent: true,
    // resizable: false,
    minimizable: false,
    alwaysOnTop: true,
    // frame: false,
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  let ctrlPressedTimeout;

  keyListener = new GlobalKeyboardListener();

  keyListener.addListener((e) => {
    if (e.state === "DOWN") {
      if (e.name === "LEFT CTRL" || e.name === "RIGHT CTRL") {
        ctrlPressed = true;

        clearTimeout(ctrlPressedTimeout);

        // Set a timeout to reset the mouse events after 30 seconds
        ctrlPressedTimeout = setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.setIgnoreMouseEvents(true, { forward: true });
            console.log("Mouse events reset after 30 seconds");
          }
        }, 30000);
      }

      if (e.name.includes("MOUSE") && ctrlPressed && e.name === "MOUSE LEFT") {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.setIgnoreMouseEvents(false);
          console.log("focused");
        }
      }

      // Handle the key events for starting/stopping tracking
      handleKeyEvents(e);
    } else if (e.state === "UP") {
      // Reset flags when keys are released
      if (e.name === "LEFT CTRL" || e.name === "RIGHT CTRL") {
        ctrlPressed = false;
      }

      if (e.name === "LEFT ALT" || e.name === "RIGHT ALT") {
        altPressed = false;
      }
    }
  });

  // Clean up the timeout when the main window is closed
  mainWindow.on("closed", () => {
    clearTimeout(ctrlPressedTimeout);  // Clear the timeout on window close
    mainWindow = null;
  });

  // Listen for changes to 'windowOpacity' and emit an event when it changes
  store.onDidChange("windowOpacity", (newValue) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("windowOpacity:changed", newValue);
    }
  });
  store.onDidChange("tracking", (newValue) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("tracking:changed", newValue);
    }
  });
  store.onDidChange("screenshotPreviewTime", (newValue) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("screenshotPreviewTime:changed", newValue);
    }
  });
};


const handleKeyEvents = (e) => {
  if (e.name === "LEFT ALT" || e.name === "RIGHT ALT") {
    altPressed = true;
  }

  if (ctrlPressed && !altPressed && e.name === START_TRACKING_KEY.key) {
    if (!trackingActive) {
      startTracking();
    }
  }

  if (ctrlPressed && altPressed && e.name === STOP_TRACKING_KEY.key) {
    if (trackingActive) {
      stopTracking();
    }
  }
};

const createLoginWindow = () => {
  loginWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      preload: LOGIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      sandbox: false,
      webSecurity: false,
    },
    autoHideMenuBar: true,
    resizable: false,
    minimizable: false,
    alwaysOnTop: true,
  });

  loginWindow.loadURL(LOGIN_WINDOW_WEBPACK_ENTRY);
};

const createNewWindow = () => {
  if (!newWindow) {
    newWindow = new BrowserWindow({
      width: 700,
      height: 600,
      webPreferences: {
        preload: path.join(CHILD_WINDOW_PRELOAD_WEBPACK_ENTRY),
        nodeIntegration: true,
        sandbox: false,
        webSecurity: false,
      },
      minimizable: false,
      resizable: false,
      alwaysOnTop: true,
    });

    newWindow.loadURL(CHILD_WINDOW_WEBPACK_ENTRY);

    newWindow.on("closed", () => {
      newWindow = null;
    });
  }
};

const createDelayWindow = () => {
  if (!timeDelayWindow) {
    timeDelayWindow = new BrowserWindow({
      width: 500,
      height: 400,
      webPreferences: {
        preload: DELAY_WINDOW_PRELOAD_WEBPACK_ENTRY,
        nodeIntegration: true,
        sandbox: false,
        webSecurity: false,
      },
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      alwaysOnTop: true,
    });

    timeDelayWindow.loadURL(DELAY_WINDOW_WEBPACK_ENTRY);

    timeDelayWindow.on("closed", () => {
      timeDelayWindow = null;

      // if (mainWindow && !mainWindow.isDestroyed()) {
      //   mainWindow.setIgnoreMouseEvents(false);
      //   console.log("Main window focused after delay window close");
      // }
    });

    stopTracking();
  }
};

const stopTracking = () => {
  try {
    if (screenshotInterval) {
      clearInterval(screenshotInterval);
      screenshotInterval = null;
    }

    if (keyListener) {
      keyListener.stop();
    }
    trackingActive = false; // Update tracking state

    // Ensure to handle any pending operations
    process.nextTick(() => {
      mainWindow.blur();
      store.set("tracking", trackingActive);
    });
  } catch (error) {
    console.error("Error occurred while stopping tracking:", error);
  }
};

const startTracking = () => {
  if (!screenshotInterval) {
    ipcMain.emit("screenshot:start");
  }

  // If tracking was paused, continue from where it left off
  if (!startTime) {
    startTime = new Date(); // Set start time only if it wasn't set
  } else {
    // Calculate the time elapsed since tracking was last stopped
    const currentTime = new Date();
    const elapsedPausedTime = Math.floor((currentTime - startTime) / 1000);

    // Adjust elapsedTime so that the tracking continues from the correct accumulated time
    elapsedTime += elapsedPausedTime;
    startTime = currentTime; // Reset startTime to the current time
  }

  trackingActive = true; // Update tracking state
  store.set("tracking", trackingActive);
};



const setupKeyListener = () => {
  keyListener = new GlobalKeyboardListener();

  keyListener
    .addListener((e) => {
      console.log(e.name);
      
      if (e.state === "DOWN") {
        console.log(e.state);
        
        resetInactivityTimer();

        if (e.name.includes("MOUSE")) {
          mouseClicks++;
        } else {
          keyPresses++;
        }

        if (e.name === "LEFT CTRL" || e.name === "RIGHT CTRL") {
          ctrlPressed = true;
        }

        if (e.name === "LEFT ALT" || e.name === "RIGHT ALT") {
          altPressed = true;
        }

        handleKeyEvents(e);
      } else if (e.state === "UP") {
        if (e.name === "LEFT CTRL" || e.name === "RIGHT CTRL") {
          ctrlPressed = false;
        }

        if (e.name === "LEFT ALT" || e.name === "RIGHT ALT") {
          altPressed = false;
        }
      }
    })
    .catch((err) => {
      console.error("Failed to initialize key listener:", err);
    });
};

const resetInactivityTimer = () => {
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout);
  }
  inactivityTimeout = setTimeout(() => {
    createDelayWindow();
  }, INACTIVITY_THRESHOLD);
};

ipcMain.on("screenshot:start", () => {
  if (!startTime) {
    startTime = new Date();
  }
  keyPresses = 0;
  mouseClicks = 0;

  // Start taking screenshots with random intervals
  captureRandomScreenshot();
 
});

ipcMain.on("screenshot:stop", () => {
  stopTracking();
});

const captureRandomScreenshot = async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1920, height: 1080 },
    });

    const screenshot = sources[0].thumbnail.toDataURL();
    const currentTime = new Date();

    // Check if the date has changed
    if (currentTime.toDateString() !== startTime.toDateString()) {
      // New day detected, reset counters
      startTime = currentTime;
      keyPresses = 0;
      mouseClicks = 0;
    }

    elapsedTime += Math.floor((currentTime - startTime) / 1000);
    startTime = currentTime; // Update startTime to the current capture time

    const keyboardProductivity = Math.min(
      (keyPresses / MAX_ACTIONS_PER_MINUTE) * 100,
      100
    );
   

    const mouseProductivity = Math.min(
      (mouseClicks / MAX_ACTIONS_PER_MINUTE) * 100,
      100
    );
    console.log("mouse", mouseClicks);

    mainWindow.webContents.send("screenshot:captured", {
      screenshot,
      keyboardProductivity,
      mouseProductivity,
      elapsedTime,
    });

    keyPresses = 0;
    mouseClicks = 0;

    // Schedule the next screenshot at a random time within the next 6 minutes
    scheduleNextRandomScreenshot();
  } catch (error) {
    console.error("Failed to capture screenshot:", error);
  }
};

// Function to schedule the next screenshot randomly between 0 and 6 minutes
const scheduleNextRandomScreenshot = () => {
  const randomDelay = Math.floor(Math.random() * 360000); // Random time in ms within 6 minutes
  console.log(`Next screenshot in ${randomDelay / 1000} seconds`);

  if (screenshotInterval) {
    clearInterval(screenshotInterval);
  }
  screenshotInterval = setTimeout(captureRandomScreenshot, randomDelay);
};

app.whenReady().then(() => {
 const login= store.get('isLogin')
  if (login === true) {
    createWindow(); // Create main window if logged in
    setupKeyListener();
  } else {
    createLoginWindow(); // Create login window if not logged in
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on("open-new-window", () => {
  createNewWindow();
});

ipcMain.on("open-login-window", () => {
  createLoginWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    trackingActive = false; // Update tracking state
    store.set("tracking", trackingActive);
    app.quit();
  }
});

ipcMain.handle("set-store-value", async (event, key, value) => {
  try {
    store.set(key, value);
  } catch (error) {
    console.error("Failed to set store value:", error);
  }
});

ipcMain.handle("get-store-value", async (event, key) => {
  return store.get(key);
});

ipcMain.handle("delete-store-value", async (event, key) => {
  store.delete(key);
});

// Handle the 'close-window' IPC message
ipcMain.on("close-window", (event) => {
  // Find the focused window
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.close(); // Close the focused window
  }
  if (focusedWindow === mainWindow) {
    trackingActive = false; // Update tracking state
    store.set("tracking", trackingActive);
    focusedWindow.close();
  }
});

ipcMain.on("loginApiCall", (event, data) => {
  console.log(data);

  const postLoginData = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 200) {
        isLogin = true; 
        // Store the login data in electron-store
        store.set("loginData", response.data);
        store.set("isLogin", isLogin); // Store the login state in electron-store
        createWindow(); // Create main window after successful login
        if (loginWindow) {
          loginWindow.close(); // Close the login window
        }

        console.log("Login data stored:", response.data);
      }
    } catch (error) {
      console.error("Error during login API call:", error);

      // Optionally send an error message back to the renderer process
      event.sender.send("login-error", error.message);
    }
  };

  postLoginData();
});

ipcMain.on("login-error", (event, errorMessage) => {
  console.error("Login error:", errorMessage);
});


//log out
ipcMain.on("logoutCall", () => {
  isLogin = false; 
  store.set("loginData", null);
  store.set("isLogin", isLogin); 

  // Close all windows except the login window
  BrowserWindow.getAllWindows().forEach((win) => {
      win.close();
  });

  createLoginWindow();

});



const os = require('os');


ipcMain.on("trackingData", (event, value, key) => {
  console.log('key : ', key);

  const sendTrackingData = async (data) => {
    // Your function to send data to the server
    console.log('Sending tracking data: ', data);

    // Simulate sending the tracking data to a server
    // Add actual API call here
    // Example: await fetch('https://your-api-endpoint.com', { method: 'POST', body: JSON.stringify(data) });
  };

  const checkAndSendData = async (data) => {
    const online = checkOnlineStatus();
    if (online) {
      // If online, send data
      console.log('online');
      await sendTrackingData(data);
      store.delete('offlineTrackingData'); // Optionally delete offline data
    } else {
      console.log('Stored tracking data offline');
      store.set('offlineTrackingData', data); // Store offline data
    }
  };

  // Function to check network status using os.networkInterfaces()
  const checkOnlineStatus = () => {
    const networkInterfaces = os.networkInterfaces();
    
    // Check if any interface has a valid external address
    for (const interfaceName in networkInterfaces) {
      const netInterface = networkInterfaces[interfaceName];

      for (const net of netInterface) {
        // Filter only external, non-internal, IPv4 addresses
        if (!net.internal && net.family === 'IPv4') {
          console.log('Network interface detected: ', net);
          return true;
        }
      }
    }
    console.log('No active network interfaces found.');
    return false;
  };

  // Check the platform time every minute
  setInterval(() => {
    const now = new Date();
    const hours = now.getHours(); // Get current hour
    const minutes = now.getMinutes(); 

    if (minutes === 0) {
      console.log(`It's ${hours}:00. Checking connection to send tracking data...`);
    }
    
    const trackingData = { key, value, timestamp: new Date() };
    checkAndSendData(trackingData);
  }, 60000); // Check every 60 seconds

  // Auto-retry when internet is back, check every 10 seconds
  setInterval(() => {
    const online = checkOnlineStatus();
    if (online) {
      const offlineData = store.get('offlineTrackingData');
      if (offlineData) {
        console.log('Internet restored. Sending stored tracking data...');
        sendTrackingData(offlineData);
        store.delete('offlineTrackingData');
      }
    }
  }, 10000); // Retry every 10 seconds


});

