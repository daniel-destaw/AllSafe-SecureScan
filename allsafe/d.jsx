import { useEffect, useState } from "react";
import axios from "axios";
import { EventSourcePolyfill } from 'event-source-polyfill';

const Resource_dashboard = () => {
  const [resources, setResources] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [maximizedIndex, setMaximizedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeExecution, setActiveExecution] = useState(null);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [executionProgress, setExecutionProgress] = useState(0);
  
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
      setActiveExecution({
        script,
        resource,
        status: 'running'
      });
      setExecutionLogs([`Starting execution of ${script.name} on ${resource.hostname}...`]);
      setExecutionProgress(0);

      // Create a new EventSource connection
      const eventSource = new EventSourcePolyfill(`/api/plugin_result/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({
          script_name: script.name,
          resource_ip: resource.ip_address,
        }),
      });

      let screens = [];
      let currentScreenIndex = null;
      let currentScreenCommands = [];

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch(data.type) {
          case 'status':
            setExecutionLogs(prev => [...prev, data.message]);
            break;
            
          case 'error':
            setExecutionLogs(prev => [...prev, `ERROR: ${data.message}`]);
            setActiveExecution(prev => ({ ...prev, status: 'error' }));
            eventSource.close();
            break;
            
          case 'command_start':
            currentScreenIndex = data.screen_index;
            currentScreenCommands = data.commands;
            setExecutionLogs(prev => [
              ...prev, 
              `\n=== Executing commands for screen ${currentScreenIndex + 1} ===`,
              ...data.commands.map(cmd => `$ ${cmd}`)
            ]);
            break;
            
          case 'output':
            if (currentScreenIndex !== null) {
              setExecutionLogs(prev => [...prev, data.data]);
            }
            break;
            
          case 'error_output':
            if (currentScreenIndex !== null) {
              setExecutionLogs(prev => [...prev, `ERROR: ${data.data}`]);
            }
            break;
            
          case 'complete':
            screens = data.screens;
            setExecutionLogs(prev => [...prev, "\nExecution completed successfully!"]);
            setExecutionProgress(100);
            setActiveExecution(null);
            
            // Create a new tab with the results
            const newTab = {
              id: `${resource.ip_address}-${script.name}-${Date.now()}`,
              label: `${script.name} (${resource.hostname})`,
              plugin: script,
              resource: resource,
              results: screens,
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
            eventSource.close();
            break;
        }
      };

      eventSource.onerror = (err) => {
        console.error("EventSource failed:", err);
        setExecutionLogs(prev => [...prev, "Connection failed"]);
        setActiveExecution(prev => ({ ...prev, status: 'error' }));
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error("Failed to get scan results:", error);
      setExecutionLogs(prev => [...prev, `ERROR: ${error.message}`]);
      setActiveExecution(prev => ({ ...prev, status: 'error' }));
      return null;
    }
  };

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // ... [rest of the component methods remain the same until the return statement] ...

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Execution Log Modal - shown when a plugin is running */}
      {activeExecution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Executing {activeExecution.script.name} on {activeExecution.resource.hostname}
              </h3>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-4">
                  <div 
                    className="h-2.5 rounded-full bg-blue-600" 
                    style={{ width: `${executionProgress}%` }}
                  ></div>
                </div>
                <button 
                  onClick={() => setActiveExecution(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-black text-green-400 font-mono text-sm">
              {executionLogs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">{log}</div>
              ))}
              {activeExecution.status === 'running' && (
                <div className="animate-pulse">...</div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              {activeExecution.status === 'error' && (
                <button 
                  onClick={() => setActiveExecution(null)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rest of your existing JSX remains the same */}
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

        {/* Rest of your existing JSX remains exactly the same */}
        {/* ... */}
      </div>
    </div>
  );
};

export default Resource_dashboard;