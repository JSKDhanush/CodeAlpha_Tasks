"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";

const Category = () => {
  const [data, setData] = useState<{ category_id: string; category: string }[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [category, setCategory] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const API_BASE = "http://127.0.0.1:8000/cmsapi/cms/categories/";

  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_BASE);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (category.trim() !== "") {
      try {
        const response = await axios.post(API_BASE, { category });
        setData((prev) => [...prev, response.data]);
        setCategory("");
      } catch (error) {
        console.error("Error adding category:", error);
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
        const categoryToDelete = paginatedData[selectedIndex];
        await axios.delete(`${API_BASE}${categoryToDelete.category_id}/`);
        const updatedData = data.filter(item => item.category_id !== categoryToDelete.category_id);
        setData(updatedData);
        setShowDeleteModal(false);
        setSelectedIndex(null);
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleEdit = (index: number) => {
    setSelectedIndex(index);
    setEditValue(paginatedData[index].category);
    setShowEditModal(true);
  };

  const confirmEdit = async () => {
    if (selectedIndex !== null) {
      try {
        const categoryToEdit = paginatedData[selectedIndex];
        const response = await axios.put(API_BASE, {
          category_id: categoryToEdit.category_id,
          category: editValue,
        });
        const updatedData = data.map((item) =>
          item.category_id === categoryToEdit.category_id ? response.data : item
        );
        setData(updatedData);
        setShowEditModal(false);
        setSelectedIndex(null);
      } catch (error) {
        console.error("Error editing category:", error);
      }
    }
  };

  return (
    <div className="h-screen p-6 ml-20 text-white flex flex-col items-center font-sans relative">
      <div className="w-60 h-40 border-2 border-[#222531] rounded-md flex flex-col items-center justify-center mt-10 mb-8">
        <img
          src="https://res.cloudinary.com/dgfv6j82t/image/upload/v1737958058/mdi-light_gender-transgender_fhz8kb.svg"
          alt="Gender Icon"
          className="w-10 h-10 mb-2"
        />
        <p className="text-sm font-semibold">Category</p>
      </div>

      <div className="flex items-center mb-6 w-full max-w-md border-2 border-[#222531] rounded-md">
        <input
          type="text"
          placeholder="Enter Your Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-transparent w-full px-4 py-2 outline-none text-white"
        />
        <button
          onClick={handleAddCategory}
          className="px-4 text-white font-bold text-xl"
        >
          +
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="grid grid-cols-3 bg-[#1F1F22] rounded-md px-4 py-3 mb-2 font-semibold text-sm">
          <div>S. No</div>
          <div>Category</div>
          <div className="text-right">Actions</div>
        </div>

        {paginatedData.map((item, index) => (
          <div
            key={item.category_id}
            className="grid grid-cols-3 items-center bg-[#1F1F22] px-4 py-3 mb-2 rounded-md text-sm"
          >
            <div>{startIndex + index + 1}.</div>
            <div>{item.category}</div>
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-center space-x-4 mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="px-4 py-2 bg-[#1F1F22] rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-white text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="px-4 py-2 bg-[#1F1F22] rounded disabled:opacity-50"
        >
          Next
        </button>
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
            <p className="text-lg font-semibold mb-4">Edit Category</p>
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

export default Category;
