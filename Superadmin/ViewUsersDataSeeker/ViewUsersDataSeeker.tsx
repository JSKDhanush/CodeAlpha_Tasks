"use client"

import React, { useEffect, useState, useCallback } from "react";
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

const ViewUsersDataSeeker: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [seekerStatusCounts, setSeekerStatusCounts] = useState<{
    verified: number;
    pending: number;
    rejected: number;
    all_requested_documents: { document_name: string; category: string; updated_at: string; count?: number }[];
    verified_documents: { document_name: string; category: string; updated_at: string; count?: number }[];
    pending_documents: { document_name: string; category: string; updated_at: string; count?: number }[];
    rejected_documents: { document_name: string; category: string; updated_at: string; count?: number }[];
  } | null>(null);
  const [requestCount, setRequestCount] = useState<number | null>(null);
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

      if (data.user_info?.user_id && data.user_info.usertype === "Seeker") {
        const requestResponse = await axios.get(
          `${ADMIN_MANAGEMENT_API_URL}/adminfiveapi/request-count/${data.user_info.user_id}/`
        );
        console.log("API Response:", requestResponse.data); // Debug API response
        setRequestCount(requestResponse.data.total_requests || 0);
        setSeekerStatusCounts({
          verified: requestResponse.data.verified_count || 0,
          pending: requestResponse.data.pending_count || 0,
          rejected: requestResponse.data.rejected_count || 0,
          all_requested_documents: requestResponse.data.all_requested_documents || [],
          verified_documents: requestResponse.data.verified_documents || [],
          pending_documents: requestResponse.data.pending_documents || [],
          rejected_documents: requestResponse.data.rejected_documents || [],
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setSeekerStatusCounts({
        verified: 0,
        pending: 0,
        rejected: 0,
        all_requested_documents: [],
        verified_documents: [],
        pending_documents: [],
        rejected_documents: [],
      });
      setRequestCount(0);
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

  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  const parseDocumentNames = (documentName: string): string[] => {
    try {
      return JSON.parse(documentName.replace(/'/g, '"'));
    } catch (error) {
      console.error("Error parsing document_name:", documentName, error);
      return [];
    }
  };

  const parseCategories = (category: string): string[] => {
    try {
      // First, try parsing as JSON array
      return JSON.parse(category.replace(/'/g, '"'));
    } catch (error) {
      // If JSON parsing fails, treat as comma-separated string
      return category.split(",").map((cat) => cat.trim());
    }
  };

  const arraysEqual = (arr1: string[], arr2: string[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
  };

  const parseDocuments = (
    docArray: { document_name: string; category: string; updated_at: string; count?: number }[],
    type: string
  ): { names: string[]; categories: string[]; updated_at: string; count: number; status?: string }[] => {
    try {
      const parsedDocs = docArray.map((doc) => ({
        names: parseDocumentNames(doc.document_name),
        categories: parseCategories(doc.category),
        updated_at: doc.updated_at,
        count: Number(doc.count) || 1, // Default to 1 if count is missing
      }));

      if (type === "total" && seekerStatusCounts) {
        return parsedDocs.map((doc) => {
          let status = "Unknown";

          // Check verified documents
          for (const verifiedDoc of seekerStatusCounts.verified_documents) {
            const verifiedNames = parseDocumentNames(verifiedDoc.document_name);
            if (arraysEqual(doc.names, verifiedNames)) {
              status = "Verified";
              break;
            }
          }

          // Check pending documents
          if (status === "Unknown") {
            for (const pendingDoc of seekerStatusCounts.pending_documents) {
              const pendingNames = parseDocumentNames(pendingDoc.document_name);
              if (arraysEqual(doc.names, pendingNames)) {
                status = "Pending";
                break;
              }
            }
          }

          // Check rejected documents
          if (status === "Unknown") {
            for (const rejectedDoc of seekerStatusCounts.rejected_documents) {
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
  if (!userData || userData.user_info.usertype !== "Seeker") return <div>User not found or not a Seeker</div>;

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
                  View Seeker Data
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
                      <div className={styles.detailItem}>
                        <strong>Date of Birth:</strong>{" "}
                        {formatDate(userData.user_info.date_of_birth)}
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
                      <span>Total Requested Documents</span>
                      <span className={styles.count}>
                        ({requestCount ?? "0"})
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
                            {parseDocuments(seekerStatusCounts?.all_requested_documents || [], "total").length > 0 ? (
                              parseDocuments(seekerStatusCounts.all_requested_documents, "total").map(
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
                        openDropdown === "verified" ? styles.activeDropdown : ""
                      }`}
                      onClick={() => toggleDropdown("verified")}
                    >
                      <span>Verified Documents</span>
                      <span className={styles.count}>
                        ({seekerStatusCounts?.verified ?? "0"})
                      </span>
                    </button>
                    {openDropdown === "verified" && (
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
                            {parseDocuments(seekerStatusCounts?.verified_documents || [], "verified").length > 0 ? (
                              parseDocuments(seekerStatusCounts.verified_documents, "verified").map(
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
                        ({seekerStatusCounts?.pending ?? "0"})
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
                            {parseDocuments(seekerStatusCounts?.pending_documents || [], "pending").length > 0 ? (
                              parseDocuments(seekerStatusCounts.pending_documents, "pending").map(
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
                        ({seekerStatusCounts?.rejected ?? "0"})
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
                            {parseDocuments(seekerStatusCounts?.rejected_documents || [], "rejected").length > 0 ? (
                              parseDocuments(seekerStatusCounts.rejected_documents, "rejected").map(
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
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewUsersDataSeeker;