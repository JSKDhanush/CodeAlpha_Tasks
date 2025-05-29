"use client";

import React, { useEffect, useState, useCallback, useMemo, lazy, Suspense } from "react";
// import "./organisation.css";
import styles from './organisation.module.css'
// import Sidebar from "../Navbars/Sidebar";
// import Header from "../Navbars/Header";

const Sidebar = lazy(() => import("../Navbars/Sidebar"));
const Header = lazy(() => import("../Navbars/Header"));

const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement

interface OrganizationEntry {
  id: string;
  organization: string | null;
  username: string | null;
  usertype: string;
  amount?: number | null;
}

// Define the type for an organization
interface Organization {
  organization?: string;
  usertype: string;
  amount?: number;
}

const Organization: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userTypeFilter, setUserTypeFilter] = useState<"Admin-Verifier" | "Admin-Seeker">("Admin-Verifier");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationEntry | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await fetch(`${AdminManagement}/adminsixapi/organisations/?usertype=${userTypeFilter}`);
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      const data = await response.json();
      setOrganizations(
        data.map((org: Organization) => ({
          ...org,
          id: org.organization || `${org.usertype}-${Math.random().toString(36).substr(2, 9)}`,
          amount: org.amount ?? null,
        }))
      );
    } catch (err) {
      console.log(err);
      setError("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, [userTypeFilter]); // ✅ Dependency added
  
  useEffect(() => {
    fetchOrganizations();
    const interval = setInterval(fetchOrganizations, 30000);
    return () => clearInterval(interval);
  }, [fetchOrganizations]); // ✅ Uses memoized function

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

  const handleSaveAmount = useCallback(async () => {
    if (!selectedOrg || !editAmount) {
      alert("Please enter a valid amount.");
      return;
    }

    const amount = Number(editAmount);
    if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid numeric amount greater than or equal to 0.");
      return;
    }

    try {
      const response = await fetch(`${AdminManagement}/admintwoapi/save-platform-fee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: selectedOrg.organization,
          amount,
          admin_user_name: localStorage.getItem("adminUserName") || "Super Admin",
          admin_user_type: localStorage.getItem("adminUserType") || "Super Admin",
          username: selectedOrg.username || "Unknown User",
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update platform fee");

      setOrganizations((prev) =>
        prev.map((org) => (org.id === selectedOrg.id ? { ...org, amount } : org))
      );

      alert(result.message || "Platform fee updated successfully!");
      closeModal();
    } catch (err) {
      // console.error("Error updating platform fee:", err);
      alert(err instanceof Error ? err.message : "Failed to update platform fee");
    }
  }, [editAmount, selectedOrg]);
  

  // const filteredOrganizations = organizations.filter((org) => {
  //   const orgName = org.organization || "";
  //   const userName = org.username || "";
  //   return (
  //     orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     userName.toLowerCase().includes(searchQuery.toLowerCase())
  //   );
  // });

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) =>
    {
      (org.organization || "").toLowerCase().includes(searchQuery.toLowerCase());
      (org.username || "").toLowerCase().includes(searchQuery.toLowerCase())
    }
    );
  }, [organizations, searchQuery]);

  if (loading) return <div className={styles.loading}></div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboard}>
      <Suspense fallback={<div>Loading Sidebar...</div>}>
        <Sidebar />
      </Suspense>
      <div className={styles.content}>
        <Suspense fallback={<div>Loading Header...</div>}>
          <Header searchQuery={searchQuery} onSearch={handleSearch} />
        </Suspense>
        <div className={styles.container}>
          <h2 className={styles.page_title}>Organizations</h2>
          <div className={styles.button_container}>
            <button
              className={userTypeFilter === "Admin-Verifier" ? styles.active : ""}
              onClick={() => setUserTypeFilter("Admin-Verifier")}
            >
              Admin-Verifier
            </button>
            <button
              className={userTypeFilter === "Admin-Seeker" ? styles.active : ""}
              onClick={() => setUserTypeFilter("Admin-Seeker")}
            >
              Admin-Seeker
            </button>
          </div>
          <div className={styles.table_container}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>User Type</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map((org) => (
                    <tr key={org.id} className={styles.table_row}>
                      <td>{org.organization || "N/A"}</td>
                      <td>{org.usertype}</td>
                      <td>
                        {org.amount !== null && org.amount !== undefined
                          ? `₹${org.amount}`
                          : "Not Set"}
                      </td>
                      <td>
                        <button
                          className={styles.edit_button}
                          onClick={() => openModal(org)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className={styles.no_organizations}>
                      No organizations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <Suspense fallback={<div>Loading Modal...</div>}>
        <div className={styles.modal_overlay}>
          <div className={styles.modal_content}>
            <h3>Platform Fee</h3>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              placeholder="Enter amount"
              className={styles.modal_input}
            />
            <div className={styles.modal_buttons}>
              <button className={styles.save_button} onClick={handleSaveAmount}>
                Save
              </button>
              <button className={styles.cancel_button} onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Suspense>
      )}
    </div>
  );
};
export default Organization;