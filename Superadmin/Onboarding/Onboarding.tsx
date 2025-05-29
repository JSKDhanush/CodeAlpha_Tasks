"use client";
import React, { useEffect, useState, useCallback } from "react";
import Header from "../Navbars/Header";
import Sidebar from "../Navbars/Sidebar";
import styles from "./Onboarding.module.css";
import Pagination from "./pagination";
import FilterDropdown from "./filterdropdown";
import moment from "moment";
import "moment-timezone";
import { useRouter } from "next/navigation";
import PopupMessage from "../Navbars/PopupMessage";
import Loadingspinner from "@/app/assets/loadingspinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import OnboardingTabs from "./OnboardingTabs";

const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
const AuthenticationandUsermanagement = process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;
const ChannelPartner = process.env.NEXT_PUBLIC_ChannelPartner;

interface Notifications {
  request_id?: string;
  status: string;
  updated_at: string;
  name: string;
  owner_name: string;
  seeker_organization_name: string;
  nft_document_name: string | string[];
  seeker_name: string;
  description: string;
  owner_phone_number: string;
  seeker_phone_number: string;
  type: "kyb" | "channel_partner";
  id: string;
  message: string;
  createdAt: string;
  company_name?: string;
  country?: string;
  channel_partner?: string;
  channel_partner_name?: string;
}

type NotificationType = "kyb" | "channel_partner";

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  type: NotificationType;
}

const Onboarding: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [requestType, setRequestType] = useState<"kyb" | "channel_partner">("kyb");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDateRange, setFilterDateRange] = useState<string>("");
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<boolean>(false);
  const [showRejectPopup, setShowRejectPopup] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setShowLoader(true);
    try {
      const endpoints = [
        `${AuthenticationandUsermanagement}/auth_kyb_details_api/company-verification/`,
        `${ChannelPartner}/chan_partner/data_data_requests_api/`,
      ];

      const responses = await Promise.allSettled(
        endpoints.map((url, index) =>
          fetch(url).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
            return res.json();
          })
        )
      );

      const [kybData, channelPartnerData] = responses.map((res, index) =>
        res.status === "fulfilled"
          ? res.value.map((req) => ({
              ...req,
              id: req.id || req.request_id,
              type: index === 0 ? "kyb" : "channel_partner",
              request_id: req.request_id || req.id,
              seeker_organization_name: req.company_name,
              company_name: req.company_name,
              country: req.country,
              channel_partner: index === 0 ? req.channel_partner : undefined,
              channel_partner_name: index === 1 ? req.channel_partner_name : undefined,
              status: req.status,
              createdAt: req.created_at,
              updated_at: req.updated_at || req.created_at,
            }))
          : []
      );

      const allNotifications = [...kybData, ...channelPartnerData];
      setNotifications(allNotifications);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setPopupMessage("Failed to fetch notifications. Please try again later.");
    } finally {
      setShowLoader(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const kybInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(kybInterval);
  }, [fetchNotifications]);

  const formatDate = (dateString: string, includeTime: boolean = false) => {
    const date = new Date(dateString);
    if (!date || isNaN(date.getTime())) return "N/A";
    const formattedDate = date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
    if (includeTime) {
      const formattedTime = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${formattedDate} ${formattedTime}`;
    }
    return formattedDate;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleViewMoreClick = useCallback(
    (notification: Notification) => {
      sessionStorage.setItem("selectedNotification", JSON.stringify(notification));
      if (notification.type === "kyb") {
        router.push("./Onboarding/KybDetails");
      } else {
        router.push("./Onboarding/ChannelPartnerDetails");
      }
    },
    [router]
  );

  const handleStatusUpdate = async (id: string, newStatus: string, description?: string) => {
    try {
      const notification = notifications.find((n) => n.request_id === id);
      if (!notification || !notification.id) {
        throw new Error("Notification not found for this request");
      }

      const token = localStorage.getItem("authToken");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const body = JSON.stringify({ description: description || null });

      const updateResponse = await fetch(
        `${AuthenticationandUsermanagement}/auth_kyb_details_api/update-status/${notification.id}/${newStatus}/`,
        { method: "POST", headers, body }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Status update failed: ${updateResponse.status} ${errorText}`);
      }

      const companyRes = await fetch(
        `${AuthenticationandUsermanagement}/auth_kyb_details_api/fetchcomapnydetailsby_id/${notification.id}/`
      );
      const companyDetails = await companyRes.json();
      if (!companyRes.ok) throw new Error("Failed to fetch company details.");

      const userEmail = companyDetails.poc_email;
      const userPassword = companyDetails.poc_phone_number;

      if (newStatus === "Approved") {
        if (!companyDetails.user_id) {
          const userPayload = {
            first_name: companyDetails.poc_full_name,
            last_name: "",
            email: userEmail,
            phone_number: userPassword,
            usertype: companyDetails.user_type,
            password: userPassword,
            organization: companyDetails.company_name,
            country: companyDetails.country,
            channelPartner: companyDetails.channel_partner,
            personal_info_status: "True",
          };

          const userRes = await fetch(`${AdminManagement}/adminapi/add-user`, {
            method: "POST",
            headers,
            body: JSON.stringify(userPayload),
          });

          if (!userRes.ok) throw new Error(`User creation failed: ${userRes.status}`);
          setPopupMessage("User created successfully.");
        } else {
          const updateStatusRes = await fetch(
            `${AdminManagement}/adminsixapi/update-personal-info-status/${companyDetails.user_id}/`,
            { method: "POST", headers }
          );

          if (!updateStatusRes.ok) throw new Error("Failed to update personal info status.");
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

      const emailRes = await fetch(`${AdminManagement}/adminsixapi/KYB-user-email/`, {
        method: "POST",
        headers,
        body: JSON.stringify(emailPayload),
      });

      if (!emailRes.ok) throw new Error("Failed to send email.");
      setPopupMessage("Email sent successfully.");

      setNotifications((prev) =>
        prev.map((n) =>
          n.request_id === id
            ? { ...n, status: newStatus, description: description || n.description }
            : n
        )
      );
    } catch (error: any) {
      console.error("Error:", error.message);
      setPopupMessage(`${error.message}`);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedId(id);
    setShowRejectPopup(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      setPopupMessage("Please provide a reason for rejection");
      return;
    }
    if (selectedId) {
      await handleStatusUpdate(selectedId, "Rejected", rejectReason);
      setShowRejectPopup(false);
      setRejectReason("");
      setSelectedId(null);
    }
  };

  const handleRejectCancel = () => {
    setShowRejectPopup(false);
    setRejectReason("");
    setSelectedId(null);
  };

  const sortedNotifications: Notifications[] = notifications.sort((a, b) => {
    const dateA = new Date(a.updated_at).getTime();
    const dateB = new Date(b.updated_at).getTime();
    return dateB - dateA;
  });

  const filteredNotifications = notifications.filter((notification) => {
    let isValid = true;

    if (requestType && notification.type !== requestType) {
      isValid = false;
    }

    if (filterStatus && notification.status !== filterStatus) {
      isValid = false;
    }

    if (filterDateRange) {
      const updatedAtDate = new Date(notification.updated_at);
      if (filterDateRange.includes(" to ")) {
        const [startDateStr, endDateStr] = filterDateRange.split(" to ");
        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);
        isValid = isValid && updatedAtDate >= startDate && updatedAtDate <= endDate;
      } else {
        const singleDate = new Date(filterDateRange);
        isValid =
          isValid &&
          updatedAtDate.getFullYear() === singleDate.getFullYear() &&
          updatedAtDate.getMonth() === singleDate.getMonth() &&
          updatedAtDate.getDate() === singleDate.getDate();
      }
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const requestIdMatch = notification.request_id
        ? notification.request_id.toLowerCase().includes(searchLower)
        : false;

      const requestedByMatch =
        (notification.company_name &&
          notification.company_name.toLowerCase().includes(searchLower)) ||
        (notification.seeker_organization_name &&
          notification.seeker_organization_name.toLowerCase().includes(searchLower)) ||
        (notification.seeker_name &&
          notification.seeker_name.toLowerCase().includes(searchLower)) ||
        (notification.owner_name &&
          notification.owner_name.toLowerCase().includes(searchLower));

      isValid = isValid && (requestIdMatch || requestedByMatch);
    }

    return isValid;
  });

  const currentRequests = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);

  function closePopup(): void {
    const popup = document.getElementById("popup");
    if (popup) popup.style.display = "none";
  }

  useEffect(() => {
    const handleChunkError = (event: any) => {
      if (
        event.message.includes("Loading chunk") ||
        event.message.includes("document not found") ||
        event.message.includes("failed to fetch dynamically imported module")
      ) {
        setErrorMessage(true);
      }
    };
    window.addEventListener("error", handleChunkError);
    return () => window.removeEventListener("error", handleChunkError);
  }, []);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h2 className="text-red-500 text-xl font-bold">
          Something went wrong. Please try again later
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
          <h2 className="text-red-500 text-xl font-bold">
            Something went wrong. Please try again later
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Reload Page
          </button>
        </div>
      }
    >
      <div className={styles.dashboard}>
        {showLoader ? (
          <div className={styles.loaderWrapper}>
            <Loadingspinner />
          </div>
        ) : (
          <>
            <Header searchQuery={searchQuery} onSearch={setSearchQuery} />
            <div className={styles.container}>
              <Sidebar />
              <main className={styles.main}>
                <h1 className={styles.pageTitle}>Onboarding Requests</h1>
                <section className={styles.content}>
                  <div className={styles.documentslist}>
                    <OnboardingTabs
                      requestType={requestType}
                      setRequestType={setRequestType}
                      sortedNotifications={sortedNotifications}
                      filterType={null}
                      filterValue={""}
                    />
                  </div>
                  <div className={styles.filterContainer}>
                    <FilterDropdown
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      filterDateRange={filterDateRange}
                      setFilterDateRange={setFilterDateRange}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                    />
                  </div>
                  <div className={styles.content1}>
                    <table className={styles.requestTable}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", paddingLeft: "3%" }}>Request ID</th>
                          <th>Requested By</th>
                          <th>Requested To</th>
                          <th>Country</th>
                          <th>Channel Partner</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRequests.length > 0 ? (
                          currentRequests.map((notification, index) => {
                            const {
                              id,
                              seeker_name,
                              owner_name,
                              type,
                              status,
                              updated_at,
                              company_name,
                              country,
                              channel_partner,
                              channel_partner_name,
                              createdAt,
                              request_id,
                              seeker_organization_name,
                            } = notification;

                            const renderStatus = () => {
                              return (
                                <button
                                  className={styles.viewMore}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewMoreClick(notification);
                                  }}
                                >
                                  View more
                                </button>
                              );
                            };

                            return (
                              <tr
                                key={index}
                                className={styles.tableRow}
                              >
                                <td className={styles.tableCell}>{request_id || "N/A"}</td>
                                <td className={styles.tableCell}>
                                  {company_name || seeker_organization_name || seeker_name || owner_name || "N/A"}
                                </td>
                                <td className={styles.tableCell}>SuperAdmin</td>
                                <td className={styles.tableCell}>{country || "N/A"}</td>
                                <td className={styles.tableCell}>
                                  {type === "kyb" ? channel_partner || "N/A" : channel_partner_name || "N/A"}
                                </td>
                                <td className={styles.tableCell}>{formatDate(createdAt, true)}</td>
                                <td className={styles.tableCell}>{renderStatus()}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className={styles.noRequests}>
                              <h1>No Requests found</h1>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <div className={styles.paginationWrapper}>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredNotifications.length / itemsPerPage)}
                        handlePageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        handleItemsPerPageChange={handleItemsPerPageChange}
                        totalItems={filteredNotifications.length}
                      />
                    </div>
                  </div>
                </section>
              </main>
              {popupMessage && (
                <PopupMessage
                  message={popupMessage}
                  onClose={closePopup}
                  type={
                    popupMessage.includes("successfully")
                      ? "success"
                      : popupMessage.includes("Error")
                      ? "error"
                      : "info"
                  }
                />
              )}
              {showRejectPopup && (
                <div className={styles.overlay}>
                  <div className={styles.popup}>
                    <h2 className={styles.title}>Are you sure you want to reject this?</h2>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Enter reason for rejection"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className={styles.buttonContainer}>
                      <button className={styles.cancelButton} onClick={handleRejectCancel}>
                        Cancel
                      </button>
                      <button
                        className={`${styles.confirmButton} ${!rejectReason.trim() ? styles.confirmButtonDisabled : ""}`}
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
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};
export default Onboarding;