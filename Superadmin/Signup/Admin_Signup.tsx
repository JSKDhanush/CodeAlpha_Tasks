"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import styles from "./Admin_Signup.module.css"; // Ensure this file exists and is correctly named
const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
const AdminSignup: React.FC = () => {
  const router = useRouter();
  const AuthenticationandUsermanagement = "http://127.0.0.1:8000/";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [error, setError] = useState<string>("");
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

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
      case "email":
        if (!value.trim()) {
          errorMessage = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = "Invalid email format.";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    validateField(name, value);
  };

  const closePopup = () => {
    setPopupMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const value = (formData as any)[key];
      validateField(key, value);

      if (fieldErrors[key as keyof typeof fieldErrors]) {
        validationErrors[key] = fieldErrors[key as keyof typeof fieldErrors];
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix the highlighted errors before submitting.");
      return;
    }

    try {
      const response = await axios.post(
        // `${AuthenticationandUsermanagement}/auth_user_api/auth/add_superadmin/`,
        `${AdminManagement}/adminapi/add-user`,
        {
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          usertype: "SuperAdmin",
          phone_number: formData.phoneNumber,
        }
      );

      if (response.status === 201) {
        setPopupMessage("Registration completed successfully");
        router.push("/UserAuthentication/Signin");
      }
    } catch (error: any) {
      if (error.response) {
        setError(
          error.response.data.error || "Something went wrong. Please try again."
        );
      }
    }
  };

  return (
    <div className={styles["modal-backdrop"]}>
      <div className={styles["modal-container"]}>
        <h2 className={styles["modal-title"]}>Add SuperAdmin</h2>

        <form onSubmit={handleSubmit} className={styles["signup-form"]}>
          <div className={styles["input-group"]}>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder=" "
              className={styles["input-field"]}
            />
            <label htmlFor="firstName" className={styles["input-label"]}>
              First Name
            </label>
            {fieldErrors.firstName && (
              <span className={styles["error"]}>{fieldErrors.firstName}</span>
            )}
          </div>

          <div className={styles["input-group"]}>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder=" "
              className={styles["input-field"]}
            />
            <label htmlFor="lastName" className={styles["input-label"]}>
              Last Name
            </label>
            {fieldErrors.lastName && (
              <span className={styles["error"]}>{fieldErrors.lastName}</span>
            )}
          </div>

          <div className={styles["input-group"]}>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder=" "
              className={styles["input-field"]}
            />
            <label htmlFor="email" className={styles["input-label"]}>
              Email
            </label>
            {fieldErrors.email && (
              <span className={styles["error"]}>{fieldErrors.email}</span>
            )}
          </div>
          {/* <div className={styles["input-group"]}>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder=" "
              className={styles["input-field"]}
            />
            <label htmlFor="phoneNumber" className={styles["input-label"]}>
              Phone Number
            </label>
            {fieldErrors.phoneNumber && (
              <span className={styles["error"]}>{fieldErrors.phoneNumber}</span>
            )}
          </div> */}

          <div className={styles["input-group"]}>
            <div className={styles["phone-wrapper"]}>
              <PhoneInput
                country={"in"}
                international
                value={formData.phoneNumber}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, phoneNumber: value }))
                }
                inputProps={{
                  name: "phoneNumber",
                  id: "phoneNumber",
                  required: true,
                }}
                containerClass={styles["phone-container"]}
                inputClass={styles["input-fieldflag"]}
                buttonClass={styles["phone-flag"]}
                dropdownClass={styles["custom-dropdown"]}
              />
            </div>

            <label htmlFor="phoneNumber" className={styles["input-label"]}>
              Phone Number
            </label>

            {fieldErrors.phoneNumber && (
              <span className={styles["error"]}>{fieldErrors.phoneNumber}</span>
            )}
          </div>

          <div className={styles["input-group"]}>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder=" "
              className={styles["input-field"]}
            />
            <label htmlFor="password" className={styles["input-label"]}>
              Password
            </label>
            {fieldErrors.password && (
              <span className={styles["error"]}>{fieldErrors.password}</span>
            )}
          </div>

          <div className={styles["input-group"]}>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder=" "
              className={styles["input-field"]}
            />
            <label htmlFor="confirmPassword" className={styles["input-label"]}>
              Confirm Password
            </label>
            {fieldErrors.confirmPassword && (
              <span className={styles["error"]}>
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          <div className={styles["button-group"]}>
            <button type="button" className={styles["cancel-button"]}>
              Cancel
            </button>
            <button type="submit" className={styles["add-button"]}>
              Add SuperAdmin
            </button>
          </div>
        </form>

        {error && <div className={styles["error-message"]}>{error}</div>}
        {popupMessage && (
          <div className={styles["popup-message"]}>
            {popupMessage}
            <button onClick={closePopup}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSignup;
