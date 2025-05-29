"use client";

import React, { useEffect, useState } from "react";
import styles from "./Usermanagement.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "./Pagination";

interface UserTableProps {
  filteredUsers: any[];
  activeTab: string;
  documentCounts: { [key: string]: number };
  handleViewClick: (user: any) => void;
  handleToggleDropdown: (userId: string) => void;
  isDropdownOpen: Record<string, boolean>;
  handleEditClick: (user: any) => void;
  handleDeleteClick: (userId: string) => void;
  formatPhoneNumber: (phoneNumber: string) => string;
  isLoading?: boolean; // Optional prop from parent
}

const UserTable: React.FC<UserTableProps> = ({
  filteredUsers,
  activeTab,
  documentCounts,
  handleViewClick,
  handleToggleDropdown,
  isDropdownOpen,
  handleEditClick,
  handleDeleteClick,
  formatPhoneNumber,
  isLoading: parentIsLoading,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Slice users based on current page
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    // Use parentIsLoading if provided, otherwise simulate loading
    if (parentIsLoading !== undefined) {
      setIsLoading(parentIsLoading);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [parentIsLoading, filteredUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdowns = document.querySelectorAll(`.${styles.dropdownMenu}`);
      const buttons = document.querySelectorAll(`.${styles.actionButton}`);

      const isClickOutside =
        Array.from(dropdowns).every(
          (dropdown) => !dropdown.contains(event.target as Node)
        ) &&
        Array.from(buttons).every(
          (button) => !button.contains(event.target as Node)
        );

      if (isClickOutside) {
        Object.keys(isDropdownOpen).forEach((userId) => {
          if (isDropdownOpen[userId]) {
            handleToggleDropdown(userId);
          }
        });
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen, handleToggleDropdown]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div className={styles.tableContainer}>
      {isLoading || filteredUsers.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 200px)",
            width: "100%",
            backgroundColor: "transparent",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              whiteSpace: "nowrap", // Prevent text wrapping
              color: "#8f8f8f",
              fontSize: "36px", // Bigger font size (you can go even higher if needed)

              width: "100%", // Take full width of parent container
              maxWidth: "900px", // Optional: Set a max width for control
              margin: "0 auto", // Center it horizontally
              overflow: "hidden", // Hide overflow if text exceeds width
              textOverflow: "ellipsis", // Add "..." if text is too long
            }}
          >
            Loading Please Wait...
          </div>
        </div>
      ) : (
        <>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th style={{ paddingLeft: "8%" }}>User Details</th>
                <th style={{ textAlign: "center" }}>Contact</th>
                {activeTab === "Data Owners" && <th>Uploaded Document</th>}
                {activeTab !== "Data Owners" && <th>Organization</th>}
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user: any, index: number) => (
                  <tr
                    key={index}
                    onClick={() => handleViewClick(user)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className={styles.nameColumn}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {user.profile ? (
                          <img
                            src={user.profile}
                            alt={`${user.name}'s profile`}
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                              marginRight: "10px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                              backgroundColor: "#333",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "10px",
                              color: "#fff",
                              fontSize: "14px",
                              fontWeight: "bold",
                            }}
                          >
                            {user.name
                              ? user.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                              : "?"}
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-start",
                          }}
                        >
                          <span>{user.name}</span>
                          <span
                            style={{
                              fontSize: "15px",
                              color: "white",
                              marginTop: "5px",
                            }}
                          >
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.nameColum5}>
                      {formatPhoneNumber(user.phone_number)}
                    </td>
                    {activeTab === "Data Owners" && (
                      <td>
                        {user && user.phone_number
                          ? documentCounts[
                              user.phone_number.replace(/^\+91/, "")
                            ] ?? "Loading.... "
                          : "Loading.... "}
                      </td>
                    )}
                    {activeTab !== "Data Owners" && (
                      <td className={styles.nameColumn3}>
                        {user.organization || "Pehachain"}
                      </td>
                    )}
                    <td className={styles.nameColumn4}>{user.usertype}</td>
                    <td className={styles.nameColumn6}>
                      {(() => {
                        const date = new Date(user.created_at);
                        const day =
                          date.getDate() < 10
                            ? `0${date.getDate()}`
                            : date.getDate();
                        const month = date.getMonth() + 1;
                        const formattedMonth = month < 10 ? `0${month}` : month;
                        const year = date.getFullYear();
                        return `${day}-${formattedMonth}-${year}`;
                      })()}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          className={`${styles.statusBox} ${
                            user.status === "Active"
                              ? styles.active
                              : styles.inactive
                          }`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "5px 10px",
                            borderRadius: "5px",
                            height: "30px",
                            minWidth: "120px",
                            justifyContent: "center",
                          }}
                        >
                          {user.status === "Active" ? (
                            <i
                              className="fas fa-check-circle"
                              style={{ color: "#4CAF50", marginRight: "8px" }}
                            ></i>
                          ) : (
                            <i
                              className="fas fa-times-circle"
                              style={{ color: "#868E96", marginRight: "8px" }}
                            ></i>
                          )}
                          <span>{user.status}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                          className={`${styles.actionButton} ${styles.dots}`}
                          title="More Actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDropdown(user.user_id);
                          }}
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                        {isDropdownOpen[user.user_id] && (
                          <div className={styles.dropdownMenu}>
                            <button
                              className={`${styles.dropdownItem} ${styles.edit}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(user);
                              }}
                            >
                              <FontAwesomeIcon icon={faEdit} /> Edit
                            </button>
                            <button
                              className={`${styles.dropdownItem} ${styles.delete}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(user.user_id);
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={activeTab === "Data Owners" ? 8 : 9}
                    style={{
                      textAlign: "center",
                      padding: "50px",
                      color: "yellow",
                    }}
                  >
                    Loading The Data Please Wait....
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            totalItems={filteredUsers.length}
          />
        </>
      )}
    </div>
  );
};

export default UserTable;
