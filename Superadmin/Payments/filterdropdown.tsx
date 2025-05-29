import React, { useState } from "react";

interface FilterDropdownProps {
  setFilterDateRange: (dateRange: string) => void;
  setSearchQuery: (query: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  setFilterDateRange,
  setSearchQuery,
}) => {
  const [showDateRange, setShowDateRange] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localFilterDateRange, setLocalFilterDateRange] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDateFocused, setIsDateFocused] = useState(false);

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
      newRange = startDate && newDate ? `${startDate} to ${newDate}` : startDate;
    }
    setLocalFilterDateRange(newRange);
    setFilterDateRange(newRange);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setSearchQuery(query);
  };

  const resetDateRange = () => {
    setLocalFilterDateRange("");
    setFilterDateRange("");
    setShowDateRange(false);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setSearchQuery("");
  };

  const toggleDateRange = () => {
    setShowDateRange(!showDateRange);
  };

  const searchBorder = isSearchFocused || searchTerm ? "2px solid white" : "1px solid #253443";
  const dateBorder = isDateFocused || localFilterDateRange || showDateRange
    ? "2px solid white"
    : "1px solid #253443";

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        marginBottom: "10px",
        gap: "10px",
      }}
    >
      {/* Search Container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: searchBorder,
          background: "transparent",
          padding: "8px",
          borderRadius: "10px",
          width: "500px",
          height: "53px",
          position: "relative",
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search by seeker name"
          style={{
            padding: "8px",
            background: "transparent",
            border: "none",
            color: "#e8eaed",
            width: "100%",
            height: "100%",
            outline: "none",
          }}
        />
      </div>

      {/* Date Container */}
      <div style={{ display: "inline-block" }}>
        {!showDateRange ? (
          <button
            onClick={toggleDateRange}
            style={{
              padding: "8px 10px",
              border: dateBorder,
              borderRadius: "10px",
              color: "#e8eaed",
              backgroundColor: "#000",
              cursor: "pointer",
              minWidth: "80px",
              height: "53px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
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
              padding: "8px 10px",
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
              onFocus={() => setIsDateFocused(true)}
              onBlur={() => setIsDateFocused(false)}
              style={{
                padding: "5px",
                border: "none",
                color: "#e8eaed",
                backgroundColor: "transparent",
                width: "160px",
                cursor: "pointer",
                height: "100%",
                fontSize: "14px",
              }}
            />
            <span style={{ color: "#e8eaed", alignSelf: "center" }}>-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateRangeChange(e, false)}
              onFocus={() => setIsDateFocused(true)}
              onBlur={() => setIsDateFocused(false)}
              style={{
                padding: "5px",
                border: "none",
                color: "#e8eaed",
                backgroundColor: "transparent",
                width: "160px",
                cursor: "pointer",
                height: "100%",
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
                  marginLeft: "5px",
                  alignSelf: "center",
                }}
              >
                ×
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterDropdown;