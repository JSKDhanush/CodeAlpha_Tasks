import { useCallback } from "react";
import axios from "axios";
import { E164Number } from "react-phone-number-input";

const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;

export const useUserManagementHandlers = (state: any, api: any) => {
  const { fetchUsers } = api;

  const handleEditClick = useCallback(
    (user: any) => {
      state.setUserToEdit(user);
      state.setShowEditUserModal(true);
    },
    [state.setUserToEdit, state.setShowEditUserModal]
  );

  const handleCloseEditUserModal = useCallback(() => {
    state.setShowEditUserModal(false);
    state.setUserToEdit(null);
  }, [state.setShowEditUserModal, state.setUserToEdit]);

  const handlePhoneNumberChange = useCallback(
    (value: E164Number | undefined) => {
      state.setNewUser({
        ...state.newUser,
        phone_number: value ?? "",
      });
    },
    [state.newUser, state.setNewUser]
  );

  const handleSaveChanges = useCallback(() => {
    const updatedData = {
      name: state.userToEdit.name,
      email: state.userToEdit.email,
      phone_number: state.userToEdit.phone_number,
      usertype: state.userToEdit.usertype,
    };

    const userData = {
      ...state.newUser,
      name: `${state.newUser.first_name} ${state.newUser.last_name}`.trim(),
      admin_user_name: state.currentUser.name,
      admin_user_type: state.currentUser.type,
    };

    const params = {
      admin_user_name: localStorage.getItem("user_name") || "Unknown User",
      admin_user_type: localStorage.getItem("user_type") || "Unknown Type",
      user_name: state.userToEdit.name,
      user_type: state.userToEdit.usertype,
      allUserData: JSON.stringify(state.userToEdit),
    };
    const queryString = new URLSearchParams(params).toString();

    axios
      .patch(
        `${AdminManagement}/adminapi/update-users/${state.userToEdit.user_id}?${queryString}`,
        updatedData
      )
      .then((response) => {
        console.log("User updated successfully:", response.data);
        state.setShowEditUserModal(false);
        state.setUserToEdit(null);
        axios
          .get(`${AdminManagement}/adminapi/users`)
          .then((response) => {
            state.setUsers(response.data);
          })
          .catch((error) => {
            console.error("Error fetching the updated users:", error);
            state.setPopupMessage(
              "Failed to fetch updated users. Please try again."
            );
          });
        state.setPopupMessage("User updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        if (error.response) {
          state.setPopupMessage(
            "Failed Error updating user: " +
              (error.response.data.message || "Unknown error")
          );
        } else {
          state.setPopupMessage("Failed to update user. Please try again.");
        }
      });
  }, [state, fetchUsers]);

  const handleOrganizationFilterChange = useCallback(
    (e: any) => {
      state.setOrganizationFilter(e.target.value);
    },
    [state.setOrganizationFilter]
  );

  const toggleDropdown = useCallback(() => {
    state.setDropdownOpen(!state.dropdownOpen);
  }, [state.dropdownOpen, state.setDropdownOpen]);

  const selectOrganization = useCallback(
    (org: string) => {
      state.setOrganizationFilter(org);
      state.setDropdownOpen(false);
    },
    [state.setOrganizationFilter, state.setDropdownOpen]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    state.setSearchQuery(e.target.value);
  };

  const handlePasswordChange = (e: any) => {
    const password = e.target.value;
    state.setNewUser({ ...state.newUser, password });
    state.evaluatePasswordStrength(password);
    state.setShowStrength(password.length > 0);
  };

  const handleDeleteClick = useCallback(
    (user_id: string) => {
      state.setSelectedUserId(user_id);
      state.setShowModal(true);
    },
    [state.setSelectedUserId, state.setShowModal]
  );

  const confirmDelete = useCallback(async () => {
    state.setShowModal(false);
    if (!state.selectedUserId) {
      state.setPopupMessage("Error: No user selected for deletion.");
      return;
    }

    const deletedUser = state.users.find(
      (user: any) => user.user_id === state.selectedUserId
    );
    if (!deletedUser) {
      state.setPopupMessage("Error: Selected user not found.");
      return;
    }

    try {
      console.log("Deleting user with ID:", state.selectedUserId);
      console.log("Deleted User Data:", deletedUser);
      console.log("AdminManagement URL:", AdminManagement);

      await axios.delete(
        `${AdminManagement}/adminapi/delete-user/${state.selectedUserId}`,
        {
          params: {
            admin_user_name:
              localStorage.getItem("user_name") || "Unknown User",
            admin_user_type:
              localStorage.getItem("user_type") || "Unknown Type",
            user_name: deletedUser.name,
            user_type: deletedUser.usertype,
            allUserData: JSON.stringify(deletedUser),
          },
          // Uncomment and add token if authentication is required
          // headers: {
          //   Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          // },
        }
      );

      fetchUsers();
      state.setPopupMessage("User deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      if (error.response) {
        console.log("Error Response:", error.response.data);
        state.setPopupMessage(
          `Failed! Error deleting user: ${error.response.data.error || "Unknown server error"}`
        );
      } else {
        state.setPopupMessage("Failed to delete user. Please try again.");
      }
    }
  }, [state, fetchUsers]);

  const handleCancelDelete = useCallback(() => {
    state.setShowDeleteModal(false);
    state.setUserToDelete(null);
  }, [state.setShowDeleteModal, state.setUserToDelete]);

  const handleCreateUserClick = async () => {
    if (state.organizations.length === 0) {
      try {
        const response = await axios.get(
          `${AdminManagement}/adminsixapi/organizations/`
        );
        state.setOrganizations(response.data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        state.setPopupMessage(
          "Failed to fetch organizations. Please try again."
        );
      }
    }
    state.setShowCreateUserModal(true);
  };

  const handleCloseCreateUserModal = useCallback(() => {
    state.setShowCreateUserModal(false);
  }, [state.setShowCreateUserModal]);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      field: string
    ) => {
      const value = e.target.value;
      state.setNewUser({
        ...state.newUser,
        [field]: value,
      });
      if (field === "password") {
        state.evaluatePasswordStrength(value);
      }
    },
    [state]
  );

  return {
    handleEditClick,
    handleCloseEditUserModal,
    handlePhoneNumberChange,
    handleSaveChanges,
    handleOrganizationFilterChange,
    toggleDropdown,
    selectOrganization,
    handleSearch,
    handlePasswordChange,
    handleDeleteClick,
    confirmDelete,
    handleCancelDelete,
    handleCreateUserClick,
    handleCloseCreateUserModal,
    handleInputChange,
  };
};