import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Prism from "prismjs";
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
  const isInitialMount = useRef(true);

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

  useEffect(() => {
    if (isModalOpen && editorRef.current) {
      if (isInitialMount.current) {
        // Set initial content without highlighting
        editorRef.current.textContent = roleConfig;
        isInitialMount.current = false;
      }
      
      // Highlight after a small delay to ensure DOM is ready
      setTimeout(() => {
        highlightCode();
      }, 50);
    } else {
      isInitialMount.current = true;
    }
  }, [isModalOpen, roleConfig]);

  const highlightCode = () => {
    if (editorRef.current) {
      // Save selection before highlighting
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const cursorPosition = range ? range.startOffset : 0;
      const currentNode = range ? range.startContainer : null;

      // Get the current text content
      const code = editorRef.current.textContent;
      
      // Highlight the code
      const highlightedCode = Prism.highlight(code, Prism.languages.bash, "bash");
      editorRef.current.innerHTML = `<code class="language-bash">${highlightedCode}</code>`;

      // Restore cursor position if possible
      if (range && currentNode) {
        try {
          const textNodes = getTextNodes(editorRef.current);
          let pos = 0;
          let newRange = document.createRange();
          
          for (const node of textNodes) {
            if (pos + node.length >= cursorPosition) {
              newRange.setStart(node, Math.min(cursorPosition - pos, node.length));
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
              break;
            }
            pos += node.length;
          }
        } catch (e) {
          console.error("Error restoring cursor position:", e);
        }
      }
    }
  };

  const getTextNodes = (node) => {
    let textNodes = [];
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else {
      const children = node.childNodes;
      for (let i = 0; i < children.length; i++) {
        textNodes = textNodes.concat(getTextNodes(children[i]));
      }
    }
    return textNodes;
  };

  const openModal = (plugin = null) => {
    setSelectedPlugin(plugin);
    if (plugin) {
      setScriptName(plugin.name);
      setRoleConfig(plugin.roleConfig || "");
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

  const handleEditorInput = (e) => {
    // Update the raw text content
    const newContent = e.currentTarget.textContent;
    setRoleConfig(newContent);
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
      setTimeout(() => {
        closeModal();
      }, 1000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plugin?")) {
      try {
        await axios.delete(`/api/plugins/${id}`);
        setPluginData(pluginData.filter((plugin) => plugin.id !== id));
        setSuccessMessage("Plugin script deleted successfully.");
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (error) {
        setErrorMessage(error.response?.data?.error || "Failed to delete the script.");
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Plugin Management</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Plugin
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plugin Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Snippet Preview
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pluginData.length > 0 ? (
              pluginData.map((plugin) => (
                <tr key={plugin.id} className={pluginData.indexOf(plugin) % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{plugin.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                      {plugin.snippet || "No preview available"}
                    </pre>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => openModal(plugin)}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plugin.id)}
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
                  No plugins found. Add a new plugin to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPlugin ? "Edit Plugin" : "Create New Plugin"}
              </h3>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 flex-1 flex flex-col">
              {errorMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded mb-4">
                  {successMessage}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="plugin-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Plugin Name
                </label>
                <input
                  id="plugin-name"
                  type="text"
                  name="name"
                  value={scriptName}
                  onChange={handleChange}
                  placeholder="Enter plugin name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Script Content
                </label>
                <div className="flex-1 relative border border-gray-300 rounded-md overflow-hidden">
                  <pre
                    className="absolute inset-0 p-4 bg-gray-900 text-white overflow-auto text-sm font-mono"
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    suppressContentEditableWarning={true}
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Write Linux or PowerShell commands. Ensure each command works on your server.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <div>
                <button
                  onClick={() => console.log("View Documentation")}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                  View Documentation
                </button>
              </div>
              <div className="space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {selectedPlugin ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    selectedPlugin ? "Update Plugin" : "Save Plugin"
                  )}
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