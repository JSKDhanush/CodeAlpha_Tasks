import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./profilepopup.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import EmailModal from "../Navbars/EmailModal";
import PasswordModal from "../Navbars/PasswodModal";
import ErrorBoundary from "@/components/ErrorBoundary";

interface ProfilePopupProps {
  // email: string;
  // password: string;
  onClose: () => void;
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({
  password: initialPassword,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(initialPassword);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const AuthenticationandUsermanagement = "http://127.0.0.1:8000";
  const [user_id, setUser_id] = useState("");
  const [errorMessage, setErrorMessage] = useState<boolean>(false);

  // Email modal state
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [blockResend, setBlockResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  // Password modal state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
    const storedUser_id = localStorage.getItem("user_id");
    if (storedUser_id) {
      setUser_id(storedUser_id);
    }
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOtp = async () => {
    if (!validateEmail(newEmail)) {
      setEmailError("Invalid email format");
      return;
    }
    setEmailError("");
    console.log("Sending OTP to:", newEmail, user_id);
    try {
      const response = await axios.post(
        `${AuthenticationandUsermanagement}/auth_otp_api/auth/send_otp_for_email_change/`,
        {
          new_email: newEmail,
          user_id: user_id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setOtpSent(true);
      }
    } catch (error) {
      setEmailError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtpAndUpdateEmail = async () => {
    if (otp.length !== 6) {
      setOtpError("Invalid OTP");
      return;
    }
    try {
      const response = await axios.post(
        `${AuthenticationandUsermanagement}/auth_otp_api/auth/verify_otp_and_update_email/`,
        {
          new_email: newEmail,
          otp: otp,
          user_id: user_id,
        }
      );
      if (response.status === 200) {
        setEmail(newEmail);
        localStorage.setItem("email", newEmail);
        setOtpSuccess(response.data.message);
        setShowChangeEmailModal(false);
      } else {
        setOtpError("Failed to verify OTP. Please try again.");
      }
    } catch (error) {
      setOtpError("Failed to verify OTP. Please try again.");
    }
  };
  // auth/change_password/
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post(
        `${AuthenticationandUsermanagement}/auth_user_api/auth/change_password/`,
        {
          email,
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
          user_id,
        }
      );
      if (response.status === 200) {
        setPassword(newPassword);
        setShowChangePasswordModal(false);
      } else {
        setPasswordError("Failed to change password.");
      }
    } catch (error) {
      setPasswordError("An error occurred. Please try again.");
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
          <h2 className="text-red-500 text-xl font-bold">
            Something went wrong. Please try again later
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Reload Page
          </button>
        </div>
      }
    >
      <div className={styles.popupOverlay}>
        {!(showChangeEmailModal || showChangePasswordModal) && (
          <div className={styles.popupContent}>
            <h2>Edit Profile</h2>

            <div className={styles.fieldGroup}>
              <span>{email}</span>
              <button
                className={styles.editButton}
                onClick={() => setShowChangeEmailModal(true)}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
            </div>

            <button
              className={styles.changePasswordLink}
              onClick={() => setShowChangePasswordModal(true)}
            >
              Change Password
            </button>

            <div className={styles.buttonGroup}>
              <button className={styles.cancelButton} onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
        {showChangeEmailModal && (
          <EmailModal
            userData={{ email }}
            newEmail={newEmail}
            setNewEmail={setNewEmail}
            handleCloseEmailModal={() => setShowChangeEmailModal(false)}
            handleSendOtp={handleSendOtp}
            handleVerifyOtpAndUpdateEmail={handleVerifyOtpAndUpdateEmail}
            emailError={emailError}
            validateEmail={validateEmail}
            otpSent={otpSent}
            otp={otp}
            otpError={otpError}
            otpSuccess={otpSuccess}
            resendDisabled={resendDisabled}
            blockResend={blockResend}
            resendTimer={resendTimer}
            handleResendOtp={() => {}}
            handleOtpChange={(index, value) => {
              const newOtp = otp.split("");
              newOtp[index] = value;
              setOtp(newOtp.join(""));
            }}
            handleOtpKeyDown={() => {}}
            handleOtpPaste={() => {}}
            otpInputRefs={otpInputRefs}
          />
        )}

        {showChangePasswordModal && (
          <PasswordModal
            showCurrentPassword={showCurrentPassword}
            setShowCurrentPassword={setShowCurrentPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            passwordMatch={passwordMatch}
            passwordError={passwordError}
            setShowChangePasswordModal={setShowChangePasswordModal}
            handleChangePassword={handleChangePassword}
            // onClose={() => setShowChangePasswordModal(false)}
            // onSave={(newPassword) => {
            //     setPassword(newPassword);
            //     setShowChangePasswordModal(false);
            // }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ProfilePopup;
