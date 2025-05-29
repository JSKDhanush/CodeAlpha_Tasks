// UserManagementApi.tsx
import { useCallback, useEffect } from "react";
import axios from "axios";

const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
const NftManagement = process.env.NEXT_PUBLIC_NftManagement;

export const useUserManagementApi = (state: any) => {
  const {
    setUsers,
    setRoles,
    setOrganizations,
    setDocumentCounts,
    users,
    autoRefresh,
    setPopupMessage,
  } = state;

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${AdminManagement}/adminapi/users`);
      // const response = await axios.get(`http://localhost:8000/adminapi/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setPopupMessage("Failed to fetch users. Please try again.");
    }
  }, [setUsers, setPopupMessage]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axios.get(`${AdminManagement}/adminapi/roles/`);
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setPopupMessage("Failed to fetch roles. Please try again.");
    }
  }, [setRoles, setPopupMessage]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await axios.get(
        `${AdminManagement}/adminsixapi/organisations/`
      );
      setOrganizations(response.data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setPopupMessage("Failed to fetch organizations. Please try again.");
    }
  }, [setOrganizations, setPopupMessage]);

  const fetchDocumentCounts = useCallback(async () => {
    const counts: Record<string, number> = {};
    await Promise.all(
      users.map(async (user: any) => {
        if (user.phone_number) {
          const phoneNumber = user.phone_number.replace(/^\+91/, "");
          try {
            const response = await axios.get(
              `${NftManagement}/nft_nft_analytics_service_api/nft-count/${phoneNumber}/`
            );
            counts[phoneNumber] = response.data.count;
          } catch (error) {
            console.error(
              `Error fetching document count for ${phoneNumber}:`,
              error
            );
            counts[phoneNumber] = 0;
            setPopupMessage(
              `Failed to fetch document count for ${phoneNumber}.`
            );
          }
        }
      })
    );
    setDocumentCounts(counts);
  }, [users, setDocumentCounts, setPopupMessage]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchOrganizations();
  }, [fetchUsers, fetchRoles, fetchOrganizations]);

  useEffect(() => {
    if (users.length > 0) {
      fetchDocumentCounts();
    }
  }, [users, fetchDocumentCounts]);

  // useEffect(() => {
  //   if (!autoRefresh) return;
  //   const interval = setInterval(() => {
  //     axios.get(`${AdminManagement}/adminapi/users`)
  //       .then((response) => {
  //         setUsers(response.data);
  //       })
  //       .catch((error) => {
  //         console.error("Error during auto-refresh:", error);
  //         setPopupMessage("Failed to auto-refresh users. Please try again.");
  //       });
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, [autoRefresh, setUsers, setPopupMessage]);

  return { fetchUsers, fetchRoles, fetchOrganizations, fetchDocumentCounts };
};
