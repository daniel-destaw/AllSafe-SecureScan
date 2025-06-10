import { useEffect, useState } from "react";
import axios from "axios";

const Resource_dashboard = () => {
  const [resources, setResources] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [maximizedIndex, setMaximizedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tab management state
  const [scanTabs, setScanTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  
  // Refresh intervals
  const refreshOptions = [
    { label: "No refresh", value: 0 },
    { label: "30 seconds", value: 30 },
    { label: "1 minute", value: 60 },
    { label: "5 minutes", value: 300 },
    { label: "10 minutes", value: 600 },
  ];

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

  const fetchPluginResults = async (script, resource) => {
    try {
      const res = await axios.post("/api/plugin_result/", {
        script_name: script.name,
        resource_ip: resource.ip_address,
      });
      return res.data;
    } catch (error) {
      console.error("Failed to get scan results:", error);
      return null;
    }
  };

  const handlePluginSelect = async (script, resource) => {
    const results = await fetchPluginResults(script, resource);
    if (!results) return;

    const newTab = {
      id: `${resource.ip_address}-${script.name}-${Date.now()}`,
      label: `${script.name} (${resource.hostname})`,
      plugin: script,
      resource: resource,
      results: results.scan_results,
      logs: results.logs || [], // Store the execution logs
      pinned: false,
      refreshInterval: 0,
      lastRefreshed: new Date().toISOString()
    };

    setScanTabs(prevTabs => {
      const existingTabIndex = prevTabs.findIndex(tab => 
        tab.resource.ip_address === resource.ip_address && 
        tab.plugin.name === script.name
      );
      
      if (existingTabIndex >= 0) {
        const updatedTabs = [...prevTabs];
        updatedTabs[existingTabIndex] = newTab;
        return updatedTabs;
      } else {
        return [...prevTabs, newTab];
      }
    });

    setActiveTab(newTab.id);
    setSelectedTab("scan");
  };

  const togglePinTab = (tabId, e) => {
    e?.stopPropagation();
    setScanTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId ? { ...tab, pinned: !tab.pinned } : tab
      )
    );
  };

  const setRefreshInterval = (tabId, interval) => {
    setScanTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId ? { 
          ...tab, 
          refreshInterval: interval,
          lastRefreshed: new Date().toISOString()
        } : tab
      )
    );
  };

  const refreshTab = async (tabId) => {
    const tabIndex = scanTabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;

    const tab = scanTabs[tabIndex];
    const results = await fetchPluginResults(tab.plugin, tab.resource);
    if (!results) return;

    setScanTabs(prevTabs =>
      prevTabs.map(t =>
        t.id === tabId ? { 
          ...t, 
          results: results.scan_results,
          logs: results.logs || [],
          lastRefreshed: new Date().toISOString()
        } : t
      )
    );
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    setScanTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      if (tabId === activeTab) {
        if (newTabs.length > 0) {
          setActiveTab(newTabs[newTabs.length - 1].id);
        } else {
          setActiveTab(null);
        }
      }
      
      return newTabs;
    });
  };

  const closeAllTabs = () => {
    setScanTabs(prevTabs => {
      const pinnedTabs = prevTabs.filter(tab => tab.pinned);
      if (pinnedTabs.length === 0) {
        setActiveTab(null);
        setSelectedTab("all");
      } else if (!pinnedTabs.some(tab => tab.id === activeTab)) {
        setActiveTab(pinnedTabs[pinnedTabs.length - 1].id);
      }
      return pinnedTabs;
    });
  };

  const filteredResources = resources.filter(resource =>
    resource.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.ip_address.includes(searchQuery)
  );

  // Set up interval for refreshing tabs
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      scanTabs.forEach(tab => {
        if (tab.pinned && tab.refreshInterval > 0) {
          const lastRefreshed = new Date(tab.lastRefreshed);
          const secondsSinceLastRefresh = (now - lastRefreshed) / 1000;
          if (secondsSinceLastRefresh >= tab.refreshInterval) {
            refreshTab(tab.id);
          }
        }
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [scanTabs]);

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Resource Dashboard</h1>
            <p className="text-gray-500">Manage and monitor your infrastructure resources</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm transition-colors">
            Enroll New Resource
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search resources by hostname or IP..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <button
              className={`pb-4 px-1 font-medium text-sm ${selectedTab === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setSelectedTab("all")}
            >
              All Resources
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {resources.length}
              </span>
            </button>
            
            {scanTabs.map(tab => (
              <div key={tab.id} className="relative group">
                <button
                  className={`pb-4 px-1 font-medium text-sm flex items-center ${selectedTab === "scan" && activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"} ${tab.pinned ? "pl-6" : ""}`}
                  onClick={() => {
                    setSelectedTab("scan");
                    setActiveTab(tab.id);
                  }}
                >
                  {tab.pinned && (
                    <svg 
                      className="w-4 h-4 mr-1 text-yellow-500 absolute left-0" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                  )}
                  {tab.label}
                  <button 
                    onClick={(e) => closeTab(tab.id, e)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    disabled={tab.pinned}
                  >
                    ×
                  </button>
                </button>
                <div className="absolute -top-1 -right-1 flex">
                  {tab.pinned && (
                    <div className="relative group/refresh">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          refreshTab(tab.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 z-10"
                        title={`Last refreshed: ${new Date(tab.lastRefreshed).toLocaleTimeString()}`}
                      >
                        <svg 
                          className={`w-3 h-3 ${tab.refreshInterval > 0 ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg z-20 hidden group-hover/refresh:block">
                        <div className="py-1 px-3 text-xs text-gray-500">
                          Refresh every:
                        </div>
                        {refreshOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`block w-full text-left px-4 py-2 text-sm ${tab.refreshInterval === option.value ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRefreshInterval(tab.id, option.value);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={(e) => togglePinTab(tab.id, e)}
                    className="p-1 text-gray-400 hover:text-yellow-500 z-10"
                    title={tab.pinned ? "Unpin tab" : "Pin tab"}
                  >
                    <svg 
                      className={`w-3 h-3 ${tab.pinned ? "text-yellow-500 fill-current" : "text-gray-400 hover:text-yellow-500"}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {scanTabs.length > 0 && (
              <button
                onClick={closeAllTabs}
                className="ml-auto text-xs text-gray-500 hover:text-gray-700 flex items-center"
              >
                Close All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {selectedTab === "all" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((res, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <img
                      src="/static/logo/linux.png"
                      alt="Linux Logo"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{res.hostname}</h3>
                    <p className="text-gray-500 text-sm mb-1">IP: {res.ip_address}</p>
                    <div className="flex items-center mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${res.compliance > 85 ? 'bg-green-500' : res.compliance > 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${res.compliance}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-700">
                        {res.compliance}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(index)}
                    className="w-full flex justify-between items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none"
                  >
                    <span>Run Action</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {openDropdown === index && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <ul className="py-1 text-sm text-gray-700">
                        {scripts.length > 0 ? (
                          scripts.map((script, idx) => (
                            <li
                              key={idx}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                              onClick={() => handlePluginSelect(script, res)}
                            >
                              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              {script.name}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-2 text-gray-500">No scripts available</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {activeTab && scanTabs.length > 0 ? (
              <>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {scanTabs.find(tab => tab.id === activeTab)?.label}
                      {scanTabs.find(tab => tab.id === activeTab)?.pinned && (
                        <>
                          <svg 
                            className="w-4 h-4 ml-2 text-yellow-500" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                            title="Pinned tab"
                          >
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                          {scanTabs.find(tab => tab.id === activeTab)?.refreshInterval > 0 && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Auto-refresh: {refreshOptions.find(opt => opt.value === scanTabs.find(tab => tab.id === activeTab)?.refreshInterval)?.label.replace("No refresh", "Off")}
                            </span>
                          )}
                        </>
                      )}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      IP: {scanTabs.find(tab => tab.id === activeTab)?.resource.ip_address} | 
                      Plugin: {scanTabs.find(tab => tab.id === activeTab)?.plugin.name} | 
                      Last refreshed: {new Date(scanTabs.find(tab => tab.id === activeTab)?.lastRefreshed).toLocaleTimeString()}
                    </p>
                  </div>
                  {scanTabs.find(tab => tab.id === activeTab)?.pinned && (
                    <button
                      onClick={() => refreshTab(activeTab)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <svg 
                        className="w-4 h-4 mr-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Now
                    </button>
                  )}
                </div>

                <div className="p-6">

                 {/* Results Section - Now Includes Logs as One of the Screens */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
                    {/* Add Execution Logs as First Screen Card */}
                    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${maximizedIndex === 'logs' ? "fixed inset-0 z-50 overflow-auto p-6 bg-white" : ""}`}>
                      <div className={`${maximizedIndex === 'logs' ? "max-w-7xl mx-auto" : ""}`}>
                        <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Execution Logs
                          </h3>
                          <button
                            onClick={() => handleMaximize('logs')}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            {maximizedIndex === 'logs' ? (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Close
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                                Expand
                              </>
                            )}
                          </button>
                        </div>
                        <div className={`${maximizedIndex === 'logs' ? "p-4" : "max-h-64 overflow-y-auto p-4"}`}>
                          <div className="font-mono text-sm bg-black text-gray-200 rounded p-4 overflow-x-auto">
                            {scanTabs.find(tab => tab.id === activeTab)?.logs.length > 0 ? (
                              scanTabs.find(tab => tab.id === activeTab)?.logs.map((log, index) => (
                                <div key={index} className="mb-1">
                                  <span className="text-green-400">$ </span>
                                  <span className="text-gray-300">{log}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-400">No execution logs available</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* All Other Plugin Result Screens */}
                    {scanTabs.find(tab => tab.id === activeTab)?.results.map((screen, index) => (
                      <div
                        key={index}
                        className={`bg-white border border-gray-200 rounded-lg shadow-sm ${
                          maximizedIndex === index ? "fixed inset-0 z-50 overflow-auto p-6 bg-white" : ""
                        }`}
                      >
                        <div className={`${maximizedIndex === index ? "max-w-7xl mx-auto" : ""}`}>
                          <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {screen.screen_name}
                            </h3>
                            <button
                              onClick={() => handleMaximize(index)}
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              {maximizedIndex === index ? (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Close
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                  </svg>
                                  Expand
                                </>
                              )}
                            </button>
                          </div>
                          <div className={`${maximizedIndex === null ? "max-h-64 overflow-y-auto p-4" : "p-4"}`}>
                            {screen.is_table ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      {screen.content[0].map((col, idx) => (
                                        <th
                                          key={idx}
                                          scope="col"
                                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          {col.replace(/"/g, "")}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {screen.content.slice(1).map((row, rowIndex) => (
                                      <tr key={rowIndex}>
                                        {typeof row === "string" ? (
                                          row.split(/\s+/).map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {cell}
                                            </td>
                                          ))
                                        ) : (
                                          row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {cell.replace(/"/g, "")}
                                            </td>
                                          ))
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap overflow-x-auto">
                                  {screen.content.join("\n")}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Scan Results</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Select a resource and run a plugin to view scan results here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resource_dashboard;