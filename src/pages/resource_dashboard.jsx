import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import axios from "axios";

const Resource_dashboard = () => {
  const [resources, setResources] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scripts, setScripts] = useState([]);  // State to store scripts list

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Fetch resources from the backend
  const fetchResources = async () => {
    try {
      const res = await axios.get("/api/resources/list/");
      const dataWithCompliance = res.data.map((res, index) => ({
        ...res,
        compliance: 80 + (index % 3) * 5, // Example compliance placeholder
      }));
      setResources(dataWithCompliance);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  // Fetch scripts from the backend (allscripts folder)
  const fetchPlugins = async () => {
    try {
      const res = await axios.get("/api/plugins/");
      setScripts(res.data); // Store the list of scripts
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* Title Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light">Resource</h1>
        <button className="bg-blue-600 text-white font-thin px-6 py-2 rounded-full">
          Enroll New Resource
        </button>
      </div>

      {/* Search Bar Section */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search Resources"
          className="w-full px-4 py-2 border border-gray-300 bg-gray-200 rounded-md focus:outline-none focus:ring-0"
        />
      </div>

      {/* Navigation Bar Section */}
      <div className="mb-8">
        <ul className="flex gap-8">
          <li>
            <Link
              href="/resource/all"
              className="text-lg font-medium text-blue-600 hover:text-blue-600 underline"
            >
              All Resources
            </Link>
          </li>
          <li>
            <Link
              href="/resource/linux"
              className="text-lg font-thin text-black-700 hover:text-blue-400"
            >
              Linux
            </Link>
          </li>
          <li>
            <Link
              href="/resource/db"
              className="text-lg font-thin text-gray-700 hover:text-blue-600"
            >
              Network
            </Link>
          </li>
        </ul>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {resources.map((res, index) => (
          <div
            key={index}
            className="border-2 border-gray-300 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white transition-colors"
          >
            {/* Resource Info */}
            <div className="flex items-center gap-4">
              <img
                src="/static/logo/linux.png"
                alt="Linux Logo"
                className="w-10 h-10 object-contain"
              />
              <div className="flex flex-col">
                <div className="font-medium text-xl mb-2">{res.hostname}</div>
                <div className="text-gray-600 mb-2">IP: {res.ip_address}</div>
                <div className="text-blue-500">Server Healty and Security: {res.compliance}%</div>
              </div>
            </div>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  toggleDropdown(index);
                  if (openDropdown !== index) fetchPlugins(); // Fetch scripts if the dropdown opens
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg focus:outline-none"
              >
                Action
              </button>

              {openDropdown === index && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <ul className="py-2">
                    {scripts.length > 0 ? (
                      scripts.map((script, idx) => (
                        <li key={idx} className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                          {script.name}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-700">No scripts available</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resource_dashboard;
