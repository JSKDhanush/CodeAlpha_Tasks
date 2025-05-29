"use client";

import React, { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from "axios";
import SubmitPage from "../SubmitPage/SubmitPage";
import PopupMessage from "@/app/Superadmin/PopupMessage/PopupMessage";
import Sidebar from "../../Navbars/Sidebar";
import Header from "../../Navbars/Header";
const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
const AuthenticationandUsermanagement = process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;

const PricingCard: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const router = useRouter();
  const [formSubmittedSuccessfully, setFormSubmittedSuccessfully] = useState(false);
  const [formSubmittedDisplay, setformSubmittedDisplay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [usertype, setUserType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
      const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchQuery(e.target.value);
        };
        interface HeaderProps {
          searchQuery: string;
          onProfileClick: () => void;
          onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
        }
  
    const closePopup = () => {
      setPopupMessage(null);
    };
    // useEffect(() => {
    //   const selectValue = localStorage.getItem("selectedServiceLabel");
    //   const userType = localStorage.getItem("user_type");
  
    //   if (selectValue === "Become Customer") {
    //     setUserType("Admin-Seeker");
    //   } else{
    //     setUserType("Admin-Seeker");
    //   }
    // }, []);
  
  const handleCardClick = (index: number) => {
    if (selectedCard === index) {
      // If the same card is clicked, unselect it
      setSelectedCard(null);
      localStorage.removeItem('subscription_plan');
    } else {
      // Select the new card
      setSelectedCard(index);
      localStorage.setItem('subscription_plan', plans[index].title);
    }
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    

    setIsSubmitting(true);


    const userEmail = localStorage.getItem("poc_email") || "";
      const userPassword = localStorage.getItem("poc_phone_number"); // Consider a secure password generation
      const userPayload = {
        first_name: localStorage.getItem("poc_full_name") || "",
        last_name: "",
        email: userEmail,
        phone_number: userPassword,
        usertype: localStorage.getItem("usertype"),
        password: userPassword,
        organization: localStorage.getItem("company_name"),
        country: localStorage.getItem("country"),
        channelPartner: localStorage.getItem("channel_partner"),
        personal_info_status: "True",
      };

      // Submit user data
      const userRes = await fetch(`${AdminManagement}/adminapi/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
              body: JSON.stringify(userPayload),
            });

      const userData = await userRes.json();

      if (!userRes.ok) {
        throw new Error(`User creation failed: ${userRes.status}`);
      }
      //Access the user_id from the response
      const userId = userData.user_id;
      console.log("Fetched User ID:", userId);

      // Optionally, store the user_id in localStorage or use it as needed
      localStorage.setItem("userid", userId);

      console.log("User created:", userData);

    // Construct formsData from localStorage
    const formsData = {
      poc_full_name: localStorage.getItem("poc_full_name") || "",
      poc_designation: localStorage.getItem("poc_designation") || "",
      poc_email: localStorage.getItem("poc_email") || "",
      poc_phone_number: localStorage.getItem("poc_phone_number") || "",
      user_type: localStorage.getItem("usertype"),
      companyLogoUrl: localStorage.getItem("companyLogoUrl") || "",
      user_id: localStorage.getItem("userid"),
      status: "Approved",
      company_name: localStorage.getItem("company_name") || "",
      duns_number: localStorage.getItem("duns_number") || "",
      company_registration_number: localStorage.getItem("company_registration_number") || "",
      company_website: localStorage.getItem("company_website") || "",
      headquarters_address: localStorage.getItem("headquarters_address") || "",
      country: localStorage.getItem("country") || "",
      verification_types: JSON.parse(localStorage.getItem("verification_types") || "[]"),
      channel_partner: localStorage.getItem("channel_partner") || "",
      turnaround_time_value: localStorage.getItem("turnaround_time_value") || "",
      turnaround_time_unit: localStorage.getItem("turnaround_time_unit") || "",
      compliance_certifications: JSON.parse(localStorage.getItem("compliance_certifications") || "[]"),
      company_logo: localStorage.getItem("companyLogoUrl") || "",
      subscription_plan: localStorage.getItem("subscription_plan") || "",
      charges_per_document:localStorage.getItem("charges_per_document"),
      charges_second_access:localStorage.getItem("charges_second_access"),
      certification_file:localStorage.getItem("certification_file"),
    };

    try {
      const response = await axios.post(
        `${AuthenticationandUsermanagement}/auth_kyb_details_api/company-details/create/`,
        // "http://127.0.0.1:8000/auth_kyb_details_api/company-details/create/",
        formsData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const id = response.data.id;
      if (id) {
        localStorage.setItem("id", id);
        localStorage.setItem(id, JSON.stringify(formsData));
        }
      
      // Submit platform fee data
      const platformFeePayload = {
        organization: localStorage.getItem("company_name"),
        amount: parseInt(localStorage.getItem("charges_per_document") || "0"), // Ensure numeric value
        second_access_charge: parseInt(localStorage.getItem("charges_second_access") || "0"), // Ensure numeric value
        admin_user_name: localStorage.getItem("user_name") || "Unknown User", // From localStorage
        admin_user_type: localStorage.getItem("user_type") || "Unknown User", // From localStorage
        username: localStorage.getItem("poc_full_name") || "Unknown User", // From formData
      };

      const platformFeeRes = await axios.post(
        `${AdminManagement}/adminsixapi/save-platform-fee/`,
        platformFeePayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (platformFeeRes.data.status === "success") {
        setPopupMessage("Platform fee saved successfully.");
      } else {
        throw new Error(platformFeeRes.data.message || "Failed to save platform fee.");
      }
      setPopupMessage("User created successfully.");
      //send mail
      await axios
      .post(`${AdminManagement}/adminthreeapi/send-email/`, {
        email: userPayload.email,
        password: userPayload.password,
        organization: userPayload.organization,
        name: userPayload.first_name + userPayload.last_name,
        usertype: userPayload.usertype === "Admin-Verifier" ? "Verification Partner Admin" : "Customer Admin",
      })
      .then(() => {
        setPopupMessage("Email sent successfully");
        setFormSubmittedSuccessfully(true);
        setformSubmittedDisplay(true);
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        setPopupMessage("Failed to send email. Please try again.");
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error || "Failed to submit form.";
      setPopupMessage(errorMessage);

    } finally {
      setIsSubmitting(false);
    }
  };
  const plans = [
    {
      title: "Basic",
      description: "For everyone starting out on a website for their big idea",
      price: "$0",
      priceDetail: "free for everyone",
      buttonText: "Get started for free",
      footerText: "Free and open-source forever",
      features: [
        "Access to verification dashboard",
        "Verify user documents & credentials",
        "Full audit logs & history",
      ],
    },
    {
      title: "Standard",
      description: "For growing businesses needing advanced verification tools",
      price: "$29",
      priceDetail: "per month",
      buttonText: "Start with Standard",
      footerText: "Best for small to medium businesses",
      features: [
        "Everything in Basic",
        "Priority support",
        "Advanced analytics dashboard",
        "Team collaboration tools",
      ],
    },
    {
      title: "Premium",
      description: "For enterprises requiring comprehensive verification solutions",
      price: "$99",
      priceDetail: "per month",
      buttonText: "Go Premium",
      footerText: "Tailored for large-scale operations",
      features: [
        "Everything in Standard",
        "Dedicated account manager",
        "Custom integrations",
        "24/7 premium support",
      ],
    },
  ];
  return (
    <div>
    {formSubmittedDisplay && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <SubmitPage />
            </div>
          )}
    <div className={`transition-all duration-300 ${formSubmittedDisplay ? "blur-md opacity-50" : ""}`}>
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
    <div className="flex flex-col mt-[30px] ml-[180px] justify-center items-center min-h-screen bg-[#121212]  p-4">
      
      <>
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
      
          {/* Heading added here */}
          <h1 className="text-3xl font-bold text-white mb-8">Choose Your Subscription Plan</h1>
          <div className="flex space-x-8">
          {plans.map((plan, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(index)}
                className={`w-80 relative rounded-xl border p-8 text-left shadow-sm transition-all duration-300 bg-black border-gray-700 text-white overflow-hidden cursor-pointer
                  ${selectedCard === index ? 'border-green-500 border-2' : 'border-gray-700'}
                  hover:border-green-500 hover:shadow-lg group`}
              >
                {/* Green gradient background for the top section */}
                {selectedCard === index && (
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-[320px] h-32 bg-[#47F33999] opacity-60 blur-2xl  z-0"/>)}
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{plan.title}</h2>
                  </div>
                  <p className="text-gray-400 mt-1">
                    For everyone starting out on a website for their big idea
                  </p>
                  <p className="text-4xl font-bold text-white mt-4">
                    $0 <span className="text-sm font-normal">free for everyone</span>
                  </p>
                  <div
                    className="w-full bg-[#1F2937] text-white py-2 rounded-md mt-6 text-center cursor-pointer  transition"
                    
                  >
                    {plan.buttonText}
                  </div>
                  <p className="text-gray-400 text-sm mt-4">Free and open-source forever</p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center text-gray-300">
                      <span className="text-green-500 mr-2">✓</span> Access to verification dashboard
                    </li>
                    <li className="flex items-center text-gray-300">
                      <span className="text-green-500 mr-2">✓</span> Verify user documents & credentials
                    </li>
                    <li className="flex items-center text-gray-300">
                      <span className="text-green-500 mr-2">✓</span> Full audit logs & history
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          
            <div className="flex gap-4 pt-6 items-end justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-yellow-400 text-black px-10 py-2 min-w-[400px] rounded-lg font-semibold flex items-center justify-center"
              >
                {isSubmitting ? (
                  <svg
                    className="animate-spin h-5 w-5 text-black mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
      
    </>
    </div>
    </div>
    </div>
  );
};

export default PricingCard;
