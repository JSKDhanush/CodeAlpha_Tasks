"use client";

import React from "react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "./ViewUsersData.module.css";
import dynamic from "next/dynamic";
const Loadingspinner = dynamic(() => import("../../assets/loadingspinner"), {
  ssr: false,
});
import { useRouter } from "next/navigation";

const SidebarDynamic = dynamic(() => import("../Navbars/Sidebar"), {
  ssr: false,
});
const HeaderDynamic = dynamic(() => import("../Navbars/Header"), {
  ssr: false,
});
const ADMIN_MANAGEMENT_API_URL = process.env.NEXT_PUBLIC_AdminManagement;

const ViewUsersDataSuperAdmin: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const router = useRouter();

  const fetchUserData = useCallback(async (phone: string) => {
    try {
      const response = await axios.get(
        `${ADMIN_MANAGEMENT_API_URL}/adminfiveapi/fetch-user/${phone}/`
      );
      const data = {
        ...response.data,
        total_documents: response.data.user_documents?.length || 0,
      };
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ][date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }, []);

  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem("selectedPhoneNumber");
    if (storedPhoneNumber) {
      setPhoneNumber(storedPhoneNumber);
      fetchUserData(storedPhoneNumber);
    } else {
      setLoading(false);
    }

    const interval = setInterval(() => {
      if (storedPhoneNumber) {
        fetchUserData(storedPhoneNumber);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUserData, refresh]);

  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found</div>;

  return (
    <div className={styles.userManagementContainer}>
      {showLoader ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100%",
            margin: "0 auto",
            backgroundColor: "#000",
            zIndex: 9999,
          }}
        >
          <Loadingspinner />
        </div>
      ) : (
        <>
          <SidebarDynamic />
          <div className={styles.mainContent}>
            <HeaderDynamic
              searchQuery={""}
              onSearch={function (
                e: React.ChangeEvent<HTMLInputElement>
              ): void {
                throw new Error("Function not implemented.");
              }}
            />
            <div className={styles.userDetailsContainer}>
              <div className={styles.breadcrumb}>
                <span
                  className={styles.breadcrumbLink}
                  onClick={() => router.push("./UserManagement")}
                  style={{ cursor: "pointer" }}
                >
                  UserManagement
                </span>
                <span style={{ margin: "0 5px" }}>>></span>
                <span style={{ color: "rgb(76, 175, 80)" }}>
                  View User Data
                </span>
              </div>
              <div className={styles.userInfo1}>
                <div className={styles.userInfo}>
                  {/* Profile Section */}
                  <div className={styles.profileContainer}>
                    <div className={styles.profileIcon}>
                      {userData.user_info.profile ? (
                        <img src={userData.user_info.profile} alt="Profile" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#fff"
                        >
                          <path d="M480-512q-44.55 0-76.27-31.72Q372-575.45 372-620t31.73-76.28Q435.45-728 480-728t76.28 31.72Q588-664.55 588-620t-31.72 76.28Q524.55-512 480-512ZM212-262v-22q0-22 13.5-41.5T262-356q55-26 109.5-39T480-408q54 0 108.5 13T698-356q23 11 36.5 30.5T748-284v22q0 13-8.5 21.5T718-232H242q-13 0-21.5-8.5T212-262Zm28 2h480v-24q0-14-9.5-26.5T684-332q-48-23-99.69-35.5Q532.63-380 480-380t-104.31 12.5Q324-355 276-332q-17 9-26.5 21.5T240-284v24Zm240-280q33 0 56.5-23.5T560-620q0-33-23.5-56.5T480-700q-33 0-56.5 23.5T400-620q0 33 23.5 56.5T480-540Zm0-80Zm0 360Z" />
                        </svg>
                      )}
                    </div>
                    <div className={styles.profileDetails}>
                      <div className={styles.profileName}>
                        <h3>
                          <strong>{userData.user_info.name}</strong>
                        </h3>
                        <p className={styles.contactInfo}>
                          {userData.user_info.email}
                        </p>
                        <p className={styles.contactInfo}>
                          {userData.user_info.phone_number || "N/A"}
                        </p>
                        <p>{userData.user_info.usertype}</p>
                      </div>
                    </div>
                  </div>
                  {/* Combined Details Section */}
                  <div className={styles.detailsContainer}>
                    <div className={styles.detailsRow}>
                      <div className={styles.detailItem}>
                        <strong>User ID:</strong>{" "}
                        {userData.user_info.user_id || "N/A"}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Member Since:</strong>{" "}
                        {formatDate(userData.user_info.created_at) || "N/A"}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Status:</strong>{" "}
                        {userData.user_info.status || "N/A"}
                      </div>
                    </div>
                  </div>
                  {/* Admin-Verifier or Admin-Seeker Additional Details Section */}
                  {(userData.user_info.usertype === "Admin-Verifier" ||
                    userData.user_info.usertype === "Admin-Seeker") && (
                    <div className={styles.detailsContainer}>
                      <div className={styles.detailsRow}>
                        <div className={styles.detailItem}>
                          <strong>Country:</strong>{" "}
                          {userData.user_info.country || "N/A"}
                        </div>
                        <div className={styles.detailItem}>
                          <strong>Organization:</strong>{" "}
                          {userData.user_info.organization || "N/A"}
                        </div>
                        <div className={styles.detailItem}>
                          <strong>Channel Partner:</strong>{" "}
                          {userData.user_info.channel_partner_name || "N/A"}
                        </div>
                        {userData.user_info.usertype === "Admin-Seeker" && (
                          <div className={styles.detailItem}>
                            <strong>Date of Birth:</strong>{" "}
                            {userData.user_info.date_of_birth
                              ? formatDate(userData.user_info.date_of_birth)
                              : "N/A"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewUsersDataSuperAdmin;