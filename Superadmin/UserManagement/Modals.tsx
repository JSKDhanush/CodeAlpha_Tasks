import React from "react";
import styles from "./Usermanagement.module.css";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { AiOutlineClose } from "react-icons/ai";
import PhoneInput from "react-phone-number-input";

interface ModalsProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  confirmDelete: () => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (show: boolean) => void;
  userToDelete: any;
  showEditUserModal: boolean;
  userToEdit: any;
  handleCloseEditUserModal: () => void;
  setUserToEdit: (user: any) => void;
  handleSaveChanges: () => void;
  isClicked: boolean;
  showCreateOrgModal: boolean;
  userType: string;
  newUser: any;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: string
  ) => void;
  handleSaveUseradmin: (type: string) => void;
  handleCancel: () => void;
  uniqueOrganizations1: string[];
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  passwordStrength: string;
  showStrength: boolean;
  handlePhoneNumberChange: (value: any) => void;
  handlecloseorganization: () => void;
  popupMessage: string | null;
  closePopup: () => void;
  handleDepartmentChange: (department: string) => void;
  handleDepartmentSelectAll: (checked: boolean) => void;
  selectAllDepartments: boolean;
}

const Modals: React.FC<ModalsProps> = ({
  showModal,
  setShowModal,
  confirmDelete,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  userToDelete,
  showEditUserModal,
  userToEdit,
  handleCloseEditUserModal,
  setUserToEdit,
  handleSaveChanges,
  isClicked,
  showCreateOrgModal,
  userType,
  newUser,
  handleInputChange,
  handleSaveUseradmin,
  handleCancel,
  uniqueOrganizations1,
  handlePasswordChange,
  showPassword,
  setShowPassword,
  passwordStrength,
  showStrength,
  handlePhoneNumberChange,
  handlecloseorganization,
  closePopup,
  handleDepartmentChange,
  handleDepartmentSelectAll,
  selectAllDepartments,
}) => {
  return (
    <>
      {showModal && (
        <div className={styles.modaldelete}>
          <div className={styles.modalContentdelete}>
            <p>Are you sure you want to delete this user?</p>
            <button onClick={confirmDelete}>Delete</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3></h3>
            <p>Are you sure to delete {userToDelete?.name}?</p>
            <div className={styles.modalButtons}>
              <button
                className={styles.cancelBtn}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button className={styles.deleteBtn} onClick={confirmDelete}>
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditUserModal && userToEdit && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.viewUserModal1}`}>
            <div className="relative" style={{ padding: 0, margin: 0 }}>
              <AiOutlineClose
                style={{
                  fontSize: "24px",
                  position: "absolute",
                  top: 0,
                  right: 0,
                  cursor: "pointer",
                }}
                onClick={handleCloseEditUserModal}
              />
            </div>

            <h2 className={styles.modalTitle} style={{ marginTop: 16 }}>
              Edit Details
            </h2>
            <form className={styles.editUserForm}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={userToEdit.name}
                  onChange={(e) =>
                    setUserToEdit({ ...userToEdit, name: e.target.value })
                  }
                  placeholder="Name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={userToEdit.email}
                  onChange={(e) =>
                    setUserToEdit({ ...userToEdit, email: e.target.value })
                  }
                  placeholder="Email"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="text"
                  value={userToEdit.phone_number}
                  onChange={(e) =>
                    setUserToEdit({
                      ...userToEdit,
                      phone_number: e.target.value.replace(/\s/g, ""),
                    })
                  }
                  placeholder="Phone Number"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select
                  value={userToEdit.usertype}
                  onChange={(e) =>
                    setUserToEdit({ ...userToEdit, usertype: e.target.value })
                  }
                >
                  <option value="">Select a role</option>
                  {["Seeker", "Verifier", "Admin-Seeker", "Admin-Verifier"].map(
                    (role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div
                className={styles.formActions}
                style={{ display: "flex", gap: "10px" }}
              >
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseEditUserModal}
                  style={{
                    backgroundColor: "black",
                    color: "#E8E81F",
                    width: "220px",
                    height: "50px",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: "1px solid #E8E81F",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={`${styles.saveButtonedit} ${
                    isClicked ? styles.bgGreen : ""
                  }`}
                  onClick={handleSaveChanges}
                  style={{
                    backgroundColor: isClicked ? "green" : "",
                    color: "black",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateOrgModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.viewUserModal1}`}>
            <div className="relative" style={{ padding: 0, margin: 0 }}>
              <AiOutlineClose
                style={{
                  fontSize: "24px",
                  position: "absolute",
                  top: 0,
                  right: 0,
                  cursor: "pointer",
                }}
                onClick={handlecloseorganization}
              />
            </div>

            <h2
              className={styles.modalTitle}
              style={{ marginTop: 16, textAlign: "center" }}
            >
              {userType === "Admin"
                ? "Add Admin"
                : userType === "Seeker"
                ? "Add Seeker"
                : userType === "Channel"
                ? "Add Channel Partner"
                : "Add Verifier"}
            </h2>
            <form className={styles.createUserForm}>
              <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
              />
              {userType !== "Channel" && (
                <div className={styles.formGroup}>
                  <label>Role</label>
                  <div className={styles.selectWrapper}>
                    <select
                      value={newUser.usertype}
                      onChange={(e) => handleInputChange(e, "usertype")}
                    >
                      <option value="">Select a role</option>
                      {userType === "Admin" ? (
                        <>
                          <option value="Admin-Verifier">Admin-Verifier</option>
                          <option value="Admin-Seeker">Admin-Seeker</option>
                        </>
                      ) : userType === "Seeker" ? (
                        <option value="Seeker">Seeker</option>
                      ) : (
                        <option value="Verifier">Verifier</option>
                      )}
                    </select>
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              )}

              {userType !== "Channel" && (
                <div className={styles.formGroup}>
                  <label>Organization</label>
                  {newUser.usertype === "Verifier" ||
                  newUser.usertype === "Seeker" ? (
                    <div className={styles.selectWrapper}>
                      <select
                        value={newUser.organization}
                        onChange={(e) => handleInputChange(e, "organization")}
                      >
                        <option value="">Select Organization</option>
                        {uniqueOrganizations1.map((org, index) => (
                          <option key={index} value={org}>
                            {org}
                          </option>
                        ))}
                      </select>
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={newUser.organization}
                      onChange={(e) => handleInputChange(e, "organization")}
                      placeholder="Enter Organization"
                    />
                  )}
                </div>
              )}
              {(userType === "Seeker" || userType === "Verifier") && (
                <div className={styles.formGroup}>
                  <label>Channel Partner</label>
                  <div className={styles.selectWrapper}>
                    <select
                      value={newUser.channelPartner}
                      onChange={(e) => handleInputChange(e, "channelPartner")}
                    >
                      <option value="">Select Channel Partner</option>
                      <option value="Partner A">Partner A</option>
                      <option value="Partner B">Partner B</option>
                      <option value="Partner C">Partner C</option>
                      <option value="null">None</option>
                    </select>
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>First Name</label>
                <input
                  type="text"
                  value={newUser.first_name}
                  onChange={(e) => handleInputChange(e, "first_name")}
                  placeholder="First Name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Last Name</label>
                <input
                  type="text"
                  value={newUser.last_name}
                  onChange={(e) => handleInputChange(e, "last_name")}
                  placeholder="Last Name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange(e, "email")}
                  placeholder="Email"
                />
              </div>
              {userType === "Verifier" && (
                <div className={styles.formGroup}>
                  <div className={styles.selectAllRow}>
                    <input
                      type="checkbox"
                      checked={selectAllDepartments}
                      onChange={(e) =>
                        handleDepartmentSelectAll(e.target.checked)
                      }
                    />
                    <span style={{ fontSize: "16px" }}>Select Departments</span>
                  </div>

                  <div className={styles.checkboxRow}>
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          newUser.departments?.includes(
                            "Government Documents"
                          ) || false
                        }
                        onChange={() =>
                          handleDepartmentChange("Government Documents")
                        }
                      />
                      Government Documents
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={
                          newUser.departments?.includes(
                            "Educational Documents"
                          ) || false
                        }
                        onChange={() =>
                          handleDepartmentChange("Educational Documents")
                        }
                      />
                      Educational Documents
                    </label>
                  </div>

                  <div className={styles.checkboxRow}>
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          newUser.departments?.includes(
                            "Professional Documents"
                          ) || false
                        }
                        onChange={() =>
                          handleDepartmentChange("Professional Documents")
                        }
                      />
                      Professional Documents
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={
                          newUser.departments?.includes("Asset Documents") ||
                          false
                        }
                        onChange={() =>
                          handleDepartmentChange("Asset Documents")
                        }
                      />
                      Asset Documents
                    </label>
                  </div>
                </div>
              )}

              {userType !== "Channel" && (
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>
                    Password
                  </label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={handlePasswordChange}
                      placeholder="Enter password"
                      id="password"
                    />
                    <span
                      className={styles.eyeIcon}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <IoEye /> : <IoEyeOff />}
                    </span>
                  </div>
                  {showStrength && (
                    <p
                      className={`${
                        styles.passwordStrength
                      } ${passwordStrength.toLowerCase()}`}
                    >
                      Strength: {passwordStrength}
                    </p>
                  )}
                </div>
              )}

              <div className={`${styles.formGroup} ${styles.phoneNumber}`}>
                <label>Phone Number</label>
                <div className={styles.phoneInputContainer}>
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={newUser.phone_number}
                    onChange={handlePhoneNumberChange}
                    maxLength={15}
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className={styles.cancelButtonedit}
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`${styles.saveButtonuser} ${
                      isClicked ? styles.bgGreen : ""
                    }`}
                    onClick={() => handleSaveUseradmin(userType)}
                  >
                    {userType === "Admin"
                      ? "Add Admin"
                      : userType === "Seeker"
                      ? "Add Seeker"
                      : userType === "Channel"
                      ? "Add Channel Partner"
                      : "Add Verifier"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Modals;
