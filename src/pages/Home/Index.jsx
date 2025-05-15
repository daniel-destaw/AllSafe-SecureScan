import { useState } from "react";
import { Line } from "react-chartjs-2"; // Importing Chart.js for the chart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registering required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Index() {
  // Sample Data (replace with actual data from your backend or API)
  const totalAssets = 150;
  const compliantAssets = 120;
  const totalNetworkVLANAssets = 80;
  const compliantNetworkVLANAssets = 70;

  // Additional data for servers and workstations
  const totalLinuxServers = 50;
  const compliantLinuxServers = 45;
  const totalWindowsServers = 40;
  const compliantWindowsServers = 35;
  const totalWorkstationAssets = 60;
  const compliantWorkstationAssets = 55;

  const assetDetails = [
    { name: "Total Assets", total: totalAssets, compliant: compliantAssets },
    { name: "Network VLAN", total: totalNetworkVLANAssets, compliant: compliantNetworkVLANAssets },
    { name: "Linux Servers", total: totalLinuxServers, compliant: compliantLinuxServers },
    { name: "Windows Servers", total: totalWindowsServers, compliant: compliantWindowsServers },
    { name: "Workstations", total: totalWorkstationAssets, compliant: compliantWorkstationAssets },
  ];

  // Chart Data for Compliance Overview
  const chartData = {
    labels: assetDetails.map((asset) => asset.name), // Labels for the x-axis
    datasets: [
      {
        label: "Compliant Assets",
        data: assetDetails.map((asset) => asset.compliant), // Data for compliant assets
        borderColor: "#34D399", // Green color for compliant assets
        backgroundColor: "#34D39980", // Light green for the background
        fill: true,
      },
      {
        label: "Total Assets",
        data: assetDetails.map((asset) => asset.total), // Data for total assets
        borderColor: "#3B82F6", // Blue color for total assets
        backgroundColor: "#3B82F680", // Light blue for the background
        fill: true,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-100 p-6 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-semibold text-gray-600">Dashboard</span>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assetDetails.map((asset, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700">{asset.name}</h3>
            <p className="text-3xl font-bold text-blue-600">{asset.compliant} / {asset.total}</p>
            <p className="text-sm text-gray-500">{((asset.compliant / asset.total) * 100).toFixed(2)}% Compliant</p>
          </div>
        ))}
      </div>

      {/* Chart and Table Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Section */}
        <div className="overflow-x-auto col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Detailed Asset Compliance Overview</h3>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-6 py-4 text-left">Asset Type</th>
                <th className="px-6 py-4 text-left">Total</th>
                <th className="px-6 py-4 text-left">Compliant</th>
                <th className="px-6 py-4 text-left">Compliance Rate</th>
              </tr>
            </thead>
            <tbody>
              {assetDetails.map((asset, index) => (
                <tr key={index} className="border-b">
                  <td className="px-6 py-4">{asset.name}</td>
                  <td className="px-6 py-4">{asset.total}</td>
                  <td className="px-6 py-4">{asset.compliant}</td>
                  <td className="px-6 py-4">{((asset.compliant / asset.total) * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart Section */}
        <div className="col-span-1">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Asset Compliance Overview</h3>
          <Line data={chartData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Footer or additional stats */}
      <div className="flex justify-center mt-6">
        <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-center">
          <p className="font-semibold">Total Assets: {totalAssets}</p>
          <p className="font-semibold">Total Compliant: {compliantAssets}</p>
        </div>
      </div>
    </div>
  );
}
