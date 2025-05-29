"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import {
  faBell,
  faCircleQuestion,
  faMagnifyingGlass,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Header.module.css";
import PopupMessage from "../Navbars/PopupMessage";
import { Tooltip } from "react-tooltip";

interface HeaderProps {
  searchQuery: string;
  onProfileClick: () => void;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearch,
  onProfileClick,
}) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null); // New state for user_type
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const router = useRouter();

  const closePopup = () => {
    setPopupMessage(null);
  };

  useEffect(() => {
    // Only access localStorage after the component mounts on the client
    const storedUserName = localStorage.getItem("user_name");
    const storedUserType = localStorage.getItem("user_type");
    setUserName(storedUserName || "User"); // Fallback to "User" if null
    setUserType(storedUserType || ""); // Fallback to empty string or other default
  }, []);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setPopupMessage("Logged Out successfully!");
    setShowLogoutConfirm(false);
    router.push("../");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <img
          src="/Ellipse12.png"
          alt="User"
          className={styles.profilePicture}
          onClick={onProfileClick}
          style={{ cursor: "pointer" }}
        />
        <h1 className={styles.logo}>
          Welcome, {userName}
          <br />
          <p style={{ fontSize: 14, fontWeight: 200 }}>{userType}</p>
        </h1>
      </div>
      <div className={styles.headerRight}>
        {showLogoutConfirm && (
          <div className={styles.confirmPopup}>
            <div className={styles.confirmPopupContent}>
              <p className={styles.p}>Are you sure you want to logout?</p>
              <div className={styles.confirmPopupButtons}>
                <button className={styles.okButton} onClick={confirmLogout}>
                  Confirm
                </button>
                <button className={styles.cancelButton} onClick={cancelLogout}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <FontAwesomeIcon
          icon={faCircleQuestion}
          className={styles.icon}
          data-tooltip-id="tooltip-help"
          data-tooltip-content="Help"
        />
        <Tooltip id="tooltip-help" place="bottom" />

        <FontAwesomeIcon
          icon={faBell}
          className={styles.icon}
          data-tooltip-id="tooltip-bell"
          data-tooltip-content="Notifications"
        />
        <Tooltip id="tooltip-bell" place="bottom" />

        <button
          className={styles.logoutButton}
          onClick={handleLogout}
          data-tooltip-id="tooltip-logout"
          data-tooltip-content="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e8eaed"
          >
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
          </svg>
        </button>
        <Tooltip id="tooltip-logout" place="bottom" />
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
    </header>
  );
};

export default Header;