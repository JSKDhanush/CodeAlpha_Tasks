"use client";
import React, { useEffect, useState, useCallback } from "react";
import Header from "../Navbars/Header";
import Sidebar from "../Navbars/Sidebar";
import styles from "./VerificationRequests.module.css";
import Pagination from "./pagination";
import FilterDropdown from "./filterdropdown";
import moment from "moment";
import "moment-timezone";
import { useRouter } from "next/navigation";
import PopupMessage from "../Navbars/PopupMessage";
import Loadingspinner from "@/app/assets/loadingspinner";
const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
import ErrorBoundary from "@/components/ErrorBoundary";
import VerificationRequestsTabs from "./VerificationRequestsTabs";

interface Notifications {
  request_id?: string;
  seeker_id?: string;
  nft_id?: string;
  status: string;
  payment_status?: string;
  updated_at: string;
  user_id?: string;
  name: string;
  owner_name: string;
  symmetric_key?: string;
  verifier_id?: string;
  category?: string | string[];
  verifier_name: string;
  seeker_organization_name: string;
  verifier_organization_name: string;
  nft_document_name: string | string[];
  seeker_name: string;
  description: string;
  owner_phone_number: string;
  seeker_phone_number: string;
  verifier_phone_number: string;
  type: "seeker_access" | "verifier_access" | "verification";
  id: string;
  message: string;
  createdAt: string;
}

type NotificationType = "seeker_access" | "verifier_access" | "verification";

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  type: NotificationType;
}

const VerificatioRequests: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [requestType, setRequestType] = useState<
    "seeker_access" | "verifier_access" | "verification" | null
  >("verification");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDateRange, setFilterDateRange] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    setShowLoader(true);
    try {
      const endpoints = [
        `${AdminManagement}/adminthreeapi/data-access-request`,
        `${AdminManagement}/admintwoapi/verification-request`,
        `${AdminManagement}/adminthreeapi/seeker_to_verifier/`,
      ];

      const responses = await Promise.allSettled(
        endpoints.map((url, index) => {
          console.time(`API call ${index + 1} - ${url}`);
          return fetch(url)
            .then((res) => {
              if (!res.ok)
                throw new Error(`Failed to fetch: ${res.statusText}`);
              return res.json();
            })
            .finally(() => {
              console.timeEnd(`API call ${index + 1} - ${url}`);
            });
        })
      );

      const [accessData, verificationData, seekerData] = responses.map(
        (res, index) =>
          res.status === "fulfilled"
            ? res.value.map((req) => {
                const id = req.id || req.request_id;
                const request_id = req.request_id || req.id;
                console.log(
                  `API ${index + 1} - Mapping: id=${id}, request_id=${request_id}`
                );
                return {
                  ...req,
                  id,
                  type:
                    index === 0
                      ? "seeker_access"
                      : index === 1
                      ? "verifier_access"
                      : "verification",
                  request_id,
                };
              })
            : []
      );

      const allNotifications = [
        ...accessData,
        ...verificationData,
        ...seekerData,
      ];
      console.log("Fetched notifications:", allNotifications);
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

    const interval = setInterval(() => {
      fetchNotifications();
    }, 180000);

    return () => clearInterval(interval);
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

  const formatTime = (timestamp: string | number | Date) => {
    if (!timestamp) return "Unknown";

    const time = moment(timestamp).tz("Asia/Kolkata");
    if (!time.isValid()) return "Invalid date";

    const now = moment().tz("Asia/Kolkata");
    const diffMinutes = now.diff(time, "minutes");
    if (diffMinutes < 1) return "Now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleClick = useCallback(
    (notification: Notification) => {
      sessionStorage.setItem(
        "selectedNotification",
        JSON.stringify(notification)
      );
      router.push(
        notification.type === "verification"
          ? "./VerificationRequests/Requestdetails"
          : "./VerificationRequests/notificationdetails"
      );
    },
    [router]
  );

  const sortedNotifications: Notifications[] = notifications.sort((a, b) => {
    const dateA = new Date(a.updated_at).getTime();
    const dateB = new Date(b.updated_at).getTime();
    return dateB - dateA;
  });

  const toggleFilterDropdown = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const filteredNotifications = notifications.filter((notification) => {
    let isValid = true;

    if (requestType) {
      if (
        requestType === "verifier_access" &&
        notification.type !== "verifier_access"
      ) {
        isValid = false;
      }
      if (
        requestType === "verification" &&
        notification.type !== "verification"
      ) {
        isValid = false;
      }
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

        if (startDate && endDate) {
          isValid =
            isValid && updatedAtDate >= startDate && updatedAtDate <= endDate;
        } else if (startDate) {
          isValid = isValid && updatedAtDate >= startDate;
        } else if (endDate) {
          isValid = isValid && updatedAtDate <= endDate;
        } else {
          isValid = false;
        }
      } else {
        const singleDate = new Date(filterDateRange);
        if (singleDate) {
          isValid =
            isValid &&
            updatedAtDate.getFullYear() === singleDate.getFullYear() &&
            updatedAtDate.getMonth() === singleDate.getMonth() &&
            updatedAtDate.getDate() === singleDate.getDate();
        } else {
          isValid = false;
        }
      }
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      // Search only in Request ID and Requested By fields
      const requestIdMatch = notification.request_id
        ? notification.request_id.toLowerCase().includes(searchLower)
        : false;

      const requestedByMatch =
        (notification.seeker_organization_name &&
          notification.seeker_organization_name
            .toLowerCase()
            .includes(searchLower)) ||
        (notification.seeker_name &&
          notification.seeker_name.toLowerCase().includes(searchLower)) ||
        (notification.owner_name &&
          notification.owner_name.toLowerCase().includes(searchLower));

      isValid = isValid && (requestIdMatch || requestedByMatch);
    }

    return isValid;
  });

  const currentRequests = filteredNotifications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  function closePopup(): void {
    if (typeof document !== "undefined") {
      const popup = document.getElementById("popup");
      if (popup) {
        popup.style.display = "none";
      }
    }
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

    return () => {
      window.removeEventListener("error", handleChunkError);
    };
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
            <Header searchQuery={searchQuery} onSearch={handleSearch} />
            <div className={styles.container}>
              <Sidebar />
              <main className={styles.main}>
                <h1 className={styles.pageTitle}>Verification Requests</h1>
                <section className={styles.content}>
                  {/* Tabs Section */}
                  <div className={styles.documentslist}>
                    <VerificationRequestsTabs
                      requestType={requestType}
                      setRequestType={setRequestType}
                      sortedNotifications={sortedNotifications}
                      filterType={null}
                      filterValue={""}
                    />
                  </div>
                  {/* Filter Section */}
                  <div className={styles.filterSection}>
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
                          <th style={{ paddingRight: "6.35%" }}>Request ID</th>
                          <th>Requested By</th>
                          <th>Requested To</th>
                          <th>Type</th>
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
                              verifier_name,
                              type,
                              status,
                              updated_at,
                              request_id,
                              seeker_organization_name,
                              verifier_organization_name,
                            } = notification;

                            const renderStatus = () => {
                              console.log(
                                `Rendering status for id=${id}, status=${status}`
                              );
                              const statusLower = status.toLowerCase();
                              const statusClasses = {
                                approved: styles.verified,
                                verified: styles.verified,
                                pending: styles.pending,
                                rejected: styles.rejected,
                                "action taken": styles.default,
                              };

                              const statusClass =
                                statusClasses[
                                  statusLower as keyof typeof statusClasses
                                ] || "";
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
                                        <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                                      </svg>
                                      <span className={styles.appr_veri_icon}>
                                        Approved
                                      </span>
                                    </>
                                  )}
                                  {statusLower === "verified" && (
                                    <>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20px"
                                        viewBox="0 -960 960 960"
                                        width="20px"
                                        fill="#75FB4C"
                                      >
                                        <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                                      </svg>
                                      <span className={styles.appr_veri_icon}>
                                        Verified
                                      </span>
                                    </>
                                  )}
                                  {statusLower === "pending" && (
                                    <>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20px"
                                        viewBox="0 -960 960 960"
                                        width="20px"
                                        fill="#F19E39"
                                      >
                                        <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                                      </svg>
                                      <span className={styles.pending_icon}>
                                        Pending
                                      </span>
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
                                      <span className={styles.rejected_icon}>
                                        Rejected
                                      </span>
                                    </>
                                  )}
                                  {statusLower === "action taken" && (
                                    <>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="20px"
                                        viewBox="0 -960 960 960"
                                        width="20px"
                                        fill="#E8E81F"
                                      >
                                        <path d="M202.87-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-554.26q0-37.78 26.61-64.39t64.39-26.61H480v91H202.87v554.26h554.26V-480h91v277.13q0 37.78-26.61 64.39t-64.39 26.61H202.87ZM395.41-332 332-395.41l361.72-361.72H560v-91h288.13V-560h-91v-133.72L395.41-332Z" />
                                      </svg>
                                      <span className={styles.action_taken_icon}>
                                        Action Taken
                                      </span>
                                    </>
                                  )}
                                </div>
                              );
                            };

                            return (
                              <tr
                                key={index}
                                className={styles.tableRow}
                                onClick={() => handleClick(notification)}
                              >
                                <td className={styles.tableCell}>
                                  {notification.request_id || "N/A"}
                                </td>
                                <td className={styles.tableCell}>
                                  {seeker_organization_name ||
                                    seeker_name ||
                                    owner_name ||
                                    "N/A"}
                                </td>
                                <td className={styles.tableCell}>
                                  {verifier_organization_name ||
                                    verifier_name ||
                                    "N/A"}
                                </td>
                                <td className={styles.tableCell}>
                                  {type === "seeker_access"
                                    ? "Data Access"
                                    : type === "verifier_access"
                                    ? "Verifier Access"
                                    : "Verification"}
                                </td>
                                <td className={styles.tableCell}>
                                  {formatDate(updated_at)}
                                </td>
                                <td className={styles.tableCell}>
                                  {renderStatus()}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className={styles.noRequests}>
                              <h1>No Requests found</h1>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <div className={styles.paginationWrapper}>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(
                          filteredNotifications.length / itemsPerPage
                        )}
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
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default VerificatioRequests;