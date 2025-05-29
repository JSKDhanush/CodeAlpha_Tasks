import React, { useState } from "react";
import styles from "./auditlog.module.css";

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
        placeholder="Search by Name.."
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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <DateFilter setFilterDateRange={setFilterDateRange} />
    </div>
  );
};

export default FilterSection;
