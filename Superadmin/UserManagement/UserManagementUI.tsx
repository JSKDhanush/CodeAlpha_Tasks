import React from "react";
import dynamic from "next/dynamic";
import styles from "./Usermanagement.module.css";
import UserTable from "./UserTable";
import Modals from "./Modals";
import Filters from "./Filters";
import { log } from "node:console";
import { useRouter } from "next/navigation";

const Sidebar = dynamic(() => import("../Navbars/Sidebar"));
const Header = dynamic(() => import("../Navbars/Header"));
const PopupMessage = dynamic(() => import("../PopupMessage/PopupMessage"));

export const UserManagementUI: React.FC<any> = ({
  state,
  handlers,
  handlersExtra,
}) => {
  const [selectAllDepartments, setSelectAllDepartments] = React.useState(false); // Moved state here
  const router = useRouter();
  const filteredUsersorg = state.users.filter((user: any) => {
    const searchLower = state.searchQuery.toLowerCase();
    const nameMatch = user.name.toLowerCase().includes(searchLower);
    const phoneMatch = user.phone_number
      ? user.phone_number.toString().includes(searchLower)
      : false;

    const matchesOrganization = state.organizationFilter
      ? user.organization &&
        user.organization
          .toLowerCase()
          .includes(state.organizationFilter.toLowerCase())
      : true;

    const matchesStatus = state.status
      ? user.status && user.status.toLowerCase() === state.status.toLowerCase()
      : true;

    return matchesOrganization && matchesStatus && (nameMatch || phoneMatch);
  });

  const filteredUsers = filteredUsersorg.filter((user: any) => {
    if (state.activeTab === "All Users") return true;
    if (state.activeTab === "SuperAdmins")
      return user.usertype === "SuperAdmin";
    if (state.activeTab === "Data Owners") return user.usertype === "Owner";
    if (state.activeTab === "Verifiers") return user.usertype === "Verifier";
    if (state.activeTab === "Data Seekers") return user.usertype === "Seeker";
    if (state.activeTab === "Channel Partner")
      return user.usertype === "Channel Partner";
    if (state.activeTab === "Admins")
      return (
        user.usertype === "Admin-Seeker" || user.usertype === "Admin-Verifier"
      );
    return false;
  });

  const uniqueOrganizations1 = [
    ...new Set(
      state.users
        .filter((user: any) => {
          if (state.newUser.usertype === "Seeker") {
            return user.usertype === "Admin-Seeker";
          } else if (state.newUser.usertype === "Verifier") {
            return user.usertype === "Admin-Verifier";
          }
          return false;
        })
        .map((user: any) => user.organization)
        .filter(Boolean)
    ),
  ];

  const uniqueOrganizations = Array.from(
    new Set(state.users.map((user: any) => user.organization).filter(Boolean))
  );

  return (
    <div className={styles.userManagementContainer}>
      <Sidebar />
      {state.popupMessage && (
        <PopupMessage
          message={state.popupMessage}
          onClose={handlersExtra.closePopup}
          type={
            state.popupMessage.includes("successfully")
              ? "success"
              : state.popupMessage.includes("Failed")
              ? "error"
              : "info"
          }
        />
      )}
      <div className={styles.mainContent}>
        <Header
          userName={state.currentUser.name}
          userType={state.currentUser.type}
          searchQuery={state.searchQuery}
          onSearch={handlers.handleSearch}
        />

        <div className={styles.contentWrapper}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1 className={styles.pageTitle}>User Management</h1>
            <div
              className={styles.organizationFilter}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div className={styles.dropdownContainer}>
                <button
                  className={styles.createButtonorg}
                  onClick={handlersExtra.toggleDropdownadd}
                >
                  <i className="fas fa-plus"></i>
                  <span>Add</span>
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </button>

                {state.isDropdownOpenadd && (
                  <div className={styles.dropdownMenuadd}>
                    <button
                      className={styles.dropdownItemadd}
                      onClick={() => {
                        localStorage.setItem("usertype", "Admin-Seeker");
                        router.push("/Superadmin/KYB-Details/KYB-Details");

                      }}
                    >
                      Add Admin Seeker
                    </button>
                    <button
                      className={styles.dropdownItemadd}
                      onClick={() => {
                        localStorage.setItem("usertype", "Admin-Verifier");
                        router.push("/Superadmin/KYB-Details/KYB-Details");

                      }}
                    >
                      Add Admin Verifier
                    </button>
                    <button
                      className={styles.dropdownItemadd}
                      onClick={() => {
                        handlersExtra.handleCreateOrganizationClick("Seeker");
                        handlersExtra.toggleDropdownadd();
                      }}
                    >
                      Add Seeker
                    </button>
                    <button
                      className={styles.dropdownItemadd}
                      onClick={() => {
                        handlersExtra.handleCreateOrganizationClick("Verifier");
                        handlersExtra.toggleDropdownadd();
                      }}
                    >
                      Add Verifier
                    </button>
                    <button
                      className={styles.dropdownItemadd}
                      onClick={() => {
                        handlersExtra.handleCreateOrganizationClick("Channel");
                        handlersExtra.toggleDropdownadd();
                      }}
                    >
                      Add Channel Partner
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          ></link>

          <Filters
            searchQuery={state.searchQuery}
            handleSearch={handlers.handleSearch}
            activeTab={state.activeTab}
            setActiveTab={state.setActiveTab}
            status={state.status}
            setStatus={state.setStatus}
            organizationFilter={state.organizationFilter}
            dropdownOpen={state.dropdownOpen}
            toggleDropdown={handlers.toggleDropdown}
            selectOrganization={handlers.selectOrganization}
            uniqueOrganizations={uniqueOrganizations}
            setOrganizationFilter={state.setOrganizationFilter}
          />

          <UserTable
            filteredUsers={filteredUsers}
            activeTab={state.activeTab}
            documentCounts={state.documentCounts}
            handleViewClick={handlersExtra.handleViewClick}
            handleToggleDropdown={handlersExtra.handleToggleDropdown}
            isDropdownOpen={state.isDropdownOpen}
            handleEditClick={handlers.handleEditClick}
            handleDeleteClick={handlers.handleDeleteClick}
            formatPhoneNumber={handlersExtra.formatPhoneNumber}
          />
        </div>
      </div>

      <Modals
        showModal={state.showModal}
        setShowModal={state.setShowModal}
        confirmDelete={handlers.confirmDelete}
        isDeleteModalOpen={state.isDeleteModalOpen}
        setIsDeleteModalOpen={state.setIsDeleteModalOpen}
        userToDelete={state.userToDelete}
        showEditUserModal={state.showEditUserModal}
        userToEdit={state.userToEdit}
        handleCloseEditUserModal={handlers.handleCloseEditUserModal}
        setUserToEdit={state.setUserToEdit}
        handleSaveChanges={handlers.handleSaveChanges}
        isClicked={state.isClicked}
        showCreateOrgModal={state.showCreateOrgModal}
        userType={state.userType}
        newUser={state.newUser}
        handleInputChange={handlers.handleInputChange}
        handleSaveUseradmin={handlersExtra.handleSaveUseradmin}
        handleCancel={handlersExtra.handleCancel}
        uniqueOrganizations1={uniqueOrganizations1}
        handlePasswordChange={handlers.handlePasswordChange}
        showPassword={state.showPassword}
        setShowPassword={state.setShowPassword}
        passwordStrength={state.passwordStrength}
        showStrength={state.showStrength}
        handlePhoneNumberChange={handlers.handlePhoneNumberChange}
        handlecloseorganization={handlersExtra.handlecloseorganization}
        popupMessage={state.popupMessage}
        closePopup={handlersExtra.closePopup}
        handleDepartmentChange={handlersExtra.handleDepartmentChange} // Added
        handleDepartmentSelectAll={handlersExtra.handleDepartmentSelectAll} // Added
        selectAllDepartments={selectAllDepartments} // Added
      />
    </div>
  );
};
