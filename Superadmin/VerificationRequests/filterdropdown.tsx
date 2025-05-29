import React, { useEffect, useState } from "react";
import styles from "./VerificationRequests.module.css";
import { useSearchParams } from "next/navigation"; // Changed: Added useSearchParams to read query parameters


type FilterDropdownProps = {
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterDateRange: string;
  setFilterDateRange: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filterStatus,
  setFilterStatus,
  filterDateRange,
  setFilterDateRange,
  searchQuery,
  setSearchQuery,
}) => {
  const [showDateRange, setShowDateRange] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchParams = useSearchParams();

  // Changed: Added useEffect to set filterStatus from query parameter on mount
  useEffect(() => {
    const statusFromQuery = searchParams.get("status"); // Changed: Get status query parameter
    if (statusFromQuery && !filterStatus) {
      setFilterStatus(statusFromQuery); // Changed: Set filterStatus to query param value (e.g., "Verified")
    }
  }, [searchParams, setFilterStatus, filterStatus]); // Changed: Dependencies for useEffect

  

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const [startDate, endDate] = filterDateRange.includes(" to ")
    ? filterDateRange.split(" to ")
    : [filterDateRange, ""];

  const handleDateRangeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isStart: boolean
  ) => {
    const newDate = e.target.value;
    if (isStart) {
      setFilterDateRange(
        newDate && endDate ? `${newDate} to ${endDate}` : newDate
      );
    } else {
      setFilterDateRange(
        startDate && newDate ? `${startDate} to ${newDate}` : startDate
      );
    }
  };

  const resetStatus = () => {
    setFilterStatus("");
  };

  const resetDateRange = () => {
    setFilterDateRange("");
    setShowDateRange(false);
  };

  const toggleDateRange = () => {
    setShowDateRange(!showDateRange);
  };

  const statusBorder = filterStatus
    ? "1px solid white"
    : "1px solid rgba(255, 255, 255, 0.2)";
  const dateBorder =
    filterDateRange || showDateRange
      ? "1px solid white"
      : "1px solid rgba(255, 255, 255, 0.2)";

  return (
    <div
      className={styles.listfilter}
      style={{ border: "none", background: "transparent", padding: 0 }}
    >
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {/* Search Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: isSearchFocused ? "2px solid #fff" : "1px solid #253443",
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
            placeholder="Search by Request ID or Requested By"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              background: "transparent",
              color: "#fff",
              border: "none",
              outline: "none",
              flex: 1,
            }}
          />
        </div>

        {/* Status Dropdown */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <select
            value={filterStatus}
            onChange={handleStatusChange}
            style={{
              padding: "0 30px 0 10px",
              backgroundColor: "#000",
              border: statusBorder,
              borderRadius: "10px",
              color: "#e8eaed",
              width: "150px",
              height: "53px",
              appearance: "none",
              backgroundImage: filterStatus
                ? "none"
                : "url(\"data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath fill='white' d='M0 0l5 6 5-6H0z'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "10px 6px",
              cursor: "pointer",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            <option value="" disabled hidden>
              Select Status
            </option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Action Taken">Action Taken</option>
          </select>
          {filterStatus && (
            <span
              onClick={resetStatus}
              style={{
                position: "absolute",
                right: "13px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#e8eaed",
                pointerEvents: "auto",
                fontSize: "16px",
              }}
            >
              ×
            </span>
          )}
        </div>

        {/* Unified Date Range Container */}
        <div style={{ position: "relative", display: "inline-block" }}>
          {!showDateRange ? (
            <button
              onClick={toggleDateRange}
              style={{
                padding: "0 10px",
                border: dateBorder,
                borderRadius: "10px",
                color: "#e8eaed",
                backgroundColor: "#000",
                cursor: "pointer",
                width: "80px",
                height: "53px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Date
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px",
                border: dateBorder,
                borderRadius: "10px",
                backgroundColor: "#000",
                position: "relative",
                height: "53px",
              }}
            >
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateRangeChange(e, true)}
                style={{
                  padding: "5px",
                  border: "none",
                  color: "#e8eaed",
                  backgroundColor: "transparent",
                  width: "160px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              />
              <span
                style={{
                  color: "#e8eaed",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                -
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateRangeChange(e, false)}
                style={{
                  padding: "5px",
                  border: "none",
                  color: "#e8eaed",
                  backgroundColor: "transparent",
                  width: "160px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              />
              {(startDate || endDate) && (
                <span
                  onClick={resetDateRange}
                  style={{
                    cursor: "pointer",
                    color: "#e8eaed",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  ×
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterDropdown;