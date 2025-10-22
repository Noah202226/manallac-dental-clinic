"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Settings,
  Calendar,
  Users,
  Stethoscope,
  Menu,
  ShoppingCart, // Replaced one icon for Products
} from "lucide-react";
import SettingsData from "./dashboard/Settings";
import Reports from "./dashboard/Reports";
import Patients from "./dashboard/Patients";
import NewPatientModal from "./dashboard/actions/NewPatientModal";
import { useServices } from "./hooks/useServices";
import { databases } from "../lib/appwrite";
import { ID } from "appwrite";
import { usePatientStore } from "../stores/usePatientStore";
import { useAuthStore } from "../stores/authStore";
import { usePersonalizationStore } from "../stores/usePersonalizationStore";
import toast from "react-hot-toast";
import ExpenseModal from "./dashboard/actions/ExpenseModal";
import DashboardData from "./dashboard/DashboardData";
import Products from "./dashboard/Products";

const PATIENTS_COLLECTION_ID = "patients";
const INSTALLMENTS_COLLECTION_ID = "installments";
const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID;

// 🎨 THEME VARIABLES FOR MODERN LOOK
// Tailwind colors used:
const MAIN_BG = "bg-gray-950"; // Deep dark background
const SIDEBAR_BG = "bg-gray-900"; // Slightly lighter for contrast
const ACCENT_COLOR = "text-cyan-400"; // Vibrant modern accent
const ACTIVE_ITEM_BG = "bg-cyan-400"; // Solid background for active item
const TEXT_COLOR = "text-gray-100";
const HOVER_BG = "hover:bg-gray-800";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
  // { id: "appointments", label: "Appointments", icon: <Calendar size={20} /> },
  { id: "patients", label: "Patients", icon: <Users size={20} /> },
  { id: "products", label: "Products", icon: <ShoppingCart size={20} /> }, // Updated icon
  { id: "reports", label: "Reports", icon: <Stethoscope size={20} /> },
  { id: "settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function DentalClinicLayout() {
  const [active, setActive] = useState("dashboard");
  const [dateTime, setDateTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Expense Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  // Auth/Store Logic
  const { logout, current } = useAuthStore((state) => state);
  const { fetchPatients, patients } = usePatientStore((state) => state);
  const { clientTitle, clientInitial } = usePersonalizationStore(
    (state) => state
  );

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openDialog = () => {
    document.getElementById("new_patient_modal").showModal();
  };
  const closeDialog = () => {
    document.getElementById("new_patient_modal").close();
  };

  const [serviceType, setServiceType] = useState("One-time");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return; // prevent double submit
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    const patientData = {
      patientName: formData.get("name"),
      patientAge: Number(formData.get("age")),
      address: formData.get("address"),
      gender: formData.get("gender"),
      contact: formData.get("contact"),
      serviceName: services.find((s) => s.id === selectedService)?.name || "",
      subServiceName:
        services
          .find((s) => s.id === selectedService)
          ?.subServices.find((sub) => sub.id === selectedSubService)?.name ||
        "",
      serviceType: formData.get("service-type"),
      servicePrice:
        serviceType === "Installment"
          ? Number(formData.get("totalPrice"))
          : Number(formData.get("servicePrice")),
      balance:
        serviceType === "Installment"
          ? Number(formData.get("totalPrice")) -
            Number(formData.get("initialPayment"))
          : 0,
    };

    try {
      // 1️⃣ Save patient
      const newPatient = await databases.createDocument(
        DATABASE_ID,
        PATIENTS_COLLECTION_ID,
        ID.unique(),
        patientData
      );

      console.log("Patient saved:", newPatient);

      // 2️⃣ Handle Transactions + Installments
      if (patientData.serviceType === "Installment") {
        const initialPayment = Number(formData.get("initialPayment")) || 0;
        const balanceAfter = patientData.servicePrice - initialPayment;

        // 👉 Create transaction first
        const transaction = await databases.createDocument(
          DATABASE_ID,
          "transactions",
          ID.unique(),
          {
            patientId: newPatient.$id,
            patientName: newPatient.patientName,
            serviceName: newPatient.serviceName,
            subServiceName: newPatient.subServiceName ?? "",
            amount: initialPayment,
            paymentType: "Installment",
            date: new Date().toISOString(),
          }
        );

        // 👉 Create installment linked to this transaction
        await databases.createDocument(
          DATABASE_ID,
          INSTALLMENTS_COLLECTION_ID,
          ID.unique(),
          {
            patientId: newPatient.$id,
            amountPaid: initialPayment,
            balanceAfter,
            paymentDate: new Date().toISOString(),
            transactionId: transaction.$id, // ✅ link here
          }
        );

        console.log("Initial installment linked to transaction ✅");
      } else {
        // One-time payment = just a transaction
        await databases.createDocument(
          DATABASE_ID,
          "transactions",
          ID.unique(),
          {
            patientId: newPatient.$id,
            patientName: newPatient.patientName,
            serviceName: newPatient.serviceName,
            subServiceName: newPatient.subServiceName ?? "",
            amount: newPatient.servicePrice,
            paymentType: "One-time",
            date: new Date().toISOString(),
          }
        );
      }

      // 3️⃣ UI updates
      toast.success("Patient added successfully!");
      fetchPatients();
      setSelectedService("");
      setSelectedSubService("");
      closeDialog();
      e.target.reset();
    } catch (error) {
      console.error("Error saving patient:", error);
      toast.error("Error saving patient");
    } finally {
      setSaving(false);
    }
  };

  const { services, loading } = useServices();

  const [selectedService, setSelectedService] = useState("");
  const [selectedSubService, setSelectedSubService] = useState("");

  return (
    <div className={`flex h-screen ${MAIN_BG} ${TEXT_COLOR}`}>
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out
          w-64 ${SIDEBAR_BG} border-r border-gray-800 flex flex-col z-20 shadow-xl`}
      >
        {/* Logo and Clinic Title */}
        <div className="p-6 border-b border-gray-800 flex flex-col items-start gap-2">
          <img
            src="/manallac-logo.png"
            alt="Clinic Logo"
            className="w-16 h-16 object-contain opacity-90"
          />
          <h1 className={`text-xl font-extrabold ${ACCENT_COLOR}`}>
            {clientTitle ? clientTitle : "Dental Clinic"}
          </h1>
          <button
            className="md:hidden absolute top-3 right-3 text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActive(item.id);
                setSidebarOpen(false); // close sidebar on mobile
              }}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
                ${
                  active === item.id
                    ? `${ACTIVE_ITEM_BG} text-gray-950 font-semibold shadow-md` // Bold, high-contrast active state
                    : `${TEXT_COLOR} hover:text-white ${HOVER_BG}` // Clean hover state
                }
              `}
            >
              {item.icon}
              <span className="ml-3 text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer/Logout Area */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              logout();
            }}
            className="flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 text-red-400 hover:bg-gray-800"
          >
            <Home size={20} className="transform rotate-180" />
            <span className="ml-3 text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header
          className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-800 ${SIDEBAR_BG} sticky top-0 z-10 shadow-md`}
        >
          {/* LEFT: Mobile Menu Button + DateTime */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              className={`md:hidden ${ACCENT_COLOR} p-2 rounded-lg ${HOVER_BG}`}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* DateTime - simplified */}
            <div className="flex flex-col text-left">
              <span className="text-xs text-gray-400 animate-bounce ">
                {dateTime.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-xl font-bold font-mono text-gray-200 animate-pulse">
                {dateTime.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* RIGHT: Quick Stats + Actions + Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Stats */}
            <div className="hidden sm:flex gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-400">Total Patients</p>
                <p className={`text-lg font-bold ${ACCENT_COLOR}`}>
                  {patients.length}
                </p>
              </div>
            </div>

            <ExpenseModal
              isOpen={isOpen}
              onClose={() => {
                setIsOpen(false);
                setEditExpense(null);
              }}
              expense={editExpense}
            />

            {/* Action Buttons (Desktop) */}
            <div className="hidden md:flex gap-2 z-10">
              <NewPatientModal openDialog={openDialog} /> {/* Primary Action */}
              <button
                onClick={() => {
                  setIsOpen(true);
                }}
                className={`px-4 py-2 rounded-lg bg-gray-700 ${TEXT_COLOR} text-sm font-medium border border-gray-600 ${HOVER_BG}`}
              >
                + Expense
              </button>
            </div>

            {/* Mobile Dropdown Menu (No change, just using new colors) */}
            <div className="fixed bottom-6 right-6 md:hidden z-50">
              <div className="dropdown dropdown-top dropdown-end">
                <label
                  tabIndex={0}
                  className={`btn btn-circle ${ACTIVE_ITEM_BG} text-gray-950 hover:bg-cyan-500 shadow-xl`}
                >
                  +
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-gray-800 border border-gray-700 rounded-xl w-44"
                >
                  <li>
                    <button
                      onClick={() =>
                        document.getElementById("new_patient_modal").showModal()
                      }
                      className={`${ACCENT_COLOR} ${HOVER_BG}`}
                    >
                      + Patient
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setIsOpen(true);
                      }}
                      className={`${ACCENT_COLOR} ${HOVER_BG}`}
                    >
                      + Expense
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* User Profile */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-3 cursor-pointer p-2 rounded-xl border border-transparent hover:border-gray-700 transition-colors"
              >
                <span className="hidden sm:inline text-sm text-gray-300">
                  {current?.email || "user@email.com"}
                </span>
                <div
                  className={`w-10 h-10 rounded-full ${ACTIVE_ITEM_BG} flex items-center justify-center text-gray-950 font-bold shadow-lg`}
                >
                  {clientInitial ? clientInitial : "MD"}
                </div>
              </div>
              <ul
                tabIndex={0}
                className={`dropdown-content menu p-2 shadow ${SIDEBAR_BG} border border-gray-700 rounded-xl w-44 mt-2`}
              >
                <li>
                  <button
                    onClick={logout}
                    className="text-red-400 hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="p-4 sm:p-6 min-h-[calc(100vh-68px)]">
          {" "}
          {/* Adjusted min-height */}
          {active === "dashboard" && <DashboardData />}
          {active === "patients" && <Patients />}
          {active === "products" && <Products />}
          {active === "reports" && <Reports />}
          {active === "settings" && <SettingsData />}
        </section>
      </main>

      {/* Modal Overlay (New Patient Modal) */}
      <dialog id="new_patient_modal" className="modal fixed inset-0 z-50">
        <div className="flex items-center justify-center w-full h-full bg-black/70 px-4">
          <div
            className={`w-full max-w-lg md:max-w-xl ${SIDEBAR_BG} ${TEXT_COLOR} rounded-xl shadow-2xl border border-gray-700 relative flex flex-col max-h-[90vh]`}
          >
            {/* Close Button */}
            <button
              className="btn btn-sm btn-circle absolute right-3 top-3 bg-gray-700 text-gray-300 hover:bg-gray-600 border-none z-20"
              onClick={() => closeDialog()}
            >
              ✕
            </button>

            {/* Title */}
            <h3
              className={`text-2xl font-extrabold p-6 ${ACCENT_COLOR} border-b border-gray-700 sticky top-0 ${SIDEBAR_BG} z-10 rounded-t-xl`}
            >
              Add New Patient
            </h3>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6 flex-1 overflow-y-auto"
            >
              {/* Patient Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`w-full input input-bordered bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                    required
                  />
                </div>
                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    className={`w-full input input-bordered bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                    required
                  />
                </div>
                {/* Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contact"
                    className={`w-full input input-bordered bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                    required
                  />
                </div>
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    className={`w-full select select-bordered bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                    required
                  >
                    <option value="" disabled className="text-gray-500">
                      Select Gender
                    </option>
                    <option value="Male" className="text-gray-100">
                      Male
                    </option>
                    <option value="Female" className="text-gray-100">
                      Female
                    </option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  className={`w-full input input-bordered bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                  required
                />
              </div>

              {/* Service Details Section */}
              <h4 className="text-lg font-semibold text-gray-300 pt-2 border-t border-gray-800">
                Service Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service Rendered */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Select Service
                  </label>
                  <select
                    className={`select select-bordered w-full bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setSelectedSubService("");
                    }}
                  >
                    <option value="" className="text-gray-500">
                      -- Choose a Service --
                    </option>
                    {services.map((service) => (
                      <option
                        key={service.id}
                        value={service.id}
                        className="text-gray-100"
                      >
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-service Selection */}
                {selectedService && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Select Sub-service
                    </label>
                    <select
                      className={`select select-bordered w-full bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                      value={selectedSubService}
                      onChange={(e) => setSelectedSubService(e.target.value)}
                    >
                      <option value="" className="text-gray-500">
                        -- Choose a Sub-service --
                      </option>
                      {services
                        .find((s) => s.id === selectedService)
                        ?.subServices.map((sub) => (
                          <option
                            key={sub.id}
                            value={sub.id}
                            className="text-gray-100"
                          >
                            {sub.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Service Type
                </label>
                <select
                  name="service-type"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className={`w-full input input-bordered bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                >
                  <option value="One-time" className="text-gray-100">
                    One-time
                  </option>
                  <option value="Installment" className="text-gray-100">
                    Installment
                  </option>
                </select>
              </div>

              {/* Installment plan */}
              {serviceType === "Installment" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Total Service Price (₱)
                    </label>
                    <input
                      type="number"
                      name="totalPrice"
                      className={`w-full input input-bordered bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Initial Payment (₱)
                    </label>
                    <input
                      type="number"
                      name="initialPayment"
                      className={`w-full input input-bordered bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Service Price - only show for One-time payment */}
              {serviceType === "One-time" && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Service Price (₱)
                  </label>
                  <input
                    type="number"
                    name="servicePrice"
                    className={`w-full input input-bordered bg-gray-800 ${TEXT_COLOR} border-gray-700 focus:border-cyan-400 rounded-lg`}
                    required
                  />
                </div>
              )}

              {/* Actions */}
              <div
                className={`flex justify-end gap-3 pt-6 sticky bottom-0 ${SIDEBAR_BG} z-10`}
              >
                <button
                  type="button"
                  className="btn bg-gray-700 text-gray-300 hover:bg-gray-600 border-none rounded-lg"
                  onClick={() => closeDialog()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`btn rounded-lg px-6 py-2 font-semibold transition ${ACTIVE_ITEM_BG} text-gray-950 hover:bg-cyan-500 border-none 
                    ${
                      saving
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : ""
                    }`}
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      Saving...
                    </span>
                  ) : (
                    "Save Patient"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
