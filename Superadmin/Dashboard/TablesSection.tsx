import React, { useEffect, useState } from "react";
import styles from "./DashboardContent.module.css";

interface TablesSectionProps {
  verificationTimeRange: string;
  setVerificationTimeRange: (value: string) => void;
  topVerifiers: any[];
  data: any[];
}

const TablesSection: React.FC<TablesSectionProps> = ({
  verificationTimeRange,
  setVerificationTimeRange,
  topVerifiers,
  data,
}) => {
  const [isDefaultZoom, setIsDefaultZoom] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const zoomLevel = Math.abs(window.innerWidth / window.screen.width - 1) < 0.01;
      setIsDefaultZoom(zoomLevel);
    }
  }, []);

  return (
    <div className={styles.tablesContainer}>
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3>Most Verification Done By</h3>
          <select
            value={verificationTimeRange}
            onChange={(e) => setVerificationTimeRange(e.target.value)}
            style={{
              marginLeft: "auto",
              padding: isDefaultZoom ? '0px' : '8px',
              borderRadius: "4px",
              border: ".5px solid #253443",
              fontSize: isDefaultZoom ? '10px' : '15px',
              backgroundColor:
                verificationTimeRange === "Last Week" ? "transparent" : "#11140B",
              color: verificationTimeRange === "Last Week" ? "#fff" : "#ccc",
            }}
          >
            <option value="Last Week">Last Week</option>
            <option value="Last 2 Weeks">Last 2 Weeks</option>
            <option value="Last 3 Weeks">Last 3 Weeks</option>
            <option value="Last Month">Last Month</option>
          </select>
        </div>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableTr}>
              <th
                className={`${styles.tableTh} ${styles.leftAlign}`}
                style={{ color: "#FFFFFF", fontSize: isDefaultZoom ? '12px' : '15px' }}
              >
                Sl
              </th>
              <th className={styles.tableTh} style={{ fontSize: isDefaultZoom ? '12px' : '15px' }}>
                Name
              </th>
              <th
                className={`${styles.tableTh} ${styles.rightAlign}`}
                style={{ fontSize: isDefaultZoom ? '12px' : '15px' }}
              >
                No. of Verifications
              </th>
            </tr>
          </thead>
          <tbody className={styles.tableTbody}>
            {topVerifiers.length > 0 ? (
              topVerifiers.map((verifier, index) => (
                <tr key={index} className={styles.tableTr}>
                  <td className={`${styles.tableTd} ${styles.leftAlign}`}>
                    {index + 1}
                  </td>
                  <td
                    className={styles.tableTd}
                    style={{
                      color:
                        verifier.name === "No Data" ? "#B9B9B1" : "inherit",
                    }}
                  >
                    {verifier.name}
                  </td>
                  <td className={`${styles.tableTd} ${styles.rightAlign}`}>
                    {verifier.count}
                  </td>
                </tr>
              ))
            ) : (
              <tr className={styles.tableTr}>
                <td
                  colSpan={3}
                  className={`${styles.tableTd} ${styles.noData}`}
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3>Most Data Requested By</h3>
          <select
            value={verificationTimeRange}
            onChange={(e) => setVerificationTimeRange(e.target.value)}
            style={{
              marginLeft: "auto",
              padding: isDefaultZoom ? '0px' : '8px',
              borderRadius: "4px",
              border: ".5px solid #253443",
              fontSize: isDefaultZoom ? '10px' : '15px',
              backgroundColor:
                verificationTimeRange === "Last Week" ? "transparent" : "#11140B",
              color: verificationTimeRange === "Last Week" ? "#fff" : "#ccc",
            }}
          >
            <option value="Last Week">Last Week</option>
            <option value="Last 2 Weeks">Last 2 Weeks</option>
            <option value="Last 3 Weeks">Last 3 Weeks</option>
            <option value="Last Month">Last Month</option>
          </select>
        </div>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableTr}>
              <th
                className={`${styles.tableTh} ${styles.leftAlign}`}
                style={{ fontSize: isDefaultZoom ? '12px' : '15px' }}
              >
                Sl
              </th>
              <th className={styles.tableTh} style={{ fontSize: isDefaultZoom ? '12px' : '15px' }}>
                Name
              </th>
              <th
                className={`${styles.tableTh} ${styles.rightAlign}`}
                style={{ fontSize: isDefaultZoom ? '12px' : '15px' }}
              >
                No. of Verifications
              </th>
            </tr>
          </thead>
          <tbody className={styles.tableTbody}>
            {data.map((item, index) => (
              <tr key={index} className={styles.tableTr}>
                <td className={`${styles.tableTd} ${styles.leftAlign}`}>
                  {index + 1}
                </td>
                <td
                  className={styles.tableTd}
                  style={{
                    color: item.name === "No Data" ? "#B9B9B1" : "inherit",
                  }}
                >
                  {item.name}
                </td>
                <td className={`${styles.tableTd} ${styles.rightAlign}`}>
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablesSection;