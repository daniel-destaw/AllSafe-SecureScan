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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Resource Management</h2>
        <button 
          onClick={openModal} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Enroll New Resource
        </button>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hostname
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.length > 0 ? (
                resources.map((res, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {res.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {res.hostname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(res.ip_address)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500 text-center" colSpan={3}>
                    No resources found. Enroll a new resource to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Resource</h3>
              <button 
                onClick={closeModal} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {errorMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded">
                  {successMessage}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address
                  </label>
                  <input
                    id="ipAddress"
                    name="ipAddress"
                    value={formData.ipAddress}
                    onChange={handleChange}
                    placeholder="192.168.1.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="admin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}