"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "../../stores/useSettingStore";
import ServicesData from "../settings/services/Services";
import { Edit, Trash, Plus, Settings } from "lucide-react"; // Added Settings icon
import CategoriesSettings from "../settings/CategoryTab";
import PersonalizationTab from "../settings/PersonalizationTab";

// 🎨 THEME VARIABLES FOR MODERN LOOK (Amber/Dark Theme)
const MAIN_BG = "bg-gray-900"; // Background for the whole component content
const TAB_BAR_BG = "bg-gray-950"; // Deep dark background for the tab bar area
const ACCENT_COLOR = "text-amber-400"; // Vibrant accent color for text/icons
const ACCENT_BG = "bg-amber-400"; // Vibrant accent color for buttons/highlights
const ACTIVE_TAB_BG = "bg-gray-800"; // Background for the currently active tab button
const TEXT_COLOR = "text-gray-100";
const TEXT_MUTED = "text-gray-400";

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("personalization");

  const tabs = [
    { key: "personalization", label: "PERSONALIZATION" },
    { key: "users", label: "USERS" },
    { key: "services", label: "SERVICES" },
    { key: "inventory", label: "PRODUCT INVENTORY" },
  ];

  const {
    theme,
    setTheme,
    users,
    addUser,
    deleteUser,
    products,
    addProduct,
    deleteProduct,
  } = useSettingsStore();

  // Local input states
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });

  return (
    <div className={`w-full p-4 ${MAIN_BG} rounded-xl shadow-2xl`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-3xl font-extrabold flex items-center gap-2 ${ACCENT_COLOR}`}
        >
          <Settings size={28} /> App Settings
        </h2>
      </div>

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
                className={`relative px-4 py-3 whitespace-nowrap rounded-lg font-semibold transition-colors duration-200 ${
                  isActive
                    ? `${ACTIVE_TAB_BG} ${ACCENT_COLOR} shadow-inner` // Active tab state
                    : `${TEXT_MUTED} hover:text-white hover:bg-gray-700` // Inactive tab state
                }`}
              >
                {tab.label}
                {/* Framer Motion Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-lg ${ACCENT_BG}`}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Container */}
      <div
        className={`mt-0 p-6 ${MAIN_BG} border border-gray-700 rounded-b-xl min-h-[500px] ${TEXT_COLOR}`}
      >
        {/* 🔹 Personalization */}
        {activeTab === "personalization" && <PersonalizationTab />}

        {/* 🔹 Users */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b border-gray-700 pb-2">
              Manage Users
            </h3>

            {/* Add User Form */}
            <div className="flex gap-4">
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, name: e.target.value }))
                }
                placeholder="New User Name"
                className={`flex-1 p-3 rounded-lg ${TEXT_COLOR} bg-gray-700 border border-gray-600 focus:ring-amber-400 focus:border-amber-400`}
              />
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, email: e.target.value }))
                }
                placeholder="Email Address"
                className={`flex-1 p-3 rounded-lg ${TEXT_COLOR} bg-gray-700 border border-gray-600 focus:ring-amber-400 focus:border-amber-400`}
              />
              <button
                onClick={() => {
                  if (!newUser.name || !newUser.email) return;
                  addUser(newUser);
                  setNewUser({ name: "", email: "" });
                }}
                className={`btn ${ACCENT_BG} text-gray-950 hover:bg-amber-500 font-bold px-6 py-3 rounded-lg flex items-center transition`}
              >
                <Plus size={18} /> Add
              </button>
            </div>

            {/* User List */}
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
                >
                  <span className="font-semibold">
                    {u.name} -{" "}
                    <span className={`${TEXT_MUTED} italic`}>{u.email}</span>
                  </span>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="text-red-500 hover:text-red-400 p-1 rounded-full transition"
                    title="Delete User"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              ))}
              {users.length === 0 && (
                <p className={`italic p-4 text-center ${TEXT_MUTED}`}>
                  No users added yet. Add staff accounts here.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 🔹 Services */}
        {activeTab === "services" && <ServicesData />}

        {/* 🔹 Inventory */}
        {activeTab === "inventory" && <CategoriesSettings />}
      </div>
    </div>
  );
}
