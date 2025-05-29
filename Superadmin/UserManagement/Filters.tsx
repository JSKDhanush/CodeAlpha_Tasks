import React, { useEffect, useRef } from "react";
import styles from "./Filters.module.css";
import { ExpandMore } from "@mui/icons-material";

interface FiltersProps {
  searchQuery: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: string;
  setStatus: (status: string) => void;
  organizationFilter: string;
  dropdownOpen: boolean;
  toggleDropdown: () => void;
  selectOrganization: (org: string) => void;
  uniqueOrganizations: string[];
  setOrganizationFilter: (org: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  searchQuery = "",
  handleSearch,
  activeTab = "All Users",
  setActiveTab,
  status = "",
  setStatus,
  organizationFilter = "",
  dropdownOpen = false,
  toggleDropdown,
  selectOrganization,
  uniqueOrganizations = [],
  setOrganizationFilter,
}) => {
  // Ref to track the dropdown wrapper
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (dropdownOpen) {
          toggleDropdown(); // Close the dropdown
        }
      }
    };

    // Add event listener when dropdown is open
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, toggleDropdown]);

  return (
    <div className={styles.topControls}>
      <div className={styles.tabs}>
        <div className={styles.searchBarContainer}>
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="  Search..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className={styles.userFilterDropdownContainer}>
          <select
            className={styles.userFilterDropdown}
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="All Users">All Users</option>
            <option value="SuperAdmins">SuperAdmins</option>
            <option value="Data Owners">Owners</option>
            <option value="Verifiers">Verifiers</option>
            <option value="Data Seekers">Seekers</option>
            <option value="Admins">Admins</option>
            <option value="Channel Partner">Channel Partner</option>
          </select>
          <ExpandMore className={styles.dropdownIcon} />
        </div>

        <div className={styles.filterDropdownContainer}>
          <select
            className={styles.filterDropdown}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <ExpandMore className={styles.dropdownIcon} />
        </div>

        <div className={styles.orgDropdownWrapper} ref={dropdownRef}>
          <div
            className={`${styles.orgSearchBar} ${
              dropdownOpen ? styles.active : ""
            }`}
            onClick={toggleDropdown}
          >
            <span className={styles.orgFilterText}>
              {organizationFilter || "Organization"} <ExpandMore />
            </span>

            {organizationFilter && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18px"
                viewBox="0 0 24 24"
                width="25px"
                fill="#999"
                className={styles.orgClearIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  setOrganizationFilter(""); // Clear the organization filter
                }}
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            )}
          </div>

          {dropdownOpen && (
            <div className={styles.orgDropdownMenu}>
              {uniqueOrganizations.map((org, index) => (
                <div
                  key={index}
                  className={styles.orgDropdownItem}
                  onClick={() => {
                    selectOrganization(org);
                  }}
                >
                  {org}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filters;
