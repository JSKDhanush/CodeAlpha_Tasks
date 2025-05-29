"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./ChangePassword.module.css";
import PopupMessage from "@/app/DataVerifier/Navbars/PopupMessage";
import validatePassword, { getPasswordStrength } from "../../../utils/validatePassword";
import PasswordInput from "./components/PasswordInput";
// Fetch environment variable
const AuthenticationandUsermanagement = process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;
const ChangePassword = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    user_id: "",
    name: "",
    email: "",
    phone_number: "",
    wallet_public_key: "",
    usertype: "",
    profile: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState<"error" | "success">("error");
  const [passwordStrength, setPasswordStrength] = useState("");
  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  // Close popup message
  const handleClosePopup = () => setPopupMessage("");
  // Toggle password visibility
  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  // Fetch user data when component mounts
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      console.error("No user_id found in localStorage");
      return;
    }
    setUserData((prev) => ({ ...prev, user_id: storedUserId }));
    fetchUserData(storedUserId);
  }, []);
  const fetchUserData = async (userId: string) => {
    try {
      const { data } = await axios.get(
        `${AuthenticationandUsermanagement}/auth_profile_api/auth/profile/${userId}/`
      );
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  // check password strength
const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPasswordValue = e.target.value;
    setNewPassword(newPasswordValue);
    const strength = getPasswordStrength(newPasswordValue);
    setPasswordStrength(strength);
  };
  // Handle API requests (Change Password or Update Reset Password)
  const handleApiRequest = useCallback(async (url: string, payload: object) => {
    try {
      const { data, status } = await axios.post(url, payload);
      if (status === 200) {
        setPopupMessage("Password updated successfully.");
        setPopupType("success");
        setTimeout(() => router.push("/WalletCreation"), 2000);
      } else {
        setPopupMessage(data.message || "An error occurred.");
        setPopupType("error");
      }
    } catch (error) {
      console.error("API error:", error);
      setPopupMessage("Failed to update password.");
      setPopupType("error");
    }
  }, [router]);
  // Change Password
  const handleChangePassword = async () => {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setPopupMessage("Invalid Password Format");
      setPopupType("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPopupMessage("New password and confirm password do not match.");
      setPopupType("error");
      return;
    }
    if (newPassword === currentPassword) {
      setPopupMessage("New password should not be the same as the current password.");
      setPopupType("error");
      return;
    }
    await handleApiRequest(`${AuthenticationandUsermanagement}/auth_user_api/auth/change_password/`, {
      email: userData.email,
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }; 
  const handlePasswordValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPasswordValue = e.target.value;
      setNewPassword(newPasswordValue);
      const strength = getPasswordStrength(newPasswordValue);
      setPasswordStrength(strength);
    };
  // Skip Password Change and Update Reset Password
  const handleSkipPasswordChange = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      console.error("User ID not found in local storage.");
      return;
    }
    router.back();
  };
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.changePasswordBox}>
        <h2 className={styles.title}>Change Password</h2>

        {/* Current Password */}
        <PasswordInput
          label="Current Password"
          value={currentPassword}
          showPassword={showPassword.current}
          onChange={(e) => setCurrentPassword(e.target.value)}
          toggleVisibility={() => togglePasswordVisibility("current")}
        />
        {/* New Password */}
        <PasswordInput
          label="New Password"
          value={newPassword}
          showPassword={showPassword.new}
          onChange={(e) => {
            handlePasswordChange(e);
            // checkPasswordStrength(e.target.value)
            handlePasswordValidation
          }}
          toggleVisibility={() => togglePasswordVisibility("new")}
        />
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          showPassword={showPassword.confirm}
          onChange={(e) => setConfirmPassword(e.target.value)}
          toggleVisibility={() => togglePasswordVisibility("confirm")}/>
        {/* Action Buttons */}
        <div className={styles.submitButton}>
          <button type="button" className={styles.btnSave} onClick={handleChangePassword}>
            Save Changes
          </button>
          </div> 
        {/* Popup Message */}
        {popupMessage && (
          <PopupMessage message={popupMessage} onClose={handleClosePopup} type={popupType} />
        )}
      </div>
    </div>
  );
};
export default ChangePassword;
