"use client";
import ErrorBoundary from "@/components/ErrorBoundary";
import React, { useEffect, useState } from "react";
import styles from "./auditlog.module.css";
import Sidebar from "../Navbars/Sidebar";
import Header from "../Navbars/Header";
import moment from "moment";
import "moment-timezone";
import dynamic from "next/dynamic";
import Pagination from "./Pagination";

// FilterSection Component
interface FilterSectionProps {
  setFilterDateRange: (dateRange: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchBar: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}> = ({ searchQuery, setSearchQuery }) => {
  const [isFocused, setIsFocused] = useState(false); // Track focus state

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: isFocused ? "2px solid #fff" : "1px solid #253443", // White border on focus
        background: "transparent",
        padding: "8px",
        borderRadius: "10px",
        width: "500px",
        height: "53px",
      }}
    >
      <i
        className="fas fa-search search-icon"
        style={{ marginRight: "8px", color: "#fff" }}
      ></i>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search by Name or Email..."
        value={searchQuery}
        onChange={handleSearch}
        onFocus={() => setIsFocused(true)} // Set focus state
        onBlur={() => setIsFocused(false)} // Remove focus state
        style={{
          background: "transparent",
          color: "#fff",
          border: "none",
          outline: "none",
          flex: 1,
        }}
      />
    </div>
  );
};

export const DateFilter: React.FC<{
  setFilterDateRange: (dateRange: string) => void;
}> = ({ setFilterDateRange }) => {
  const [showDateRange, setShowDateRange] = useState(false);
  const [localFilterDateRange, setLocalFilterDateRange] = useState("");
  const [isDateFocused, setIsDateFocused] = useState(false); // Track date input focus

  const [startDate, endDate] = localFilterDateRange.includes(" to ")
    ? localFilterDateRange.split(" to ")
    : [localFilterDateRange, ""];

  const handleDateRangeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isStart: boolean
  ) => {
    const newDate = e.target.value;
    let newRange;
    if (isStart) {
      newRange = newDate && endDate ? `${newDate} to ${endDate}` : newDate;
    } else {
      newRange =
        startDate && newDate ? `${startDate} to ${newDate}` : startDate;
    }
    setLocalFilterDateRange(newRange);
    setFilterDateRange(newRange);
  };

  const resetDateRange = () => {
    setLocalFilterDateRange("");
    setFilterDateRange("");
    setShowDateRange(false);
    setIsDateFocused(false);
  };

  const toggleDateRange = () => {
    setShowDateRange(!showDateRange);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {!showDateRange ? (
        <button
          onClick={toggleDateRange}
          className={styles.dateButton}
          style={{
            padding: "8px 16px",
            border: "1px solid #253443",
            borderRadius: "5px",
            background: "transparent",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Date
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "transparent",
            padding: "8px",
            border: isDateFocused ? "2px solid #fff" : "1px solid #253443", // White border on focus
            borderRadius: "5px",
          }}
        >
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateRangeChange(e, true)}
            onFocus={() => setIsDateFocused(true)} // Set focus state
            onBlur={() => setIsDateFocused(false)} // Remove focus state
            className={styles.dateInput}
            style={{
              background: "transparent",
              color: "#fff",
              border: "none",
              outline: "none",
              marginRight: "8px",
            }}
          />
          <span style={{ color: "#fff", margin: "0 8px" }}>-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateRangeChange(e, false)}
            onFocus={() => setIsDateFocused(true)} // Set focus state
            onBlur={() => setIsDateFocused(false)} // Remove focus state
            className={styles.dateInput}
            style={{
              background: "transparent",
              color: "#fff",
              border: "none",
              outline: "none",
              marginRight: "8px",
            }}
          />
          {(startDate || endDate) && (
            <span
              onClick={resetDateRange}
              style={{ color: "#fff", cursor: "pointer" }}
            >
              ×
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const FilterSection: React.FC<FilterSectionProps> = ({
  setFilterDateRange,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className={styles.filterSectionContainer}>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <DateFilter setFilterDateRange={setFilterDateRange} />
    </div>
  );
};

// AuditLog Component
const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
const Loadingspinner = dynamic(() => import("../../assets/loadingspinner"), {
  ssr: false,
});

interface AuditLogEntry {
  admin_user_name: string;
  admin_user_type: string;
  user_name: string;
  user_id: string;
  user_type: string;
  description: string;
  last_action_time: string;
  admin_profile?: string;
  admin_email?: string;
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterDateRange, setFilterDateRange] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchLogs = async () => {
      setShowLoader(true);
      setError(null);

      try {
        const response = await fetch(
          `${AdminManagement}/adminthreeapi/audit_logs/`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch audit logs (Status: ${response.status})`
          );
        }
        const data = await response.json();

        const sortedLogs = data.sort(
          (a: AuditLogEntry, b: AuditLogEntry) =>
            new Date(b.last_action_time).getTime() -
            new Date(a.last_action_time).getTime()
        );

        setLogs(sortedLogs);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError("Failed to load audit logs. Please try again.");
      } finally {
        setShowLoader(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log: AuditLogEntry) => {
    let isValid = true;

    // Search by admin_user_name or admin_email
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      isValid =
        (log.admin_user_name?.toLowerCase().includes(query) || false) ||
        (log.admin_email?.toLowerCase().includes(query) || false);
    }

    // Filter by date range using last_action_time
    const logDate = moment(log.last_action_time).tz("Asia/Kolkata");

    if (filterDateRange) {
      const [startDate, endDate] = filterDateRange.includes(" to ")
        ? filterDateRange.split(" to ")
        : [filterDateRange, ""];
      if (startDate && endDate) {
        const from = moment(startDate).tz("Asia/Kolkata").startOf("day");
        const to = moment(endDate).tz("Asia/Kolkata").endOf("day");
        isValid = isValid && logDate.isBetween(from, to, null, "[]");
      } else if (startDate) {
        // Handle single date case
        const from = moment(startDate).tz("Asia/Kolkata").startOf("day");
        const to = moment(startDate).tz("Asia/Kolkata").endOf("day");
        isValid = isValid && logDate.isBetween(from, to, null, "[]");
      }
    }

    return isValid;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

  const formatDescription = (description: string) => {
    const parts = description.split(" ").filter(Boolean);
    if (parts.length < 3) return description;

    let userParts = parts.slice(3);
    if (
      userParts.length > 1 &&
      userParts[userParts.length - 1] === userParts[userParts.length - 2]
    ) {
      userParts = userParts.slice(0, -1);
    }

    const action = ["modified", "added", "deleted"].includes(parts[2]) ? (
      <em>{parts[2]}</em>
    ) : (
      parts[2]
    );

    return (
      <span className={styles["description-content"]}>
        <span style={{ color: "white" }}>{`${parts[0]} ${parts[1]}`}</span>{" "}
        {action} {userParts.slice(0, -2).join(" ")}{" "}
        <span style={{ color: "white" }}>
          {userParts.length >= 2
            ? `${userParts[userParts.length - 2]} ${
                userParts[userParts.length - 1]
              }`
            : userParts.join(" ")}
        </span>
      </span>
    );
  };

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
                  Audit Logs
                </h2>
                <div style={{ marginBottom: "24px" }}>
                  <FilterSection
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setFilterDateRange={setFilterDateRange}
                  />
                </div>
                <div
                  className={styles["table-container"]}
                  style={{ borderRadius: "20px", overflow: "hidden" }}
                >
                  <table className={styles.table} style={{ border: "none" }}>
                    <thead>
                      <tr
                        style={{
                          border: "none",
                          borderBottom: "1px solid #253443",
                        }}
                      >
                        <th style={{ border: "none", paddingLeft: "4%" }}>
                          User Name
                        </th>
                        <th style={{ border: "none" }}>Role</th>
                        <th style={{ border: "none" }}>Date & Time</th>
                        <th style={{ border: "none" }}>Action Performed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentLogs.length > 0 ? (
                        currentLogs.map((log, index) => {
                          const date = new Date(log.last_action_time);
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

                          return (
                            <tr
                              key={index}
                              className={styles["table-row"]}
                              style={{
                                border: "none",
                                borderBottom:
                                  index === currentLogs.length - 1
                                    ? "none"
                                    : "1px solid #253443",
                              }}
                            >
                              <td
                                className={styles["name-column"]}
                                style={{ border: "none" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {log.admin_profile ? (
                                    <img
                                      src={log.admin_profile}
                                      alt={`${log.admin_user_name}'s profile`}
                                      className={styles["profile-image"]}
                                    />
                                  ) : (
                                    <div className={styles["initials-circle"]}>
                                      {getInitials(log.admin_user_name)}
                                    </div>
                                  )}
                                  <div
                                    className={styles["name-email-container"]}
                                  >
                                    <span className={styles["user-name"]}>
                                      {log.admin_user_name}
                                    </span>
                                    <span className={styles["user-email"]}>
                                      {log.admin_email || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ border: "none" }}>
                                {log.admin_user_type}
                              </td>
                              <td
                                className={styles["date-time-column"]}
                                style={{ border: "none" }}
                              >
                                {formattedDateTime}
                              </td>
                              <td style={{ border: "none" }}>
                                {formatDescription(log.description)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr style={{ border: "none" }}>
                          <td
                            colSpan={4}
                            style={{
                              border: "none",
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
      </div>
    </ErrorBoundary>
  );
};

export default AuditLog;