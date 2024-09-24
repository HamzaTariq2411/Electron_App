import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./login.module.css";
import axios from "axios";
import { fetchApi } from "../utlis/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!password) {
      alert("Enter your password, please");
    } else {
      try {

        window.electron.ipcRenderer.send("loginApiCall",{
          email,
          password,
          domain,
        });
        // const response = await fetchApi.post("/login", {
        //   email,
        //   password,
        //   domain,
        // });

        // if (response.data.status === 200) {
        //   setErrorMessage("");
        //   alert("Logged in successfully!");
        // } else {
        //   setErrorMessage("Login failed. Please try again.");
        // }
      } catch (error) {
        setErrorMessage("An error occurred. Please try again later.");
        console.error("Login error:", error);
      }
    }
  };

  const handleCancel = () => {
    // Clear fields when cancel is clicked
    setEmail("");
    setDomain("");
    setPassword("");
    setErrorMessage("");
  };

  return (
    <>
      <div className={`${styles.loginContainer} ${styles.darkTheme}`}>
        <p className={styles.detailspan}>Please enter the following details:</p>
        <div className={styles.inputGroup}>
          <label htmlFor="domain" style={{ marginBottom: "10px" }}>
            Your company domain
          </label>
          <div className={styles.domainInput}>
            <input
              type="text"
              id="domain"
              placeholder="Domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <span>.productivitypro.com</span>
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="email" style={{ marginBottom: "10px" }}>
            Email
          </label>
          <div className={styles.passwordInput}>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password" style={{ marginBottom: "10px" }}>
            Password
          </label>
          <div className={styles.passwordInput}>
            <input
              style={{ paddingRight: "40px" }}
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className={styles.toggleButton}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          <a href="#" className={styles.forgotPassword}>
            Forgot your password?
          </a>
          <div className={styles.buttongrp}>
            <button
              type="button"
              onClick={handleCancel}
              className={`${styles.cancelButton} ${styles.btngrp}`}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.loginButton} ${styles.btngrp}`}
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
