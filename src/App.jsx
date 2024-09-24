import React, { useState, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { PiBagSimpleFill } from "react-icons/pi";
import { FaWrench } from "react-icons/fa";
import "./index.css";

export default function App() {
  const [playing, setPlaying] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [mouseProductivity, setMouseProductivity] = useState(0);
  const [keyboardProductivity, setKeyboardProductivity] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [windowOpacity, setWindowOpacity] = useState(30);
  const [screenshotPreviewTime, setScreenshotPreviewTime] = useState(5);
  const [trackingData, setTrackingData] = useState([]); // Array to store tracking objects

  useEffect(() => {
    const fetchTrackingStatus = async () => {
      const result = await window.electronStore.get("tracking");
      setPlaying(result);
    };
    fetchTrackingStatus();

    const handleWindowTrackingChanged = (event, newValue) => {
      setPlaying(newValue);
    };

    window.electron.ipcRenderer.on(
      "tracking:changed",
      handleWindowTrackingChanged
    );

    return () => {
      window.electron.ipcRenderer.removeListener(
        "tracking:changed",
        handleWindowTrackingChanged
      );
    };
  }, []);

  useEffect(() => {
    const fetchStoredValue = async () => {
      if (window.electronStore) {
        const result = await window.electronStore.get("windowOpacity");
        setWindowOpacity(result);
      }
    };

    fetchStoredValue();

    const handleWindowOpacityChanged = (event, newValue) => {
      setWindowOpacity(newValue);
    };

    window.electron.ipcRenderer.on(
      "windowOpacity:changed",
      handleWindowOpacityChanged
    );

    return () => {
      window.electron.ipcRenderer.removeListener(
        "windowOpacity:changed",
        handleWindowOpacityChanged
      );
    };
  }, []);

  useEffect(() => {
    const fetchStoredValue = async () => {
      try {
        if (window.electronStore) {
          const result = await window.electronStore.get("screenshotPreviewTime");
          if (result !== undefined) {
            setScreenshotPreviewTime(result);
            console.log("Retrieved screenshotPreviewTime:", result);
          } else {
            console.warn("screenshotPreviewTime is undefined");
          }
        }
      } catch (error) {
        console.error("Error retrieving screenshotPreviewTime:", error);
      }
    };

    fetchStoredValue();

    const handleScreenshotPreviewTimeChanged = (event, newValue) => {
      setScreenshotPreviewTime(newValue);
    };

    window.electron.ipcRenderer.on(
      "screenshotPreviewTime:changed",
      handleScreenshotPreviewTimeChanged
    );

    return () => {
      window.electron.ipcRenderer.removeListener(
        "screenshotPreviewTime:changed",
        handleScreenshotPreviewTimeChanged
      );
    };
  }, []);

  const handleClick = () => {
    window.electron.ipcRenderer.send("open-new-window");
  };

  const handleLogin = () => {
    window.electron.ipcRenderer.send("open-login-window");
  };

  const handleClose = () => {
    window.electron.ipcRenderer.send("close-window");
  };

  const handleStartTracking = async () => {
    if (!playing) {
      await window.electronStore.set("tracking", true);
      window.electron.ipcRenderer.send("screenshot:start");
    } else {
      await window.electronStore.set("tracking", false);
      window.electron.ipcRenderer.send("screenshot:stop");
    }
  };

  useEffect(() => {
    console.log('useEffect ran');
  
    let timeoutId;
  
    const handleScreenshotCaptured = (
      e,
      { screenshot, mouseProductivity, keyboardProductivity, elapsedTime }
    ) => {
      console.log('Screenshot captured handler triggered');
      setImageSrc(screenshot);
      setMouseProductivity(mouseProductivity);
      setKeyboardProductivity(keyboardProductivity);
      setElapsedTime(elapsedTime);
      setShowImage(true);
  
      const newTrackingObject = {
        image: screenshot,
        mouseClicks: mouseProductivity,
        keyboardClicks: keyboardProductivity,
        time: formatTime(elapsedTime),
      };
      
      setTrackingData((prevData) => {
        const updatedData = [...prevData, newTrackingObject];
        console.log('Tracking data updated', updatedData);
        window.electron.ipcRenderer.send("trackingData", updatedData);
        return updatedData;
      });
  
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
  
      timeoutId = setTimeout(() => {
        setShowImage(false);
        setImageSrc(null);
      }, screenshotPreviewTime * 1000);
    };
  
    window.electron.ipcRenderer.on("screenshot:captured", handleScreenshotCaptured);
  
    return () => {
      console.log('Cleaning up');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.electron.ipcRenderer.removeListener("screenshot:captured", handleScreenshotCaptured);
    };
  }, []); // Empty dependency array
  
  

  useEffect(() => {
  if (trackingData.length > 0) {
    // Send the updated data to the backend
    console.log("Sending updated data to backend", trackingData);
    // Your backend request goes here
    // axios.post('your-backend-url', trackingData)
  }
}, [trackingData]); 

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${
      remainingMinutes < 10 ? `0${remainingMinutes}` : remainingMinutes
    }`;
  };

  return (
    <>
      <div className="image-container">
        {showImage && imageSrc && (
          <img src={imageSrc} alt="Screenshot" className="screenshot-image" />
        )}
      </div>
      <div
        className="controls flex items-center justify-between bg-gray-800 p-1 rounded-md text-gray-400 w-[150px] h-[50px] mt-2"
        style={{ opacity: windowOpacity / 100 }}
      >
        <div
          className="flex flex-col items-center pl-4 text-2xl cursor-pointer"
          onClick={handleStartTracking}
        >
          {playing ? <FaPause /> : <FaPlay />}
          <div
            className={`bg-${
              playing ? "red" : "green"
            }-600 w-[40px] h-[2px] mt-1`}
          ></div>
        </div>
        <div className="text-xl">{formatTime(elapsedTime)}</div>
        <div className="flex flex-col gap-1 items-end">
          <div className="cursor-pointer text-xl">
            <IoMdClose onClick={handleClose} />
          </div>
          <div className="flex gap-1 items-center cursor-pointer">
            <PiBagSimpleFill onClick={handleLogin} />
            <FaWrench onClick={handleClick} />
          </div>
        </div>
      </div>


    </>
  );
}
