import React, { useState, useEffect, useRef } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface OrganizationEntry {
  id: string;
  organization: string | null;
  username: string | null;
  usertype: string;
  amount?: number | null;
  updated_at?: string | null;
}

interface TableProps {
  data: OrganizationEntry[];
  onEdit: (org: OrganizationEntry) => void;
  onDelete: (id: string) => void;
}

const TableComponent: React.FC<TableProps> = ({ data, onEdit, onDelete }) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Log duplicate or invalid IDs for debugging
  useEffect(() => {
    const idCounts = data.reduce((acc, org) => {
      const id = org.id || "undefined";
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const duplicates = Object.entries(idCounts).filter(
      ([id, count]) => count > 1
    );
    if (duplicates.length > 0) {
      console.warn("Duplicate IDs found:", duplicates);
    }
    if (data.some((org) => !org.id)) {
      console.warn("Entries with missing IDs:", data.filter((org) => !org.id));
    }
  }, [data]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsideAny = Object.values(menuRefs.current).some((ref) =>
        ref?.contains(event.target as Node)
      );
      if (!isClickInsideAny) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter and prepare data to ensure unique IDs
  const validData = data
    .map((org, index) => ({
      ...org,
      // Generate a unique key if org.id is missing or invalid
      uniqueKey: org.id && org.id !== "Auth Bridge" ? org.id : `org-${index}-${org.organization || "unknown"}`,
    }))
    .filter(
      (org, index, self) =>
        org.uniqueKey &&
        self.findIndex((o) => o.uniqueKey === org.uniqueKey) === index
    );

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          margin: "0 auto",
          borderCollapse: "collapse",
          backgroundColor: "#1e2116",
          color: "white",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#212714",
              color: "white",
              height: "70px",
            }}
          >
            <th
              style={{
                padding: "8px",
                textAlign: "left",
                borderBottom: "1px solid #253443",
                paddingLeft: "34px",
              }}
            >
              Organization
            </th>
            <th
              style={{
                padding: "8px",
                textAlign: "left",
                borderBottom: "1px solid #253443",
              }}
            >
              User Type
            </th>
            <th
              style={{
                padding: "8px",
                textAlign: "left",
                borderBottom: "1px solid #253443",
              }}
            >
              Amount
            </th>
            <th
              style={{
                padding: "8px",
                textAlign: "left",
                borderBottom: "1px solid #253443",
              }}
            >
              Updated At
            </th>
            <th
              style={{
                padding: "8px",
                textAlign: "center",
                borderBottom: "1px solid #253443",
                paddingLeft: "10px",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {validData.length > 0 ? (
            validData.map((org, index) => (
              <tr
                key={org.uniqueKey} // Use uniqueKey to ensure no duplicates
                style={{
                  backgroundColor: "#11140B",
                  height: "60px",
                  borderBottom:
                    index === validData.length - 1
                      ? "none"
                      : "1px solid #253443",
                }}
              >
                <td style={{ padding: "8px", paddingLeft: "60px" }}>
                  {org.organization || "N/A"}
                </td>
                <td style={{ padding: "8px", paddingLeft: "8px" }}>
                  {org.usertype}
                </td>
                <td style={{ padding: "8px" }}>
                  {org.amount !== null && org.amount !== undefined
                    ? `₹${org.amount}`
                    : "Not Set"}
                </td>
                <td style={{ padding: "8px" }}>
                  {org.updated_at
                    ? new Date(org.updated_at).toLocaleString()
                    : "N/A"}
                </td>
                <td style={{ padding: "8px", paddingLeft: "28px" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => onEdit(org)}
                      style={{
                        backgroundColor: "#E8E81F",
                        color: "black",
                        fontWeight: "bold",
                        border: "none",
                        padding: "4px 25px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      <FiEdit style={{ marginRight: "4px" }} />
                      Edit
                    </button>
                    {/* Uncomment if delete functionality is needed */}
                    {/* <button
                      onClick={() => onDelete(org.id)}
                      style={{
                        backgroundColor: "black",
                        color: "#E8E81F",
                        border: "1px solid #E8E81F",
                        padding: "4px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      <FiTrash2 style={{ marginRight: "4px" }} />
                      Delete
                    </button> */}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr style={{ backgroundColor: "#11140B", borderBottom: "none" }}>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  padding: "50px",
                  color: "yellow",
                }}
              >
                No organizations found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;