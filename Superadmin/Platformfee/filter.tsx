import React from "react";
import styles from './organisation.module.css';

const isDefaultZoom = typeof window !== 'undefined' 
  ? Math.abs(window.innerWidth / window.screen.width - 1) < 0.01 
  : true; // Default value for SSR
interface FiltersProps {
  activeTab: string;
  setActiveTab: (tab: "All" | "Admin-Verifier" | "Admin-Seeker") => void;
  organizationFilter: string;
  setOrganizationFilter: (filter: string) => void;
  dropdownOpen: boolean;
  toggleDropdown: () => void;
  uniqueOrganizations: string[];
  selectOrganization: (org: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  activeTab,
  setActiveTab,
  organizationFilter,
  setOrganizationFilter,
  dropdownOpen,
  toggleDropdown,
  uniqueOrganizations,
  selectOrganization,
}) => {
  return (
    <div className={styles.filters}>
      {/* User Type Filter */}
      <select
        value={activeTab}
        onChange={(e) => setActiveTab(e.target.value as "All" | "Admin-Verifier" | "Admin-Seeker")}
        className={styles.filter_select}
      >
        <option value="All">All</option>
        <option value="Admin-Verifier">Verifier Organization</option>
        <option value="Admin-Seeker">Seeker Organization</option>
      </select>

      {/* Organization Filter */}
      <div
        className={styles.orgDropdownWrapper}
        style={{ position: "relative", marginLeft: "16px", width: isDefaultZoom ? '120px' : '150px' }}
      >
        <div
          className={`${styles.filter_select} ${dropdownOpen ? styles.active : ""}`}
          onClick={toggleDropdown}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span className={styles.orgFilterText}>
            {organizationFilter ? `${organizationFilter}` : "Organization"}
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
                setOrganizationFilter("");
              }}
              style={{ marginLeft: "auto" }}
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          )}
        </div>

        {dropdownOpen && (
          <div
            className={`${styles.dropdown} ${styles.orgDropdownMenu}`}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              background: "#fff",
              border: "1px solid #ccc",
              zIndex: 1000,
            }}
          >
            {uniqueOrganizations.map((org, index) => (
              <div
                key={index}
                className={`${styles.dropdown_item} ${styles.orgDropdownItem}`}
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
  );
};

export default Filters;