import React, { useEffect, useState } from "react";
import styles from "./settings.module.css";

const Settings = () => {
  const [opacity, setOpacity] = useState(30);
  const [screenshotPreviewTime, setScreenshotPreviewTime] = useState(5);

  const handleOpacityChange = async (value) => {
    setOpacity(value);
    if (window.electronStore) {
      await window.electronStore.set("windowOpacity", value);
    } else {
      console.error("electronStore is not available");
    }
  };
  const handleScreenshotPreviewTimeChange = async (value) => {
    setScreenshotPreviewTime(value);
    if (window.electronStore) {
      await window.electronStore.set("screenshotPreviewTime", value);
    } else {
      console.error("electronStore is not available");
    }
  };

  useEffect(() => {
    const fetchStoredValue = async () => {
      if (window.electronStore) {
        const result = await window.electronStore.get("windowOpacity");
        if (result !== undefined) {
          console.log(result);
          
          setOpacity(result); // Update state with the fetched value
        }
      }
    };
    fetchStoredValue();
  }, []);

  useEffect(() => {
    const fetchStoredValue = async () => {
      if (window.electronStore) {
        const result = await window.electronStore.get("screenshotPreviewTime");
        if (result !== undefined) {
          console.log(result);
          
          setScreenshotPreviewTime(result); // Update state with the fetched value
        }
      }
    };
    fetchStoredValue();
  }, []);

  return (
    <div className={styles.container}>
      <div className={`${styles.section} ${styles.flexcontainer}`}>
        <label className={styles.label}>Interface language</label>
        <select className={styles.select}>
          <option>English</option>
        </select>
      </div>

      <div className={`${styles.section} ${styles.flexcontainer}`}>
        <div className={styles.checkboxContainer}>
          <label className={styles.label}>Display screenshot preview</label>
        </div>
        <select
          value={screenshotPreviewTime}
          onChange={(e) =>
            handleScreenshotPreviewTimeChange(Number(e.target.value))
          }
          className={styles.select}
        >
          <option value="5">5 sec</option>
          <option value="10">10 sec</option>
          <option value="15">15 sec</option>
        </select>
      </div>

      <div className={`${styles.section} ${styles.flexcontainer}`}>
        <label className={styles.label}>Main window transparency</label>
        <input
          type="range"
          id="opacity-slider"
          className="transparencySlider"
          min="20"
          max="100"
          step="10"
          value={opacity}
          onChange={(e) => handleOpacityChange(e.target.value)}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.checkboxContainer}>
          <input type="checkbox" />
          <label className={styles.label}>Use secure protocol</label>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.checkboxContainer}>
          <label className={styles.label}>Following are hot keys:</label>
        </div>
        <div className={styles.section}>
          <div className={`${styles.section} ${styles.flexcontainer}`}>
            <label className={styles.label}>Start tracking:</label>
            <p>Ctrl+S</p>
          </div>
          <div className={`${styles.section} ${styles.flexcontainer}`}>
            <label className={styles.label}>Stop tracking:</label>
            <p>Ctrl+Alt+S</p>
          </div>
          <div className={`${styles.section} ${styles.flexcontainer}`}>
            <label className={styles.label}>Show statistics:</label>
            <p>Ctrl+Alt+X</p>
          </div>
        </div>
      </div>
      {/* <button className={styles.button}>Reset default keys</button> */}
    </div>
  );
};

export default Settings;
