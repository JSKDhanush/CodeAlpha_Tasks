"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";

const Roles = () => {
  const [data, setData] = useState<{ role_id: string; roles_type: string }[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newRole, setNewRole] = useState("");

  const API_URL = "http://127.0.0.1:8000/cmsapi/cms/roles/";

  // Pagination states
  const itemsPerPage = 3;
  const pagesPerGroup = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async () => {
    if (newRole.trim() !== "") {
      try {
        const response = await axios.post(API_URL, { roles_type: newRole });
        setData((prev) => [...prev, response.data]);
        setNewRole("");
      } catch (error) {
        console.error("Error adding role:", error);
      }
    }
  };

  const handleDelete = (index: number) => {
    setSelectedIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedIndex !== null) {
      try {
        const roleToDelete = currentData[selectedIndex];
        await axios.delete(`${API_URL}${roleToDelete.role_id}/`);
        const updatedData = data.filter((item) => item.role_id !== roleToDelete.role_id);
        setData(updatedData);

        // Adjust currentPage if last item on page is deleted
        const newTotalPages = Math.ceil(updatedData.length / itemsPerPage);
        if (currentPage > newTotalPages) {
          setCurrentPage(newTotalPages || 1);
        }

        setShowDeleteModal(false);
        setSelectedIndex(null);
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  const handleEdit = (index: number) => {
    setSelectedIndex(index);
    setEditValue(currentData[index].roles_type);
    setShowEditModal(true);
  };

  const confirmEdit = async () => {
    if (selectedIndex !== null) {
      try {
        const roleToEdit = currentData[selectedIndex];
        const response = await axios.put(API_URL, {
          role_id: roleToEdit.role_id,
          roles_type: editValue,
        });

        const updatedData = data.map((item) =>
          item.role_id === roleToEdit.role_id ? response.data : item
        );
        setData(updatedData);
        setShowEditModal(false);
        setSelectedIndex(null);
      } catch (error) {
        console.error("Error editing role:", error);
      }
    }
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
  const startPage = currentGroup * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="h-screen p-6 ml-20 text-white flex flex-col items-center font-sans relative">
      {/* Icon and Title */}
      <div className="w-60 h-40 border-2 border-[#222531] rounded-md flex flex-col items-center justify-center mt-10 mb-8">
        <img
          src="https://res.cloudinary.com/dgfv6j82t/image/upload/v1737958058/carbon_currency_mkzolk.svg"
          alt="Role Icon"
          className="w-10 h-10 mb-2"
        />
        <p className="text-sm font-semibold">Roles</p>
      </div>

      {/* Input Field */}
      <div className="flex items-center mb-6 w-full max-w-md border-2 border-[#222531] rounded-md">
        <input
          type="text"
          placeholder="Enter Your Role"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="bg-transparent w-full px-4 py-2 outline-none text-white"
        />
        <button
          onClick={handleAddRole}
          className="px-4 text-white font-bold text-xl"
        >
          +
        </button>
      </div>

      {/* Table */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="grid grid-cols-3 bg-[#1F1F22] rounded-md px-4 py-3 mb-2 font-semibold text-sm">
          <div>S. No</div>
          <div>Roles</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Paginated Rows */}
        {currentData.map((item, index) => (
          <div
            key={item.role_id}
            className="grid grid-cols-3 items-center bg-[#1F1F22] px-4 py-3 mb-2 rounded-md text-sm"
          >
            <div>{startIndex + index + 1}.</div>
            <div>{item.roles_type}</div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => handleEdit(index)}>
                <FontAwesomeIcon icon={faEdit} className="text-white" />
              </button>
              <button onClick={() => handleDelete(index)}>
                <FontAwesomeIcon icon={faTrash} className="text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center w-full max-w-md mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-3 py-1 mx-1 bg-[#2C2F36] text-white rounded hover:bg-[#3a3d44]"
          >
            &lt;
          </button>
          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`px-3 py-1 mx-1 rounded ${
                num === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-[#2C2F36] text-white hover:bg-[#3a3d44]"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3 py-1 mx-1 bg-[#2C2F36] text-white rounded hover:bg-[#3a3d44]"
          >
            &gt;
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#222531] p-6 rounded-lg w-80 text-center shadow-xl">
            <p className="text-lg font-semibold mb-4">Are you sure you want to delete?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#222531] p-6 rounded-lg w-80 text-center shadow-xl">
            <p className="text-lg font-semibold mb-4">Edit Role</p>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#1A1A1D] text-white mb-4 outline-none"
            />
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmEdit}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
