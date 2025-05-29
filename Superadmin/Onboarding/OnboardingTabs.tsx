import React from "react";
import styles from "./OnboardingTabs.module.css"; // Adjust path as needed

interface OnboardingTabsProps {
  requestType: "kyb" | "channel_partner";
  setRequestType: (type: "kyb" | "channel_partner") => void;
  sortedNotifications: any[]; // Adjust type as needed
  filterType: string | null;
  filterValue: string;
}

const OnboardingTabs: React.FC<OnboardingTabsProps> = ({
  requestType,
  setRequestType,
  sortedNotifications,
  filterType,
  filterValue,
}) => {
  const tabs = [
    { id: "kyb", label: "KYB Requests" },
    { id: "channel_partner", label: "Channel Partner" },
  ];

  const countRequests = (type: string) => {
    const filtered = sortedNotifications.filter((req) => {
      let isValid = req.type === type;

      if (filterType && isValid) {
        if (filterType === "status" && filterValue !== "All") {
          isValid = req.status === filterValue;
        }
        if (filterType === "updatedAt" && filterValue) {
          isValid = req.updated_at.startsWith(filterValue);
        }
      }

      return isValid;
    });

    return filtered.length;
  };

  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${
            requestType === tab.id ? styles.activeTab : ""
          }`}
          onClick={() => setRequestType(tab.id as "kyb" | "channel_partner")}
        >
          {tab.label}{" "}
          <span className={styles.count}>({countRequests(tab.id)})</span>
        </button>
      ))}
    </div>
  );
};

export default OnboardingTabs;