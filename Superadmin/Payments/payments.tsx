"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Header from "../Navbars/Header";
import Sidebar from "../Navbars/Sidebar";
import Loadingspinner from "@/app/assets/loadingspinner";
import PopupMessage from "../Navbars/PopupMessage";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CiCircleCheck } from "react-icons/ci";
import Pagination from "./Pagination";
const TransactionModal = React.lazy(() => import("./transactionmodal"));
const FilterDropdown = React.lazy(() => import("./filterdropdown"));
import styles from "./VerificationRequest.module.css";

const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;

interface VerificationRequest {
  seeker_name: string;
  payment_id: string;
  request_id: string;
  amount: string;
  status: string;
  transaction_reference: string;
  created_at: string;
  seeker_id: string;
  verifier_organization: string;
  organization: string;
}

const VerificationRequest: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("");
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [modalData, setModalData] = useState<VerificationRequest | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setShowLoader(true);
      try {
        const response = await axios.get<VerificationRequest[]>(
          `${AdminManagement}/admintwoapi/payments`
        );
        setRequests(response.data);
        setShowLoader(false);
      } catch (error: any) {
        if (
          error.message.includes("Loading chunk") ||
          error.message.includes("ChunkLoadError")
        ) {
          setErrorMessage(true);
        } else {
          setPopupMessage(
            "Failed to load data. Please check your connection and try again."
          );
        }
        setShowLoader(false);
      }
    };

    fetchData();
  }, []);

  const closePopup = () => {
    setPopupMessage(null);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const formattedDate = new Date(request.created_at)
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(",", "");

      const nameMatch = request.seeker_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      let dateMatch = true;
      if (filterDateRange) {
        const [startDateStr, endDateStr] = filterDateRange.includes(" to ")
          ? filterDateRange.split(" to ")
          : [filterDateRange, filterDateRange];
        const requestDate = new Date(request.created_at).setHours(0, 0, 0, 0);
        const startDate = startDateStr
          ? new Date(startDateStr).setHours(0, 0, 0, 0)
          : null;
        const endDate = endDateStr
          ? new Date(endDateStr).setHours(0, 0, 0, 0)
          : null;

        if (startDate && endDate) {
          dateMatch = requestDate >= startDate && requestDate <= endDate;
        } else if (startDate) {
          dateMatch = requestDate >= startDate;
        }
      }

      return nameMatch && dateMatch;
    });
  }, [requests, searchQuery, filterDateRange]);

  const calculateDateTimeInIST = (createdAt: string | null) => {
    if (!createdAt) return { date: "No Date", time: "No Time" };

    const utcDate = new Date(createdAt);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(utcDate.getTime() + istOffset);

    const day = istDate.getDate();
    const month = istDate.toLocaleString("default", { month: "short" });
    const year = istDate.getFullYear();
    const formattedDate = `${day < 10 ? "0" + day : day} ${month} ${year}`;

    let hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
    const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;

    return { date: formattedDate, time: formattedTime };
  };

  const handleViewDetails = useCallback((request: VerificationRequest) => {
    setModalData(request);
    setModalVisible(true);
  }, []);

  const formattedRequests = useMemo(() => {
    return filteredRequests.map((request) => ({
      ...request,
      formattedDateTime: calculateDateTimeInIST(request.created_at),
    }));
  }, [filteredRequests]);

  const totalItems = formattedRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return formattedRequests.slice(startIndex, endIndex);
  }, [currentPage, itemsPerPage, formattedRequests]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

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
      <div className={styles.errorContainer}>
        <h2 className={styles.errorTitle}>
          Something went wrong. Please try again later
        </h2>
        <button
          onClick={() => window.location.reload()}
          className={styles.reloadButton}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className={styles.errorContainer}>
          <h2 className={styles.errorTitle}>
            Something went wrong. Please try again later
          </h2>
          <button
            onClick={() => window.location.reload()}
            className={styles.reloadButton}
          >
            Reload Page
          </button>
        </div>
      }
    >
      <div className={styles.mainContainer}>
        {showLoader ? (
          <div className={styles.loaderContainer}>
            <Loadingspinner />
          </div>
        ) : (
          <>
            <Header />
            <div className={styles.contentWrapper}>
              <Sidebar />
              <main className={styles.mainContent}>
                <section className={styles.section}>
                  <div className={styles.headerSection}>
                    <h1 className={styles.headerTitle}>Payments</h1>
                    <div className={styles.filterWrapper}>
                      <FilterDropdown
                        setFilterDateRange={setFilterDateRange}
                        setSearchQuery={setSearchQuery}
                      />
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

                  {formattedRequests.length > 0 ? (
                    <>
                      <table className={styles.table}>
                        <thead className={styles.tableHead}>
                          <tr>
                            <th className={styles.tableHeader}>Request</th>
                            <th className={styles.tableHeader}>Payment</th>
                            <th className={styles.tableHeader}>Name</th>
                            <th className={styles.tableHeader}>Asset Owner</th>
                            <th className={styles.tableHeader}>Customer</th>
                            <th className={styles.tableHeader}>Amount</th>
                            <th className={styles.tableHeader}>Date&Time</th>
                            <th
                              className={`${styles.tableHeader} ${styles.lastHeader}`}
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className={styles.tableBody}>
                          {paginatedRequests.map((request, index) => (
                            <tr
                              key={request.request_id}
                              onClick={() => handleViewDetails(request)}
                              className={styles.tableRow}
                            >
                              <td
                                className={`${styles.tableCell} ${
                                  index === paginatedRequests.length - 1
                                    ? styles.lastRowCell
                                    : ""
                                }`}
                              >
                                {request.request_id}
                              </td>
                              <td
                                className={`${styles.tableCell} ${
                                  index === paginatedRequests.length - 1
                                    ? styles.lastRowCell
                                    : ""
                                }`}
                              >
                                {request.payment_id}
                              </td>
                              <td
                                className={`${styles.tableCell} ${
                                  index === paginatedRequests.length - 1
                                    ? styles.lastRowCell
                                    : ""
                                }`}
                              >
                                {request.seeker_name}
                              </td>
                              <td
                                className={`${styles.tableCell} ${
                                  index === paginatedRequests.length - 1
                                    ? styles.lastRowCell
                                    : ""
                                }`}
                              >
                                {request.verifier_organization}
                              </td>
                              <td
                                className={`${styles.tableCell} ${
                                  index === paginatedRequests.length - 1
                                    ? styles.lastRowCell
                                    : ""
                                }`}
                              >
                                {request.organization}
                              </td>
                              <td
                                className={`${styles.tableCell} ${
                                  index === paginatedRequests.length - 1
                                    ? styles.lastRowCell
                                    : ""
                                }`}
                              >
                                ₹{request.amount}
                              </td>
                              <td
                                className={`${styles.tableCell} ${
                                  index === paginatedRequests.length - 1
                                    ? styles.lastRowCell
                                    : ""
                                }`}
                              >
                                {request.formattedDateTime.date},{" "}
                                {request.formattedDateTime.time}
                              </td>
                              <td
                                className={`${styles.tableCell} ${
                                  index === paginatedRequests.length - 1
                                    ? styles.lastRowCell
                                    : ""
                                } ${styles.statusCell}`}
                              >
                                {request.status === "Paid" ? (
                                  <div className={styles.statusSuccess}>
                                    <CiCircleCheck color="#75FB4C" size={15} />
                                    <span>Success</span>
                                  </div>
                                ) : (
                                  request.status
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className={styles.paginationContainer}>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          handlePageChange={handlePageChange}
                          itemsPerPage={itemsPerPage}
                          handleItemsPerPageChange={handleItemsPerPageChange}
                          totalItems={totalItems}
                        />
                      </div>
                    </>
                  ) : (
                    <div className={styles.noPaymentsContainer}>
                      <h1 className={styles.noPaymentsText}>
                        No payments found
                      </h1>
                    </div>
                  )}
                </section>
              </main>
            </div>

            {isModalVisible && modalData && (
              <TransactionModal
                modalData={modalData}
                closeModal={() => setModalData(null)}
                calculateDateTimeInIST={calculateDateTimeInIST}
              />
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default VerificationRequest;