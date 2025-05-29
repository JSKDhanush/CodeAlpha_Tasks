import React from "react";
import styles from "./VerificationRequests.module.css";
import { Dispatch, SetStateAction } from "react";

interface Notifications {
  request_id?: string;
  seeker_id?: string;
  nft_id?: string;
  status: string;
  payment_status?: string;
  updated_at: string;
  user_id?: string;
  name: string;
  owner_name: string;
  symmetric_key?: string;
  verifier_id?: string;
  category?: string | string[];
  verifier_name: string;
  seeker_organization_name: string;
  verifier_organization_name: string;
  nft_document_name: string | string[];
  seeker_name: string;
  description: string;
  owner_phone_number: string;
  seeker_phone_number: string;
  verifier_phone_number: string;
  type:
    | "seeker_access"
    | "verifier_access"
    | "verification"
    | "kyb"
    | "channel_partner";
  id: string;
  message: string;
  createdAt: string;
}

type RequestTabsProps = {
  requestType:
    | "seeker_access"
    | "verifier_access"
    | "verification"
    | "kyb"
    | "channel_partner"
    | "onboarding"
    | "verification_main"
    | null;
  setRequestType: Dispatch<
    SetStateAction<
      | "seeker_access"
      | "verifier_access"
      | "verification"
      | "kyb"
      | "channel_partner"
      | "onboarding"
      | "verification_main"
      | null
    >
  >;
  sortedNotifications: Notifications[];
  filterType: string | null;
  filterValue: string;
};

const VerificationRequestsTabs: React.FC<RequestTabsProps> = ({
  requestType,
  setRequestType,
  sortedNotifications,
  filterType,
  filterValue,
}) => {
  const countRequests = (type: string | null) => {
    const filtered = sortedNotifications.filter((req) => {
      let isValid = true;

      if (type === "verifier_access") {
        isValid =
          req.type === "verifier_access" &&
          req.request_id?.startsWith("REQ-VRF");
      } else if (type === "verification") {
        isValid =
          req.type === "verification" && req.request_id?.startsWith("REQ-SKR");
      }

      if (filterType && isValid) {
        if (filterType === "status" && filterValue !== "All") {
          isValid = req.status === filterValue;
        }
        if (filterType === "updatedAt" && filterValue) {
          isValid = req.updated_at.startsWith(filterValue);
        }
      }

      return isValid;
    });

    return filtered.length;
  };

  return (
    <div className={styles.orglist}>
      <ul className={styles.organizationList}>
        <button
          className={`${styles.orglist1} ${
            requestType === "verifier_access" ? styles.selected : ""
          }`}
          onClick={() => setRequestType("verifier_access")}
          style={{
            border:
              requestType === "verifier_access"
                ? "1px solid white"
                : "2px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <li className={styles.organizationItem}>
            Verifier Access Requests{" "}
            <div className={styles.count}>
              ({countRequests("verifier_access")})
            </div>
          </li>
        </button>
        <button
          className={`${styles.orglist1} ${
            requestType === "verification" ? styles.selected : ""
          }`}
          onClick={() => setRequestType("verification")}
          style={{
            border:
              requestType === "verification"
                ? "1px solid white"
                : "2px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <li className={styles.organizationItem}>
            Verification Requests{" "}
            <div className={styles.count}>
              ({countRequests("verification")})
            </div>
          </li>
        </button>
      </ul>
    </div>
  );
};

export default VerificationRequestsTabs;