import { useState } from "react";
import Users from "@/pages/users/users.jsx";
import Resource from "@/pages/resource/resource.jsx";
import Plugins_handler from "@/pages/plugins/plugins_handler.jsx";

const Management = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

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
    <div className="flex">
      {/* Left Navigation Menu */}
      <div className="w-1/4 bg-white text-grey py-6 px-4 border-r border-gray-200">
        <h2 className="text-xl font-normal mb-4">Management</h2>
        <ul className="space-y-6">
          <li className="border-b border-gray-200 pb-4">
            <h3 className="font-light text-lg">Access Management</h3>
            <ul className="pl-4 space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection("users")}
                  className="text-black font-thin hover:text-blue-400"
                >
                  Users
                </button>
              </li>
            </ul>
          </li>

          <li className="border-b border-gray-200 pb-4">
            <h3 className="font-light text-lg">Resource Management</h3>
            <ul className="pl-4 space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection("resource")}
                  className="text-black font-thin hover:text-blue-400"
                >
                  Enroll New Resource
                </button>
              </li>
            </ul>
          </li>

          <li className="border-b border-gray-200 pb-4">
            <h3 className="font-light text-lg">Custom Plugins</h3>
            <ul className="pl-4 space-y-2">
              <li>
                <button
                  onClick={() => setActiveSection("Plugins_handler")}
                  className="text-black font-thin hover:text-blue-400"
                >
                  Enroll New Plugins
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      {/* Main Content Area with Grey Background */}
      <div className="w-3/4 p-6 bg-gray-100">{renderContent()}</div>
    </div>
  );
};

export default Management;
