"use client";
import React, { useState } from "react";
// import "./VerifyMail.css";
import axios from "axios";
import styles from "./VerifyMail.module.css";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FaEdit } from "react-icons/fa"; // Importing the edit icon
import PopupMessage from "@/app/Superadmin/Navbars/PopupMessage";

const VerifyMail: React.FC = () => {
  const searchParams = useSearchParams();
  const { email: encodedEmail } = useParams();
  const from = searchParams.get("from") || "signup";

  // Ensure email is always a string before decoding
  const email = encodedEmail ? decodeURIComponent(String(encodedEmail)) : "";
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState<boolean>(false);
  const [resendCount, setResendCount] = useState<number>(0);
  const [resendDisabled, setResendDisabled] = useState<boolean>(false);
  const successUrl = sessionStorage.getItem("success-url") ? sessionStorage.getItem("success-url") : "";
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [popupType, setPopupType] = useState<"error" | "success">("error");
  const UserAuthentication = process.env.NEXT_PUBLIC_AuthenticationandUsermanagement

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    // Move to the next input field if not the last one
    if (value !== "" && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };
  const closePopup = () => {
    setPopupMessage(null);
  };
  const handleOtpVerification = async () => {
    try {
      setMessage("");
  
      if (!email) {
        setMessage("Email is required.");
        return;
      }
  
      const otpString = Array.isArray(otp) ? otp.join("") : "";
      if (otpString.length !== 6) {
        setPopupMessage("Please enter a valid OTP.");
        setPopupType("error");
        return;
      }
  
      setLoading(true);
      console.log("Sending OTP:", otpString);
      console.log("Sending email:", email);
      console.log("From:", from);
  
      if (from === "forgetpassword") {
        const response = await axios.post(`${UserAuthentication}/auth_otp_api/auth/email-otp/`, 
          { email, otp: otpString });
        console.log("Response:", response);  
        if (response.status === 200) {
          // Redirect based on where the user came from
          sessionStorage.setItem("user_email", email);
          setPopupMessage("OTP Verified Successfuly.");
          setPopupType("success");
          console.log(from);
          router.push(`/UserAuthentication/ForgotPassword?otp_verified=true`);
        } else {
          setPopupMessage("Invalid OTP.");
          setPopupType("error");
          return;
        }
      } else if (from === "otp") {
        const response = await axios.post(`${UserAuthentication}/auth_otp_api/auth/email-otp/`, 
          { email, otp: otpString });
        console.log("Response:", response);  
        if (response.status === 200) {
          try {
            await axios.post(`${UserAuthentication}/auth_verification_api/verify-email/`, {
              email,
            });
            console.log("Email status updated to verified.");
          } catch (verifyError) {
            console.error("Failed to update email status:", verifyError);
            // Optional: setPopupMessage("Failed to update email status.");
          }
          // Redirect back to same page with success
          sessionStorage.setItem("user_email", email);
          setPopupMessage("OTP Verified Successfully.");
          setPopupType("success");
          router.push(`/otp?otp_verified=true`);
        } else {
          setPopupMessage("Invalid OTP.");
          setPopupType("error");
          return;
        }
      } else {
        const response = await axios.post(
          `${UserAuthentication}/auth_otp_api/loginwithotp/`,
          { email, otp: otpString }
        );
        if (response.data.success === "true") {
          // Redirect based on where the user came from
          console.log(from);
          console.log("OTP verified successfully!");
          setPopupMessage("OTP Verified successfully!");
          setPopupType("success");
          setResendDisabled(true); // Disable resend after successful verification
          setTimeout(() => router.push(`/UserAuthentication/SetupAccount/${email}`), 2000); // Redirect after 2 seconds
        } else {
          setPopupMessage("Invalid OTP.");
          setPopupType("error");
          return;
        }
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error.response?.data || error.message);
      setPopupMessage("An error occur during otp verification.");
      setPopupType("error");
      return;
    } finally {
      setLoading(false);
    }
  };
  
  const handleClosePopup = () => setPopupMessage("");
  const handleResendOtp = async () => {
    if (resendCount >= 3) {
      setPopupMessage("Too many requests. Please try again after 10 minutes.");
      setPopupType("success");
      return;
    }
    setLoading(true);
    setPopupMessage("");
    try {
      const response = await axios.post(
        `${UserAuthentication}/auth_otp_api/auth/resendotp/`,
        // "https://authenticationandusermanagement-281286704109.asia-east1.run.app/api/auth/resendotp/",
        { email }
      );
      if (response.data.success) {
        setPopupMessage("A new OTP has been sent to your email");
        setPopupType("success");
        setResendDisabled(true);
        setResendCount(resendCount + 1);
        setTimeout(() => setResendDisabled(false), 30000);
      } else {
        setPopupMessage( "Failed to resend OTP");
        setPopupType("error");
        return;
      }
    } catch (error: any) {
      setPopupMessage("An error occurred while resending OTP.");
      setPopupType("error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.verifycontainer}>
      {popupMessage && (
        <PopupMessage
          message={popupMessage}
          onClose={closePopup}
          type={
            popupMessage.includes("successfully") ? "success" :
              popupMessage.includes("Failed") ? "error" :
                "info"}/>)}
      <div className={styles.verifybox}>
        {message && (
          <p className={
              message.includes("successfully") ? "success-message" : "error-message"}>
            {message.includes("successfully") ? (
              message
            ) : (
              <button className={styles.errorbutton}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="red"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
                {message}
              </button>
            )}
          </p>
        )}
        <h1 className={styles.verifytitle}>Verify Your Mail ID</h1>
        <p className={styles.verifysubtitle}>
          Please enter the 6 digit code sent to <br /></p>
          <span  className={styles.verifyemail}>{email}{" "}</span>
          {/* <span>
            <FaEdit className={styles.editicon} onClick={() => router.back()} />
          </span> */}
        
        {/* OTP Input Fields */}
        <div className={styles.otpinputgroup}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onInput={(e) => {
                const value = e.currentTarget.value.replace(/[^0-9]/g, ""); // Only numbers
                handleChange(value, index);
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  if (!otp[index]) {

                    if (index > 0) {
                      handleChange("", index - 1);
                      const prevInput = document.getElementById(`otp-${index - 1}`);
                      prevInput?.focus();
                    }
                  } else {
                    handleChange("", index);
                  }
                }
              }}
              className={styles.otpinput}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>
        {/* Conditionally render error or success message */}

        <p className={styles.resendsection}>
  Didn’t receive a code?{" "}
  <a
    href="#"
    className={`${styles.resendlink} ${
      resendDisabled ? styles.disabled : ""
    }`}
    onClick={(e) => {
      e.preventDefault();
      if (!resendDisabled) {
        handleResendOtp();
        setOtp(Array(otp.length).fill(""));
      }
    }}
  >
    Resend OTP
  </a>
</p>
        {/* Next Button */}
        <button
          type="button"
          className={styles.nextbutton}
          onClick={handleOtpVerification}
          disabled={loading}
        >
          {loading ? "Loading..." : "Next"}
        </button>
      </div>
      {popupMessage && (
          <PopupMessage message={popupMessage} onClose={handleClosePopup} type={popupType} />
        )}
    </div>
  );
};
export default VerifyMail;
