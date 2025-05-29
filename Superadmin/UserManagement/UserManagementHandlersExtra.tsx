import { useCallback } from "react";
import axios from "axios";

const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;

export const useUserManagementHandlersExtra = (
  state: any,
  api: any,
  setSelectAllDepartments: (value: boolean) => void
) => {
  const { fetchUsers } = api;

  const handleSaveUser = useCallback(() => {
    let errorMessage = "";
    if (!state.newUser.first_name) errorMessage = "First Name is required!";
    else if (!state.newUser.last_name) errorMessage = "Last Name is required!";
    else if (!state.newUser.email) errorMessage = "Email is required!";
    else if (!state.newUser.phone_number)
      errorMessage = "Phone Number is required!";
    else if (!state.newUser.usertype && state.newUser.usertype !== "Channel")
      errorMessage = "Role is required!";
    else if (!state.newUser.password && state.newUser.usertype !== "Channel")
      errorMessage = "Password is required!";

    if (errorMessage) {
      state.setPopupMessage(errorMessage);
      return;
    }

    const userData = {
      ...state.newUser,
      name: `${state.newUser.first_name} ${state.newUser.last_name}`.trim(),
      admin_user_name: state.currentUser.name,
      admin_user_type: state.currentUser.type,
      department: state.newUser.departments, // Rename to department
    };

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(state.newUser.email)) {
      state.setPopupMessage(
        "Please enter a valid email address (e.g. example@domain.com)."
      );
      return;
    }

    state.setIsClicked(true);
    setTimeout(() => state.setIsClicked(false), 2000);

    axios
      .post(`${AdminManagement}/adminapi/add-user`, userData)
      .then((response) => {
        console.log("New user created successfully:", response.data);
        fetchUsers();
        state.setPopupMessage("User created successfully!");
        state.setShowCreateUserModal(false);
        state.setIsModalOpen(false);
        state.setNewUser({
          first_name: "",
          last_name: "",
          password: "",
          email: "",
          phone_number: "",
          usertype: "",
          organization: "",
          channelPartner: "",
          departments: "", // Fixed typo from department to departments
        });
      })
      .catch((error) => {
        console.error("There was an error creating the user:", error);
        state.setPopupMessage(
          "Failed! Error creating user: " +
            (error.response?.data.message ||
              error.response?.data.error ||
              "Unknown error")
        );
      });
  }, [state, fetchUsers]);

  const handleSaveUseradmin = useCallback(
    (type: string) => {
      let errorMessage = "";
      console.log("user type", type);

      if (type !== "Channel" && !state.newUser.organization)
        errorMessage = "Organization is required!";
      else if (type !== "Channel" && !state.newUser.usertype)
        errorMessage = "Role is required!";
      else if (!state.newUser.first_name)
        errorMessage = "First Name is required!";
      else if (!state.newUser.last_name)
        errorMessage = "Last Name is required!";
      else if (!state.newUser.email) errorMessage = "Email is required!";
      else if (type !== "Channel" && !state.newUser.password)
        errorMessage = "Password is required!";
      else if (!state.newUser.phone_number)
        errorMessage = "Phone Number is required!";

      if (errorMessage) {
        state.setPopupMessage(errorMessage);
        return;
      }

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(state.newUser.email)) {
        state.setPopupMessage(
          "Please enter a valid email address (e.g. example@domain.com)."
        );
        return;
      }

      if (type === "Channel") {
        state.newUser.password = state.newUser.phone_number;
      }
      if (type === "Channel") {
        state.newUser.usertype = "Channel Partner";
      }

      const userData = {
        ...state.newUser,
        name: `${state.newUser.first_name} ${state.newUser.last_name}`.trim(),
        usertype: state.newUser.usertype,
        department: state.newUser.departments, // Rename to department
      };

      state.setIsClicked(true);
      setTimeout(() => state.setIsClicked(false), 2000);

      axios
        .post(`${AdminManagement}/adminapi/add-user`, userData)
        .then((response) => {
          console.log("New user created successfully:", response.data);
          fetchUsers();
          state.setPopupMessage(
            type === "Channel"
              ? "Channel Partner created successfully!"
              : "User created successfully!"
          );
          axios
            .post(`${AdminManagement}/adminthreeapi/send-email/`, {
              email: state.newUser.email,
              password: state.newUser.password,
              organization: state.newUser.organization,
              name: state.newUser.first_name + state.newUser.last_name,
              usertype: state.newUser.usertype,
            })
            .then(() => state.setPopupMessage("Email sent successfully"))
            .catch((error) => {
              console.error("Error sending email:", error);
              state.setPopupMessage("Failed to send email. Please try again.");
            });
          state.setShowCreateUserModal(false);
          state.setIsModalOpen(false);
          state.setNewUser({
            first_name: "",
            last_name: "",
            password: "",
            email: "",
            phone_number: "",
            usertype: "",
            organization: "",
            channelPartner: "",
            departments: "", // Fixed typo from department to departments
          });
          setSelectAllDepartments(false); // Reset selectAllDepartments
        })
        .catch((error) => {
          console.error("There was an error creating the user:", error);
          const errorMsg =
            error.response?.data?.message || error.response?.data?.error || "";

          if (
            (errorMsg.includes("email") && errorMsg.includes("exists")) ||
            (errorMsg.includes("phone") && errorMsg.includes("exists"))
          ) {
            state.setPopupMessage("Email or Phone Number already exists.");
          } else {
            state.setPopupMessage(
              "Failed! Error creating user: " + (errorMsg || "Unknown error")
            );
          }
        });
    },
    [state, fetchUsers, setSelectAllDepartments]
  );

  const handleDepartmentChange = useCallback(
    (department: string) => {
      // *** Change Starts Here ***
      const currentDepartments =
        typeof state.newUser.departments === "string" &&
        state.newUser.departments
          ? state.newUser.departments
              .split(",")
              .filter((d: string) => d.trim() !== "")
          : [];
      const updatedDepartments = currentDepartments.includes(department)
        ? currentDepartments.filter((d: string) => d !== department)
        : [...currentDepartments, department];
      state.setNewUser((prev: any) => ({
        ...prev,
        departments: updatedDepartments.join(","), // Store as comma-separated string
      }));
      setSelectAllDepartments(updatedDepartments.length === 4); // Sync "Select Departments" checkbox
      // *** Change Ends Here ***
    },
    [state.setNewUser, setSelectAllDepartments]
  );

  const handleDepartmentSelectAll = useCallback(
    (checked: boolean) => {
      setSelectAllDepartments(checked);
      state.setNewUser((prev: any) => ({
        ...prev,
        departments: checked
          ? "Government Documents,Educational Documents,Professional Documents,Asset Documents" // Select all departments
          : "", // Deselect all
      }));
    },
    [state.setNewUser, setSelectAllDepartments]
  );
 const handleViewClick = useCallback(
    (user: any) => {
      // Check if user is Owner or SuperAdmin to allow access
      if (user.usertype === "Owner") {
        localStorage.setItem("selectedPhoneNumber", user.phone_number);
        state.router.push(`/Superadmin/ViewUsersData`);
      } else if (user.usertype === "SuperAdmin" || user.usertype === "Admin-Verifier" || user.usertype === "Admin-Seeker" || user.usertype === "Channel Partner") {
        // Added redirection for SuperAdmin
        localStorage.setItem("selectedPhoneNumber", user.phone_number);
        state.router.push(`/Superadmin/ViewUsersDataAdmin`);
      } else if ( user.usertype === "Seeker") {
        // Added redirection for SuperAdmin
        localStorage.setItem("selectedPhoneNumber", user.phone_number);
        state.router.push(`/Superadmin/ViewUsersDataSeeker`);
      }
      else {
        localStorage.setItem("selectedPhoneNumber", user.phone_number);
        state.router.push(`/Superadmin/ViewUsersDataVerifier`);
      }
    },
    [state.router, state.setPopupMessage]
  );

  const handleCloseViewUserModal = useCallback(() => {
    state.setShowViewUserModal(false);
    state.setUserToView(null);
  }, [state.setShowViewUserModal, state.setUserToView]);

  const evaluatePasswordStrength = useCallback(
    (password: string) => {
      let strength = "Weak";
      if (password.length >= 8) {
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
          if (/\d/.test(password)) {
            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
              strength = "Strong";
            } else {
              strength = "Medium";
            }
          }
        }
      }
      state.setPasswordStrength(strength);
    },
    [state.setPasswordStrength]
  );

  const handleCloseCreateOrgModal = useCallback(() => {
    state.setShowCreateOrgModal(false);
    state.setNewOrgName("");
  }, [state.setShowCreateOrgModal, state.setNewOrgName]);

  const handlecloseorganization = useCallback(() => {
    console.log("enter");
    state.setShowCreateOrgModal(false);
  }, [state.setShowCreateOrgModal]);

  const formatPhoneNumber = useCallback((phoneNumber: string) => {
    if (!phoneNumber) return "N/A";
    if (phoneNumber.startsWith("+91")) {
      return `+91 ${phoneNumber.slice(3)}`;
    }
    return phoneNumber;
  }, []);

  const handleCancel = useCallback(() => {
    console.log("Cancel clicked");
    state.setShowCreateOrgModal(false);
    state.setNewUser({
      first_name: "",
      last_name: "",
      password: "",
      email: "",
      phone_number: "",
      usertype: "",
      organization: "",
      channelPartner: "",
      departments: "",
    });
    state.setShowCreateUserModal(false);
    state.setIsModalOpen(false);
    state.setPopupMessage(null);
    state.setIsClicked(false);
    setSelectAllDepartments(false); // Reset selectAllDepartments
  }, [
    state.setNewUser,
    state.setShowCreateUserModal,
    state.setIsModalOpen,
    state.setPopupMessage,
    state.setIsClicked,
    setSelectAllDepartments,
  ]);

  const handleCreateOrganizationClick = useCallback(
    (type: string) => {
      state.setUserType(type);
      state.setShowCreateOrgModal(true);
    },
    [state.setUserType, state.setShowCreateOrgModal]
  );

  const toggleDropdownadd = useCallback(() => {
    state.setIsDropdownOpenadd(!state.isDropdownOpenadd);
  }, [state.isDropdownOpenadd, state.setIsDropdownOpenadd]);

  const togglePasswordVisibility = useCallback(() => {
    state.setShowPassword((prev: boolean) => !prev);
  }, [state.setShowPassword]);

  const handleToggleDropdown = useCallback(
    (userId: string) => {
      state.setIsDropdownOpen((prevState: any) => {
        if (prevState[userId]) {
          return {};
        }
        return { [userId]: true };
      });
    },
    [state.setIsDropdownOpen]
  );

  const closePopup = useCallback(() => {
    state.setPopupMessage(null);
  }, [state.setPopupMessage]);

  return {
    handleSaveUser,
    handleSaveUseradmin,
    handleViewClick,
    handleCloseViewUserModal,
    evaluatePasswordStrength,
    handleCloseCreateOrgModal,
    handlecloseorganization,
    formatPhoneNumber,
    handleCancel,
    handleCreateOrganizationClick,
    toggleDropdownadd,
    togglePasswordVisibility,
    handleToggleDropdown,
    closePopup,
    handleDepartmentChange,
    handleDepartmentSelectAll,
  };
};
