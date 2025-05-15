import { useEffect, useState } from "react";
import axios from "axios";

export default function Resource() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ipAddress: "", username: "", password: "" });
  const [resources, setResources] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    setFormData({ ipAddress: "", username: "", password: "" });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ ipAddress: "", username: "", password: "" });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/resources/list/");
      setResources(res.data);
    } catch (error) {
      console.error("Error fetching resources", error);
      setErrorMessage("Error fetching resources. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await axios.post("/api/resources/", formData);
      if (res.data.message === "Resource saved successfully") {
        setSuccessMessage(res.data.message);
        fetchResources();
        closeModal();
      } else {
        setErrorMessage(res.data.message || "An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error saving resource", error);
      if (error.response) {
        setErrorMessage(error.response.data.message || "An error occurred while saving the resource.");
      } else {
        setErrorMessage("An error occurred while saving the resource.");
      }
    }
  };

  const handleDelete = async (ipAddress) => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await axios.post("/api/resources/delete/", { ip_address: ipAddress });
      if (res.data.message === "Resource deleted successfully") {
        setSuccessMessage(res.data.message);
        fetchResources();
      } else {
        setErrorMessage(res.data.message || "Failed to delete resource.");
      }
    } catch (error) {
      console.error("Error deleting resource", error);
      if (error.response) {
        setErrorMessage(error.response.data.message || "An error occurred while deleting the resource.");
      } else {
        setErrorMessage("An error occurred while deleting the resource.");
      }
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Resources</h2>
        <button onClick={openModal} className="bg-blue-500 text-white px-4 py-2 rounded">
          Enroll New Resource
        </button>
      </div>

      {errorMessage && <div className="bg-red-500 text-white p-3 rounded mb-4">{errorMessage}</div>}
      {successMessage && <div className="bg-green-500 text-white p-3 rounded mb-4">{successMessage}</div>}

      {loading ? (
        <p className="text-gray-500">Loading resources...</p>
      ) : (
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">IP Address</th>
              <th className="p-2 text-left">Hostname</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.length > 0 ? (
              resources.map((res, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{res.ip_address}</td>
                  <td className="p-2">{res.hostname}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(res.ip_address)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2 text-gray-500" colSpan={3}>No resources found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded w-96">
            <h3 className="text-lg font-bold mb-4">Add New Resource</h3>

            {errorMessage && <div className="bg-red-500 text-white p-3 rounded mb-4">{errorMessage}</div>}
            {successMessage && <div className="bg-green-500 text-white p-3 rounded mb-4">{successMessage}</div>}

            <input
              name="ipAddress"
              value={formData.ipAddress}
              onChange={handleChange}
              placeholder="IP Address"
              className="w-full border p-2 mb-2"
            />
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full border p-2 mb-2"
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full border p-2 mb-4"
            />

            <div className="flex justify-between">
              <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
                Save
              </button>
              <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
