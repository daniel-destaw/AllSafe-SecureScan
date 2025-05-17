import { useEffect, useState } from "react";
import axios from "axios";

const Resource_dashboard = () => {
  const [resources, setResources] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [maximized, setMaximized] = useState(null);

  const toggleMaximize = (box) => {
    setMaximized(maximized === box ? null : box);
  };
  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
    if (openDropdown !== index) fetchPlugins();
  };

  // Fetch resources from the backend
  const fetchResources = async () => {
    try {
      const res = await axios.get("/api/resources/list/");
      const dataWithCompliance = res.data.map((res, index) => ({
        ...res,
        compliance: 80 + (index % 3) * 5,
      }));
      setResources(dataWithCompliance);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  // Fetch scripts from the backend
  const fetchPlugins = async () => {
    try {
      const res = await axios.get("/api/plugins/");
      setScripts(res.data);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  // Handle Plugin Selection
  const handlePluginSelect = (script, resource) => {
    setSelectedPlugin(script);
    setSelectedResource(resource);
    setSelectedTab("scan");
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
            <button
              className={`text-lg font-medium ${selectedTab === "all" ? "text-blue-600 underline" : "text-black-700"}`}
              onClick={() => setSelectedTab("all")}
            >
              All Resources
            </button>
          </li>
          <li>
            <button
              className={`text-lg font-medium ${selectedTab === "scan" ? "text-blue-600 underline" : "text-black-700"}`}
              onClick={() => setSelectedTab("scan")}
            >
              Scan Result
            </button>
          </li>
        </ul>
      </div>

      {/* Conditional Rendering */}
      {selectedTab === "all" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {resources.map((res, index) => (
            <div
              key={index}
              className="border-2 border-gray-300 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-4">
                <img
                  src="/static/logo/linux.png"
                  alt="Linux Logo"
                  className="w-10 h-10 object-contain"
                />
                <div className="flex flex-col">
                  <div className="font-medium text-xl mb-2">{res.hostname}</div>
                  <div className="text-gray-600 mb-2">IP: {res.ip_address}</div>
                  <div className="text-blue-500">Server Health and Security: {res.compliance}%</div>
                </div>
              </div>

              {/* Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown(index)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg focus:outline-none"
                >
                  Action
                </button>

                {openDropdown === index && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <ul className="py-2">
                      {scripts.length > 0 ? (
                        scripts.map((script, idx) => (
                          <li 
                            key={idx} 
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handlePluginSelect(script, res)}
                          >
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
      ) : (
        <div className="text-xl text-gray-800">
          {selectedPlugin && selectedResource ? (
             <><h1 className="text-sm font-light pb-2">
                Scanning Resource: <strong>{selectedResource.hostname}</strong> with Plugin: <strong>{selectedPlugin.name}</strong>

              </h1><div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Directory List Box */}
                    {(maximized === null || maximized === "directory") && (
                      <div className={`${maximized === "directory" ? "col-span-2 h-1/1" : "h-40"} bg-white p-4 shadow-md relative flex flex-col`}>
                        <div className="flex justify-between items-center mb-2 border-b-4 pb-2 border-gray-100">
                          <h2 className="font-semibold">Command Execution</h2>
                          <button
                            className="text-sm text-grey-600"
                            onClick={() => toggleMaximize("directory")}
                          >
                            {maximized === "directory" ? "Minimize" : "Maximize"}
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[400px] border border-gray-200 rounded p-2">
                          <h1 className="text-sm font-light whitespace-pre-wrap break-words"> 
                            ...
                          </h1>
                        </div>
                      </div>
                    )}
                    {/* Directory List Box */}
                    {(maximized === null || maximized === "directory") && (
                      <div className={`${maximized === "directory" ? "col-span-2 h-1/1" : "h-40"} bg-white p-4 shadow-md relative flex flex-col`}>
                        <div className="flex justify-between items-center mb-2 border-b-4 pb-2 border-gray-100">
                          <h2 className="font-thin text-blue-600">Report <strong>{selectedResource.ip_address}</strong></h2>
                          <button
                            className="text-sm text-grey-600"
                            onClick={() => toggleMaximize("directory")}
                          >
                            {maximized === "directory" ? "Minimize" : "Maximize"}
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[400px] rounded p-2">
                       <table className="min-w-full bg-white border">
                        <thead>
                          <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">IP Address</th>
                            <th className="py-3 px-6 text-left">Port</th>
                            <th className="py-3 px-6 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                          {resources.map((resource, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200 hover:bg-gray-100"
                            >
                              <td className="py-3 px-6">{resource.ip_address}</td>
                              <td className="py-3 px-6">{resource.port}</td>
                              <td
                                className={`py-3 px-6 font-semibold ${
                                  resource.status === "Online"
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {resource.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                        </div>
                      </div>
                    )}
                     {/* Directory List Box */}
                    {(maximized === null || maximized === "directory") && (
                      <div className={`${maximized === "directory" ? "col-span-2 h-1/1" : "h-40"} bg-white p-4 shadow-md relative flex flex-col`}>
                        <div className="flex justify-between items-center mb-2 border-b-4 pb-2 border-gray-100">
                          <h2 className="font-light text-blue-600">Summary</h2>
                          <button
                            className="text-sm text-grey-600"
                            onClick={() => toggleMaximize("directory")}
                          >
                            {maximized === "directory" ? "Minimize" : "Maximize"}
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[400px] border border-gray-200 rounded p-2">
                          <h1 className="text-sm font-light whitespace-pre-wrap break-words"> 
                            ...
                          </h1>
                        </div>
                      </div>
                    )}

                    {/* Directory List Box */}
                    {(maximized === null || maximized === "directory") && (
                      <div className={`${maximized === "directory" ? "col-span-2 h-1/1" : "h-40"} bg-white p-4 shadow-md relative flex flex-col`}>
                        <div className="flex justify-between items-center mb-2 border-b-4 pb-2 border-gray-100">
                          <h2 className="text-base font-bold ">Details about <strong className="text-lg font-light text-blue-600">{selectedResource.ip_address}</strong></h2>
                          <button
                            className="text-sm text-grey-600"
                            onClick={() => toggleMaximize("directory")}
                          >
                            {maximized === "directory" ? "Minimize" : "Maximize"}
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[400px] rounded p-2">
                          <h1 className="text-sm font-light whitespace-pre-wrap break-words"> 
                            ...
                          </h1>
                        </div>
                      </div>
                    )}
                  </div>
                </div></>
          ) : (
            <p>You have to choose a Plugin from the dropdown of each resource first.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Resource_dashboard;
