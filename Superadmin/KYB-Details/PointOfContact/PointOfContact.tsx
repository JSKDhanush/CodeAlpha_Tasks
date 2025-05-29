// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import dynamic from "next/dynamic";
// // Dynamically import PhoneInput with SSR disabled
// const PhoneInput = dynamic(() => import("react-phone-number-input"), {
//   ssr: false,
// });
// import "react-phone-number-input/style.css";
// import SubmitPage from "../SubmitPage/SubmitPage";
// import PopupMessage from "@/app/Superadmin/Navbars/PopupMessage";
// import Sidebar from "../../Navbars/Sidebar";
// import Header from "../../Navbars/Header";
// import { formatPhoneNumberIntl } from "react-phone-number-input";
// const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
// const AuthenticationandUsermanagement = process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;
// const PointOfContact = () => {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     poc_full_name: "",
//     poc_designation: "",
//     poc_email: "",
//     poc_phone_number: "",
//     user_type: "",
//     companyLogoUrl: '',
//   });
//   const [formSubmittedSuccessfully, setFormSubmittedSuccessfully] = useState(false);
//   const [formSubmittedDisplay, setformSubmittedDisplay] = useState(false);
//   const [formErrors, setFormErrors] = useState({});
//   const [formSubmitted, setFormSubmitted] = useState(false);
//   const [usertype, setUserType] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [popupMessage, setPopupMessage] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//     const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setSearchQuery(e.target.value);
//       };
//       interface HeaderProps {
//         searchQuery: string;
//         onProfileClick: () => void;
//         onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
//       }

//   useEffect(() => {
//     const selectValue = localStorage.getItem("selectedServiceLabel");
//     const userType = localStorage.getItem("usertype");

//     if (selectValue === "Become Verification Partner") {
//       setUserType("Admin-Verifier");
//     } else if (userType) {
//       setUserType(userType);
//     }
//   }, []);
//   const closePopup = () => {
//     setPopupMessage(null);
//   };
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handlePhoneChange = (value: string | undefined) => {
//     setFormData((prev) => ({
//       ...prev,
//       poc_phone_number: value || "",
//     }));
//   };
//   const validatePhoneNumber = (phone: string) => {
//     if (!phone) return false;

//     // Get the formatted phone number (e.g., "+91 12345678901")
//     const formattedPhone = formatPhoneNumberIntl(phone);
//     if (!formattedPhone) return false;

//     // Split into country code and phone number parts
//     const parts = formattedPhone.split(" ");
//     if (parts.length < 2) return false;

//     // Extract country code (after +) and phone number
//     const countryCode = parts[0].slice(1); // Remove + to get digits
//     const phoneNumber = parts.slice(1).join("").replace(/\D/g, ""); // Remove non-digits

//     // Count country code digits
//     const countryCodeLength = countryCode.length;

//     // Validate based on country code length
//     if (countryCodeLength === 2) {
//       return phoneNumber.length === 10   // 2-digit country code requires 11-digit phone number
//     } else {
//       return phoneNumber.length === 10; // Other country codes require 12-digit phone number
//     }
//   };
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormSubmitted(true);

//     const errors: any = {
//       poc_full_name:
//         formData.poc_full_name.trim() === "" ? "POC Full Name is required" : "",
//       poc_designation:
//         formData.poc_designation.trim() === "" ? "POC Designation is required" : "",
//       poc_email: formData.poc_email.trim() === "" ? "POC Email is required" : "",
//       poc_phone_number:
//         formData.poc_phone_number.trim() === "" ? "POC Phone Number is required" : "",
//     };

//     setFormErrors(errors);

//     const hasErrors = Object.values(errors).some((msg) => msg !== "");
//     if (hasErrors) return;

//     setIsSubmitting(true);
  
//     const formsData = {
//       ...formData,
//       status: "Approved",
//       company_name: localStorage.getItem("company_name"),
//       duns_number: localStorage.getItem("duns_number"),
//       company_registration_number: localStorage.getItem("company_registration_number"),
//       company_website: localStorage.getItem("company_website"),
//       headquarters_address: localStorage.getItem("headquarters_address"),
//       country: localStorage.getItem("country"),
//       verification_types: JSON.parse(localStorage.getItem("verification_types") || "[]"),
//       channel_partner: localStorage.getItem("channel_partner"),
//       turnaround_time_value: localStorage.getItem("turnaround_time_value"),
//       turnaround_time_unit: localStorage.getItem("turnaround_time_unit"),
//       compliance_certifications: localStorage.getItem("compliance_certifications"),
//       company_logo: localStorage.getItem("companyLogoUrl"),
//       charges_per_document:localStorage.getItem("charges_per_document"),
//       charges_second_access:localStorage.getItem("charges_second_access"),
//       user_type: usertype,
//     };

//     try {
//       const response = await axios.post(
//         `${AuthenticationandUsermanagement}/auth_kyb_details_api/company-details/create/`,
//         // "http://127.0.0.1:8000/auth_kyb_details_api/company-details/create/",
//         formsData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const id = response.data.id;
//       if (id) {
//         localStorage.setItem("id", id);
//         localStorage.setItem(id, JSON.stringify(formsData));
//       }
//       const userEmail = formData.poc_email;
//       const userPassword = formData.poc_phone_number; // Consider a secure password generation
//       const userPayload = {
//         first_name: formData.poc_full_name,
//         last_name: "",
//         email: userEmail,
//         phone_number: userPassword,
//         usertype: usertype,
//         password: userPassword,
//         organization: localStorage.getItem("company_name"),
//         country: localStorage.getItem("country"),
//         channelPartner: localStorage.getItem("channel_partner"),
//         personal_info_status: "True",
//       };

//       // Submit user data
//       const userRes = await fetch(`${AdminManagement}/adminapi/add-user`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//               body: JSON.stringify(userPayload),
//             });

//       const userData = await userRes.json();

//       if (!userRes.ok) {
//         throw new Error(`User creation failed: ${userRes.status}`);
//       }

//       console.log("User created:", userData);
//       // Submit platform fee data
//       const platformFeePayload = {
//         organization: localStorage.getItem("company_name"),
//         amount: parseInt(localStorage.getItem("charges_per_document") || "0"), // Ensure numeric value
//         second_access_charge: parseInt(localStorage.getItem("charges_second_access") || "0"), // Ensure numeric value
//         admin_user_name: localStorage.getItem("user_name") || "Unknown User", // From localStorage
//         admin_user_type: localStorage.getItem("user_type") || "Unknown User", // From localStorage
//         username: formData.poc_full_name || "Unknown User", // From formData
//       };

//       const platformFeeRes = await axios.post(
//         `${AdminManagement}/adminsixapi/save-platform-fee/`,
//         platformFeePayload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (platformFeeRes.data.status === "success") {
//         setPopupMessage("Platform fee saved successfully.");
//       } else {
//         throw new Error(platformFeeRes.data.message || "Failed to save platform fee.");
//       }
//       setPopupMessage("User created successfully.");
//       //send mail
//       await axios
//       .post(`${AdminManagement}/adminthreeapi/send-email/`, {
//         email: userPayload.email,
//         password: userPayload.password,
//         organization: userPayload.organization,
//         name: userPayload.first_name + userPayload.last_name,
//         usertype: userPayload.usertype,
//       })
//       .then(() => {
//         setPopupMessage("Email sent successfully");
//         setFormSubmittedSuccessfully(true);
//         setformSubmittedDisplay(true);
//       })
//       .catch((error) => {
//         console.error("Error sending email:", error);
//         setPopupMessage("Failed to send email. Please try again.");
//       });
//     } catch (err: any) {
//       const errorMessage =
//         err?.response?.data?.error || "Failed to submit form.";
//       setPopupMessage(errorMessage);

//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0d1520] flex items-center justify-center p-4 relative">
      
//       <div className={`fixed top-0 left-0 right-0 z-50 ${formSubmittedDisplay ? "blur-md opacity-50" : ""}`}>
//         <Header 
//           searchQuery={searchQuery}
//           onSearch={handleSearch}
//           onProfileClick={() => {
//             console.log("Profile clicked");
//           }}
//         />
//       </div>
                    
//         {/* Sidebar */}
//         <div
//           className={`fixed top-0 left-0 h-full transition-all duration-300 ${
//             formSubmittedDisplay ? "blur-md opacity-50" : ""
//           }`}
//         >
//           <Sidebar />
//         </div>
//       <style jsx>{`
//         input:-webkit-autofill,
//         input:-webkit-autofill:hover,
//         input:-webkit-autofill:focus,
//         input:-webkit-autofill:active {
//           -webkit-box-shadow: 0 0 0 30px #1f2937 inset !important;
//           box-shadow: 0 0 0 30px #1f2937 inset !important;
//           -webkit-text-fill-color: #ffffff !important;
//         }
//       `}</style>
//       {popupMessage && (
//         <PopupMessage
//           message={popupMessage}
//           onClose={closePopup}
//           type={
//             popupMessage.includes("successfully") ? "success" :
//               popupMessage.includes("Failed") ? "error" :
//                 "info"} />)}
//       {formSubmittedDisplay && (
//         <div className="absolute inset-0 flex items-center justify-center z-50">
//           <SubmitPage />
//         </div>
//       )}

//       {/* Form Container with Blur Effect */}
//       <div
//         className={`w-1/2 bg-[#101828] mb-[180px] border border-gray-600 rounded-[40px] p-6 text-white transition-all duration-300 ${formSubmittedDisplay ? "blur-md opacity-50" : ""
//           }`}
//       >
//         <h2 className="text-center text-lg font-semibold mb-4">KYB Details</h2>

//         {/* Progress steps */}
//         <div className="flex items-center justify-between w-4/5 mx-auto my-4">
//           <div className="flex flex-col items-center relative translate-y-2">
//             <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
//               ✓
//             </span>
//             <span className="text-[10px] mt-1 text-white font-bold">Company</span>
//             <span className="text-[10px] -mt-[2px] text-white font-bold">Details</span>
//           </div>
//           <div className="flex-grow h-0.5 bg-blue-600 mx-[-11px] mt-[-20px]" />
//           <div className="flex flex-col items-center relative">
//             <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
//               ✓
//             </span>
//             <span className="text-[10px] mt-1 text-white">Role & Info</span>
//           </div>
//           <div className="flex-grow h-0.5 bg-blue-600 mx-[-11px] mt-[-20px]" />
//           <div className="flex flex-col items-center relative">
//             <span
//               className={`w-6 h-6 flex items-center justify-center rounded-full ${formSubmittedSuccessfully ? "bg-blue-600" : "bg-white"
//                 } text-blue-600 font-bold text-sm`}
//             >
//               {formSubmittedSuccessfully ? "✓" : "•"}
//             </span>
//             <span className="text-[10px] mt-1 text-white font-bold">POC</span>
//           </div>
//         </div>

//         {/* Form */}
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Full Name */}
//             <div>
//               <label className="block text-sm mb-1">POC: Full Name</label>
//               <input
//                 type="text"
//                 name="poc_full_name"
//                 value={formData.poc_full_name}
//                 onChange={handleChange}
//                 placeholder="ABC"
//                 className={`w-full px-3 py-2 bg-gray-800 border ${formSubmitted && formData.poc_full_name.trim().length === 0
//                     ? "border-red-500"
//                     : "border-gray-700"
//                   } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
//               />
//               {formSubmitted && formData.poc_full_name.trim().length === 0 && (
//                 <p className="text-red-500 text-xs mt-1">POC Name is Required</p>
//               )}
//             </div>

//             {/* Designation */}
//             <div>
//               <label className="block text-sm mb-1">POC: Designation</label>
//               <input
//                 type="text"
//                 name="poc_designation"
//                 value={formData.poc_designation}
//                 onChange={handleChange}
//                 placeholder="Manager"
//                 className={`w-full px-3 py-2 bg-gray-800 border ${formSubmitted && formData.poc_designation.trim().length === 0
//                     ? "border-red-500"
//                     : "border-gray-700"
//                   } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
//               />
//               {formSubmitted && formData.poc_designation.trim().length === 0 && (
//                 <p className="text-red-500 text-xs mt-1">Designation is Required</p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <label className="block text-sm mb-1">POC: Email</label>
//               <input
//                 type="email"
//                 name="poc_email"
//                 value={formData.poc_email}
//                 onChange={handleChange}
//                 placeholder="abc@gmail.com"
//                 className={`w-full px-3 py-2 bg-gray-800 border ${formSubmitted && formData.poc_email.trim().length === 0
//                     ? "border-red-500"
//                     : "border-gray-700"
//                   } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
//               />
//               {formSubmitted && formData.poc_email.trim().length === 0 && (
//                 <p className="text-red-500 text-xs mt-1">Poc email is required</p>
//               )}
//             </div>

//             {/* Phone */}
//             <div>
//               <label className="block text-sm mb-1">POC: Phone Number</label>
//               <div className="w-full bg-gray-800 border border-gray-700 rounded-md flex items-center px-2 py-1">
//                 <PhoneInput
//                   international
//                   defaultCountry="IN"
//                   value={formData.poc_phone_number}
//                   onChange={handlePhoneChange}
//                   placeholder="98746763438"
//                   className="w-full text-white [&_.PhoneInputInput]:bg-gray-800 [&_.PhoneInputInput]:text-white [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:border-none"
//                 />
//               </div>
//               {formSubmitted && !formData.poc_phone_number && (
//                 <p className="text-red-500 text-xs mt-1">Poc Phone Number is required</p>
//               )}
//               {formSubmitted &&
//                 formData.poc_phone_number.trim() !== "" &&
//                 !validatePhoneNumber(formData.poc_phone_number) && (
//                   <p className="text-red-500 text-xs mt-1">
//                     Phone number must include a 1-3 digit country code and a 10-digit number
//                   </p>
//                 )}
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-4 pt-4 items-end justify-end">
//             <button
//               type="button"
//               className="text-white border border-yellow-400 rounded-lg px-4 py-2"
//               onClick={() => router.back()}
//             >
//               Previous
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold"
//             >
//               {isSubmitting ? (
//                 <svg
//                   className="animate-spin h-5 w-5 text-black mr-2"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                   ></path>
//                 </svg>
//               ) : (
//                 "Submit"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default PointOfContact;




"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
// Dynamically import PhoneInput with SSR disabled
const PhoneInput = dynamic(() => import("react-phone-number-input"), {
  ssr: false,
});
import "react-phone-number-input/style.css";
import SubmitPage from "../SubmitPage/SubmitPage";
import PopupMessage from "@/app/Superadmin/Navbars/PopupMessage";
import Sidebar from "../../Navbars/Sidebar";
import Header from "../../Navbars/Header";
import { formatPhoneNumberIntl } from "react-phone-number-input";
const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
const AuthenticationandUsermanagement = process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;
const PointOfContact = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    poc_full_name: "",
    poc_designation: "",
    poc_email: "",
    poc_phone_number: "",
    user_type: "",
    companyLogoUrl: '',
  });
  const [formSubmittedSuccessfully, setFormSubmittedSuccessfully] = useState(false);
  const [formSubmittedDisplay, setformSubmittedDisplay] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [usertype, setUserType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
      };
      interface HeaderProps {
        searchQuery: string;
        onProfileClick: () => void;
        onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
      }

  useEffect(() => {
    const storedPocFullName = localStorage.getItem("poc_full_name") || "";
    const storedPocDesignation = localStorage.getItem("poc_designation") || "";
    const storedPocEmail = localStorage.getItem("poc_email") || "";
    const storedPocPhoneNumber = localStorage.getItem("poc_phone_number") || "";
    const selectValue = localStorage.getItem("selectedServiceLabel");

    setFormData((prev) => ({
      ...prev,
      poc_full_name: storedPocFullName,
      poc_designation: storedPocDesignation,
      poc_email: storedPocEmail,
      poc_phone_number: storedPocPhoneNumber,
    }));
    
  }, []);
  const closePopup = () => {
    setPopupMessage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Capitalize first letter for poc_full_name and poc_designation
    if (name === "poc_full_name" || name === "poc_designation") {
      updatedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      poc_phone_number: value || "",
    }));
  };

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return false;

    // Get the formatted phone number (e.g., "+91 12345678901")
    const formattedPhone = formatPhoneNumberIntl(phone);
    if (!formattedPhone) return false;

    // Split into country code and phone number parts
    const parts = formattedPhone.split(" ");
    if (parts.length < 2) return false;

    // Extract country code (after +) and phone number
    const countryCode = parts[0].slice(1); // Remove + to get digits
    const phoneNumber = parts.slice(1).join("").replace(/\D/g, ""); // Remove non-digits

    // Count country code digits
    const countryCodeLength = countryCode.length;

    // Validate based on country code length
    if (countryCodeLength === 2) {
      return phoneNumber.length === 10   // 2-digit country code requires 11-digit phone number
    } else {
      return phoneNumber.length === 10; // Other country codes require 12-digit phone number
    }
  };

  const validateForm = () => {
    const errors: any = {
      poc_full_name:
        formData.poc_full_name.trim() === "" ? "POC Full Name is required" : "",
      poc_designation:
        formData.poc_designation.trim() === "" ? "POC Designation is required" : "",
      poc_email:
        formData.poc_email.trim() === "" ? "POC Email is required" : "",
      poc_phone_number:
        formData.poc_phone_number.trim() === ""
          ? "POC Phone Number is required"
          : !validatePhoneNumber(formData.poc_phone_number)
          ? "Phone number must include a valid country code and number"
          : "",
    };
    setFormErrors(errors);
    return !Object.values(errors).some((msg) => msg !== "");
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save form data to localStorage before validation
    localStorage.setItem("poc_full_name", formData.poc_full_name);
    localStorage.setItem("poc_designation", formData.poc_designation);
    localStorage.setItem("poc_email", formData.poc_email);
    localStorage.setItem("poc_phone_number", formData.poc_phone_number);

    setFormSubmitted(true);
    if (!validateForm()) return;

    try {
      const response = await axios.post(
        `${AuthenticationandUsermanagement}/auth_kyb_details_api/validate-contact/`,
        // "http://127.0.0.1:8000/auth_kyb_details_api/validate-contact/",
        {
          poc_email: formData.poc_email,
          poc_phone_number: formData.poc_phone_number,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // If validation is successful, navigate to PaymentSection
        router.push("./PaymentSection");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "Validation failed.";
      setPopupMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 relative">
      
      <div className={`fixed top-0 left-0 right-0 z-50 ${formSubmittedDisplay ? "blur-md opacity-50" : ""}`}>
        <Header 
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onProfileClick={() => {
            console.log("Profile clicked");
          }}
        />
      </div>
                    
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full transition-all duration-300 ${
            formSubmittedDisplay ? "blur-md opacity-50" : ""
          }`}
        >
          <Sidebar />
        </div>
      <style jsx>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #1f2937 inset !important;
          box-shadow: 0 0 0 30px #1f2937 inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `}</style>
      {popupMessage && (
        <PopupMessage
          message={popupMessage}
          onClose={closePopup}
          type={
            popupMessage.includes("successfully") ? "success" :
              popupMessage.includes("Failed") ? "error" :
                "info"} />)}
      {formSubmittedDisplay && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <SubmitPage />
        </div>
      )}

      {/* Form Container with Blur Effect */}
      <div
        className={`w-1/2 bg-[#101828] mb-[210px] ml-[200px] border border-gray-600 rounded-[40px] p-6 text-white transition-all duration-300 ${formSubmittedDisplay ? "blur-md opacity-50" : ""
          }`}
      >
        <h2 className="text-center text-lg font-semibold mb-4">KYB Details</h2>

        {/* Progress steps */}
        <div className="flex items-center justify-between w-4/5 mx-auto my-4">
          <div className="flex flex-col items-center relative translate-y-2">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
              ✓
            </span>
            <span className="text-[10px] mt-1 text-white font-bold">Company</span>
            <span className="text-[10px] -mt-[2px] text-white font-bold">Details</span>
          </div>
          <div className="flex-grow h-0.5 bg-blue-600 mx-[-11px] mt-[-20px]" />
          <div className="flex flex-col items-center relative">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
              ✓
            </span>
            <span className="text-[10px] mt-1 text-white">Role & Info</span>
          </div>
          <div className="flex-grow h-0.5 bg-blue-600 mx-[-11px] mt-[-20px]" />
          <div className="flex flex-col items-center relative">
            <span
              className={`w-6 h-6 flex items-center justify-center rounded-full ${formSubmittedSuccessfully ? "bg-blue-600" : "bg-white"
                } text-blue-600 font-bold text-sm`}
            >
              {formSubmittedSuccessfully ? "✓" : "•"}
            </span>
            <span className="text-[10px] mt-1 text-white font-bold">POC</span>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleNext}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">POC: Full Name</label>
              <input
                type="text"
                name="poc_full_name"
                value={formData.poc_full_name}
                onChange={handleChange}
                placeholder="ABC"
                className={`w-full px-3 py-2 bg-gray-800 border ${
                  formSubmitted && formData.poc_full_name.trim().length === 0
                    ? "border-red-500"
                    : "border-gray-700"
                } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
              />
              {formSubmitted && formData.poc_full_name.trim().length === 0 && (
                <p className="text-red-500 text-xs mt-1">POC Name is Required</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">POC: Designation</label>
              <input
                type="text"
                name="poc_designation"
                value={formData.poc_designation}
                onChange={handleChange}
                placeholder="Manager"
                className={`w-full px-3 py-2 bg-gray-800 border ${
                  formSubmitted && formData.poc_designation.trim().length === 0
                    ? "border-red-500"
                    : "border-gray-700"
                } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
              />
              {formSubmitted && formData.poc_designation.trim().length === 0 && (
                <p className="text-red-500 text-xs mt-1">Designation is Required</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">POC: Email</label>
              <input
                type="email"
                name="poc_email"
                value={formData.poc_email}
                onChange={handleChange}
                placeholder="abc@gmail.com"
                className={`w-full px-3 py-2 bg-gray-800 border ${
                  formSubmitted && formData.poc_email.trim().length === 0
                    ? "border-red-500"
                    : "border-gray-700"
                } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
              />
              {formSubmitted && formData.poc_email.trim().length === 0 && (
                <p className="text-red-500 text-xs mt-1">Poc email is required</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">POC: Phone Number</label>
              <div className="w-full bg-gray-800 border border-gray-700 rounded-md flex items-center px-3 py-2">
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={formData.poc_phone_number}
                  onChange={handlePhoneChange}
                  placeholder="98746763438"
                  className="w-full text-white [&_.PhoneInputCountrySelect]:bg-[#101828] [&_.PhoneInputInput]:bg-gray-800 [&_.PhoneInputInput]:text-white [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:border-none"
                />
              </div>
              {formSubmitted && !formData.poc_phone_number && (
                <p className="text-red-500 text-xs mt-1">Poc Phone Number is required</p>
              )}
              {formSubmitted &&
                formData.poc_phone_number.trim() !== "" &&
                !validatePhoneNumber(formData.poc_phone_number) && (
                  <p className="text-red-500 text-xs mt-1">
                    Phone number must include a valid country code and number
                  </p>
                )}
            </div>
          </div>
          <div className="flex gap-4 pt-4 items-end justify-end">
            <button
              type="button"
              className="text-white border border-yellow-400 rounded-lg px-4 py-2"
              onClick={() => router.back()}
            >
              Previous
            </button>
            <button
              type="submit"
              className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold"
            >
              Next
            </button>
          </div>
          {/* Uncomment if FormSubmissionHandler is needed */}
          {/* <FormSubmissionHandler
            usertype={usertype}
            setFormSubmitted={setFormSubmitted}
            validateForm={validateForm}
          /> */}
        </form>
      </div>
    </div>
  );
};

export default PointOfContact;
