import React, { useState } from 'react';
import styles from './sidebar.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { setRoute } from '../../../store/routeSlice';

const Sidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const dispatch = useDispatch();
  const currentRoute = useSelector((state) => state.route.currentRoute); // Accessing the correct part of state


  const handleItemClick = (item) => {
    if (item === 'Change user') {
      setIsModalOpen(true); // Show modal when 'Change user' is clicked
    } else {
      dispatch(setRoute(item)); // Dispatch the action with the item directly as payload
    }
  };

  const handleClose = () => {
    window.electron.ipcRenderer.send("close-window");
  };

  const handleConfirmChangeUser = () => {
    window.electron.ipcRenderer.send("logoutCall");
    setIsModalOpen(false); // Close modal after confirming
  };

  const handleCancelChangeUser = () => {
    setIsModalOpen(false); // Close modal when user cancels
  };

  return (
    <>
      <div className={styles.container}>
        <div
          className={`${styles.menuItem} ${currentRoute === 'Time Tracking' ? styles.active : ''}`}
          onClick={() => handleItemClick('Time Tracking')}
        >
          <i className="fas fa-clock"></i>
          Time Tracking
        </div>
        <div
          className={`${styles.menuItem} ${currentRoute === 'Settings' ? styles.active : ''}`}
          onClick={() => handleItemClick('Settings')}
        >
          <i className="fas fa-cog"></i>
          Settings
        </div>
        <div
          className={`${styles.menuItem} ${currentRoute === 'Proxy' ? styles.active : ''}`}
          onClick={() => handleItemClick('Proxy')}
        >
          <i className="fas fa-shield-alt"></i>
          Proxy
        </div>
        <div
          className={`${styles.menuItem} ${currentRoute === 'About' ? styles.active : ''}`}
          onClick={() => handleItemClick('About')}
        >
          <i className="fas fa-info-circle"></i>
          About
        </div>

        <div className={styles.bottomItems}>
          <div
            className={`${styles.menuItem} ${currentRoute === 'Change user' ? styles.active : ''}`}
            onClick={() => {handleItemClick('Change user')
            }}
          >
            <i className="fas fa-user"></i>
            Change user
          </div>
          <div
            className={`${styles.menuItem} ${currentRoute === 'Exit Tahometer' ? styles.active : ''}`}
            onClick={() => handleItemClick('Exit Tahometer')}
          >
            <i className="fas fa-sign-out-alt"></i>
            Exit Tahometer
          </div>
        </div>
      </div>
      <span className={styles.closeBtn} onClick={handleClose}>Close</span>

      {/* Modal for confirming account change */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <p>Are you sure you want to change the account?</p>
            <button onClick={handleConfirmChangeUser}>Yes</button>
            <button onClick={handleCancelChangeUser}>No</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
