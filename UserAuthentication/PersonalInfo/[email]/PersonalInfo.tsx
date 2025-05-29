"use client";
import React, { useState } from "react";
import "./PersonalInfo.css";


interface Errors {
  dateOfBirth?: string;
}

const PersonalInfo: React.FC = () => {
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [errors, setErrors] = useState<Errors>({});

  // DatePicker Component
  const DatePicker: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    onFocus?: () => void;
  }> = ({ value, onChange, disabled = false,onFocus }) => {
    return (
      <div className="datePickerContainer">
        <input
          type="date"
          value={value}
          className="dateInputField"
          onChange={onChange}
          disabled={disabled}
          onFocus={onFocus}
          
        />
      </div>
    );
  };

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
  
    // Calculate age from the date of birth
    const dob = new Date(inputDate);
    const today = new Date();
    
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--; // If the birthday hasn't occurred yet this year, subtract 1 from age
    }
  
    // If age is above or equal to 18, update dateOfBirth, otherwise show error
    if (age >= 18) {
      setDateOfBirth(inputDate);
      setErrors((prevErrors) => ({ ...prevErrors, dateOfBirth: '' })); // Clear error if valid
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        dateOfBirth: 'Age must be above 18 years',
      }));
    }
  };
    
    return (
      <div className="form-container">
        <div className="welcome-text">Welcome</div>
        <div className="info-text">Update your personal details before creating a wallet</div>
    
        <div className="input-container">
          <div className="input-group">
            <label htmlFor="input-1" className="input-label">First Name</label>
            <div className="input-wrapper">
              <input id="input-1" type="text" className="input-box" placeholder="Enter First Name" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="input-2" className="input-label">Last Name</label>
            <div className="input-wrapper">
              <input id="input-2" type="text" className="input-box" placeholder="Enter Last Name" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="input-3" className="input-label">Select Gender</label>
            <div className="input-wrapper">
              <input id="input-3" type="text" className="input-box" placeholder="Select Gender" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="input-4" className="input-label">Mobile Number</label>
            <div className="input-wrapper">
              <input id="input-4" type="text" className="input-box" placeholder="Enter Mobile Number" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="input-5" className="input-label">Date of Birth</label>
            <div className="dateinput-wrapper">
              <DatePicker
                value={dateOfBirth}
                onChange={handleDateOfBirthChange}
                // onFocus={() => setErrors({ ...errors, dateOfBirth: "" })}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="input-6" className="input-label">Address Line 1</label>
            <div className="input-wrapper">
              <input id="input-6" type="text" className="input-box" placeholder="Enter Address Line 1" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="input-7" className="input-label">Address Line 2</label>
            <div className="input-wrapper">
              <input id="input-7" type="text" className="input-box" placeholder="Enter Address Line 2" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="input-8" className="input-label">City</label>
            <div className="input-wrapper">
              <input id="input-8" type="text" className="input-box" placeholder="Enter City" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="input-9" className="input-label">Postal/Zip Code</label>
            <div className="input-wrapper">
              <input id="input-9" type="text" className="input-box" placeholder="Enter Postal/Zip Code" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="input-10" className="input-label">State/Region</label>
            <div className="input-wrapper">
              <input id="input-10" type="text" className="input-box" placeholder="Enter State/Region" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="input-11" className="input-label">Country</label>
            <div className="input-wrapper">
              <input id="input-11" type="text" className="input-box" placeholder="Enter Country" />
            </div>
          </div>
          
          <div className="button-container">
            <button className="submit-button">Submit</button>
          </div>
        </div>
      </div>
    );
      
};

export default PersonalInfo;
