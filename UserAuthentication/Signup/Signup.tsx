"use client";
import React, { useEffect, useState } from "react";
import styles from "./Signup.module.css"; // Importing the module CSS file
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { gapi } from "gapi-script";
import { jwtDecode } from 'jwt-decode';
import PopupMessage from "../../Superadmin/Navbars/PopupMessage";

const AuthenticationandUsermanagement = process.env.NEXT_PUBLIC_AuthenticationandUsermanagement

const Signup: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>(""); // Unified message state
  const [isEmailOrPhoneValid, setIsEmailOrPhoneValid] = useState<boolean>(false); // Initial state as false
  const [resendDisabled, setResendDisabled] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const CLIENT_ID = "850360713446-guceuvbo8fhefehketbr4l2slji9eidb.apps.googleusercontent.com";
  const Loadingspinner = dynamic(() => import('../../assets/loadingspinner'), { ssr: false });
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initClient = () => {
        gapi.client.init({
          clientId: CLIENT_ID,
          scope: "email",
        });
      };
      gapi.load("client:auth2", initClient);
    }
  }, []);

  const closePopup = () => {
    setPopupMessage(null);
  };

  // Function to validate email or phone number
  const validateEmailOrPhone = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex for email
    const phoneRegex = /^[0-9]{10}$/; // Regex for 10-digit phone numbers
    return input.length > 0 && (emailRegex.test(input) || phoneRegex.test(input)); // Ensure input is not empty
  };

  // Function to handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim(); // Trim spaces from input
    setEmail(input);

    if (validateEmailOrPhone(input)) {
      setIsEmailOrPhoneValid(true);
      setErrorMessage(""); // Clear error message if valid
    } else {
      setIsEmailOrPhoneValid(false);
      setErrorMessage("Please enter a valid email or 10-digit phone number."); // Set error message
    }
  };

  const handleOtpRequest = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter a valid input."); // Display error message for empty input
      return;
    }

    if (!isEmailOrPhoneValid) {
      setErrorMessage("Please enter a valid email or 10-digit phone number."); // Display error message for invalid input
      return;
    }

    setLoading(true);
    setErrorMessage(""); // Clear any previous messages
    try {
      const response = await axios.post(`${AuthenticationandUsermanagement}/auth_otp_api/auth/loginwithotp/`, { email }); // Correct URL
      if (response.data.success) {
        setOtpSent(true);
        setPopupMessage("OTP sent successfully to your email."); // Success message
        setResendDisabled(true);
        setTimeout(() => setResendDisabled(false), 30000);
        router.push(`/UserAuthentication/VerifyMail/${email}`);
      } else {
        setErrorMessage(response.data.message || "Failed to send OTP."); // Error message
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "An error occurred while sending OTP."); // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const auth2 = gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      const idToken = googleUser.getAuthResponse().id_token;

      // Decode JWT token to extract user details
      const decoded: any = jwtDecode(idToken);
      const email = decoded.email;
      const name = decoded.name;

      console.log("Decoded Email:", email);
      console.log("Decoded Name:", name);

      // Store user details in localStorage
      localStorage.setItem("user_email", email);
      localStorage.setItem("usertype", name);

      // Store email in sessionStorage
      sessionStorage.setItem("email", email);

      console.log("Email stored in sessionStorage:", sessionStorage.getItem("email"));

      // Send email to backend for validation using axios
      const response = await axios.post(`${AuthenticationandUsermanagement}/auth_user_api/auth/googleSignup/`, { email });

      if (response.data.exists) {
        // If user exists, redirect to Sign-in page
        router.push('/');
      } else {
        // If user does not exist, redirect to Setup Account page
        router.push(`/UserAuthentication/SetupAccount/${email}`);
      }
    } catch (error) {
      console.error("Google login error:", error);
      setErrorMessage("An error occurred while logging in with Google.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 800); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="body">
      <>
      {showLoader ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width:'100%',
            margin:'0 auto',
            backgroundColor: '#000',
            zIndex: 9999,
          }}
        >
          <Loadingspinner />
        </div>
      ):(
        <>
        <div className={styles["main-container"]}>
          <div className={styles["left-section"]}>
            <div className={styles["signin-container"]}>
              {popupMessage && (
                <PopupMessage
                  message={popupMessage}
                  onClose={closePopup}
                  type={
                    popupMessage.includes("successfully") ? "success" :
                      popupMessage.includes("Failed") ? "error" :
                        "info"
                  }
                />
              )}
              <div className={styles["signup-box"]}>
                <div className={styles["logo"]}>
                  <img src="https://res.cloudinary.com/dolhqxgju/image/upload/v1743070827/q9pto9iinemebbkex6gl.png" alt="Pehachain Logo" className={styles["logo-image"]} />
                  <span className={styles["logo-text"]}>Pehachain</span>
                </div>

                <h2 className={styles["signuptitle"]}>Sign Up</h2>

                <div className={`${styles["inputgroup"]} ${errorMessage ? styles["error"] : ""}`}>
                  <div className={styles["inputfield-wrapper"]}>
                    <input
                      type="text"
                      className={styles["inputfield"]}
                      id="email"
                      value={email}
                      onChange={handleInputChange}
                      required
                      placeholder="Email ID / Phone Number"
                    />
                    <label htmlFor="email" className={styles["inputlabel"]}>
                      Email ID / Phone Number
                    </label>
                  </div>
                  {/* Display the unified errorMessage */}
                  {errorMessage && <span className={styles["error-message"]}>{errorMessage}</span>}
                </div>
                <button
                  className={styles["signupbutton"]}
                  onClick={handleOtpRequest}
                  disabled={loading} // Button only disabled when loading
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
                
                <p className={styles["signintext"]}>
                  Already have an account?{" "}
                  <a href="/UserAuthentication/Signin" className={styles["signin-link"]}>
                    Sign in
                  </a>
                </p>
                <div className={styles["divider"]}>
                  <hr />OR<hr />
                </div>
                <button className={styles["googlebutton"]} onClick={handleGoogleLogin}>
                  <img src="/images/google.png" alt="Google Logo" className={styles["gbutton-icon"]} />
                  Continue with Google
                </button>
                <p className={styles["terms"]}>
                  By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Our Policies</a>
                </p>
              </div>
            </div>
          </div>
          <div className={styles["right-section"]}>
            <img
              src="https://res.cloudinary.com/dolhqxgju/image/upload/v1742306181/Downloader.la_-67d91ee353076_1_ledonk.png" // Replace with your image path
              alt="Background"
              className={styles["right-image"]}
            />
          </div>
        </div>
        </>
      )}
      </>
    </div>
  );
};

export default Signup;