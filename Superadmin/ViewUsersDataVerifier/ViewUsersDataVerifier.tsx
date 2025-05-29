"use client"

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

const ViewUsersDataVerifier: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [statusCounts, setStatusCounts] = useState<{
    approved: number;
    pending: number;
    rejected: number;
    total_verified: number;
    approved_documents: { document_name: string; category: string; updated_at: string; count: number }[];
    pending_documents: { document_name: string; category: string; updated_at: string; count: number }[];
    rejected_documents: { document_name: string; category: string; updated_at: string; count: number }[];
    total_verified_documents: { document_name: string; category: string; updated_at: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserData = useCallback(async (phone: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${ADMIN_MANAGEMENT_API_URL}/adminfiveapi/fetch-user/${phone}/`
      );
      const data = {
        ...response.data,
        total_documents: response.data.user_documents?.length || 0,
      };
      setUserData(data);

      if (data.user_info?.user_id && data.user_info.usertype === "Verifier") {
        const statusResponse = await axios.get(
          `${ADMIN_MANAGEMENT_API_URL}/adminfiveapi/verification-status-counts/${data.user_info.user_id}/`
        );
        const statusData = statusResponse.data.status_counts || {};
        setStatusCounts({
          approved: Number(statusData.approved?.count) || 0,
          pending: Number(statusData.pending?.count) || 0,
          rejected: Number(statusData.rejected?.count) || 0,
          total_verified: Number(statusData.total_verified?.count) || 0,
          approved_documents: statusData.approved?.documents || [],
          pending_documents: statusData.pending?.documents || [],
          rejected_documents: statusData.rejected?.documents || [],
          total_verified_documents: statusData.total_verified?.documents || [],
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setStatusCounts({
        approved: 0,
        pending: 0,
        rejected: 0,
        total_verified: 0,
        approved_documents: [],
        pending_documents: [],
        rejected_documents: [],
        total_verified_documents: [],
      });
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
  }, [fetchUserData]);

  const pieData = statusCounts
    ? [
        { name: "Approved", value: Number(statusCounts.approved) || 0 },
        { name: "Pending", value: Number(statusCounts.pending) || 0 },
        { name: "Rejected", value: Number(statusCounts.rejected) || 0 },
      ]
    : [];

  const COLORS = ["#4CAF50", "#FFD700", "#FF4444"];

  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const barData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        label: "Document Count",
        data: [
          Number(statusCounts?.approved) || 0,
          Number(statusCounts?.pending) || 0,
          Number(statusCounts?.rejected) || 0,
        ],
        backgroundColor: ["#4CAF50", "#FFD700", "#FF4444"],
        borderColor: ["#388E3C", "#FBC02D", "#CC0000"],
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

  const parseDocumentNames = (documentName: string): string[] => {
    try {
      return JSON.parse(documentName.replace(/'/g, '"'));
    } catch (error) {
      console.error("Error parsing document_name:", error);
      return [];
    }
  };

  const arraysEqual = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
  };

  const parseDocuments = (
    docArray: { document_name: string; category: string; updated_at: string; count: number }[],
    type: string
  ): { names: string[]; categories: string[]; updated_at: string; count: number; status?: string }[] => {
    try {
      const parsedDocs = docArray.map((doc) => ({
        names: parseDocumentNames(doc.document_name),
        categories: JSON.parse(doc.category.replace(/'/g, '"')),
        updated_at: doc.updated_at,
        count: Number(doc.count) || 0,
      }));

      if (type === "total" && statusCounts) {
        return parsedDocs.map((doc) => {
          let status = "Unknown";

          // Check approved documents
          for (const approvedDoc of statusCounts.approved_documents) {
            const approvedNames = parseDocumentNames(approvedDoc.document_name);
            if (arraysEqual(doc.names, approvedNames)) {
              status = "Approved";
              break;
            }
          }

          // Check pending documents
          if (status === "Unknown") {
            for (const pendingDoc of statusCounts.pending_documents) {
              const pendingNames = parseDocumentNames(pendingDoc.document_name);
              if (arraysEqual(doc.names, pendingNames)) {
                status = "Pending";
                break;
              }
            }
          }

          // Check rejected documents
          if (status === "Unknown") {
            for (const rejectedDoc of statusCounts.rejected_documents) {
              const rejectedNames = parseDocumentNames(rejectedDoc.document_name);
              if (arraysEqual(doc.names, rejectedNames)) {
                status = "Rejected";
                break;
              }
            }
          }

          return { ...doc, status };
        });
      }
      return parsedDocs;
    } catch (error) {
      console.error("Error parsing documents:", error);
      return [];
    }
  };

  const toggleDropdown = (type: string) => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  if (loading) {
    return (
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
    );
  }
  if (!userData || userData.user_info.usertype !== "Verifier") return <div>User not found or not a Verifier</div>;

  const hasPieData =
    pieData.length > 0 && pieData.some((entry) => entry.value > 0);

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
                  View Verifier Data
                </span>
              </div>
              <div className={styles.userInfo1}>
                <div className={styles.userInfo}>
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
                        <strong>Member Since:</strong>{" "}
                        {formatDate(userData.user_info.created_at)}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Status:</strong>{" "}
                        {renderField(userData.user_info.status)}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Country:</strong>{" "}
                        {renderField(userData.user_info.country)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.detailsContainer}>
                    <div className={styles.detailsRow}>
                      <div className={styles.detailItem}>
                        <strong>Channel Partner Name:</strong>{" "}
                        {renderField(userData.user_info.channel_partner_name)}
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Organization:</strong>{" "}
                        {renderField(userData.user_info.organization)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.documentSummary}>
                <h2 className={styles.head}>Document Summary</h2>
                <div className={styles.documentSummary1}>
                  <div className={styles.dropdownContainer}>
                    <button
                      className={`${styles.summaryButton} ${
                        openDropdown === "total" ? styles.activeDropdown : ""
                      }`}
                      onClick={() => toggleDropdown("total")}
                    >
                      <span>Total Verified Documents</span>
                      <span className={styles.count}>
                        ({Number(statusCounts?.total_verified) || 0})
                      </span>
                    </button>
                    {openDropdown === "total" && (
                      <div className={styles.dropdownContent}>
                        <div className={styles.dropdownHeader}>
                          <h4 className={styles.dropdownTitle}>Documents</h4>
                          <button
                            onClick={() => setOpenDropdown(null)}
                            className={styles.closeButton}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <table className={styles.dropdownTable}>
                          <thead>
                            <tr>
                              <th>S.No.</th>
                              <th>Documents</th>
                              <th>Doc Type</th>
                              <th>Status</th>
                              <th>Updated At</th>
                              <th>Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseDocuments(statusCounts?.total_verified_documents || [], "total").length > 0 ? (
                              parseDocuments(statusCounts.total_verified_documents, "total").map(
                                (doc, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{doc.names.join(", ")}</td>
                                    <td>{doc.categories.join(", ")}</td>
                                    <td>{doc.status}</td>
                                    <td>{formatDate(doc.updated_at)}</td>
                                    <td>{doc.count}</td>
                                  </tr>
                                )
                              )
                            ) : (
                              <tr>
                                <td colSpan={6} className={styles.noData}>
                                  No documents
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className={styles.dropdownContainer}>
                    <button
                      className={`${styles.summaryButton} ${
                        openDropdown === "approved" ? styles.activeDropdown : ""
                      }`}
                      onClick={() => toggleDropdown("approved")}
                    >
                      <span>Approved Documents</span>
                      <span className={styles.count}>
                        ({Number(statusCounts?.approved) || 0})
                      </span>
                    </button>
                    {openDropdown === "approved" && (
                      <div className={styles.dropdownContent}>
                        <div className={styles.dropdownHeader}>
                          <h4 className={styles.dropdownTitle}>Documents</h4>
                          <button
                            onClick={() => setOpenDropdown(null)}
                            className={styles.closeButton}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <table className={styles.dropdownTable}>
                          <thead>
                            <tr>
                              <th>S.No.</th>
                              <th>Documents</th>
                              <th>Doc Type</th>
                              <th>Updated At</th>
                              <th>Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseDocuments(statusCounts?.approved_documents || [], "approved").length > 0 ? (
                              parseDocuments(statusCounts.approved_documents, "approved").map(
                                (doc, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{doc.names.join(", ")}</td>
                                    <td>{doc.categories.join(", ")}</td>
                                    <td>{formatDate(doc.updated_at)}</td>
                                    <td>{doc.count}</td>
                                  </tr>
                                )
                              )
                            ) : (
                              <tr>
                                <td colSpan={5} className={styles.noData}>
                                  No documents
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className={styles.dropdownContainer}>
                    <button
                      className={`${styles.summaryButton} ${
                        openDropdown === "pending" ? styles.activeDropdown : ""
                      }`}
                      onClick={() => toggleDropdown("pending")}
                    >
                      <span>Pending Documents</span>
                      <span className={styles.count}>
                        ({Number(statusCounts?.pending) || 0})
                      </span>
                    </button>
                    {openDropdown === "pending" && (
                      <div className={styles.dropdownContent}>
                        <div className={styles.dropdownHeader}>
                          <h4 className={styles.dropdownTitle}>Documents</h4>
                          <button
                            onClick={() => setOpenDropdown(null)}
                            className={styles.closeButton}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <table className={styles.dropdownTable}>
                          <thead>
                            <tr>
                              <th>S.No.</th>
                              <th>Documents</th>
                              <th>Doc Type</th>
                              <th>Updated At</th>
                              <th>Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseDocuments(statusCounts?.pending_documents || [], "pending").length > 0 ? (
                              parseDocuments(statusCounts.pending_documents, "pending").map(
                                (doc, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{doc.names.join(", ")}</td>
                                    <td>{doc.categories.join(", ")}</td>
                                    <td>{formatDate(doc.updated_at)}</td>
                                    <td>{doc.count}</td>
                                  </tr>
                                )
                              )
                            ) : (
                              <tr>
                                <td colSpan={5} className={styles.noData}>
                                  No documents
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className={styles.dropdownContainer}>
                    <button
                      className={`${styles.summaryButton} ${
                        openDropdown === "rejected" ? styles.activeDropdown : ""
                      }`}
                      onClick={() => toggleDropdown("rejected")}
                    >
                      <span>Rejected Documents</span>
                      <span className={styles.count}>
                        ({Number(statusCounts?.rejected) || 0})
                      </span>
                    </button>
                    {openDropdown === "rejected" && (
                      <div className={styles.dropdownContent}>
                        <div className={styles.dropdownHeader}>
                          <h4 className={styles.dropdownTitle}>Documents</h4>
                          <button
                            onClick={() => setOpenDropdown(null)}
                            className={styles.closeButton}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <table className={styles.dropdownTable}>
                          <thead>
                            <tr>
                              <th>S.No.</th>
                              <th>Documents</th>
                              <th>Doc Type</th>
                              <th>Updated At</th>
                              <th>Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseDocuments(statusCounts?.rejected_documents || [], "rejected").length > 0 ? (
                              parseDocuments(statusCounts.rejected_documents, "rejected").map(
                                (doc, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{doc.names.join(", ")}</td>
                                    <td>{doc.categories.join(", ")}</td>
                                    <td>{formatDate(doc.updated_at)}</td>
                                    <td>{doc.count}</td>
                                  </tr>
                                )
                              )
                            ) : (
                              <tr>
                                <td colSpan={5} className={styles.noData}>
                                  No documents
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.chartContainer}>
                  <h3 className={styles.head}>Document Status Charts</h3>
                  <div className={styles.chartRow}>
                    <div className={styles.chartWrapper}>
                      {/* <h4 className={styles.chartTitle}>Pie Chart</h4> */}
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
                      {/* <h4 className={styles.chartTitle}>
                        Approved vs Pending vs Rejected
                      </h4> */}
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
                      Approved
                    </div>
                    <div className={styles.legendItem}>
                      <span
                        className={styles.legendColor}
                        style={{ backgroundColor: COLORS[1] }}
                      ></span>{" "}
                      Pending
                    </div>
                    <div className={styles.legendItem}>
                      <span
                        className={styles.legendColor}
                        style={{ backgroundColor: COLORS[2] }}
                      ></span>{" "}
                      Rejected
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

export default ViewUsersDataVerifier;