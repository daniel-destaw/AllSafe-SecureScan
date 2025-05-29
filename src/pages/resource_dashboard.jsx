import { useEffect, useState } from "react";
import axios from "axios";

const Resource_dashboard = () => {
  const [resources, setResources] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [maximizedIndex, setMaximizedIndex] = useState(null);
  const [scanResults, setScanResults] = useState(null);

  const handleMaximize = (index) => {
    setMaximizedIndex(maximizedIndex === index ? null : index);
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
    if (openDropdown !== index) fetchPlugins();
  };

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

  const fetchPlugins = async () => {
    try {
      const res = await axios.get("/api/plugins/");
      setScripts(res.data);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  const handlePluginSelect = async (script, resource) => {
    setSelectedPlugin(script);
    setSelectedResource(resource);
    setSelectedTab("scan");

    try {
      const res = await axios.post("/api/plugin_result/", {
        script_name: script.name,
        resource_ip: resource.ip_address,
      });

      setScanResults(res.data.scan_results);
      console.log("Scan results received:", res.data.scan_results);
    } catch (error) {
      console.error("Failed to get scan results:", error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light">Resource</h1>
        <button className="bg-blue-600 text-white font-thin px-6 py-2 rounded-full">
          Enroll New Resource
        </button>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search Resources"
          className="w-full px-4 py-2 border border-gray-300 bg-gray-200 rounded-md focus:outline-none focus:ring-0"
        />
      </div>

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
        <div>
          <h2 className="text-2xl font-light mb-4">Scan Results</h2>
          {scanResults ? (
            <div
              className={`grid ${maximizedIndex === null ? "grid-cols-1 md:grid-cols-3 gap-4" : "grid-cols-1"} transition-all duration-300`}
            >
              {scanResults.map((screen, index) => (
                <div
                  key={index}
                  className={`relative bg-white p-4 rounded-lg shadow-lg border transition-all duration-300 ${
                    maximizedIndex === null || maximizedIndex === index ? "block" : "hidden"
                  } ${maximizedIndex === index ? "w-full" : ""}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-medium">{screen.screen_name}</h3>
                    <button
                      onClick={() => handleMaximize(index)}
                      className="text-sm text-blue-500 underline"
                    >
                      {maximizedIndex === index ? "Minimize" : "Maximize"}
                    </button>
                  </div>

                  <div
                    className={`${
                      maximizedIndex === null ? "max-h-48 overflow-y-auto" : "max-h-full overflow-y-visible"
                    }`}
                  >
                    {screen.is_table ? (
                      <table className="min-w-full text-sm text-left text-gray-500 mt-2 border">
                        <thead className="bg-gray-200 sticky top-0">
                          <tr>
                            {screen.content[0].map((col, idx) => (
                              <th key={idx} className="px-4 py-2">{col.replace(/"/g, "")}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {screen.content.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className="bg-white border-b">
                              {typeof row === "string" ? (
                                row.split(/\s+/).map((cell, cellIndex) => (
                                  <td key={cellIndex} className="px-4 py-2">{cell}</td>
                                ))
                              ) : (
                                row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="px-4 py-2">{cell.replace(/"/g, "")}</td>
                                ))
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <pre className="mt-2 whitespace-pre-wrap">{screen.content.join("\n")}</pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Loading scan results...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Resource_dashboard;
