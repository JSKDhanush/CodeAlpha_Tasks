"use client";

import React, { useEffect, useState, lazy, useCallback } from "react";
import styles from "./organisation.module.css";
const Sidebar = lazy(() => import("../Navbars/Sidebar"));
const Header = lazy(() => import("../Navbars/Header"));
import Filters from "./filter";
import PopupMessage from "../PopupMessage/PopupMessage";
import { AiOutlineClose } from "react-icons/ai";
import TableComponent from "./tablecomponent";
import PaginationComponent from "./pagination";
import Loadingspinner from "@/app/assets/loadingspinner";
const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
import ErrorBoundary from "@/components/ErrorBoundary";

interface OrganizationEntry {
  id: string;
  organization: string | null;
  username: string | null;
  usertype: string;
  amount?: number | null;
  updated_at?: string | null;
}

const Organization: React.FC = () => {
  const [verifierOrganizations, setVerifierOrganizations] = useState<
    OrganizationEntry[]
  >([]);
  const [seekerOrganizations, setSeekerOrganizations] = useState<
    OrganizationEntry[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "All" | "Admin-Verifier" | "Admin-Seeker"
  >("All");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationEntry | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [organizationFilter, setOrganizationFilter] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchOrganizations = async (
      userType: "Admin-Verifier" | "Admin-Seeker"
    ) => {
      setShowLoader(true);
      try {
        const response = await fetch(
          `${AdminManagement}/adminsixapi/organisations/?usertype=${userType}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${userType} organizations (Status: ${response.status})`
          );
        }

        const data: Omit<OrganizationEntry, "id">[] = await response.json();
        console.log(`Fetched ${userType} organizations:`, data); // Debug log

        // Load cached updated_at from localStorage
        const cachedUpdates = JSON.parse(
          localStorage.getItem(`updated_at_${userType}`) || "{}"
        );

        return data.map((org) => ({
          ...org,
          id:
            org.organization ??
            `${userType}-${Math.random().toString(36).substr(2, 9)}`,
          amount: org.amount ?? null,
          updated_at:
            org.updated_at ??
            cachedUpdates[org.organization ?? ""] ??
            "N/A", // Use cached value if API returns null
        })) as OrganizationEntry[];
      } catch (error) {
        console.error(`Error fetching ${userType} organizations:`, error);
        return [];
      } finally {
        setShowLoader(false);
      }
    };

    const fetchAllOrganizations = async () => {
      setLoading(true);
      setError(null);

      try {
        const [verifierData, seekerData] = await Promise.all([
          fetchOrganizations("Admin-Verifier"),
          fetchOrganizations("Admin-Seeker"),
        ]);

        setVerifierOrganizations(verifierData);
        setSeekerOrganizations(seekerData);
      } catch (error) {
        console.error("Error fetching all organizations:", error);
        setError("Something went wrong. Please try again later");
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrganizations();

    // Comment out auto-refresh for debugging
    // const interval = setInterval(() => {
    //   window.location.reload();
    // }, 180000);
    // return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const openModal = useCallback((org: OrganizationEntry) => {
    setSelectedOrg(org);
    setEditAmount(org.amount?.toString() || "");
    setIsModalOpen(true);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrg(null);
    setEditAmount("");
  };

  const closePopup = () => {
    setPopupMessage(null);
  };

  const handleSaveAmount = async () => {
    if (!selectedOrg || !editAmount) {
      setPopupMessage("Please enter a valid amount.");
      return;
    }

    const amount = Number(editAmount);
    if (isNaN(amount) || amount < 0) {
      setPopupMessage(
        "Please enter a valid numeric amount greater than or equal to 0."
      );
      return;
    }

    const adminUserName = localStorage.getItem("user_name") || "Super Admin";
    const adminUserType = localStorage.getItem("user_type") || "Super Admin";

    try {
      const response = await fetch(
        `${AdminManagement}/adminsixapi/save-platform-fee/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organization: selectedOrg.organization,
            amount,
            admin_user_name: adminUserName,
            admin_user_type: adminUserType,
            username: selectedOrg.username || "Unknown User",
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update platform fee");
      }

      const updated_at = result.updated_at ?? new Date().toISOString();
      console.log("Updated at from API:", updated_at); // Debug log

      // Cache updated_at in localStorage
      const cachedUpdates = JSON.parse(
        localStorage.getItem(`updated_at_${selectedOrg.usertype}`) || "{}"
      );
      cachedUpdates[selectedOrg.organization ?? ""] = updated_at;
      localStorage.setItem(
        `updated_at_${selectedOrg.usertype}`,
        JSON.stringify(cachedUpdates)
      );

      const updatedOrg = {
        ...selectedOrg,
        amount,
        updated_at,
      };

      if (selectedOrg.usertype === "Admin-Verifier") {
        setVerifierOrganizations((prev) =>
          prev.map((org) => (org.id === selectedOrg.id ? updatedOrg : org))
        );
      } else if (selectedOrg.usertype === "Admin-Seeker") {
        setSeekerOrganizations((prev) =>
          prev.map((org) => (org.id === selectedOrg.id ? updatedOrg : org))
        );
      }

      setPopupMessage(result.message || "Platform fee updated successfully!");
      closeModal();
    } catch (err) {
      console.error("Error updating platform fee:", err);
      if (err instanceof Error) {
        setPopupMessage(err.message);
      } else {
        setPopupMessage("Failed to update platform fee");
      }
    }
  };

  const currentOrganizations =
    activeTab === "All"
      ? [...verifierOrganizations, ...seekerOrganizations]
      : activeTab === "Admin-Verifier"
      ? verifierOrganizations
      : seekerOrganizations;

  const uniqueOrganizations: string[] = Array.from(
    new Set(
      currentOrganizations
        .map((org) => org.organization)
        .filter((org): org is string => org !== null)
    )
  );

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const selectOrganization = (org: string) => {
    setOrganizationFilter(org);
    setDropdownOpen(false);
  };

  const filteredOrganizations = currentOrganizations.filter((org) => {
    const orgName = org.organization || "";
    const userName = org.username || "";
    const matchesSearch =
      orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrganization = organizationFilter
      ? orgName.toLowerCase().includes(organizationFilter.toLowerCase())
      : true;

    return matchesSearch && matchesOrganization;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentTableData = filteredOrganizations.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const handleDelete = useCallback((id: string) => {
    console.log(`Delete organization with id: ${id}`);
  }, []);

  const totalPages = Math.ceil(filteredOrganizations.length / rowsPerPage);

  useEffect(() => {
    const handleChunkError = (event: any) => {
      if (
        event.message.includes("Loading chunk") ||
        event.message.includes("document not found") ||
        event.message.includes("failed to fetch dynamically imported module")
      ) {
        setErrorMessage(true);
      }
    };
    window.addEventListener("error", handleChunkError);

    return () => {
      window.removeEventListener("error", handleChunkError);
    };
  }, []);

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h2 className="text-red-500 text-xl font-bold">
          Something went wrong. Please try again later
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
          <h2 className="text-red-500 text-xl font-bold">
            Something went wrong. Please try again later
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Reload Page
          </button>
        </div>
      }
    >
      <div className={styles.dashboard}>
        {showLoader ? (
          <div className={styles.loaderWrapper}>
            <Loadingspinner />
          </div>
        ) : (
          <>
            <Sidebar />
            <div className={styles.content}>
              <header>
                <Header searchQuery={searchQuery} onSearch={handleSearch} />
              </header>

              <div className={styles.container}>
                <div className={styles.platform}>
                  <h2 className={styles.page_title}>Platform Fee</h2>
                  <Filters
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    organizationFilter={organizationFilter}
                    setOrganizationFilter={setOrganizationFilter}
                    dropdownOpen={dropdownOpen}
                    toggleDropdown={toggleDropdown}
                    uniqueOrganizations={uniqueOrganizations}
                    selectOrganization={selectOrganization}
                  />
                </div>

                <TableComponent
                  data={currentTableData}
                  onEdit={openModal}
                  onDelete={handleDelete}
                />

                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  handlePageChange={setCurrentPage}
                  itemsPerPage={rowsPerPage}
                  handleItemsPerPageChange={(e) =>
                    setRowsPerPage(Number(e.target.value))
                  }
                  totalItems={filteredOrganizations.length}
                />
              </div>
            </div>

            {isModalOpen && selectedOrg && (
              <div className={styles.modal_overlay}>
                <div className={styles.modal_content}>
                  <AiOutlineClose
                    className={styles.close_icon}
                    onClick={closeModal}
                  />

                  <h2 className={styles.modal_title} style={{ marginTop: 16 }}>
                    Manage Platform Fee
                  </h2>

                  <form className={styles.edit_user_form}>
                    <div className={styles.form_group}>
                      <label>Organization</label>
                      <input
                        type="text"
                        value={selectedOrg.organization || "N/A"}
                        readOnly
                        placeholder="Organization"
                        className={styles.modal_input}
                      />
                    </div>
                    <div className={styles.form_group}>
                      <label>User Type</label>
                      <input
                        type="text"
                        value={selectedOrg.usertype || "N/A"}
                        readOnly
                        placeholder="User Type"
                        className={styles.modal_input}
                      />
                    </div>
                    <div className={styles.form_group}>
                      <label>Amount</label>
                      <input
                        type="number"
                        value={editAmount || ""}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="Enter amount"
                        className={styles.modal_input}
                      />
                    </div>

                    <div className={styles.form_actions}>
                      <button
                        type="button"
                        className={styles.cancel_button}
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={styles.update_button}
                        onClick={handleSaveAmount}
                      >
                        Update
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {popupMessage && (
              <PopupMessage
                message={popupMessage}
                onClose={closePopup}
                type={
                  popupMessage.toLowerCase().includes("success")
                    ? "success"
                    : popupMessage.toLowerCase().includes("failed")
                    ? "error"
                    : "info"
                }
              />
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Organization;