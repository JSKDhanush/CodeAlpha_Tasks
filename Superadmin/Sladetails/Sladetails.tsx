"use client";

import React, { useEffect, useState } from "react";
import Header from "../Navbars/Header";
import Sidebar from "../Navbars/Sidebar";
import styles from "./Sladetails.module.css";
import PopupMessage from "../Navbars/PopupMessage";
import SlaDetailsModal from "./SlaDetailsModal";
const AuthenticationandUsermanagement =
  process.env.NEXT_PUBLIC_AuthenticationandUsermanagement;

interface KybData {
  id: string;
  company_name: string;
  user_type: string;
  channel_partner: string;
  turnaround_time_value: string;
  poc_full_name: string;
  poc_email: string;
  created_at: string;
  status: string;
}

const KybDetails: React.FC = () => {
  const [data, setData] = useState<KybData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KybData | null>(null);
  const [newTurnaroundTime, setNewTurnaroundTime] = useState("");
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${AuthenticationandUsermanagement}/auth_kyb_details_api/company-verification/`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching KYB details:", error);
        setPopupMessage("Failed to fetch KYB details. Please try again.");
      }
    };

    fetchData();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Filter data based on search query
  const filteredData = data.filter(
    (item) =>
      item.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.poc_full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleRowClick = () => {
    setIsSlaModalOpen(true);
  };

  const handleEditClick = (item: KybData) => {
    setSelectedItem(item);
    setNewTurnaroundTime(item.turnaround_time_value || "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      const response = await fetch(
        `${AuthenticationandUsermanagement}/auth_kyb_details_api/update-turnaround-time/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedItem.id,
            turnaround_time_value: newTurnaroundTime,
          }),
        }
      );

      if (response.ok) {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === selectedItem.id
              ? { ...item, turnaround_time_value: newTurnaroundTime }
              : item
          )
        );
        setIsModalOpen(false);
        setSelectedItem(null);
        setNewTurnaroundTime("");
        setPopupMessage("Turnaround time updated successfully.");
      } else {
        const errorText = await response.text();
        setPopupMessage(
          `Failed to update turnaround time: ${errorText || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating turnaround time:", error);
      setPopupMessage("Error updating turnaround time. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setNewTurnaroundTime("");
  };

  const closePopup = () => {
    setPopupMessage(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLTableRowElement>,
    id: string
  ) => {
    setTooltipPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setShowTooltip(id);
  };

  const handleMouseEnter = (id: string) => {
    setShowTooltip(id);
  };

  const handleMouseLeave = () => {
    setShowTooltip(null);
  };

  return (
    <div className={styles.mainContainer}>
      <Header />
      <div className={styles.contentWrapper}>
        <Sidebar />
        <main className={styles.mainContent}>
          <h1 className={styles.heading}>SLA Details</h1>
          <div className={styles.searchBarContainer}>
            <i className="fas fa-search searchIcon"></i>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by Name or Companyname... "
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          />
          <section className={styles.section}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Company Name</th>
                  <th>User Type</th>
                  <th>Channel Partner</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Turnaround Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr
                    key={item.id}
                    onClick={handleRowClick}
                    onMouseMove={(e) => handleMouseMove(e, item.id)}
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    <td>{item.id}</td>
                    <td>{item.company_name}</td>
                    <td>{item.user_type}</td>
                    <td>{item.channel_partner}</td>
                    <td>{item.poc_full_name}</td>
                    <td>{item.poc_email}</td>
                    <td>
                      {new Date(item.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ position: "relative", paddingRight: "30px" }}>
                      {item.turnaround_time_value || "No data"}
                      <i
                        className="fas fa-pencil-alt"
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "125px",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "#E8E81F",
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from firing
                          handleEditClick(item);
                        }}
                      ></i>
                      {showTooltip === item.id && (
                        <div
                          className={styles.tooltip}
                          style={{
                            top: tooltipPosition.y + 10, // Offset below cursor
                            left: tooltipPosition.x + 10, // Offset right of cursor
                            position: "fixed", // Use fixed to position relative to viewport
                          }}
                        >
                          See more details
                        </div>
                      )}
                    </td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.paginationContainer}>
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={styles.paginationArrow}
              ></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`${styles.paginationButton} ${
                      currentPage === number ? styles.activePage : ""
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={styles.paginationArrow}
              ></button>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={styles.itemsPerPageSelect}
              >
                <option value={10}>10/page</option>
                <option value={20}>20/page</option>
                <option value={50}>50/page</option>
                <option value={100}>100/page</option>
              </select>
            </div>
          </section>
        </main>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalHeading}>Edit Turnaround Time</h2>
            <input
              type="text"
              value={newTurnaroundTime}
              onChange={(e) => setNewTurnaroundTime(e.target.value)}
              className={styles.modalInput}
              placeholder="Enter turnaround time"
            />
            <div className={styles.modalButtons}>
              <button className={styles.saveButton} onClick={handleSave}>
                Save
              </button>
              <button
                className={styles.cancelButton}
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <SlaDetailsModal
        isOpen={isSlaModalOpen}
        onClose={() => setIsSlaModalOpen(false)}
      />

      {popupMessage && (
        <PopupMessage
          message={popupMessage}
          onClose={closePopup}
          type={
            popupMessage.includes("successfully")
              ? "success"
              : popupMessage.includes("Error") ||
                popupMessage.includes("Failed")
              ? "error"
              : "info"
          }
        />
      )}
    </div>
  );
};

export default KybDetails;