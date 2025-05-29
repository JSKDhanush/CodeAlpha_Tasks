import React, { useState } from "react";
import styles from "./UserSupport.module.css";

interface FilterSectionProps {
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
        placeholder="Search..."
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

const FilterSection: React.FC<FilterSectionProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    </div>
  );
};

export default FilterSection;