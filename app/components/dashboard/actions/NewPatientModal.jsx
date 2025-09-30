"use client";

export default function NewPatientModal({ openDialog }) {
  return (
    <>
      {/* Open Button */}
      <button
        className="btn bg-[var(--theme-text)] text-white hover:bg-[var(--theme-text)]/70 rounded-lg shadow-xs"
        onClick={() => openDialog()}
      >
        + New Patient
      </button>
    </>
  );
}
