"use client";
import ErrorBoundary from "@/components/ErrorBoundary";
import React, { useEffect, useState } from "react";
import styles from "./UserSupport.module.css";
import Sidebar from "../Navbars/Sidebar";
import Header from "../Navbars/Header";
import { SearchBar } from "./FilterSection";
import dynamic from "next/dynamic";
import Pagination from "./Pagination";

// const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
const UserSupportService = process.env.NEXT_PUBLIC_UserSupportService;
const Loadingspinner = dynamic(() => import("../../assets/loadingspinner"), {
  ssr: false,
});

interface UserSupportEntry {
  id: number;
  name: string;
  email: string;
  usertype: string;
  category: string;
  description: string;
  document: string;
  created_at: string;
  action: string;
}

const UserSupport: React.FC = () => {
  const [logs, setLogs] = useState<UserSupportEntry[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [replyStatus, setReplyStatus] = useState<string>("");

  useEffect(() => {
    const fetchLogs = async () => {
      setShowLoader(true);
      setError(null);

      try {
        const response = await fetch(
          `${UserSupportService}/contactusapp_api/user-support/`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch user support logs (Status: ${response.status})`
          );
        }
        const data = await response.json();

        const sortedLogs = data.sort(
          (a: UserSupportEntry, b: UserSupportEntry) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        setLogs(sortedLogs);
      } catch (err) {
        console.error("Error fetching user support logs:", err);
        setError("Failed to load user support logs. Please try again.");
      } finally {
        setShowLoader(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log: UserSupportEntry) => {
    if (searchQuery) {
      return log.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "?"
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleReplyClick = (email: string) => {
    setSelectedEmail(email);
    setReplyMessage("");
    setReplyStatus("");
    setIsModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      setReplyStatus("Please enter a message.");
      return;
    }

    setReplyStatus("Sending...");

    try {
      const response = await fetch(`${UserSupportService}/contactusapp_api/send-support-email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: selectedEmail,
          message: replyMessage,
        }).toString(),
      });

      // Clone response to allow multiple reads
      const textResponse = await response.clone().text();
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        console.log("Raw response text:", textResponse);
        throw new Error(`Invalid JSON response from server: ${textResponse.substring(0, 200)}`);
      }

      console.log("Response:", { status: response.status, data });

      if (response.ok) {
        setReplyStatus("Message sent successfully!");
        setTimeout(() => {
          setIsModalOpen(false);
          setReplyStatus("");
        }, 2000);
      } else {
        setReplyStatus(`Error: ${data.error || "Failed to send email."}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setReplyStatus(`Failed to send email: ${err.message || "Please try again."}`);
    }
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
            <Sidebar />
            <div className={styles.content}>
              <Header />
              <div className={styles.container}>
                <h2
                  className={styles["page-title"]}
                  style={{ marginBottom: "16px" }}
                >
                  Users Supports
                </h2>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                </div>
                <div className={styles["table-container"]}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: "4%" }}>User Name</th>
                        <th>Category</th>
                        <th>UserType</th>
                        <th>Description</th>
                        <th>Action</th>
                        <th>Reply</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLogs.length > 0 ? (
                        currentLogs.map((log, index) => {
                          const date = new Date(log.created_at);
                          const formattedDate = date.toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          );
                          const formattedTime = date.toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }
                          );
                          const formattedDateTime = `${formattedDate} • ${formattedTime}`;

                          const renderActionStatus = () => {
                            const actionLower = log.action.toLowerCase();
                            return (
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: "4px 12px",
                                  borderRadius: "16px",
                                  backgroundColor:
                                    actionLower === "pending"
                                      ? "#4A3B1E"
                                      : actionLower === "completed"
                                      ? "#1E4A3B"
                                      : "#4A3B1E",
                                  color:
                                    actionLower === "pending"
                                      ? "#F19E39"
                                      : actionLower === "completed"
                                      ? "#75FB4C"
                                      : "#F19E39",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  gap: "4px",
                                }}
                              >
                                {actionLower === "pending" && (
                                  <>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      height="20px"
                                      viewBox="0 -960 960 960"
                                      width="20px"
                                      fill="#F19E39"
                                    >
                                      <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320q-33 0-56.5-23.5T400-560q0-33 23.5-56.5T480-640q33 0 56.5 23.5T560-560q0 33-23.5 56.5T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm-40 280h80v-360h-80v360Z" />
                                    </svg>
                                    <span>Pending</span>
                                  </>
                                )}
                                {actionLower === "completed" && (
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
                                    <span>Completed</span>
                                  </>
                                )}
                              </div>
                            );
                          };

                          return (
                            <tr key={index} className={styles["table-row"]}>
                              <td className={styles["name-column"]}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <div className={styles["initials-circle"]}>
                                    {getInitials(log.name)}
                                  </div>
                                  <div
                                    className={styles["name-email-container"]}
                                  >
                                    <span className={styles["user-name"]}>
                                      {log.name}
                                    </span>
                                    <span className={styles["user-email"]}>
                                      {log.email}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>{log.category}</td>
                              <td className={styles["date-time-column"]}>
                                {log.usertype}
                              </td>
                              <td>{log.description}</td>
                              <td>{renderActionStatus()}</td>
                              <td>
                                <button
                                  onClick={() => handleReplyClick(log.email)}
                                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                  Reply
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              textAlign: "center",
                              padding: "50px",
                              color: "yellow",
                            }}
                          >
                            No logs found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  handleItemsPerPageChange={handleItemsPerPageChange}
                  totalItems={filteredLogs.length}
                />
              </div>
            </div>
          </>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-white text-lg font-semibold mb-4">
                Reply to {selectedEmail}
              </h3>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Enter your reply message"
                className="w-full p-2 bg-gray-700 text-white rounded-md mb-4"
                rows={5}
              />
              {replyStatus && (
                <p
                  className={`mb-4 ${
                    replyStatus.includes("Error") || replyStatus.includes("Please")
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {replyStatus}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReply}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default UserSupport;