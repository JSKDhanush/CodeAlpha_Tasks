"use client";
import React, { useCallback, useEffect, useState } from "react";
import styles from "./KybDetails.module.css";
import { useRouter } from "next/navigation";
import Sidebar from "../../Navbars/Sidebar";
import { FaArrowLeft } from "react-icons/fa";
import Header from "../../Navbars/Header";
import PopupMessage from "../../Navbars/PopupMessage";
import axios from "axios";

const AuthenticationandUsermanagement =
  process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;
const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;

interface Notification {
  id?: string;
  company_name?: string;
  duns_number?: string;
  company_registration_number?: string;
  company_website?: string;
  country?: string;
  headquarters_address?: string;
  verification_type?: string;
  channel_partner?: string;
  turnaround_time_value?: string;
  compliance_certifications?: string;
  poc_full_name?: string;
  poc_designation?: string;
  poc_email?: string;
  poc_phone_number?: string;
  status?: string;
  user_id?: string;
  user_type?: string;
  description?: string;
  charges_per_document?: string;
  charges_second_access?: string;
  subscription_plan?: string;
}

const KybDetails: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<Notification | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [showRejectPopup, setShowRejectPopup] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    setUserName(localStorage.getItem("user_name"));
    try {
      const storedNotification = sessionStorage.getItem("selectedNotification");
      if (storedNotification) {
        setNotification(JSON.parse(storedNotification));
      }
    } catch (error) {
      console.error("Error parsing session storage data", error);
    }
  }, []);

  const goBack = useCallback(() => {
    console.log("Going back...");
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8) + "@1a";
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: string,
    description?: string
  ) => {
    try {
      if (!notification?.id) {
        throw new Error("Request ID not found");
      }
      setIsUpdating(id);
      const token = localStorage.getItem("authToken");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const body = JSON.stringify({ description: description || null });
      const response = await fetch(
        `${AuthenticationandUsermanagement}/auth_kyb_details_api/update-status/${notification.id}/${newStatus}/`,
        {
          method: "POST",
          headers,
          body,
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", response.status, errorText);
        throw new Error(
          `Failed to update status: ${response.status} ${errorText}`
        );
      }
      const data = await response.json();
      setPopupMessage(data.message || "Status updated successfully.");
      const companyRes = await fetch(
        `${AuthenticationandUsermanagement}/auth_kyb_details_api/fetchcomapnydetailsby_id/${notification.id}/`
      );
      const companyDetails = await companyRes.json();
      if (!companyRes.ok) {
        throw new Error("❌ Failed to fetch company details.");
      }
      const userEmail = companyDetails.poc_email;
      const userPassword = generateTempPassword();
      if (newStatus === "Approved") {
        if (!companyDetails.user_id) {
          const userPayload = {
            first_name: companyDetails.poc_full_name,
            last_name: "",
            email: userEmail,
            phone_number: companyDetails.poc_phone_number,
            usertype: companyDetails.user_type,
            password: userPassword,
            organization: companyDetails.company_name,
            country: companyDetails.country,
            channelPartner: companyDetails.channel_partner,
            personal_info_status: true,
          };
          const userRes = await fetch(`${AdminManagement}/adminapi/add-user`, {
            method: "POST",
            headers,
            body: JSON.stringify(userPayload),
          });
          if (!userRes.ok) {
            const errorText = await userRes.text();
            console.error("User creation failed:", userRes.status, errorText);
            throw new Error(
              `User creation failed: ${userRes.status} ${errorText}`
            );
          }
          const userData = await userRes.json();
          setPopupMessage("User created successfully.");
          if (companyDetails.user_type === "Admin-Verifier") {
            const platformFeePayload = {
              organization: companyDetails.company_name,
              amount: parseInt(companyDetails.charges_per_document || "0"),
              second_access_charge: parseInt(
                companyDetails.charges_second_access || "0"
              ),
              admin_user_name: localStorage.getItem("user_name") || "Unknown User",
              admin_user_type: localStorage.getItem("user_type") || "Unknown User",
              username: companyDetails.poc_full_name || "Unknown User",
            };
            try {
              const platformFeeRes = await axios.post(
                `${AdminManagement}/adminsixapi/save-platform-fee/`,
                platformFeePayload,
                { headers: { "Content-Type": "application/json" } }
              );
              if (platformFeeRes.data.status === "success") {
                setPopupMessage(
                  "User created and platform fee saved successfully."
                );
              } else {
                throw new Error(
                  platformFeeRes.data.message || "Failed to save platform fee."
                );
              }
            } catch (error) {
              console.error("Platform fee submission failed:", error);
              setPopupMessage("User created, but failed to save platform fee.");
            }
          }
        } else {
          const updateStatusRes = await fetch(
            `${AdminManagement}/adminsixapi/update-personal-info-status/${companyDetails.user_id}/`,
            { method: "POST", headers }
          );
          const updateStatusData = await updateStatusRes.json();
          if (!updateStatusRes.ok) {
            throw new Error("Failed to update personal info status.");
          }
          setPopupMessage("Personal info status updated successfully.");
        }
      }
      const emailPayload = {
        email: userEmail,
        password: userPassword,
        organization: companyDetails.company_name,
        name: companyDetails.poc_full_name,
        usertype: companyDetails.user_type,
        status: newStatus,
      };
      const emailRes = await fetch(
        `${AdminManagement}/adminsixapi/KYB-user-email/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(emailPayload),
        }
      );
      const emailData = await emailRes.json();
      if (!emailRes.ok) {
        throw new Error("Failed to send email.");
      }
      setPopupMessage("Email sent successfully.");
      setNotification((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              description: description || prev.description,
            }
          : prev
      );
    } catch (error: any) {
      console.error("Error updating status:", error.message);
      setPopupMessage(`Failed to update status: ${error.message}`);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRejectClick = () => {
    setShowRejectPopup(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      setPopupMessage("Please provide a reason for rejection.");
      return;
    }
    if (notification?.id) {
      await handleStatusUpdate(notification.id, "Rejected", rejectReason);
      setShowRejectPopup(false);
      setRejectReason("");
    }
  };

  const handleRejectCancel = () => {
    setShowRejectPopup(false);
    setRejectReason("");
  };

  const closePopup = () => {
    setPopupMessage(null);
  };

  const renderStatus = () => {
    const statusLower = notification?.status?.toLowerCase() || "n/a";
    const statusClasses = {
      approved: styles.verified,
      pending: styles.pending,
      rejected: styles.rejected,
      "n/a": styles.default,
    };
    const statusClass =
      statusClasses[statusLower as keyof typeof statusClasses] || styles.default;

    if (statusLower === "pending") {
      return null; // Render nothing in header for Pending; buttons will be at the bottom
    }

    return (
      <div className={statusClass}>
        {statusLower === "approved" && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#75FB4C"
            >
              <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-

156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
            <span className={styles.appr_veri_icon}>Approved</span>
          </>
        )}
        {statusLower === "rejected" && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#BB271A"
            >
              <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q54 0 104-17.5t92-50.5L228-676q-33 42-50.5 92T160-480q0 134 93 227t227 93Zm252-124q33-42 50.5-92T800-480q0-134-93-227t-227-93q-54 0-104 17.5T284-732l448 448Z" />
            </svg>
            <span className={styles.rejected_icon}>Rejected</span>
          </>
        )}
        {statusLower === "n/a" && <span className={styles.na_icon}>N/A</span>}
      </div>
    );
  };

  const renderPendingButtons = () => {
    if (notification?.status?.toLowerCase() !== "pending") {
      return null;
    }

    return (
      <div className={styles.pendingButtonsContainer}>
        <div className={styles.statusButtons}>
          <button
            className={styles.approveButton}
            onClick={(e) => {
              e.stopPropagation();
              if (notification?.id)
                handleStatusUpdate(notification.id, "Approved");
              else setPopupMessage("Error: Request ID is missing");
            }}
            disabled={isUpdating === notification?.id}
          >
            {isUpdating === notification?.id ? "Approving..." : "Approve"}
          </button>
          <button
            className={styles.rejectButton}
            onClick={(e) => {
              e.stopPropagation();
              if (notification?.id) handleRejectClick();
              else setPopupMessage("Error: Request ID is missing");
            }}
            disabled={isUpdating === notification?.id}
          >
            {isUpdating === notification?.id ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    );
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
      description:
        "For enterprises requiring comprehensive verification solutions",
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
    <div className={styles.formContainer}>
      <Header searchQuery={searchQuery} onSearch={handleSearch} />
      <div className={styles.contentContainer}>
        <Sidebar />
        <div style={{ width: "100%", maxWidth: "1536px", margin: "0 auto" }}>
          <h1 className={styles.formTitle}>KYB Details</h1>
          <div className={styles.formCard}>
            <div className={styles.headerRow}>
              <FaArrowLeft
                className={styles.backArrow}
                onClick={(e) => {
                  e.stopPropagation();
                  goBack();
                }}
              />
              {renderStatus()}
            </div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Company Details</h2>
            </div>
            <div className={styles.formGrid}>
              <div>
                <label>Company Name</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.company_name || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>DUNS Number</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.duns_number || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>Company Registration Number</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.company_registration_number || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>Company Website</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.company_website || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>Country</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.country || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>Headquarters Address</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.headquarters_address || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
            </div>
          </div>
          <div className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Verification Role</h2>
            </div>
            <div className={styles.formGrid}>
              <div>
                <label>Verification Type</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.verification_type || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>Channel Partner</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.channel_partner || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>Charges for Verification per Document</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.charges_per_document || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>Charges for Second Time Access for Document</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.charges_second_access || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
            </div>
          </div>
          <div className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Operational Info</h2>
            </div>
            <div className={styles.formGrid}>
              <div>
                <label>Turnaround Time (TAT)</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.turnaround_time_value || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>Compliance Certifications</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.compliance_certifications || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
            </div>
          </div>
          <div className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Point of Contact (POC)</h2>
            </div>
            <div className={styles.formGrid}>
              <div>
                <label>POC Full Name</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.poc_full_name || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>POC Designation</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.poc_designation || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>POC Email</label>
                <input
                  type="email"
                  className={styles.inputField}
                  value={notification?.poc_email || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
              <div>
                <label>POC Phone Number</label>
                <input
                  type="tel"
                  className={styles.inputField}
                  value={notification?.poc_phone_number || ""}
                  readOnly
                  placeholder="Null"
                />
              </div>
            </div>
          </div>
          <div className={`${styles.formCard} w-full`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Subscription Plan</h2>
            </div>
            <div className={styles.formGrid}>
              {/* <div>
                <label>Selected Plan</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={notification?.subscription_plan || ""}
                  readOnly
                  placeholder="Null"
                />
              </div> */}
            </div>
            <div className="flex justify-center gap-8 mt-6">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`w-80 relative rounded-xl border p-8 text-left shadow-sm transition-all duration-300 bg-black border-gray-700 text-white overflow-hidden ${
                    notification?.subscription_plan === plan.title
                      ? "border-green-500 border-2"
                      : "border-gray-700"
                  }`}
                >
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white">{plan.title}</h2>
                    <p className="text-gray-400 mt-1">{plan.description}</p>
                    <p className="text-4xl font-bold text-white mt-4">
                      {plan.price}{" "}
                      <span className="text-sm font-normal">
                        {plan.priceDetail}
                      </span>
                    </p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-gray-300">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {renderPendingButtons()}
        </div>
      </div>
      {popupMessage && (
        <PopupMessage
          message={popupMessage}
          onClose={closePopup}
          type={
            popupMessage.includes("successfully")
              ? "success"
              : popupMessage.includes("Failed")
              ? "error"
              : "info"
          }
        />
      )}
      {showRejectPopup && (
        <div className={styles.overlay}>
          <div className={styles.popup}>
            <h2 className={styles.title}>
              Are you sure you want to reject this?
            </h2>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter reason for rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className={styles.buttonContainer}>
              <button
                style={{ width: "90px" }}
                className={styles.cancelButton}
                onClick={handleRejectCancel}
              >
                Cancel
              </button>
              <button
                className={`${styles.confirmButton} ${
                  !rejectReason.trim() ? styles.confirmButtonDisabled : ""
                }`}
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KybDetails;