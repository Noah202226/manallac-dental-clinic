"use client";

import { useState } from "react";
import { FiSearch, FiUser, FiTrash2, FiChevronRight } from "react-icons/fi"; // Added ChevronRight for list item
import InstallmentsPanel from "./actions/InstallmentsPanel";
import { usePatientStore } from "../../stores/usePatientStore";
import TransactionsPanel from "./actions/TransactionPanel";
import toast from "react-hot-toast"; // Import toast for deletion feedback

// 🎨 THEME VARIABLES FOR MODERN LOOK (Matching the main layout)
const MAIN_BG = "bg-gray-950"; // Deep dark background
const SIDEBAR_BG = "bg-gray-900"; // Patients list background
const ACCENT_COLOR_TEXT = "text-cyan-400"; // Vibrant modern accent text
const ACCENT_COLOR_BG = "bg-cyan-400"; // Vibrant modern accent background
const TEXT_COLOR = "text-gray-100";
const TEXT_MUTED = "text-gray-400";

export default function PatientsLayout() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    patients,
    fetchPatients,
    loading,
    selectedPatient,
    setSelectedPatient,
    deletePatient,
  } = usePatientStore();

  const filteredPatients = patients.filter((p) =>
    [p.patientName, p.serviceName, p.address] // Use patientName instead of p.name
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSelect = (p) => {
    setSelectedPatient(p);

    // only open modal if on mobile
    if (window.innerWidth < 768) {
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (
      confirm(
        "Are you sure you want to delete this patient and all associated records? This cannot be undone."
      )
    ) {
      const { success } = await deletePatient(id);
      if (success) {
        toast.success("Patient successfully deleted!");
        if (selectedPatient?.$id === id) {
          setSelectedPatient(null);
        }
      } else {
        toast.error("Failed to delete patient.");
      }
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row h-[calc(100vh-9rem)] ${MAIN_BG} ${TEXT_COLOR} rounded-xl shadow-2xl`}
    >
      {/* Left: Patients List */}
      <aside
        className={`w-full md:w-1/3 ${SIDEBAR_BG} border-r border-gray-800 flex flex-col rounded-l-xl`}
      >
        {/* Search Bar */}
        <div
          className={`sticky top-0 p-4 border-b border-gray-800 ${SIDEBAR_BG} z-10`}
        >
          <div className="flex items-center gap-2">
            <FiSearch className={`${ACCENT_COLOR_TEXT}`} size={20} />
            <input
              type="text"
              placeholder="Search patients (name, service, address)..."
              className={`input input-sm w-full bg-gray-800 ${TEXT_COLOR} border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500`}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-full overflow-y-auto p-3 space-y-2">
          {loading ? (
            <p className={`${TEXT_MUTED} text-sm p-4`}>Loading patients...</p>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((p) => (
              <div
                key={p.$id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-150 cursor-pointer ${
                  selectedPatient?.$id === p.$id
                    ? `${ACCENT_COLOR_BG} text-gray-950 font-semibold shadow-md` // Active state
                    : `bg-gray-800 ${TEXT_COLOR} hover:bg-gray-700` // Default/Hover state
                }`}
                onClick={() => handleSelect(p)}
              >
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold">{p.patientName}</h3>
                  <div className="flex flex-wrap gap-x-3 text-sm">
                    <span
                      className={`${
                        selectedPatient?.$id === p.$id
                          ? "text-gray-700"
                          : TEXT_MUTED
                      }`}
                    >
                      {p.serviceName}
                    </span>
                    <span
                      className={`italic ${
                        selectedPatient?.$id === p.$id
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                    >
                      ({p.serviceType})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent selecting the patient when deleting
                      handleDelete(p.$id);
                    }}
                    className={`p-2 rounded-full transition-colors 
                            ${
                              selectedPatient?.$id === p.$id
                                ? "text-red-700 hover:bg-red-200"
                                : "text-red-400 hover:bg-gray-700"
                            }`}
                    title="Delete Patient"
                  >
                    <FiTrash2 size={18} />
                  </button>
                  <FiChevronRight
                    size={18}
                    className={
                      selectedPatient?.$id === p.$id
                        ? "text-gray-800"
                        : ACCENT_COLOR_TEXT
                    }
                  />
                </div>
              </div>
            ))
          ) : (
            <p className={`${TEXT_MUTED} text-sm p-4`}>
              No patients found matching "{search}".
            </p>
          )}
        </div>
      </aside>

      {/* Right: Patient Details (Desktop only) */}
      <main className="hidden md:block flex-1 p-4 overflow-y-auto">
        {selectedPatient ? (
          <PatientDetails
            patient={selectedPatient}
            fetchPatients={fetchPatients}
          />
        ) : (
          <div
            className={`h-full flex items-center justify-center ${TEXT_MUTED}`}
          >
            <FiUser className="mr-2" size={24} />
            Select a patient to view details
          </div>
        )}
      </main>

      {/* Mobile Modal */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div
            className={`${SIDEBAR_BG} w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-2xl border border-gray-700 relative`}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
            <PatientDetails
              patient={selectedPatient}
              fetchPatients={fetchPatients}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// PatientDetails Component (Updated for modern look)
// ------------------------------------------------------------------------------------------------
function PatientDetails({ patient, fetchPatients }) {
  return (
    <div className="space-y-6">
      {/* Patient Info Header Card */}
      <div
        className={`p-6 rounded-xl ${ACCENT_COLOR_BG} text-gray-950 shadow-xl`}
      >
        <h2 className="text-4xl font-extrabold mb-4 border-b border-gray-700/30 pb-2">
          {patient.patientName}
        </h2>

        {/* Grid: 1 column on mobile, 2 columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {/* Left: Patient Info */}
          <div>
            <p className="font-bold">
              Age: <span className="font-normal">{patient.patientAge}</span>
            </p>
            <p className="font-bold">
              Gender: <span className="font-normal">{patient.gender}</span>
            </p>
            <p className="font-bold">
              Contact: <span className="font-normal">{patient.contact}</span>
            </p>
            <p className="font-bold">
              Address: <span className="font-normal">{patient.address}</span>
            </p>
          </div>

          {/* Right: Service Info */}
          <div className="md:border-l md:border-gray-700/30 md:pl-8">
            <p className="font-bold text-lg mb-1">Service Details</p>
            <p className="font-bold">
              Service:{" "}
              <span className="font-normal">{patient.serviceName}</span>
            </p>
            <p className="font-bold">
              Sub-service:{" "}
              <span className="font-normal">
                {patient.subServiceName || "N/A"}
              </span>
            </p>
            <p className="font-bold text-base">
              Type:{" "}
              <span
                className={`font-extrabold ${
                  patient.serviceType === "Installment"
                    ? "text-red-700"
                    : "text-green-700"
                }`}
              >
                {patient.serviceType}
              </span>
            </p>
            <p className="font-bold text-lg mt-2">
              Price:{" "}
              <span className="font-extrabold">
                ₱{patient.servicePrice.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Installments Panel */}
      {patient.serviceType === "Installment" && (
        <div
          className={`p-4 rounded-xl ${SIDEBAR_BG} border border-gray-700 shadow-lg`}
        >
          <h3 className={`text-xl font-bold mb-3 ${ACCENT_COLOR_TEXT}`}>
            Payment Plan
          </h3>
          <InstallmentsPanel patient={patient} fetchPatients={fetchPatients} />
        </div>
      )}

      {/* Transactions Section */}
      <div
        className={`p-4 rounded-xl ${SIDEBAR_BG} border border-gray-700 shadow-lg`}
      >
        <h3 className={`text-xl font-bold mb-3 ${ACCENT_COLOR_TEXT}`}>
          Transactions History
        </h3>
        <TransactionsPanel patient={patient} />
      </div>
    </div>
  );
}
