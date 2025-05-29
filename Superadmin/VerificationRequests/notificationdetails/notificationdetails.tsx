'use client'

import React, { useEffect, useState } from 'react';
import Sidebar from '../../Navbars/Sidebar';
import axios from 'axios';
import styles from './notificationdetails.module.css';
import Header from '../../Navbars/Header';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';


const NotificationDetails: React.FC = () => {
    const user_name = localStorage.getItem('user_name');
    const [searchQuery, setSearchQuery] = useState("");
    const [notification, setNotification] = useState<any>(null); // State to hold notification details
    const [documentList, setDocumentList] = useState<string[]>([]);
    const router = useRouter();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        const storedNotification = sessionStorage.getItem('selectedNotification');
        if (storedNotification) {
            setNotification(JSON.parse(storedNotification)); 
        }
    }, []);

    if (!notification) {
        return <div>Loading...</div>; 
    }


    const { status, seeker_name, request_id } = notification; // Destructure values from notification
    const date = new Date(notification.updated_at);
    const createdAtTimeAndDate = date.toDateString() + " " + date.toLocaleTimeString();
    const updatedAtTimeAndDate = new Date(notification.updated_at).toDateString() + " " + new Date(notification.updated_at).toLocaleTimeString();

    // Clean the document_name field to remove brackets and extra characters
    const cleanDocumentNames = (documentNameString: string): string[] => {
        if (!documentNameString) {
            return []; // If documentNameString is null or undefined, return an empty array
        }

        const cleanedString = documentNameString
            .replace(/[\[\]']/g, '')
            .trim();

        return cleanedString.split(',').map(doc => doc.trim());
    };


    const documents = cleanDocumentNames(notification.document_name);


    return (
        <div className={styles.dashboard}>
            <Header searchQuery={searchQuery} onSearch={handleSearch} username={`${user_name || "Guest"}`} />
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.main}>
                    <div className={styles.header}>
                        <FaArrowLeft className={styles.backArrow} onClick={() => router.back()} />
                        <h2 className={styles.title}>Data Access Request Details</h2>
                        <span
                            className={
                                status === "Verified"
                                    ? styles.verified_status
                                    : status === "Pending"
                                        ? styles.pending_status
                                        : status === "Action Taken"
                                            ? styles.action_taken_status
                                            : status === "Approved"
                                                ? styles.verified_status  // Applying same styling as Verified
                                                : status == "Rejected"
                                                    ? styles.rejected_status
                                                    : styles.requested_status
                            }
                        >
                            {status}
                        </span>

                    </div>
                    {/* Display other notification details */}
                    <div className={styles.wrapper}>
                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Request ID</label>
                            <input className={styles.requestinput} type="text" value={request_id} readOnly />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Verifier</label>
                            <input className={styles.requestinput} type="text" value={notification.verifier_name} readOnly />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Event Name</label>
                            <input
                                className={styles.requestinput}
                                type="text"
                                value={`DAR | Owner: ${notification.owner_name} | Verifier : ${notification.verifier_name} | Description: ${(() => {
                                    try {
                                        // Assuming description is a string like "['Testing']"
                                        const description = notification.description.replace(/[\[\]']+/g, ''); // Remove brackets and quotes
                                        return description;
                                    } catch (error) {
                                        return notification.description; // In case of any issue, return the original description
                                    }
                                })()}`}
                                readOnly
                            />
                        </div>
                        {notification.type === 'seeker_access' && (
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Description</label>
                                <input className={styles.requestinput} type="text" value={(() => {
                                    try {
                                        // Assuming description is a string like "['Testing']"
                                        const description = notification.description.replace(/[\[\]']+/g, ''); // Remove brackets and quotes
                                        return description;
                                    } catch (error) {
                                        return notification.description; // In case of any issue, return the original description
                                    }
                                })()} readOnly />
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Created at</label>
                            <input className={styles.requestinput} type="text" value={createdAtTimeAndDate} readOnly />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Updated at</label>
                            <input className={styles.requestinput} type="text" value={updatedAtTimeAndDate} readOnly />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Event Status</label>
                            <span className={status === "Verified" ? styles.verified_status2 :
                                status === "Pending" ? styles.pending_status2 :
                                    status === "Action Taken" ? styles.action_taken_status2 :
                                        status === "Approved" ? styles.verified_status2 :
                                            status == "Rejected" ? styles.rejected_status2 : // Same styling as Verified
                                                styles.requested_status
                            }>
                                {status}
                            </span>

                        </div>
                        {notification.type === 'seeker_access' && (
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Payment Status</label>
                                <span className={notification.payment_status === "Paid" ? styles.verified_status2 : styles.pending_status2}>
                                    {notification.payment_status || "N/A"}
                                </span>
                            </div>
                        )}

                    </div>
                    <div className={styles.docContainer}>
                        <h3 className={styles.docTitle}>Documents</h3>
                        {documents.map((doc, index) => (
                            <div key={index} className={styles.docItem}>
                                <span className={styles.docName}>{doc}</span>

                                {/* Show "View" button with eye icon if payment_status is "paid" */}
                                {/* {notification.payment_status === "Paid" ? (
                                    <button className={styles.viewButton}
                                    //  onClick={() => handleViewDocument(doc)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="18"
                                            width="18"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className={styles.eyeIcon}
                                        >
                                            <path d="M12 4C7 4 2.7 7.1 1 12c1.7 4.9 6 8 11 8s9.3-3.1 11-8c-1.7-4.9-6-8-11-8zm0 14c-4.3 0-8-3-9.5-7 1.5-4 5.2-7 9.5-7s8 3 9.5 7c-1.5 4-5.2 7-9.5 7zm0-12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
                                        </svg>
                                        <span>View</span>
                                    </button>
                                ) : (
                                    <span className={
                                        notification.status === "Approved" ? styles.verified_status :
                                            notification.status === "Pending" ? styles.pending_status :
                                                notification.status === "Rejected" ? styles.rejected_status :
                                                    styles.requested_status
                                    }>
                                        {notification.status}
                                    </span>
                                )} */}
                            </div>
                        ))}
                    </div>
                    {/* Comments Section */}
                    {/* <div className={styles.commentContainer}>
                        <h3 className={styles.commentTitle}>Comments and Remarks</h3>
                        <textarea className={styles.inputBox} placeholder="Enter your comments here..."></textarea>
                    </div> */}
                </main>
            </div>
        </div>
    );
};

export default NotificationDetails;
