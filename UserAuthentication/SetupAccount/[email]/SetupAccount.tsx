"use client";
import React, { useState } from "react";
import axios from "axios";
import "./SetupAccount.css";
import { useParams, useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PopupMessage from "@/app/Superadmin/Navbars/PopupMessage";

// Define the types for form data
interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
  email: string;
}

const SetupAccount: React.FC = () => {
  const { email } = useParams();
  const router = useRouter();
  const countryCodes = [
    { code: "+91" },
    { code: "+1" },
    { code: "+44" },
    // Add more country codes as needed
  ];
  const sanitizedEmail = Array.isArray(email) ? email[0] : email || "";
  const [showPassword, setShowPassword] = useState<boolean>(false); // For password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false); // For confirm password visibility
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const AuthenticationandUsermanagement = process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;


  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "+91",
    password: "",
    confirmPassword: "",
    email: sanitizedEmail,
  });

  const [activeField, setActiveField] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleFocus = (field: string) => {
    setActiveField(field);
  };

  const handleBlur = () => {
    setActiveField("");
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate the input field on change
    validateField(name, value);
  };

  // Validation function for individual fields
  const validateField = (fieldName: string, value: string) => {
    let errorMessage = "";

    switch (fieldName) {
      case "firstName":
        if (!value.trim()) {
          errorMessage = "First name is required.";
        } else if (value.length < 1) {
          errorMessage = "First name must be at least 1 character.";
        }
        break;
      case "lastName":
        if (!value.trim()) {
          errorMessage = "Last name is required.";
        } else if (value.length < 3) {
          errorMessage = "Last name must be at least 3 characters.";
        }
        break;
      case "phone":
        if (!value.trim()) {
          errorMessage = "Phone number is required.";
        } else if (!/^\d{10}$/.test(value)) {
          errorMessage = "Phone number must be exactly 10 digits.";
        }
        break;
      case "password":
        if (!value.trim()) {
          errorMessage = "Password is required.";
        } else if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value
          )
        ) {
          errorMessage =
            "Password must be 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special (e.g., Example@123).";
        }
        break;
      case "confirmPassword":
        if (!value.trim()) {
          errorMessage = "Confirm password is required.";
        } else if (value !== formData.password) {
          errorMessage = "Passwords do not match.";
        }
        break;
      default:
        break;
    }

    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: errorMessage,
    }));
  };

  const closePopup = () => {
    setPopupMessage(null);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Validate all fields before submitting
  //   Object.keys(formData).forEach((key) => validateField(key, (formData as any)[key]));

  //   // Check for any errors
  //   if (Object.values(fieldErrors).some((error) => error)) {
  //     setError("Please fix the highlighted errors before submitting.");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(
  //       // " http://localhost:8000/api/auth/signup/", 
  //       ` ${AuthenticationandUsermanagement}/auth_user_api/signup`,
  //       {
  //       email: formData.email,
  //       firstName: formData.firstName,
  //       lastName: formData.lastName,
  //       countryCode: formData.countryCode,
  //       phone: formData.phone,
  //       password: formData.password,
  //       confirmPassword: formData.confirmPassword,
  //     });
  //     if (response.status === 200 || response.status === 201) {
  //       setPopupMessage("Registration completed successfully")
  //       router.push("/UserAuthentication/Signin"); // Redirect to login after successful registration
  //     }
  //   } catch (error: any) {
  //     if (error.response) {
  //       setError(error.response.data.error || "Something went wrong. Please try again.");
  //     }
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Use const because validationErrors is not reassigned
    const validationErrors: Record<string, string> = {};
  
    // Validate each field manually and collect errors
    Object.keys(formData).forEach((key) => {
      const value = (formData as any)[key];
      validateField(key, value); // This will update fieldErrors state
  
      // Use 'keyof typeof fieldErrors' to ensure the key is a valid key from fieldErrors
      if (fieldErrors[key as keyof typeof fieldErrors]) {
        validationErrors[key] = fieldErrors[key as keyof typeof fieldErrors]; // Store error if it exists
      }
    });
  
    // If there are validation errors, set the error message and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix the highlighted errors before submitting.");
      return;
    }
  
    try {
      // Make the API request after validation passes
      const response = await axios.post(
        `${AuthenticationandUsermanagement}/auth_user_api/auth/signup/`,
        {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          countryCode: formData.countryCode,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );
  
      if (response.status === 200 || response.status === 201) {
        setPopupMessage("Registration completed successfully");
        router.push("/UserAuthentication/Signin"); // Redirect to login after successful registration
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.error || "Something went wrong. Please try again.");
      }
    }
  };
  

  return (
    <div className="form-container">
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
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form-title">Set up Your account</h2>

        {error && <p className="error-message">{error}</p>}

        {/* First Name Input */}
        <div className="input-wrapper">
          <div className={`input-border ${activeField === "First name" ? "active" : ""}`}>
            <input
              type="text"
              className="input"
              placeholder=" "
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onFocus={() => handleFocus("First name")}
              onBlur={handleBlur}
              required
            />
            <label className="placeholder">First name</label>
          </div>
          {fieldErrors.firstName && <p className="error-message">{fieldErrors.firstName}</p>}
        </div>

        {/* Last Name Input */}
        <div className="input-wrapper">
          <div className={`input-border ${activeField === "Last name" ? "active" : ""}`}>
            <input
              type="text"
              className="input"
              placeholder=" "
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onFocus={() => handleFocus("Last name")}
              onBlur={handleBlur}
              required
            />
            <label className="placeholder">Last name</label>
          </div>
          {fieldErrors.lastName && <p className="error-message">{fieldErrors.lastName}</p>}
        </div>

        {/* Phone Number Input */}
        <div className="input-wrapper">
          <div className={`input-border ${activeField === "Number" ? "active" : ""}`}>
            <input
              type="text"
              className="input"
              placeholder=" "
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onFocus={() => handleFocus("Number")}
              onBlur={handleBlur}
              required
            />
            <label className="placeholder">Number</label>
          </div>
          {fieldErrors.phone && <p className="error-message">{fieldErrors.phone}</p>}
        </div>

        {/* Password Input */}
        <div className="input-wrapper">
          <div className={`input-border ${activeField === "Password" ? "active" : ""}`}>
            <input
              type={showPassword ? "text" : "password"}  // Toggle visibility of password
              className="input"
              placeholder=" "
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus("Password")}
              onBlur={handleBlur}
              required
            />
            <label className="placeholder">Password</label>
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword((prev) => !prev)}  // Toggle password visibility
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}  {/* Show Eye or Eye-Slash icon */}
            </button>
          </div>
          {fieldErrors.password && <p className="error-message">{fieldErrors.password}</p>}
        </div>

        <div className="input-wrapper">
          <div className={`input-border ${activeField === "Confirm password" ? "active" : ""}`}>
            <input
              type={showConfirmPassword ? "text" : "password"}  // Toggle visibility of confirm password
              className="input"
              placeholder=" "
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => handleFocus("Confirm password")}
              onBlur={handleBlur}
              required
            />
            <label className="placeholder">Confirm password</label>
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirmPassword((prev) => !prev)}  // Toggle confirm password visibility
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}  {/* Show Eye or Eye-Slash icon */}
            </button>
          </div>
          {fieldErrors.confirmPassword && <p className="error-message">{fieldErrors.confirmPassword}</p>}
        </div>


        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
    </div>
  );
};

export default SetupAccount;
