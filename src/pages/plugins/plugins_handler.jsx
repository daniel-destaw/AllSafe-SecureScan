import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Prism from "prismjs";

// Import Prism.js languages
import "prismjs/components/prism-bash.min.js";
import "prismjs/themes/prism.css";

const Plugins_handler = () => {
  const [pluginData, setPluginData] = useState([]);
  const [scriptName, setScriptName] = useState("");
  const [roleConfig, setRoleConfig] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchPluginScripts = async () => {
      try {
        const response = await axios.get("/api/plugins/");
        setPluginData(response.data);
      } catch (error) {
        setErrorMessage("Failed to load scripts.");
      }
    };
    fetchPluginScripts();
  }, []);

  const highlightCode = () => {
    if (editorRef.current) {
      const code = editorRef.current.innerText;
      const highlightedCode = Prism.highlight(code, Prism.languages.bash, "bash");
      editorRef.current.innerHTML = `<code class="language-bash">${highlightedCode}</code>`;
    }
  };

  const openModal = (plugin = null) => {
    setSelectedPlugin(plugin);
    if (plugin) {
      setScriptName(plugin.name);
      setRoleConfig(plugin.roleConfig);
    } else {
      setScriptName("");
      setRoleConfig("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSuccessMessage("");
    setErrorMessage("");
    setSelectedPlugin(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setScriptName(value);
    }
  };

  const handleEditorInput = () => {
    setRoleConfig(editorRef.current.innerText);
    highlightCode();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    if (!scriptName || !roleConfig) {
      setErrorMessage("Both name and script content are required.");
      setLoading(false);
      return;
    }

    const newPlugin = {
      name: scriptName,
      roleConfig: roleConfig,
    };

    try {
      if (selectedPlugin) {
        const response = await axios.put(`/api/plugins/${selectedPlugin.id}`, newPlugin);
        setSuccessMessage(response.data.message);
        setPluginData(
          pluginData.map((plugin) =>
            plugin.id === selectedPlugin.id ? { ...plugin, ...newPlugin } : plugin
          )
        );
      } else {
        const response = await axios.post("/api/plugins/", newPlugin);
        setSuccessMessage(response.data.message);
        setPluginData([...pluginData, { ...newPlugin, id: response.data.id }]);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "An error occurred while saving the script.");
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/plugins/${id}`);
      setPluginData(pluginData.filter((plugin) => plugin.id !== id));
      setSuccessMessage("Plugin script deleted successfully.");
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Failed to delete the script.");
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-semibold text-gray-600">Plugins</span>
        <button
          onClick={() => openModal()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400"
        >
          Add New Plugin
        </button>
      </div>

      <hr className="border-t border-gray-300 mb-4" />

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pluginData.length > 0 ? (
              pluginData.map((plugin) => (
                <tr key={plugin.id} className="border-b">
                  <td className="px-6 py-4">
                    <div className="font-medium">{plugin.name}</div>
                    <pre className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                      {plugin.snippet}
                    </pre>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openModal(plugin)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-400 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plugin.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                  No plugin scripts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 md:w-2/3 h-[80vh] flex flex-col">
            <h2 className="text-2xl font-normal mb-4">{selectedPlugin ? "Edit Plugin" : "New Plugin"}</h2>

            {successMessage && (
              <div className="mb-4 text-green-700 bg-green-100 p-2 rounded-md">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 text-red-700 bg-red-100 p-2 rounded-md">
                {errorMessage}
              </div>
            )}

            <input
              type="text"
              name="name"
              value={scriptName}
              onChange={handleChange}
              placeholder="Plugin Name"
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />

            <div className="flex flex-col md:flex-row gap-4 h-full">
              <div className="flex-1 relative">
                <pre
                  className="w-full h-full p-4 bg-gray-100 rounded-md overflow-auto language-bash text-sm"
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  onBlur={highlightCode}
                ></pre>
              </div>

              <div className="md:w-64 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">SETUP PLUGIN</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    These are Linux or PowerShell commands. write carefully first each command are work in your server.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-900"
                disabled={loading}
              >
                {loading ? "Saving..." : selectedPlugin ? "Update" : "Save"}
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => console.log("View Documentation")}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400"
                >
                  View Documentation
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
        </div>
      )}
    </div>
  );
};

export default Plugins_handler;
