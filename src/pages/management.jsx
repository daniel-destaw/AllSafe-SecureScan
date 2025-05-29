import { useState } from "react";
import Users from "@/pages/users/users.jsx";
import Resource from "@/pages/resource/resource.jsx";
import Plugins_handler from "@/pages/plugins/plugins_handler.jsx";

const Management = () => {
  const [activeSection, setActiveSection] = useState("users");
  const [activeGroup, setActiveGroup] = useState("access"); // Track active group for mobile

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <Users />;
      case "resource":
        return <Resource />;
      case "Plugins_handler":
        return <Plugins_handler />;
      default:
        return <Users />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Mobile Menu Button - Hidden on desktop */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveGroup("access")}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${activeGroup === "access" ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Access Management
          </button>
          <button
            onClick={() => setActiveGroup("resource")}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${activeGroup === "resource" ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Resource Management
          </button>
          <button
            onClick={() => setActiveGroup("plugins")}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${activeGroup === "plugins" ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Custom Plugins
          </button>
        </div>
      </div>

      {/* Left Navigation Menu */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 py-6 px-4">
        <div className="flex items-center mb-8 pl-2">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800">Management</h2>
        </div>
        
        {/* Access Management */}
        <div className="mb-6">
          <h3 className="flex items-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Access Management
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveSection("users")}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${activeSection === "users" ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Users
              </button>
            </li>
          </ul>
        </div>

        {/* Resource Management */}
        <div className="mb-6">
          <h3 className="flex items-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            Resource Management
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveSection("resource")}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${activeSection === "resource" ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enroll New Resource
              </button>
            </li>
          </ul>
        </div>

        {/* Custom Plugins */}
        <div className="mb-6">
          <h3 className="flex items-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Custom Plugins
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveSection("Plugins_handler")}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${activeSection === "Plugins_handler" ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Enroll New Plugins
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Management;