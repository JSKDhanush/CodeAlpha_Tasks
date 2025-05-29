"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const Category = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: "Government Documents" },
    { id: 2, name: "Educational Documents" },
    { id: 3, name: "Professional Documents" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      setCategories([...categories, { id: Date.now(), name: inputValue }]);
      setInputValue("");
    }
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      const updated = [...categories];
      updated.splice(deleteIndex, 1);
      setCategories(updated);
      setDeleteIndex(null);
    }
  };

  const handleEdit = () => {
    if (editIndex !== null && editValue.trim()) {
      const updated = [...categories];
      updated[editIndex].name = editValue;
      setCategories(updated);
      setEditIndex(null);
      setEditValue("");
    }
  };

 
  
  return (
    <div className="mt-10 ml-20 mr-55 min-h-screen p-6 text-white flex flex-col items-center font-sans relative">
      {/* Icon and Title */}
      <div className="w-60 h-40 border-2 border-[#222531] rounded-md flex flex-col items-center justify-center mb-8">
        <img
          src="https://res.cloudinary.com/dgfv6j82t/image/upload/v1737958058/mdi-light_gender-transgender_fhz8kb.svg"
          alt="Gender Icon"
          className="w-10 h-10 mb-2"
        />
        <p className="text-sm font-semibold">Category</p>
      </div>

      {/* Input Field */}
      <div className="flex items-center mb-6 w-full max-w-md border-2 border-[#222531] rounded-md">
        <input
          type="text"
          placeholder="Enter Your Category"
          className="bg-transparent w-full px-4 py-2 outline-none text-white"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className="px-4 text-white font-bold text-xl"
          onClick={handleAdd}
        >
          +
        </button>
      </div>

      {/* Table */}
      <div className="w-full max-w-md">
        <div className="grid grid-cols-3 bg-[#1F1F22] rounded-md px-4 py-3 mb-2 font-semibold text-sm">
          <div>S. No</div>
          <div>Category</div>
          <div className="text-right">Actions</div>
        </div>
        {categories.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-3 items-center bg-[#1F1F22] mt-2 p-3 rounded-md text-sm"
          >
            <div>{index + 1}.</div>
            <div>{item.name}</div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => {
                setEditIndex(index);
                setEditValue(item.name);
              }}>
                <FontAwesomeIcon icon={faEdit} className="text-white" />
              </button>
              <button onClick={() => setDeleteIndex(index)}>
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
      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#222531] p-6 rounded-lg w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete?</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setDeleteIndex(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#222531] p-6 rounded-lg w-96 text-center">
            <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 mb-4 rounded bg-[#17171A] text-white border border-gray-600"
            />
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditIndex(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
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
