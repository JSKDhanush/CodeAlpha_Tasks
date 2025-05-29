'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Sidebar from '../../Navbars/Sidebar';
import styles from './Requestdetails.module.css';
import Header from '../../Navbars/Header';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Notification {
    status: string;
    seeker_name: string;
    request_id: string;
    updated_at: string;
    verifier_name: string | null;
    owner_name: string;
    owner_phone_number: string;
    description: string;
    nft_id?: string;
    nft_document_name?: string;
}

const RequestDetails: React.FC = () => {
    const [userName, setUserName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [notification, setNotification] = useState<Notification | null>(null);
    const router = useRouter();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        setUserName(localStorage.getItem('user_name'));
        try {
            const storedNotification = sessionStorage.getItem('selectedNotification');
            if (storedNotification) {
                setNotification(JSON.parse(storedNotification));
            }
        } catch (error) {
            console.error("Error parsing session storage data", error);
        }
    }, []);

    // Clean the document_name field to remove brackets and extra characters
    const cleanDocumentNames = (documentNameString?: string): string[] => {
        if (!documentNameString) return []; // Early return
    
        return documentNameString
            .replace(/\[|\]|'/g, '') // Remove brackets and extra characters
            .split(',')
            .map(doc => doc.trim())
            .filter(Boolean); // Remove empty strings
    };

    const documents = useMemo(() => cleanDocumentNames(notification?.nft_document_name), [notification]);
    const goBack = useCallback(() => router.back(), [router]);
    
    if (!notification) {
        return <div>Loading...</div>; // Show loading if notification is not yet available
    }

    const { status, seeker_name, request_id } = notification; // Destructure values from notification
    const date = new Date(notification.updated_at);
    const createdAtTimeAndDate = date.toDateString() + " " + date.toLocaleTimeString();
    const updatedAtTimeAndDate = new Date(notification.updated_at).toDateString() + " " + new Date(notification.updated_at).toLocaleTimeString();

    const statusClasses: Record<string, string> = {
        "Verified": styles.verified_status,
        "Pending": styles.pending_status,
        "Action Taken": styles.action_taken_status,
        "Approved": styles.verified_status, // Same as Verified
        "Rejected": styles.rejected_status,
        "Requested": styles.requested_status
    };
    
    const statusClass = statusClasses[status] || styles.requested_status;

    return (
        <div className={styles.dashboard}>
            <Header searchQuery={searchQuery} onSearch={handleSearch} />
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.main}>
                    <div className={styles.header}>
                        <FaArrowLeft className={styles.backArrow} onClick={goBack} />
                        <h2 className={styles.title}>Verification Request Details</h2>
                        <span className={statusClass}>{status}</span>
                    </div>
                    <div className={styles.wrapper}>
                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Request ID</label>
                            <input
                                className={styles.requestinput}
                                type="text"
                                value={notification.request_id ?? ""}
                                readOnly
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Assigned To</label>
                            <input
                                className={styles.requestinput}
                                type="text"
                                value={notification.verifier_name ?? ""}
                                readOnly
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Event Name</label>
                            <input
                                className={styles.requestinput}
                                type="text"
                                value={`${notification.nft_id ? 'DVR' : 'DUR'
                                    } | Owner: ${notification.owner_name ?? ""} | Mobile: ${notification.owner_phone_number ?? ""} | Description: ${notification.description ?? ""}`}
                                readOnly
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Created at</label>
                            <input
                                className={styles.requestinput}
                                type="text"
                                value={createdAtTimeAndDate}
                                readOnly
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Updated at</label>
                            <input
                                className={styles.requestinput}
                                type="text"
                                value={updatedAtTimeAndDate}
                                readOnly
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.requestlabel}>Event Status</label>
                            <span className={status === "Verified" ? styles.verified_status2 :
                                status === "Pending" ? styles.pending_status2 :
                                    status === "Action Taken" ? styles.action_taken_status2 :
                                        status === "Approved" ? styles.verified_status2 :
                                            status == "Rejected" ? styles.rejected_status2 :
                                                styles.requested_status
                            }>
                                {status}
                            </span>
                        </div>
                    </div>
                    <div className={styles.docContainer}>
                        <h3 className={styles.docTitle}>Documents</h3>
                        {documents.map((doc, index) => (
                            <div key={index} className={styles.docItem}>
                                <span className={styles.docName}>{doc}</span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RequestDetails;