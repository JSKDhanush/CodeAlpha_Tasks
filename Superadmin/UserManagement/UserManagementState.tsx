"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const useUserManagementState = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Users");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [userToView, setUserToView] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<Record<string, boolean>>(
    {}
  );
  const [selectAllDepartments, setSelectAllDepartments] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    password: "",
    email: "",
    phone_number: "",
    usertype: "",
    organization: "",
    channelPartner: "",
    departments: [],
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("Weak");
  const [showStrength, setShowStrength] = useState(false);

  // Initialize currentUser with default values
  const [currentUser, setCurrentUser] = useState({
    name: "Unknown User",
    type: "Unknown Type",
  });
  const [documentCounts, setDocumentCounts] = useState<{
    [key: string]: number;
  }>({});
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDropdownOpenadd, setIsDropdownOpenadd] = useState(false);
  const [userType, setUserType] = useState("");

  // Load currentUser from localStorage only on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("user_name") || "Unknown User";
      const storedType = localStorage.getItem("user_type") || "Unknown Type";
      setCurrentUser({
        name: storedName,
        type: storedType,
      });
    }
  }, []);
  const evaluatePasswordStrength = (password: string) => {
    let strength = "Weak";
    if (password.length >= 8) {
      if (
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
      ) {
        strength = "Strong";
      } else if (
        /[A-Z]/.test(password) ||
        /[0-9]/.test(password) ||
        /[^A-Za-z0-9]/.test(password)
      ) {
        strength = "Medium";
      }
    }
    setPasswordStrength(strength);
  };

  return {
    isClicked,
    setIsClicked,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    showDeleteModal,
    setShowDeleteModal,
    showCreateUserModal,
    setShowCreateUserModal,
    showEditUserModal,
    setShowEditUserModal,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    showViewUserModal,
    setShowViewUserModal,
    userToDelete,
    setUserToDelete,
    userToEdit,
    setUserToEdit,
    userToView,
    setUserToView,
    users,
    setUsers,
    roles,
    setRoles,
    organizations,
    setOrganizations,
    isModalOpen,
    setIsModalOpen,
    showCreateOrgModal,
    setShowCreateOrgModal,
    newOrgName,
    setNewOrgName,
    showModal,
    setShowModal,
    selectedUserId,
    setSelectedUserId,
    popupMessage,
    setPopupMessage,
    status,
    setStatus,
    isDropdownOpen,
    setIsDropdownOpen,
    newUser,
    setNewUser,
    autoRefresh,
    setAutoRefresh,
    router,
    showPassword,
    setShowPassword,
    passwordStrength,
    setPasswordStrength,
    showStrength,
    setShowStrength,
    currentUser,
    setCurrentUser,
    documentCounts,
    setDocumentCounts,
    organizationFilter,
    setOrganizationFilter,
    dropdownOpen,
    setDropdownOpen,
    isDropdownOpenadd,
    setIsDropdownOpenadd,
    userType,
    setUserType,
    evaluatePasswordStrength,
    selectAllDepartments,
    setSelectAllDepartments,
  };
};
