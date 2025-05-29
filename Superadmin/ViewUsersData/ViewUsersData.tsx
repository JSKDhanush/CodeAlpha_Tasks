"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "./ViewUsersData.module.css";
import dynamic from "next/dynamic";
const Loadingspinner = dynamic(() => import("../../assets/loadingspinner"), {
  ssr: false,
});
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip as ChartJSTooltip,
  Legend,
} from "chart.js";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ChartJSTooltip,
  Legend
);

const SidebarDynamic = dynamic(() => import("../Navbars/Sidebar"), {
  ssr: false,
});
const HeaderDynamic = dynamic(() => import("../Navbars/Header"), {
  ssr: false,
});
const ADMIN_MANAGEMENT_API_URL = process.env.NEXT_PUBLIC_AdminManagement;

const ViewUsersData: React.FC = () => {
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
    if (!dateString) return "N/A";
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

  const pieData = userData
    ? [
        { name: "Verified", value: userData.verified_documents || 0 },
        { name: "Pending", value: userData.pending_documents || 0 },
      ]
    : [];

  const COLORS = ["#4CAF50", "#FFD700"];
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const barData = {
    labels: ["Verified", "Unverified"],
    datasets: [
      {
        label: "Document Count",
        data: [
          userData?.verified_documents || 0,
          userData?.pending_documents || 0,
        ],
        backgroundColor: ["#4CAF50", "#FFD700"],
        borderColor: ["#388E3C", "#FBC02D"],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Documents",
        },
      },
      x: {
        title: {
          display: true,
          text: "Document Status",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found</div>;

  const hasPieData =
    pieData.length > 0 && pieData.some((entry) => entry.value > 0);

  // Helper function to render fields conditionally
  const renderField = (value: any, defaultText: string = "Not Provided") => {
    return value || defaultText;
  };

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
                          <strong>{renderField(userData.user_info.name)}</strong>
                        </h3>
                        <p className={styles.contactInfo}>
                          {renderField(userData.user_info.email)}
                        </p>
                        <p className={styles.contactInfo}>
                          {renderField(userData.user_info.phone_number)}
                        </p>
                        <p>{renderField(userData.user_info.usertype)}</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.detailsContainer}>
                    <div className={styles.detailsRow}>
                      <div className={styles.detailItem}>
                        <strong>DOB:</strong>{" "}
                        {formatDate(userData.user_info.date_of_birth)}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Member Since:</strong>{" "}
                        {formatDate(userData.user_info.created_at)}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Gender:</strong>{" "}
                        {renderField(userData.user_info.gender)}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Status:</strong>{" "}
                        {renderField(userData.user_info.status)}
                      </div>
                    </div>
                  </div>
                  {/* Address Section */}
                  <div className={styles.detailsContainer}>
                    <div className={styles.detailsRow}>
                      <div className={styles.detailItem}>
                        <strong>Address:</strong>{" "}
                        {renderField(
                          userData.user_info.address_line_1,
                          userData.user_info.address_line_2
                            ? `${userData.user_info.address_line_1}, ${userData.user_info.address_line_2}`
                            : userData.user_info.address_line_1
                        )}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>City:</strong>{" "}
                        {renderField(userData.user_info.city)}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>State:</strong>{" "}
                        {renderField(userData.user_info.state)}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Country:</strong>{" "}
                        {renderField(userData.user_info.country)}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Zip Code:</strong>{" "}
                        {renderField(userData.user_info.zipcode)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.documentSummary}>
                <h2 className={styles.head}>Document Summary</h2>
                <div className={styles.documentSummary1}>
                  <button className={styles.summaryButton}>
                    <span>Total Uploaded Documents</span>
                    <span className={styles.count}>
                      ({userData.total_documents ?? "0"})
                    </span>
                  </button>
                  <button className={styles.summaryButton}>
                    <span>Total Requests</span>
                    <span className={styles.count}>
                      ({userData.total_requests ?? "0"})
                    </span>
                  </button>
                  <button className={styles.summaryButton}>
                    <span>Verified Documents</span>
                    <span className={styles.count}>
                      ({userData.verified_documents ?? "0"})
                    </span>
                  </button>
                  <button className={styles.summaryButton}>
                    <span>Pending Documents</span>
                    <span className={styles.count}>
                      ({userData.pending_documents ?? "0"})
                    </span>
                  </button>
                </div>

                <div className={styles.chartContainer}>
                  <h3 className={styles.head}>Document Status Charts</h3>
                  <div className={styles.chartRow}>
                    <div className={styles.chartWrapper}>
                      <h4 className={styles.chartTitle}>Pie Chart</h4>
                      {hasPieData ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name }) => name}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 200,
                            fontSize: "18px",
                            color: "#666",
                          }}
                        >
                          No Data
                        </div>
                      )}
                    </div>
                    <div className={styles.chartWrapper}>
                      <h4 className={styles.chartTitle}>
                        Verified vs Unverified
                      </h4>
                      {hasPieData ? (
                        <div style={{ width: "100%", height: 200 }}>
                          <Bar data={barData} options={barOptions} />
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 200,
                            fontSize: "18px",
                            color: "#666",
                          }}
                        >
                          No Data
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.legendContainer}>
                    <div className={styles.legendItem}>
                      <span
                        className={styles.legendColor}
                        style={{ backgroundColor: COLORS[0] }}
                      ></span>{" "}
                      Verified
                    </div>
                    <div className={styles.legendItem}>
                      <span
                        className={styles.legendColor}
                        style={{ backgroundColor: COLORS[1] }}
                      ></span>{" "}
                      Pending
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewUsersData;