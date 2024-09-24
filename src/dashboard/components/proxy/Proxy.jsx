import React from 'react';
import styles from './proxy.module.css';

const Proxy = () => {
  
  return (
    <div className={styles.container}>
      <div className={styles.radioGroup}>
        <div className={styles.radioItem}>
          <input type="radio" id="direct" name="connection" defaultChecked />
          <label htmlFor="direct">I am directly connected to the internet</label>
        </div>
        <div className={styles.radioItem}>
          <input type="radio" id="auto-detect" name="connection" />
          <label htmlFor="auto-detect">Automatically detect proxy settings</label>
        </div>
        <div className={styles.radioItem}>
          <input type="radio" id="manual" name="connection" />
          <label htmlFor="manual">Manual proxy configuration</label>
        </div>
      </div>
      
    </div>
  );
};

export default Proxy;
