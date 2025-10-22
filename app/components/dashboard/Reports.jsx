"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SalesDashboard from "../reports/transactions";
import ExpensesTab from "../reports/ExpensesTab";
import {
  FaChartLine,
  FaMoneyBillTrendUp,
  FaMoneyBillTransfer,
} from "react-icons/fa6";

// 🎨 THEME VARIABLES FOR MODERN LOOK (Amber/Dark Theme)
// 💡 FIX: Define all constants used in the component's styling
const MAIN_BG = "bg-gray-950";
const TAB_BAR_BG = "bg-gray-900";
const ACCENT_COLOR = "text-amber-400";
const ACCENT_LINE_COLOR = "bg-amber-400";
const ACTIVE_TAB_BG = "bg-gray-800";
const TEXT_COLOR = "text-gray-100";
const TEXT_MUTED = "text-gray-400";
const CARD_BG = "bg-gray-800"; // <--- THIS WAS THE MISSING DEFINITION

export default function ReportsTabs() {
  const [activeTab, setActiveTab] = useState("transactions");

  const tabs = [
    {
      key: "transactions",
      label: "SALES",
      icon: <FaMoneyBillTrendUp size={16} />,
    },
    {
      key: "expenses",
      label: "EXPENSES",
      icon: <FaMoneyBillTransfer size={16} />,
    },
    // { key: "patients", label: "PATIENTS", icon: <FaChartLine size={16} /> },
    // { key: "financial", label: "FINANCIAL SUMMARY", icon: <FaChartLine size={16} /> },
  ];

  return (
    <div
      className={`w-full h-full p-4 ${MAIN_BG} rounded-xl shadow-2xl ${TEXT_COLOR}`}
    >
      <h2
        className={`text-3xl font-extrabold mb-4 flex items-center gap-2 ${ACCENT_COLOR}`}
      >
        <FaChartLine /> Business Reports
      </h2>

      {/* 🚀 Custom Scrollable Tab Bar */}
      <div
        className={`relative border-b border-gray-700 ${TAB_BAR_BG} p-2 rounded-t-xl`}
      >
        <div className="flex space-x-2 min-w-max overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-3 flex items-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-colors duration-200 ${
                  isActive
                    ? `${ACTIVE_TAB_BG} ${ACCENT_COLOR} shadow-inner`
                    : `${TEXT_MUTED} hover:text-white hover:bg-gray-700`
                }`}
              >
                {tab.icon}
                {tab.label}

                {/* Framer Motion Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeReportTab"
                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-lg ${ACCENT_LINE_COLOR}`}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div
        className={`flex flex-col mt-0 p-4 border-t-0 border border-gray-700 rounded-b-xl ${CARD_BG} h-[calc(100vh-16rem)] overflow-y-auto`}
      >
        {/* 🔹 Transactions Report */}
        {activeTab === "transactions" && (
          <div className="flex-1">
            <SalesDashboard />
          </div>
        )}

        {/* 🔹 Expenses Report */}
        {activeTab === "expenses" && (
          <div className="flex-1">
            <ExpensesTab />
          </div>
        )}

        {/* 🔹 Patients Report (Placeholder) */}
        {activeTab === "patients" && (
          <div className="text-center py-12">
            <p className="text-xl font-semibold mb-4 text-gray-400">
              🧑‍⚕️ Patient Activity Report Coming Soon...
            </p>
            <button
              className={`${ACCENT_BG} text-gray-950 font-bold py-2 px-6 rounded-lg hover:bg-amber-500 transition`}
            >
              Build Patient Report
            </button>
          </div>
        )}

        {/* 🔹 Financial Summary (Placeholder) */}
        {activeTab === "financial" && (
          <div className="text-center py-12">
            <p className="text-xl font-semibold mb-4 text-gray-400">
              📊 Comprehensive Financial Summary Coming Soon...
            </p>
            <button
              className={`${ACCENT_BG} text-gray-950 font-bold py-2 px-6 rounded-lg hover:bg-amber-500 transition`}
            >
              View Financial Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
