import React from 'react';
import styles from './about.module.css';

const About = () => {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <img src="/path-to-your-logo-image.png" alt="ProductivityPro Logo" />
      </div>
      <div className={styles.version}>
        Productivity Pro Agent 
      </div>
      <div className={styles.description}>
        Tahometer is a time-tracking and screenshot-taking tool for MacOS, Linux, and Windows.
      </div>
      <div className={styles.helpSection}>
        <strong>Need help?</strong><br />
        If you need help, please visit our <a href="https://productivitypro.com/faq" target="_blank" rel="noopener noreferrer">F.A.Q. section</a> or contact our support team: <a href="mailto:info@productivitypro.com">info@productivitypro.com</a>.<br />
        For more information, visit our website at <a href="https://productivitypro.com" target="_blank" rel="noopener noreferrer">productivitypro.com</a>.
      </div>
      
    </div>
  );
};

export default About;
