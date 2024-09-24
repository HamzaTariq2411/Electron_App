import React, { useState, useEffect } from "react";
import styles from "./timeDelay.module.css";

const TimeDelay = () => {
  const [inactivityTime, setInactivityTime] = useState(0);
  const [activityDescription, setActivityDescription] = useState("");
  const [project, setProject] = useState("");
  const [isTimerActive, setIsTimerActive] = useState(true); // New state to control the timer

  useEffect(() => {
    let timer;
    if (isTimerActive) {
      timer = setInterval(() => {
        setInactivityTime((prevTime) => prevTime + 1); // Increment time every second
      }, 1000);
    }
    return () => clearInterval(timer); // Cleanup the timer on unmount or when isTimerActive changes
  }, [isTimerActive]);

  const handleAdd = () => {
    setIsTimerActive(false); // Stop the timer
    if(!activityDescription){
      return alert('Please fill the descrption')

    }
    // You can also handle any additional logic for the 'Add' button here
  };

  return (
    <div className={styles.container}>
      <p className={styles.detectedText}>
        ProductivityPro has detected that you were not active for
      </p>
      <h2 className={styles.inactivityDuration}>
        {Math.floor(inactivityTime / 60)} min {inactivityTime % 60} sec
      </h2>
      <div className={styles.formGroup}>
        <label htmlFor="activityDescription">Activity description</label>
        <input
          type="text"
          id="activityDescription"
          value={activityDescription}
          onChange={(e) => setActivityDescription(e.target.value)}
          className={styles.input}
          disabled={!isTimerActive} // Disable input if timer is stopped
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="project">Project</label>
        <select
          id="project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className={styles.input}
          disabled={!isTimerActive} // Disable select if timer is stopped
        >
          <option value="Tahometer">BugTrack</option>
          <option value="Other Project">Other Project</option>
        </select>
      </div>
      <div className={styles.buttons}>
        <button className={styles.addButton} onClick={handleAdd}>Add</button>
        <button className={styles.skipButton} onClick={() => setInactivityTime(0)}>Skip</button>
      </div>
    </div>
  );
};

export default TimeDelay;
