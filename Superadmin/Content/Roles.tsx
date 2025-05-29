"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";

const Roles = () => {
  const [data, setData] = useState([
    { gender: "Seeker" },
    { gender: "Verifier" },
    { gender: "Admin-Seeker" },
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleDelete = (index: number) => {
    setSelectedIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedIndex !== null) {
      const updatedData = [...data];
      updatedData.splice(selectedIndex, 1);
      setData(updatedData);
    }
    setShowDeleteModal(false);
    setSelectedIndex(null);
  };

  const handleEdit = (index: number) => {
    setSelectedIndex(index);
    setEditValue(data[index].gender);
    setShowEditModal(true);
  };

  const confirmEdit = () => {
    if (selectedIndex !== null) {
      const updatedData = [...data];
      updatedData[selectedIndex].gender = editValue;
      setData(updatedData);
    }
    setShowEditModal(false);
    setSelectedIndex(null);
  };

  return (
    <div className="h-screen p-6 ml-20 text-white flex flex-col items-center font-sans relative">
      {/* Icon and Title */}
      <div className="w-60 h-40 border-2 border-[#222531] rounded-md flex flex-col items-center justify-center mt-10 mb-8">
        <img
          src="https://res.cloudinary.com/dgfv6j82t/image/upload/v1737958058/carbon_currency_mkzolk.svg"
          alt="Gender Icon"
          className="w-10 h-10 mb-2"
        />
        <p className="text-sm font-semibold">Roles</p>
      </div>

      {/* Input Field */}
      <div className="flex items-center mb-6 w-full max-w-md border-2 border-[#222531] rounded-md">
        <input
          type="text"
          placeholder="Enter Your Roles"
          className="bg-transparent w-full px-4 py-2 outline-none text-white"
        />
        <button className="px-4 text-white font-bold text-xl">+</button>
      </div>

      {/* Table */}
      <div className="w-full max-w-md">
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-[#1F1F22] rounded-md px-4 py-3 mb-2 font-semibold text-sm">
          <div>S. No</div>
          <div>Roles</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Rows */}
        {data.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-3 items-center bg-[#1F1F22] px-4 py-3 mb-2 rounded-md text-sm"
          >
            <div>{index + 1}.</div>
            <div>{item.gender}</div>
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
      <div className="flex items-center justify-between w-full max-w-2xl mt-8 px-4">
        <div className="flex space-x-1 text-xl">
          <span className="cursor-pointer">&lt;</span>
          <span>•</span>
          <span>•</span>
          <span className="text-white">•</span>
          <span>•</span>
          <span>&gt;</span>
        </div>
      </div>

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
                Update
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
