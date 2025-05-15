// src/pages/contact.jsx
import { useState } from "react";

export default function Users() {
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    role: "Admin", // Default to "Admin"
  });

  // Handle opening and closing of the modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSave = () => {
    console.log("New User Data:", formData);
    // Logic to save the new user data goes here
    closeModal(); // Close the modal after saving
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-100 p-6">
      {/* Title */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-semibold text-gray-600">Users</span>
        <button
          onClick={openModal}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400"
        >
          Add New User
        </button>
      </div>

      {/* Horizontal Line to Separate */}
      <hr className="border-t border-gray-300 mb-4" />

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Users"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Sample Row */}
            <tr className="border-b">
              <td className="px-6 py-4">John Doe</td>
              <td className="px-6 py-4">Admin</td>
              <td className="px-6 py-4">
                <span className="text-blue-500">Local</span>
              </td>
              <td className="px-6 py-4">
                <select className="bg-white border border-gray-300 rounded-md px-2 py-1">
                  <option value="edit">Edit</option>
                  <option value="delete">Delete</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal for Adding New User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-normal mb-4">New User</h2>

            {/* Form Inputs */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter Username"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-gray-600">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Admin">Admin</option>
                <option value="Local">Local</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-900"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
