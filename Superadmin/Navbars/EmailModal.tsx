import React from "react";
import styles from "./Profile.module.css";
import { color } from "highcharts";

interface EmailModalProps {
  userData: { email: string };
  newEmail: string;
  setNewEmail: (value: string) => void;
  handleCloseEmailModal: () => void;
  handleSendOtp: () => void;
  handleVerifyOtpAndUpdateEmail: () => void;
  emailError: string;
  validateEmail: (email: string) => boolean;
  otpSent: boolean;
  otp: string;
  otpError: string;
  otpSuccess: string;
  resendDisabled: boolean;
  blockResend: boolean;
  resendTimer: number;
  handleResendOtp: () => void;
  handleOtpChange: (index: number, value: string) => void;
  handleOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  otpInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
}

const EmailModal: React.FC<EmailModalProps> = ({
  userData,
  newEmail,
  setNewEmail,
  handleCloseEmailModal,
  handleSendOtp,
  handleVerifyOtpAndUpdateEmail,
  emailError,
  validateEmail,
  otpSent,
  otp,
  otpError,
  otpSuccess,
  resendDisabled,
  blockResend,
  resendTimer,
  handleResendOtp,
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
  otpInputRefs,
}) => {
  return (
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
            <input type="email" value={userData.email || "XYZ@gmail.com"} readOnly />
          </div>
          <div className={styles.formGroups}>
            <label>New Email</label>
            <input 
              type="email"
              placeholder="abc@gmail.com"
              className="custom-placeholder"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                if (!validateEmail(e.target.value)) {
                  // Show error if email is invalid
                }
              }}
              onBlur={() => {
                if (!validateEmail(newEmail)) {
                  // Show error if email is invalid
                }
              }}
            />
            {emailError && <p style={{ color: "red", fontSize: "14px" }}>{emailError}</p>}
          </div>

          {otpSent && (
            <div className={styles.otpSection}>
              <label>{otpSuccess && <p style={{ color: "#9acd32", fontSize: "16px" }}>{otpSuccess}</p>}Enter The OTP </label>
              <p>Please enter the 6-digit code sent to <span>{newEmail}</span></p>
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
              {otpError && <p style={{ color: "red", fontSize: "14px" }}>{otpError}</p>}
              <div className={styles.otpLinks}>
                <a href="#" onClick={handleResendOtp}>Didn't receive a code?</a>
                <a
                  href="#"
                  onClick={handleResendOtp}
                  className={resendDisabled || blockResend ? styles.disabledLink : styles.activeLink}
                >
                  Resend OTP {resendDisabled && !blockResend && <span className={styles.timer}>{`(${resendTimer}s)`}</span>}
                </a>
              </div>
            </div>
          )}

          <button type="button" className={styles.saveButton} onClick={handleSendOtp}>
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
  );
};

export default EmailModal;
