import React from "react";
import styles from "./timeTracking.module.css";

const TimeTracking = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        My total time: <span>0 min</span>
      </h2>
      <div className={styles.spaceY2}>
        <div className={styles.flexRow}>
          <div className={`${styles.textGray700} ${styles.progressBar_main}`}>
            Online time: <div className={styles.progressBar}></div>
          </div>
          <div className={styles.textGray700}>0 min</div>
        </div>
        <div className={styles.flexRow}>
          <span className={`${styles.textGray700} ${styles.progressBar_main}`}>Offline time: <div className={styles.progressBar}></div></span>
          <span className={styles.textGray700}>0 min</span>
        </div>
      </div>

      <div className={styles.projectContainer}>
        <h3 className={styles.projectTitle}>Projects I worked on today:</h3>
        <div className={styles.checkboxContainer}>
          <input type="checkbox" className={styles.checkbox} checked readOnly />
          <span className={styles.checkboxLabel}>Project not selected</span>
        </div>
        <p className={styles.projectTime}>7 h 51 min</p>

        <div className={styles.selectContainer}>
          <label htmlFor="project" className={styles.selectLabel}>
            Project
          </label>
          <select id="project" className={styles.select}>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className={styles.breakContainer}>
        <h3 className={styles.breakTitle}>Take a break:</h3>
        <div className={styles.breakRow}>
          <select className={styles.breakSelect}>
            <option>Stop tracking and let me rest for</option>
            <option>15 min</option>
            <option>30 min</option>
          </select>
          <button className={styles.breakButton}>Stop</button>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
