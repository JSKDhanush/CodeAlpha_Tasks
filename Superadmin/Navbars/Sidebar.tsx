"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUserFriends,
  faPaperPlane,
  faCreditCard,
  faListAlt,
  faMoneyBillWave,
  faFileContract,
  faQuestionCircle,
  faCog,
  faUserCheck,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import PopupMessage from "./PopupMessage";
import { useRouter } from "next/navigation";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string>(pathname);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

   useEffect(() => {
    // Check if pathname is /Superadmin/ViewUsersData or includes /Superadmin/UserManagement
    if (
      pathname === "/Superadmin/ViewUsersData" || 
      pathname.startsWith("/Superadmin/UserManagement")
    ) {
      // Set activeItem to /Superadmin/UserManagement to keep "User Management" highlighted
      setActiveItem("/Superadmin/UserManagement");
    } else if (
      pathname === "/Superadmin/ViewUsersDataAdmin" || 
      pathname.startsWith("/Superadmin/UserManagement")
    ) {
      // Set activeItem to /Superadmin/UserManagement to keep "User Management" highlighted
      setActiveItem("/Superadmin/UserManagement");
    }
    else if (
      pathname === "/Superadmin/ViewUsersDataVerifier" || 
      pathname.startsWith("/Superadmin/UserManagement")
    ) {
      // Set activeItem to /Superadmin/UserManagement to keep "User Management" highlighted
      setActiveItem("/Superadmin/UserManagement");
    }else if (
      pathname === "/Superadmin/ViewUsersDataSeeker" || 
      pathname.startsWith("/Superadmin/UserManagement")
    ) {
      // Set activeItem to /Superadmin/UserManagement to keep "User Management" highlighted
      setActiveItem("/Superadmin/UserManagement");
    }
     else {
      // For other routes, set activeItem to the current pathname
      setActiveItem(pathname);
    }
  }, [pathname]);

  const menuItems = [
    { name: "Dashboard", icon: faHome, path: "/Superadmin/Dashboard" },
    {
      name: "User Management",
      icon: faUserFriends,
      path: "/Superadmin/UserManagement",
    },
    // { name: "Requests", icon: faPaperPlane, path: "/Superadmin/Requests" },
    { name: "Onboarding Request", icon: faUserCheck, path: "/Superadmin/Onboarding" },
    {
      name: "Verification Request",
      icon: faShieldAlt,
      path: "/Superadmin/VerificationRequests",
    },
    {
      name: "Payment Management",
      icon: faCreditCard,
      path: "/Superadmin/Payments",
    },
    { name: "Audit Log", icon: faListAlt, path: "/Superadmin/Auditlog" },
    {
      name: "Platform Fee",
      icon: faMoneyBillWave,
      path: "/Superadmin/Platformfee",
    },
    {
      name: "CMS Management",
      icon: faCog,
      path: "/Superadmin/Cms",
    },
    {
      name: "User Support",
      icon: faQuestionCircle,
      path: "/Superadmin/UserSupport",
    },
    {
      name: "SLA Details",
      icon: faFileContract,
      path: "/Superadmin/Sladetails",
    },
  ];

  const closePopup = () => {
    setPopupMessage(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setPopupMessage("Logged Out successfully!");
    router.push("../");
  };

  return (
    <aside className={styles.sidebar}>
      <ul className={styles.nav}>
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={`${styles.navItem} ${
              activeItem === item.path ? styles.active : ""
            }`}
            onMouseEnter={() => isTablet && setHoveredItem(item.name)}
            onMouseLeave={() => isTablet && setHoveredItem(null)}
          >
            <Link href={item.path}>
              <div
                onClick={() => setActiveItem(item.path)}
                className={styles.navLink}
              >
                <FontAwesomeIcon icon={item.icon} className={styles.icon} />
                <span className={styles.text}>{item.name}</span>
              </div>
            </Link>
            {isTablet && hoveredItem === item.name && (
              <div className={styles.tooltip}>{item.name}</div>
            )}
          </li>
        ))}
      </ul>
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
    </aside>
  );
};

export default Sidebar;