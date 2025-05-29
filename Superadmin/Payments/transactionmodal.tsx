import React, { useMemo } from "react";
import styles from "./transactionModal.module.css";

const isDefaultZoom = Math.abs(window.innerWidth / window.screen.width - 1) < 0.01;

interface ModalData {
    payment_id?: string;
    request_id?: string;
    seeker_id?: string;
    seeker_name?: string;
    amount?: string;
    status?: string;
    created_at?: string;
}

interface TransactionModalProps {
  modalData: ModalData | null;
  closeModal: () => void;
  calculateDateTimeInIST: (createdAt: string) => { date: string; time: string };
}

const TransactionModal: React.FC<TransactionModalProps> = ({ modalData, closeModal, calculateDateTimeInIST }) => {
  const formattedDateTime = useMemo(() => {
    if (!modalData?.created_at) return { date: "N/A", time: "N/A" };
    return calculateDateTimeInIST(modalData.created_at);
  }, [modalData?.created_at, calculateDateTimeInIST]);

  const transactionDetails = useMemo(
    () => [
      { label: "Payment ID", value: modalData?.payment_id ?? "N/A" },
      { label: "Request ID", value: modalData?.request_id ?? "N/A" },
      { label: "Seeker ID", value: modalData?.seeker_id ?? "N/A" },
      { label: "Name", value: modalData?.seeker_name ?? "N/A" },
      { label: "Amount", value: modalData?.amount ? `₹${modalData.amount}` : "N/A" },
      { label: "Date", value: formattedDateTime.date },
      { label: "Time", value: formattedDateTime.time },
      { label: "Status", value: modalData?.status ?? "N/A" },
    ],
    [modalData, formattedDateTime]
  );

  if (!modalData) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={closeModal}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="#fff"
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>
        <div className={styles.transactionDetails}>
          <div className={styles.heading}>Transaction Details</div>
          <hr className={styles.hrLine} />
          <table>
            <tbody>
              {transactionDetails.map((item, index) => (
                <tr key={index}>
                  <td><strong>{item.label}:</strong></td>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;