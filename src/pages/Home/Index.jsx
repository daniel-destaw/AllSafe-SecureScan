import { useState } from "react";
import { Line } from "react-chartjs-2";
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
    labels: assetDetails.map((asset) => asset.name),
    datasets: [
      {
        label: "Compliant Assets",
        data: assetDetails.map((asset) => asset.compliant),
        borderColor: "#10B981",
        backgroundColor: "#10B98120",
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#10B981",
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
      },
      {
        label: "Total Assets",
        data: assetDetails.map((asset) => asset.total),
        borderColor: "#3B82F6",
        backgroundColor: "#3B82F620",
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#3B82F6",
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: '#E5E7EB',
        },
        ticks: {
          stepSize: 20
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 p-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Compliance Dashboard</h1>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm text-gray-500">Last updated:</span>
          <span className="text-sm font-medium">Today, {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {assetDetails.map((asset, index) => {
          const complianceRate = (asset.compliant / asset.total) * 100;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{asset.name}</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-800">
                    {asset.compliant}<span className="text-lg font-normal text-gray-500">/{asset.total}</span>
                  </h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  complianceRate >= 90 ? 'bg-green-100 text-green-800' : 
                  complianceRate >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {complianceRate.toFixed(1)}%
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      complianceRate >= 90 ? 'bg-green-500' : 
                      complianceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${complianceRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart and Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Compliance Trend</h3>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">Weekly</button>
              <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">Monthly</button>
              <button className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">Yearly</button>
            </div>
          </div>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Detailed Compliance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliant</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assetDetails.map((asset, index) => {
                  const complianceRate = (asset.compliant / asset.total) * 100;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.compliant}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            complianceRate >= 90 ? 'text-green-600' : 
                            complianceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {complianceRate.toFixed(1)}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                complianceRate >= 90 ? 'bg-green-500' : 
                                complianceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${complianceRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-800 mb-1">Overall Compliance</h4>
            <p className="text-2xl font-bold text-indigo-600">
              {((compliantAssets / totalAssets) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-indigo-500 mt-1">
              {compliantAssets} out of {totalAssets} assets compliant
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-1">Best Performing</h4>
            <p className="text-xl font-bold text-green-600">
              Linux Servers ({(compliantLinuxServers / totalLinuxServers * 100).toFixed(1)}%)
            </p>
            <p className="text-xs text-green-500 mt-1">
              {compliantLinuxServers} out of {totalLinuxServers} compliant
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-1">Needs Attention</h4>
            <p className="text-xl font-bold text-red-600">
              Windows Servers ({(compliantWindowsServers / totalWindowsServers * 100).toFixed(1)}%)
            </p>
            <p className="text-xs text-red-500 mt-1">
              {totalWindowsServers - compliantWindowsServers} non-compliant assets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}