"use client";

import React, { useEffect, useState, useRef } from "react";
import Header from "../Navbars/Header";
import Sidebar from "../Navbars/Sidebar";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./Profile.module.css";
import PopupMessage from "../PopupMessage/PopupMessage";
const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
const AuthenticationandUsermanagement =
  process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;
interface UserData {
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  wallet_public_key: string;
  organization: string;
  usertype: string;
  created_at: string;
  updated_at: string;
  symmetric_key: string;
  profile: string;
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState({
    user_id: "",
    name: "",
    email: "",
    phone_number: "",
    wallet_public_key: "",
    organization: "",
    usertype: "",
    profile: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showChangeMobileModal, setShowChangeMobileModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [showChangeUsernameModal, setShowChangeUsernameModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newMobileNumber, setNewMobileNumber] = useState(""); // State for new mobile number
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [emailError, setEmailError] = useState(""); // Track email validation error
  const [otpError, setOtpError] = useState(""); // Track OTP validation error
  const [otpSuccess, setOtpSuccess] = useState("");
  const [mobileNumberError, setMobileNumberError] = useState<string | null>(
    null
  );
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(30);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [blockResend, setBlockResend] = useState(false);

  const closePopup = () => {
    setPopupMessage(null);
  };

  useEffect(() => {
    let timer: number;

    if (resendTimer > 0 && !blockResend) {
      timer = window.setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [resendTimer, blockResend]);

  useEffect(() => {
    if (newPassword && confirmPassword) {
      setPasswordMatch(newPassword === confirmPassword);
    } else {
      setPasswordMatch(false);
    }
  }, [newPassword, confirmPassword]);

  // useEffect(() => {
  //     const storedUserId = localStorage.getItem("user_id");
  //     if (storedUserId) {
  //         setUserData((prev) => ({ ...prev, user_id: storedUserId }));
  //     } else {
  //         console.error("No user_id found in localStorage");
  //         return;
  //     }

  //     const fetchUserData = async () => {
  //         try {
  //             const response = await axios.get(
  //                 `https://authenticationandusermanagement-281286704109.asia-east1.run.app/api/auth/profile/${storedUserId}/`
  //             );
  //             setUserData(response.data);
  //         } catch (error) {
  //             console.error("Error fetching user data:", error);
  //         }
  //     };

  //     fetchUserData();
  // }, []);
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUserData((prev) => ({ ...prev, user_id: storedUserId }));
    } else {
      console.error("No user_id found in localStorage");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          // `http://127.0.0.1:8000/api/auth/profile/${storedUserId}/`
          `${AuthenticationandUsermanagement}/auth_profile_api/profile/${storedUserId}/`
        );
        setUserData(response.data); // Ensure this includes the profile field
        console.log("Fetched user data:", response.data); // Debugging
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  const saveChanges = async () => {
    try {
      const response = await axios.put(
        // `https://authenticationandusermanagement-281286704109.asia-east1.run.app/api/auth/profile/update/${userData.user_id}/`,
        `${AdminManagement}/auth_profile_api/profile/update/${userData.user_id}/`,
        {
          name: userData.name,
          email: userData.email,
          phone_number: userData.phone_number,
        }
      );
      setUserData(response.data);
      setPopupMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setPopupMessage("Failed updating profile");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(userData.profile || "");
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleNewMobileNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewMobileNumber(e.target.value);
  };

  const handleSaveNewMobileNumber = async () => {
    if (newMobileNumber === userData.phone_number) {
      setMobileNumberError(
        "New mobile number should not be the same as the current mobile number."
      );
      return;
    }

    if (!validateMobileNumber(newMobileNumber)) {
      setMobileNumberError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setMobileNumberError(null); // Clear any previous error
    try {
      const response = await axios.put(
        // `https://authenticationandusermanagement-281286704109.asia-east1.run.app/api/auth/profile/update/${userData.user_id}/`,
        `${AdminManagement}/auth_profile_api/profile/update/${userData.user_id}/`,
        {
          phone_number: newMobileNumber,
        }
      );
      setUserData((prev) => ({ ...prev, phone_number: newMobileNumber }));
      setShowChangeMobileModal(false);
      setPopupMessage("Mobile Number updated successfully!");
    } catch (error) {
      setPopupMessage("Failed updating mobile number,please enter new number");
    }
  };
  const handleSendOtp = async () => {
    // Validate the email format
    if (!newEmail.trim()) {
      setEmailError("Please enter a valid email.");
      return;
    }

    if (newEmail === userData.email) {
      setEmailError("New email should not be the same as the current email.");
      return;
    }

    if (!validateEmail(newEmail)) {
      setEmailError("Please enter a valid email.");
      return;
    }

    // Clear any previous error messages
    setEmailError("");

    try {
      // Only proceed if the email is valid
      const response = await axios.post(
        `${AuthenticationandUsermanagement}/auth_otp_api/send_otp_for_email_change/`,
        {
          new_email: newEmail,
          user_id: userData.user_id,
        }
      );

      if (response.data.success) {
        setOtpSent(true);
        setOtpSuccess("OTP sent to your new email.");
        setPopupMessage("OTP sent to your new email.");
      } else {
        setPopupMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setOtpError("Failed to send OTP.");
    }
  };
  // const handleSendOtp = async () => {
  //     if (!newEmail.trim()) {
  //         setEmailError("Please enter a valid email.");
  //         return;
  //     }

  //     if (newEmail === userData.email) {
  //         setEmailError("New email should not be the same as the current email.");
  //         return;
  //     }

  //     if (!validateEmail(newEmail)) {
  //         setEmailError("Please enter a valid email.");
  //         return;
  //     }

  //     setEmailError("");

  //     try {
  //         const response = await axios.post(
  //             "http://127.0.0.1:8000/api/auth/send_otp_for_email_change/",
  //             {
  //                 new_email: newEmail,
  //                 user_id: userData.user_id,
  //             }
  //         );
  //         if (response.data.success) {
  //             setOtpSent(true);
  //             setOtpSuccess("OTP sent to your new email.");
  //             setPopupMessage("OTP sent to your new email.");
  //             // setPopupMessage("OTP sent to your new email.");
  //         } else {
  //             // setPopupMessage(response.data.message);
  //         }
  //     } catch (error) {
  //         // console.error("Error sending OTP:", error);
  //         // setPopupMessage("Failed to send OTP.");
  //         setOtpError("Failed to send OTP.");
  //     }
  // };
  // Resend OTP function
  const handleResendOtp = async () => {
    if (blockResend) {
      setOtpError(
        "You have exceeded the resend limit. Please try again after 5 minutes."
      );
      return;
    }

    if (resendAttempts >= 3) {
      setBlockResend(true);
      setOtpError(
        "You have exceeded the resend limit. Please try again after 5 minutes."
      );
      setTimeout(() => {
        setBlockResend(false);
        setResendAttempts(0);
      }, 5 * 60 * 1000);
      return;
    }

    try {
      const response = await axios.post(
        // "http://127.0.0.1:8000/api/auth/send_otp_for_email_change/",
        `${AuthenticationandUsermanagement}/auth_otp_api/send_otp_for_email_change/`,
        {
          new_email: newEmail,
          user_id: userData.user_id,
        }
      );
      if (response.data.success) {
        setOtpSent(true);
        setResendDisabled(true);
        setResendTimer(30);
        setResendAttempts((prev) => prev + 1);
        setPopupMessage("OTP resent to your new email.");
        setOtpSuccess("OTP resent to your new email.");
      } else {
        setPopupMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setPopupMessage("Failed to resend OTP.");
    }
  };

  const handleCloseEmailModal = () => {
    setShowChangeEmailModal(false);
    setResendDisabled(true);
    setResendTimer(30);
    setResendAttempts(0);
    setBlockResend(false);
  };

  const handleVerifyOtpAndUpdateEmail = async () => {
    console.log("OTP Value:", otp, "Length:", otp.length);
    if (otp.trim().length !== 6) {
      setOtpError("Enter the correct 6-digit OTP.");
      setPopupMessage("successfully");
      return;
    }

    setOtpError("");

    try {
      const response = await axios.post(
        // "http://127.0.0.1:8000/api/auth/verify_otp_and_update_email/",
        `${AuthenticationandUsermanagement}/auth_otp_api/verify_otp_and_update_email/`,
        {
          new_email: newEmail,
          otp: otp,
          user_id: userData.user_id,
        }
      );
      if (response.data.success) {
        setEmailChangeSuccess(true);
        setPopupMessage("Email updated successfully.");
        setUserData((prev) => ({ ...prev, email: newEmail }));
        setShowChangeEmailModal(false);
      } else {
        setOtpError("Failed to update email. Incorrect OTP.");
        setPopupMessage("Failed to update email. Incorrect OTP.");
      }
    } catch (error) {
      // console.error("Error verifying OTP and updating email:", error);
      setOtpError("Incorrect OTP");
    }
  };

  const handleSaveNewUsername = async () => {
    if (!newUsername.trim()) {
      setPopupMessage("Username cannot be empty.");
      return;
    }

    try {
      const response = await axios.put(
        // `https://authenticationandusermanagement-281286704109.asia-east1.run.app/api/auth/profile/update/${userData.user_id}/`,
        `${AdminManagement}/auth_profile_api/profile/update/${userData.user_id}/`,
        {
          name: newUsername,
        }
      );
      setUserData((prev) => ({ ...prev, name: newUsername }));
      setShowChangeUsernameModal(false);
      setPopupMessage("Username updated successfully!");
    } catch (error) {
      console.error("Error updating username:", error);
      setPopupMessage("Failed to update username.");
    }
  };
  const handleChangePassword = async () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (newPassword === currentPassword) {
      setPasswordError(
        "New password should not be the same as the current password.Please try again."
      );
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "Password must be at least 8 characters long, include 1 uppercase, 1 lowercase, 1 number, and 1 special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match. Please try again."
      );
      return;
    }

    try {
      const response = await axios.post(
        // "http://127.0.0.1:8000/api/auth/change_password/",
        `${AuthenticationandUsermanagement}/auth_user_api/change_password`,
        {
          email: userData.email,
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }
      );

      if (response.data.success) {
        setPopupMessage("Password updated successfully.");
        setShowChangePasswordModal(false);
        setPasswordError(""); // Clear error on success
      } else {
        setPopupMessage(response.data.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPopupMessage("Failed to update password.");
    }
  };

  // Function to validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validateMobileNumber = (mobileNumber: string): boolean => {
    const mobileRegex = /^\+91\s?[6-9]\d{9}$/;
    return mobileRegex.test(mobileNumber);
  };

  // Function to handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      otpInputRefs.current[index - 1]
    ) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData);
      otpInputRefs.current[5]?.focus();
    }
  };
  const handleCloseMobileModal = () => {
    setShowChangeMobileModal(false);
    setMobileNumberError(null);
  };
  const handleCloseUsernameModal = () => {
    setShowChangeUsernameModal(false);
    setNewUsername("");
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);

    try {
      const response = await axios.post(
        // `http://127.0.0.1:8000/api/auth/profile/upload-image/${userData.user_id}/`,
        `${AuthenticationandUsermanagement}/auth_profile_api/auth/profile/upload-image/${userData.user_id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.image_url) {
        setUserData((prev) => ({ ...prev, profile: response.data.image_url }));
        localStorage.setItem("profile_image", response.data.image_url);
        setPopupMessage("Profile image updated successfully!");
        console.log("Updated userData:", {
          ...userData,
          profile: response.data.image_url,
        }); // Debugging
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setPopupMessage("Failed to upload profile image.");
    }
  };

  return (
    <div className={styles.dashboard}>
      <Header searchQuery={searchQuery} onSearch={handleSearch} />
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          {/* Profile Section */}
          <div className={styles.profileContainer}>
            {/* My Profile Heading */}
            <div className={styles.profileHeading}>My Profile</div>
            <div className={styles.profileContainer1}>
              {/* Left Section */}
              <div className={styles.profileHeader}>
                {/* Profile Image or Avatar */}
                <div className={styles.profileImageContainer}>
                  {userData.profile ? (
                    <img
                      src={userData.profile}
                      alt="Profile"
                      className={styles.profileImage}
                    />
                  ) : (
                    <div className={styles.profileAvatar}>
                      {userData.name ? (
                        getInitials(userData.name)
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="90px"
                          viewBox="0 -960 960 960"
                          width="90px"
                          fill="#ffffff"
                        >
                          <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" />
                        </svg>
                      )}
                    </div>
                  )}
                  {/* Edit Icon */}
                  <div
                    className={styles.editProfileIcon}
                    onClick={() =>
                      document.getElementById("profileImageInput")?.click()
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#000000"
                    >
                      <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z" />
                    </svg>
                    <input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                  </div>
                  <div className={styles.profileInfo}>
                    <h2 className={styles.profileName}>
                      {userData.name || "User Name"}
                    </h2>
                    <div className={styles.profileRole}>
                      <img
                        src="/usertype.png"
                        alt="Profile"
                        className={styles.roleIcon}
                      />
                      <span>{userData.usertype || "Loading User Type..."}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div className={styles.profileForm}>
                {/* <label className={styles.formLabel} htmlFor="walletId">
                  Organization
                </label> */}
                <div className={styles.inputGroup}>
                  {/* <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      id="walletId"
                      className={styles.formInput}
                      value={userData.organization || "null"}
                      readOnly
                    />
                    <div className={styles.tooltipContainer}>
                      <span className={styles.editIcon} onClick={handleCopy}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#aaa"
                        >
                          <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                        </svg>
                      </span>
                      {isCopied && (
                        <span className={styles.tooltip}>Copied!</span>
                      )}
                    </div>
                  </div> */}
                </div>
                <label className={styles.formLabel} htmlFor="name">
                  Username
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="name"
                    className={styles.formInput}
                    value={userData.name || ""}
                    readOnly
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#aaa"
                    className={styles.editIcon}
                    onClick={() => setShowChangeUsernameModal(true)}
                  >
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
                  </svg>
                </div>

                <label className={styles.formLabel} htmlFor="email">
                  Email Id
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    id="email"
                    className={styles.formInput}
                    value={userData.email || ""}
                    onChange={handleInputChange}
                    readOnly
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#aaa"
                    className={styles.editIcon}
                    onClick={() => setShowChangeEmailModal(true)}
                  >
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
                  </svg>
                </div>

                {/* <label className={styles.formLabel} htmlFor="phone_number">
                  Mobile Number
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="tel"
                    id="phone_number"
                    className={styles.formInput}
                    value={userData.phone_number || ""}
                    onChange={handleInputChange}
                    readOnly
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#aaa"
                    className={styles.editIcon}
                    onClick={() => setShowChangeMobileModal(true)}
                  >
                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
                  </svg>
                </div> */}

                <div className={styles.profileActions}>
                  <button className={styles.actionButton} onClick={saveChanges}>
                    Save Changes
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => setShowChangePasswordModal(true)}
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {popupMessage && (
        <PopupMessage
          message={popupMessage}
          onClose={closePopup}
          type={
            popupMessage.includes("successfully")
              ? "success"
              : popupMessage.includes("Failed")
              ? "error"
              : "info"
          }
        />
      )}
      {showChangeUsernameModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.changeUsernameBox}>
            <div className={styles.closeIconContainer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
                className={styles.closeIcon}
                onClick={handleCloseUsernameModal}
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </div>
            <h2>Change Username</h2>
            <form>
              {/* <div className={styles.formGroup}>
                                <label>Current Username</label>
                                <input
                                    type="text"
                                    value={userData.name || ""}
                                    readOnly
                                />
                            </div> */}
              <div className={styles.formGroup}>
                <label>New Username</label>
                <input
                  type="text"
                  placeholder="Enter new username"
                  value={newUsername || userData.name || ""}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSaveNewUsername}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {showChangeEmailModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.changeEmailBox}>
            <div className={styles.closeIconContainer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
                className={styles.closeIcon}
                onClick={handleCloseEmailModal}
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </div>
            <h2>Change Email</h2>
            <form>
              <div className={styles.formGroup}>
                <label>Current Email</label>
                <input
                  type="email"
                  value={userData.email || "XYZ@gmail.com"}
                  readOnly
                />
              </div>
              <div className={styles.formGroup}>
                <label>New Email</label>
                <div>
                  {/* <input
                                        type="email"
                                        placeholder="abc@gmail.com"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                    // Trigger email validation on blur
                                    /> */}
                  <input
                    type="email"
                    placeholder="abc@gmail.com"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      if (!validateEmail(e.target.value)) {
                        setEmailError("Please enter a valid email.");
                      } else {
                        setEmailError("");
                      }
                    }}
                    onBlur={() => {
                      if (!validateEmail(newEmail)) {
                        setEmailError("Please enter a valid email.");
                      }
                    }}
                  />
                  {/* <button
                                        type="button"
                                        className={styles.verifyButton}
                                        onClick={handleSendOtp} disabled
                                    >
                                        Verify
                                    </button> */}
                </div>
                {emailError && (
                  <p style={{ color: "red", fontSize: "14px" }}>{emailError}</p>
                )}
              </div>
              {otpSent && (
                <div className={styles.otpSection}>
                  <label>
                    {otpSuccess && (
                      <p style={{ color: "#9acd32", fontSize: "16px" }}>
                        {otpSuccess}
                      </p>
                    )}
                    Enter The OTP{" "}
                  </label>
                  <p>
                    Please enter the 6-digit code sent to{" "}
                    <span>{newEmail}</span>
                  </p>
                  <div className={styles.otpInputContainer}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        className={styles.otpInput}
                        value={otp[index] || ""}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p style={{ color: "red", fontSize: "14px" }}>{otpError}</p>
                  )}
                  <div className={styles.otpLinks}>
                    <a href="#" onClick={handleResendOtp}>
                      Didn't receive a code?
                    </a>
                    <a
                      href="#"
                      onClick={handleResendOtp}
                      className={
                        resendDisabled || blockResend
                          ? styles.disabledLink
                          : styles.activeLink
                      }
                    >
                      Resend OTP{" "}
                      {resendDisabled && !blockResend && (
                        <span
                          className={styles.timer}
                        >{`(${resendTimer}s)`}</span>
                      )}
                    </a>
                  </div>
                </div>
              )}
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSendOtp}
                // style={{ display: otpSent ? "none" : "block" }} // Hide Verify button after OTP is sent
              >
                Send OTP
              </button>
              {otpSent && (
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleVerifyOtpAndUpdateEmail}
                  disabled={!otpSent || otp.length !== 6}
                >
                  Save Changes
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {showChangeMobileModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.changeMobileBox}>
            <div className={styles.closeIconContainer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
                className={styles.closeIcon}
                onClick={handleCloseMobileModal}
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </div>
            <div className={styles.formContainer}>
              <h2>Change Mobile Number</h2>
              <form>
                <div className={styles.formGroup}>
                  <label htmlFor="currentMobile">Current Mobile Number</label>
                  <input
                    type="text"
                    id="currentMobile"
                    placeholder="+91 9885654657"
                    value={userData.phone_number || ""}
                    readOnly
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="newMobile">New Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter new mobile number"
                    value={newMobileNumber}
                    onChange={(e) => setNewMobileNumber(e.target.value)}
                  />
                  {mobileNumberError && (
                    <p className={styles.errorMessage}>{mobileNumberError}</p>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleSaveNewMobileNumber}
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.changePasswordBox}>
            <div className={styles.closeIconContainer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#000000"
                className={styles.closeIcon}
                onClick={() => setShowChangePasswordModal(false)}
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </div>
            <h2 className={styles.title}>Change Password</h2>
            {/* Current Password */}
            <div className={styles.inputGroup1}>
              <label>Current password</label>
              <div className={styles.inputWrapper1}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className={styles.inputField}
                  value={currentPassword}
                  placeholder="Current Password"
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={styles.eyeIcon}
                >
                  {showCurrentPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#aaa"
                    >
                      <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#aaa"
                    >
                      <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                    </svg>
                  )}
                </span>
              </div>
            </div>

            {/* New Password */}
            <div className={styles.inputGroup1}>
              <label>New password</label>
              <div className={styles.inputWrapper1}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  className={styles.inputField}
                  value={newPassword}
                  placeholder="New Password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={styles.eyeIcon}
                >
                  {showNewPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#aaa"
                    >
                      <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#aaa"
                    >
                      <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                    </svg>
                  )}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className={styles.inputGroup1}>
              <label>Confirm password</label>
              <div className={styles.inputWrapper1}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={styles.inputField}
                  value={confirmPassword}
                  placeholder="Confirm Password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#aaa"
                    >
                      <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#aaa"
                    >
                      <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                    </svg>
                  )}
                </span>
              </div>
              {confirmPassword && (
                <p
                  style={{
                    color: passwordMatch ? "green" : "red",
                    fontSize: "14px",
                  }}
                >
                  {passwordMatch
                    ? "Passwords match!"
                    : "Passwords do not match."}
                </p>
              )}
            </div>

            {passwordError && (
              <p className={styles.errorMessage}>{passwordError}</p>
            )}

            <button
              className={styles.submitButton}
              onClick={handleChangePassword}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
