'use client'

import React, { useEffect, useState } from 'react';
import Sidebar from '../../Navbars/Sidebar';
import axios from 'axios';
import styles from './ChannelPartnerDetails.module.css';
import Header from '../../Navbars/Header';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
const ChannelPartner = process.env.NEXT_PUBLIC_ChannelPartner;
import PopupMessage from '../../Navbars/PopupMessage';

const ChannelPartnerDetails: React.FC = () => {
    const [user_name, setUserName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState<any>(null);
    const [documentList, setDocumentList] = useState<string[]>([]);
    const [popupMessage, setPopupMessage] = useState<string | null>(null);
    const router = useRouter();
    const [showDenyModal, setShowDenyModal] = useState(false);
    const [denyReason, setDenyReason] = useState('');
    const [denyReasonError, setDenyReasonError] = useState<string | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUserName(localStorage.getItem('user_name'));
        }
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        const storedNotification = typeof window !== 'undefined' ? sessionStorage.getItem('selectedNotification') : null;
        if (storedNotification) {
            setNotification(JSON.parse(storedNotification));
        }
    }, []);

    if (!notification) {
        return <div>Loading...</div>;
    }

    const { status, seeker_name, request_id } = notification;
    const date = new Date(notification.updated_at);
    const createdAtTimeAndDate = date.toDateString() + ' ' + date.toLocaleTimeString();
    const updatedAtTimeAndDate = new Date(notification.updated_at).toDateString() + ' ' + new Date(notification.updated_at).toLocaleTimeString();

    const cleanDocumentNames = (documentNameString: string): string[] => {
        if (!documentNameString) {
            return [];
        }

        const cleanedString = documentNameString
            .replace(/[\[\]']/g, '')
            .trim();

        return cleanedString.split(',').map((doc) => doc.trim());
    };

    const documents = cleanDocumentNames(notification.document_name);

    function closePopup(): void {
        if (typeof window !== 'undefined') {
            setPopupMessage(null);
        }
    }

    const handleApprove = async () => {
        const payload = {
            name: `${notification.poc_full_name}`,
            email: notification.poc_email,
            phone_number: notification.poc_phone_number,
            wallet_public_key: notification.wallet_public_key,
            symmetric_key: notification.symmetric_key,
            organization: notification.organization,
            profile: notification.profile,
            department: notification.department,
            country: notification.country,
            request_id: notification.request_id,
            channel_partner_id: notification.channel_partner_id,
            channel_partner_name: notification.channel_partner_name,
            user_type: notification.role,
        };

        console.log('Approve Verifier Payload:', payload);
        try {
            const approveResponse = await axios.post(`${ChannelPartner}/chan_partner/approve-verifier/`, payload);
            console.log('Approve Verifier Response:', approveResponse.data);
            setPopupMessage(`Approved successfully! User ID: ${approveResponse.data.user_id}`);
            setTimeout(() => {
                router.back();
            }, 2000);
        } catch (error: any) {
            if (error.response?.data?.error?.includes('already exists')) {
                setPopupMessage('This email is already in use.');
            } else {
                setPopupMessage('Approval failed. Please try again.');
            }
        }
        setShowApproveModal(false);
    };

    const plans = [
        {
            title: 'Basic',
            description: 'For everyone starting out on a website for their big idea',
            price: '$0',
            priceDetail: 'free for everyone',
            buttonText: 'Get started for free',
            footerText: 'Free and open-source forever',
            features: [
                'Access to verification dashboard',
                'Verify user documents & credentials',
                'Full audit logs & history',
            ],
        },
        {
            title: 'Standard',
            description: 'For growing businesses needing advanced verification tools',
            price: '$29',
            priceDetail: 'per month',
            buttonText: 'Start with Standard',
            footerText: 'Best for small to medium businesses',
            features: [
                'Everything in Basic',
                'Priority support',
                'Advanced analytics dashboard',
                'Team collaboration tools',
            ],
        },
        {
            title: 'Premium',
            description: 'For enterprises requiring comprehensive verification solutions',
            price: '$99',
            priceDetail: 'per month',
            buttonText: 'Go Premium',
            footerText: 'Tailored for large-scale operations',
            features: [
                'Everything in Standard',
                'Dedicated account manager',
                'Custom integrations',
                '24/7 premium support',
            ],
        },
    ];

    return (
        <div className={styles.dashboard}>
            <Header searchQuery={searchQuery} onSearch={handleSearch} username={`${notification.first_name || 'Guest'}`} />
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.main}>
                    <div className={styles.header}>
                        <FaArrowLeft className={styles.backArrow} onClick={() => router.back()} />
                        <h2 className={styles.title}>Request Details</h2>
                        <span
                            className={
                                status === 'Verified'
                                    ? styles.verified_status
                                    : status === 'Pending'
                                    ? styles.pending_status
                                    : status === 'Action Taken'
                                    ? styles.action_taken_status
                                    : status === 'Approved'
                                    ? styles.verified_status
                                    : status == 'Rejected'
                                    ? styles.rejected_status
                                    : styles.requested_status
                            }
                        >
                            {status}
                        </span>
                    </div>
                    <div className={`${styles.formCard} w-full`}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Channel Partner Details</h2>
                        </div>
                        <div className={styles.wrapper}>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}> Channel Partner ID</label>
                                <input className={styles.requestinput} type="text" value={notification.channel_partner_id} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Kyc Partner Name</label>
                                <input className={styles.requestinput} type="text" value={`${notification.poc_full_name}`} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Email</label>
                                <input className={styles.requestinput} type="text" value={notification.poc_email} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Phone Number</label>
                                <input className={styles.requestinput} type="text" value={notification.poc_phone_number} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Organization</label>
                                <input className={styles.requestinput} type="text" value={notification.organization} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Company Name</label>
                                <input className={styles.requestinput} type="text" value={notification.company_name} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Company Registration Number</label>
                                <input className={styles.requestinput} type="text" value={notification.company_registration_number} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Designation</label>
                                <input className={styles.requestinput} type="text" value={notification.poc_designation} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>DUNS Number</label>
                                <input className={styles.requestinput} type="text" value={notification.duns_number} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Headquaters Address</label>
                                <input className={styles.requestinput} type="text" value={notification.headquarters_address} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Company Website</label>
                                <input className={styles.requestinput} type="text" value={notification.company_website} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Created at</label>
                                <input className={styles.requestinput} type="text" value={createdAtTimeAndDate} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Charges Per Document</label>
                                <input className={styles.requestinput} type="text" value={notification.charges_per_document || 'N/A'} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Charges Second Access</label>
                                <input className={styles.requestinput} type="text" value={notification.charges_second_access || 'N/A'} readOnly />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.requestlabel}>Event Status</label>
                                <span
                                    className={
                                        status === 'Verified'
                                            ? styles.verified_status2
                                            : status === 'Pending'
                                            ? styles.pending_status2
                                            : status === 'Action Taken'
                                            ? styles.action_taken_status2
                                            : status === 'Approved'
                                            ? styles.verified_status2
                                            : status == 'Rejected'
                                            ? styles.rejected_status2
                                            : styles.requested_status
                                    }
                                >
                                    {status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.formCard} w-full`}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Certificate </h2>
                        </div>
                        <div className="mt-6">
                            {notification.certification_file ? (
                                <div className="flex flex-col items-center">
                                    <iframe
                                        src={notification.certification_file}
                                        className="w-full h-[600px] border border-gray-700 rounded-lg"
                                        title="Certificate"
                                    />
                                    <a
                                        href={notification.certification_file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 text-blue-500 hover:underline"
                                    >
                                        Download Certificate
                                    </a>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center">No certificate available</p>
                            )}
                        </div>
                    </div>
                    <div className={`${styles.formCard} w-full`}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Subscription Plan</h2>
                        </div>
                        <div className="flex justify-center gap-8 mt-6">
                            {plans.map((plan, index) => (
                                <div
                                    key={index}
                                    className={`w-80 relative rounded-xl border p-8 text-left shadow-sm transition-all duration-300 bg-black border-gray-700 text-white overflow-hidden ${
                                        notification?.subscription_plan === plan.title ? 'border-green-500 border-2' : 'border-gray-700'
                                    }`}
                                >
                                    <div className="relative z-10">
                                        <h2 className="text-xl font-bold text-white">{plan.title}</h2>
                                        <p className="text-gray-400 mt-1">{plan.description}</p>
                                        <p className="text-4xl font-bold text-white mt-4">
                                            {plan.price} <span className="text-sm font-normal">{plan.priceDetail}</span>
                                        </p>
                                        <ul className="mt-4 space-y-2">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center text-gray-300">
                                                    <span className="text-green-500 mr-2">✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.buttonGroup}>
                        {status !== 'Approved' && status !== 'Rejected' && (
                            <>
                                <button className={styles.denyButton} onClick={() => setShowDenyModal(true)}>
                                    Reject
                                </button>
                                <button className={styles.approveButton} onClick={() => setShowApproveModal(true)}>
                                    Approve
                                </button>
                            </>
                        )}
                    </div>
                </main>
            </div>
            {popupMessage && (
                <PopupMessage
                    message={popupMessage}
                    onClose={closePopup}
                    type={popupMessage.includes('successfully') ? 'success' : popupMessage.includes('Failed') ? 'error' : 'info'}
                />
            )}
            {showDenyModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={() => setShowDenyModal(false)}>×</button>
                        <h3 className={styles.modalTitle}>Reason for Rejection</h3>
                        <textarea
                            className={styles.textArea}
                            value={denyReason}
                            onChange={(e) => {
                                setDenyReason(e.target.value);
                                if (e.target.value.trim()) setDenyReasonError(null);
                            }}
                            placeholder="Enter reason for rejection..."
                        />
                        {denyReasonError && <p className={styles.errorText}>{denyReasonError}</p>}
                        <button
                            className={styles.rejectButton}
                            onClick={async () => {
                                if (!denyReason.trim()) {
                                    setDenyReasonError('Please provide a reason for rejection.');
                                    return;
                                }
                                const payload = {
                                    request_id: notification.request_id,
                                    reason: denyReason,
                                };
                                try {
                                    const response = await axios.post(`${ChannelPartner}/chan_partner/deny-verifier/`, payload);
                                    console.log('Deny Verifier Response:', response.data);
                                    setShowDenyModal(false);
                                    setPopupMessage('Request denied successfully.');
                                    setTimeout(() => {
                                        router.back();
                                    }, 2000);
                                } catch (error) {
                                    setPopupMessage('Failed to deny the request. Please try again.');
                                    setShowDenyModal(false);
                                }
                            }}
                        >
                            Reject
                        </button>
                    </div>
                </div>
            )}
            {showApproveModal && (
                <div className={styles.modalOverlay1}>
                    <div className={styles.modalContent1}>
                        <h3 className={styles.modalTitle1}>Confirm Approval</h3>
                        <p className={styles.modalText1}>Are you sure you want to approve this request?</p>
                        <div className={styles.modalButtonGroup}>
                            <button className={styles.cancelButton} onClick={() => setShowApproveModal(false)}>
                                Cancel
                            </button>
                            <button className={styles.confirmButton} onClick={handleApprove}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChannelPartnerDetails;