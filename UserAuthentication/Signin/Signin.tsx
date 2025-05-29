"use client";
import React, { useEffect, useState } from "react";
import "./Signin.css";
import dynamic from "next/dynamic";
import Image from "next/image";
import { IoEyeOff, IoEye } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { gapi } from "gapi-script";
import PopupMessage from "../../Superadmin/Navbars/PopupMessage";
const AuthenticationandUsermanagement =
  process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;

const SignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const CLIENT_ID =
    "850360713446-guceuvbo8fhefehketbr4l2slji9eidb.apps.googleusercontent.com";
  const [errors] = useState<{
    emailOrMobile?: string;
    password?: string;
    general?: string;
  }>({});
  const Loadingspinner = dynamic(() => import("../../assets/loadingspinner"), {
    ssr: false,
  });
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof gapi !== "undefined") {
      const initClient = () => {
        gapi.client.init({
          clientId: CLIENT_ID,
          scope: "email",
        });
      };
      gapi.load("client:auth2", initClient);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const signInTitle =
    screenWidth <= 600 ? "Sign In" : "Continue to your Account";

  const validateEmailOrPhone = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    if (emailRegex.test(value)) {
      return true;
    }
    if (phoneRegex.test(value)) {
      return true;
    }
    return "Please enter a valid email or a 10-digit phone number.";
  };

  const closePopup = () => {
    setPopupMessage(null);
  };

  const redirectUser = (usertype: string) => {
    const allowedTypes = [
      "Data_Owner",
      "Verifier",
      "Seeker",
      "Admin-Seeker",
      "Admin-Verifier",
    ];
    if (allowedTypes.includes(usertype)) {
      router.push("/WalletCreation");
    } else {
      router.push("/Superadmin/Dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Step 1: Make sure the user is signed in with Google
      const auth2 = gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      const idToken = googleUser.getAuthResponse().id_token;

      // Log to ensure we have the idToken and user details
      console.log("Google User Details:", googleUser);
      console.log("ID Token:", idToken);

      // Step 2: Send the idToken to the backend for verification
      const response = await fetch(
        `${AuthenticationandUsermanagement}/auth_user_api/auth/google-login/`,
        // "http://127.0.0.1:8002/api/auth/google-login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken, // Send the ID Token for validation
          }),
        }
      );

      // Step 3: Parse the response
      const data = await response.json();
      console.log("Backend Response:", data); // Log the full response from the backend

      if (response.ok) {
        const { user_id, usertype, email, name, phone_number, organization } =
          data;
        setPopupMessage("Login successfull");
        // Step 4: Store user details in localStorage and email in sessionStorage
        localStorage.setItem("user_id", user_id);
        localStorage.setItem("user_type", usertype);
        localStorage.setItem("user_name", name);
        localStorage.setItem("organization", organization);
        sessionStorage.setItem("email", email);

        sessionStorage.setItem("phone_number", phone_number);
        console.log(usertype);
        console.log(
          "User Name stored in localStorage:",
          localStorage.getItem("user_name")
        );

        redirectUser(usertype);
      } else if (response.status === 404) {
        // Successfully registered
        router.push("/UserAuthentication/Signup"); // Redirect to login after successful registration
      } else {
        console.log({ general: data.message || "Google login failed." });
      }
    } catch (error) {
      console.error("Google login error:", error);
      console.log({
        general: "Google login encountered an error. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailOrPhoneError = validateEmailOrPhone(email);

    if (emailOrPhoneError !== true) {
      console.log({
        emailOrMobile: emailOrPhoneError,
      });
      return;
    }

    // if (email === "superadmin@gmail.com" && password === "Superadmin@123") {
    //   // Store admin details in local storage
    //   localStorage.setItem("user_name", "Nithin");
    //   localStorage.setItem("user_type", "Super Admin");
    //   localStorage.setItem("user_email", email);

    //   // Redirect to User Management page
    //   router.push("/Superadmin/Dashboard");
    //   return;
    // }

    try {
      const response = await fetch(
        `${AuthenticationandUsermanagement}/auth_user_api/auth/login/`,
        // "http://127.0.0.1:8002/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "login",
            emailOrMobile: email,
            password: password,
          }),
        }
      );

      const data = await response.json();
      console.log(data.email);

      if (response.ok) {
        // Store user details in localStorage
        const {
          user_id,
          usertype,
          name,
          email,
          wallet_public_key,
          email_status,
          organization,
          reset_password,
          phone_number,
          department,
        } = data;
        console.log(data.organization);
        setPopupMessage("Login successfull");
        localStorage.setItem("user_id", user_id);
        localStorage.setItem("user_type", usertype);
        localStorage.setItem("user_name", name); // Store user name
        localStorage.setItem("email", email);
        localStorage.setItem("email_status", email_status);
        localStorage.setItem("organization", organization);
        localStorage.setItem("wallet_publickey", wallet_public_key);
        localStorage.setItem("reset_password", reset_password);
        sessionStorage.setItem("phone_number", phone_number);
        localStorage.setItem("department", department);
        console.log(usertype);
        if (
          usertype === "Channel Partner" &&
          data.email_status !== "verified"
        ) {
          router.push(`/otp`);
        } else {
          redirectUser(usertype);
        }
      } else if (response.status === 404) {
        // If email is not found
        console.log({ general: "This Email ID is not regisered" });
      } else if (response.status === 401) {
        // If password is incorrect
        console.log({ general: "Incorrect password. Please try again." });
      } else {
        console.log({ general: data.message || "Invalid login credentials" });
      }
    } catch (err) {
      console.error("Error:", err);
      console.log({ general: "An error occurred. Please try again." });
    }
  };

  const handleForgetPassword = () => {
    router.push(`/UserAuthentication/ForgotPassword`);
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
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              width: "100%",
              margin: "0 auto",
              backgroundColor: "#000",
              zIndex: 9999,
            }}
          >
            <Loadingspinner />
          </div>
        ) : (
          <>
            <div className="main-container">
              <div className="left-section">
                <div className="signin-container">
                  {popupMessage && (
                    <PopupMessage
                      message={popupMessage}
                      onClose={closePopup}
                      type={
                        popupMessage.includes("successfull")
                          ? "success"
                          : popupMessage.includes("Failed")
                          ? "error"
                          : "info"
                      }
                    />
                  )}
                  <div className="signinbox1">
                    <div className="logo">
                      <Image
                        src="https://res.cloudinary.com/dolhqxgju/image/upload/v1743070827/q9pto9iinemebbkex6gl.png"
                        alt="Pehachain Logo"
                        className="logo-image"
                        width={30}
                        height={50}
                      />
                      <span className="logo-text">Pehachain</span>
                    </div>

                    {/* Welcome Message */}
                    <p className="welcome-message">Welcome Back 👋</p>

                    {/* Heading */}
                    <h1 className="signintitle">{signInTitle}</h1>
                    {errors.general && (
                      <p className="error-message">
                        <button className="error-button">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 0 24 24"
                            width="24px"
                            fill="red"
                          >
                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                          </svg>
                          {errors.general}
                        </button>
                      </p>
                    )}

                    <form onSubmit={handleSubmit}>
                      {/* Email/Phone Input */}
                      <div className="inputgroup">
                        <input
                          type="text"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email ID / Phone Number"
                          className="inputfield"
                          required
                        />
                        <label htmlFor="email" className="inputlabel">
                          Email ID / Phone Number
                        </label>
                        {errors.emailOrMobile && (
                          <p className="error-messages">
                            {errors.emailOrMobile}
                          </p>
                        )}
                      </div>

                      {/* Password Input */}
                      <div className="inputgroup">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="inputfield"
                          required
                        />
                        <label htmlFor="Password" className="inputlabel">
                          Password
                        </label>

                        <span
                          className="eye-icon"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <IoEye /> : <IoEyeOff />}
                        </span>
                        <a
                          href="/UserAuthentication/ForgotPassword"
                          className="forgotpassword"
                          onClick={handleForgetPassword}
                        >
                          Reset Password?
                        </a>
                      </div>
                      {errors.password && (
                        <p className="error-messages">{errors.password}</p>
                      )}

                      {/* Sign In Button */}
                      <button type="submit" className="signinbutton">
                        Log in
                      </button>
                    </form>

                    {/* Sign Up Section */}
                    {/* <p className="signuptext">
                      Don’t have an account?{" "}
                      <a
                        href="/UserAuthentication/Signup"
                        className="signup-link"
                      >
                        Sign Up
                      </a>
                    </p> */}

                    {/* Divider */}
                    {/* <div className="divider">
                      <hr /> OR <hr />
                    </div> */}

                    {/* Google and Apple Buttons */}
                    {/* <button
                      className="googlebutton"
                      onClick={handleGoogleLogin}
                    >
                      <Image
                        src="/google.png"
                        alt="Google"
                        className="icon google-icon"
                        width={15}
                        height={15}
                      />
                      Continue with Google
                    </button> */}

                    {/* Terms */}
                    <p className="terms">
                      By continuing, you agree to our{" "}
                      <a href="#" className="terms-link">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#" className="terms-link">
                        Our Policies
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
              <div className="right-section">
                <Image
                  src="https://res.cloudinary.com/dolhqxgju/image/upload/v1742306181/Downloader.la_-67d91ee353076_1_ledonk.png" // Replace with your image path
                  alt="Background"
                  className="right-image"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </>
        )}
      </>
    </div>
  );
};

export default SignIn;
