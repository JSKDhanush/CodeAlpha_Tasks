"use client";
import React, { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./ForgotPassword.module.css";
import validatePassword, { getPasswordStrength } from "../../../utils/validatePassword";
import PopupMessage from "@/app/DataVerifier/Navbars/PopupMessage";
const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState<"error" | "success">("error");
  const [showPassword, setShowPassword] = useState<{ new: boolean; confirm: boolean }>({new: false,confirm: false,});
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const AuthenticationandUsermanagement = process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;
  const router = useRouter();
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("user_email");
    const searchParams = new URLSearchParams(location.search);
    const otpVerifiedParam = searchParams.get("otp_verified");
    if (storedEmail) {
      setEmail(storedEmail);
    }
    if (otpVerifiedParam === "true" && storedEmail) {
      setIsOtpVerified(true);
      setEmail(storedEmail);
      console.log("OTP Verified",email);
      
    }
  }, []);
  // Handle OTP Request
  const handleOtpRequest = async () => {  
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(`${AuthenticationandUsermanagement}/auth_otp_api/auth/email-otp/`, { email });
      if (response.status === 200) {
        sessionStorage.setItem("user_email", email);
        setOtpSent(true);
        setMessage("OTP sent successfully to your email.");
        setPopupMessage("OTP sent successfully.");
        setPopupType("success");
        setEmail(email);
        router.push(`/UserAuthentication/VerifyMail/${email}?from=forgetpassword`);
      } else {
        setMessage(response.data.message || "Failed to send OTP.");
        setPopupMessage("Failed to send OTP.");
        setPopupType("error");
        return;
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "An error occurred while sending OTP.");
      setPopupMessage("Failed to send OTP.");
      setPopupType("error");
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPasswordValue = e.target.value;
    setNewPassword(newPasswordValue);
    const strength = getPasswordStrength(newPasswordValue);
    setPasswordStrength(strength);
  };
  // Handle Password Update
  const handleClosePopup = () => setPopupMessage("");
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!isOtpVerified) {
      setPopupMessage("New password should not be the same as the current password.");
      setPopupType("error");
      return; 
    }
    // Validate password using validatePassword
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
       
        setPopupMessage("Invalid Password Format");
        setPopupType("error");
        return;
    }
    if (newPassword !== confirmPassword) {
      setPopupMessage("Password do not Match.");
      setPopupType("error");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${AuthenticationandUsermanagement}/auth_user_api/auth/updatepassword/`, {
        email,
        newPassword,
      });
      if (response.status === 200) {
        setPopupMessage("Password updated Successfuly.");
        setPopupType("success");
        sessionStorage.removeItem("user_email");
        sessionStorage.removeItem("otp_verified");
        router.push("/UserAuthentication/Signin");
      } else {
        setPopupMessage("Failed to updated Successfuly.");
        setPopupType("error");
        return;
      }
    } catch (error: any) {
      setPopupMessage("Failed to updated Successfuly.");
        setPopupType("error");
        return;
    } finally {
      setLoading(false);
    }
  };
  // Password Visibility Toggle Icon
  const EyeIcon = ({ visible, toggle }: { visible: boolean; toggle: () => void }) => (
    <span onClick={toggle} className={styles.eyeIcon}>
      {visible ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#aaa">
          <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#aaa">
          <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
        </svg>
      )}
    </span>
  );
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Forgot Password</h2>
        {/* Email Field */}
        <div className={styles.inputgroup}>
          <label className={styles.label}>Email</label>
          <div className={styles.inputwrapper}>
            <input
              type="email"
              value={email}
              className={styles.input}
              onChange={(e) => setEmail(e.target.value)}
             disabled={isOtpVerified || otpSent} />
            <button type="button" className={styles.verifybutton} onClick={handleOtpRequest} disabled={otpSent || loading }>
              {otpSent ? "OTP Sent" : "Verify"}
            </button>
          </div>
        </div>
        {/* New Password Field */}
        <div className={styles.inputgroup}>
          <label className={styles.label}>New Password</label>
          <div className={styles.inputwrapper}>
            <input
              type={showPassword.new ? "text" : "password"}
              value={newPassword}
              onChange={handlePasswordChange}
              // onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              disabled={!isOtpVerified}/>
            <EyeIcon visible={showPassword.new} toggle={() => setShowPassword({ ...showPassword, new: !showPassword.new })} />
          </div>
        </div>
        {/* Confirm Password Field */}
<div className={styles.inputgroup}>
  <label className={styles.label}>Confirm Password</label>
  <div className={styles.inputwrapper}>
    <input
      type={showPassword.confirm ? "text" : "password"}
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      className={`${styles.input} ${
        confirmPassword && newPassword !== confirmPassword ? styles.errorInput : ""}`}
      disabled={!isOtpVerified}/>
    <EyeIcon
      visible={showPassword.confirm}
      toggle={() =>
        setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}/>
  </div>
</div>
        {/* Submit Button */}
        <button type="submit" className={styles.submitbutton} onClick={handleSubmit} disabled={loading || !isOtpVerified}>
          {loading ? "Updating..." : "Update Password"}
        </button>

        {/* Error or Success Message */}
        {message && <p className={styles.message}>{message}</p>}
        {errors.general && <p className={styles.error}>{errors.general}</p>}
      </div>
      {popupMessage && (
          <PopupMessage message={popupMessage} onClose={handleClosePopup} type={popupType} />
        )}
    </div>
  );
};
export default ForgotPassword;
