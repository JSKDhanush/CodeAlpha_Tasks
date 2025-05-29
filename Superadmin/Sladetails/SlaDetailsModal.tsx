import React from "react";
import styles from "./Sladetails.module.css";

interface SlaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlaDetailsModal: React.FC<SlaDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.slaModalOverlay}>
      <div className={styles.slaModal}>
        <div className={styles.slaModalHeader}>
          <h2 className={styles.slaModalHeading}>SLA Details</h2>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: "60%" }}
              ></div>
            </div>
            <span className={styles.progressText}>60% complete</span>
          </div>
        </div>
        <div className={styles.slaModalContent}>
          <div className={styles.slaSection}>
            <h3 className={styles.slaSubHeading}>SLA Time Limit</h3>
            <p className={styles.slaText}>2 hours</p>
            <h3 className={styles.slaSubHeading}>Time Taken So Far</h3>
            <p className={styles.slaText}>1 hour 20 minutes</p>
            <button className={styles.onTrackButton}>On Track</button>
          </div>
          <div className={styles.slaSection}>
            <h3 className={styles.slaSubHeading}>SLA Log History</h3>
            <ul className={styles.logList}>
              <li className={styles.logItem}>
                • Started: 04/02/2025 - 9:10 AM
              </li>
              <li className={styles.logItem}>• Paused: 04/02/2025 - 9:50 AM</li>
              <li className={styles.logItem}>
                • Resumed: 04/02/2025 - 10:15 AM
              </li>
            </ul>
          </div>
        </div>
        {/* <p className={styles.note}>
          Full payment eligible if completed within SLA
        </p> */}
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SlaDetailsModal;
