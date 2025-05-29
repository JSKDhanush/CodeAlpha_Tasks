import React from "react";
import styles from "./DashboardContent.module.css";
import { useRouter } from "next/navigation";

interface StatsCardsProps {
  totalUsers: number;
  totalRevenue: number;
  verifiedCount: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  totalUsers,
  totalRevenue,
  verifiedCount,
}) => {
  const router = useRouter(); // Initializing router for navigation
  const handleUsersCardClick = () => {
    router.push("./UserManagement"); // Redirect to UserManagement route
  };
  const handlePaymentsCardClick = () => {
    router.push("./Payments"); // Redirect to UserManagement route
  };
  const handleVerifiedDocumentsCardClick = () => {
    router.push("./VerificationRequests?status=Verified"); // Redirect to VerificationRequests with status filter
  };

  return (
    <div className={styles.stats}>
      <div
        className={styles.card}
        onClick={handleUsersCardClick}
        style={{ cursor: "pointer" }}
      >
        {" "}
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>No of Users</h3>
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              backgroundColor: "#11140B",
              borderRadius: "50%",
              padding: "6px",
            }}
          >
            <img
              src="https://res.cloudinary.com/dolhqxgju/image/upload/v1742454699/Icon_gsjn8u.svg"
              alt="Users Icon"
              width="35"
              height="35"
            />
          </div>
        </div>
        <p className={styles.cardValue}>{totalUsers}</p>
        <hr
          style={{
            opacity: 0.6,
            border: "0.5px solid #253443",
            margin: "4px 0",
            width: "100%",
          }}
        />
        <small className={styles.cardSmall}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="#A3D397"
            viewBox="0 0 24 24"
            style={{ marginRight: "4px" }}
          >
            <path d="M4 12l4-4 4 4 6-6 2 2v-6h-6l2 2-6 6-4-4-6 6z" />
          </svg>
          <span style={{ color: "#A3D397" }}>4.5%</span> Up from past week
        </small>
      </div>

      <div
        className={styles.card}
        onClick={handlePaymentsCardClick}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Total Revenue</h3>
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              backgroundColor: "#7746F440",
              borderRadius: "50%",
              padding: "6px",
              // width: "50px",
              // height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="https://res.cloudinary.com/dolhqxgju/image/upload/v1742463115/payments_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24_1_1_ftptna.png"
              alt="Total Revenue Icon"
              width="25"
              height="25"
            />
          </div>
        </div>
        <p className={styles.cardValue}>₹{totalRevenue.toLocaleString()}</p>
        <hr
          style={{
            opacity: 0.6,
            border: "0.5px solid #253443",
            margin: "4px 0",
            width: "100%",
          }}
        />
        <small className={styles.cardSmall}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="#A3D397"
            viewBox="0 0 24 24"
            style={{ marginRight: "4px" }}
          >
            <path d="M4 12l4-4 4 4 6-6 2 2v-6h-6l2 2-6 6-4-4-6 6z" />
          </svg>
          <span style={{ color: "#A3D397" }}>4.5%</span> Up from past week
        </small>
      </div>

      <div
        className={styles.card}
        onClick={handleVerifiedDocumentsCardClick}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Number of Verified Documents</h3>
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              backgroundColor: "#7746F440",
              borderRadius: "50%",
              padding: "6px",
              // width: "50px",
              // height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="https://res.cloudinary.com/dolhqxgju/image/upload/v1742455921/hourglass_top_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24_1_feejmy.svg"
              alt="Hourglass Icon"
              width="25"
              height="25"
            />
          </div>
        </div>
        <p className={styles.cardValue}>{verifiedCount}</p>
        <hr
          style={{
            opacity: 0.6,
            border: "0.5px solid #253443",
            margin: "4px 0",
            width: "100%",
          }}
        />
        <small className={styles.cardSmall}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#FF0000"
            viewBox="0 0 24 24"
            style={{ marginRight: "4px" }}
          >
            <path d="M20 12l-4 4-4-4-6 6-2-2v6h6l-2-2 6-6 4 4 6-6z" />
          </svg>
          <span style={{ color: "red" }}>2.3%</span> Down from past week
        </small>
      </div>
    </div>
  );
};

export default StatsCards;
