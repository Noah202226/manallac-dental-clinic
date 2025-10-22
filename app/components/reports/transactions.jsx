"use client";

import { useEffect, useMemo, useState } from "react";
import { useTransactionStore } from "../../stores/useTransactionStore";
import { FiDollarSign, FiFilter, FiTrash2 } from "react-icons/fi";
import { FaPesoSign } from "react-icons/fa6";
import { FaFilePdf } from "react-icons/fa6"; // Icon for PDF

// PDF
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../Roboto-font";
import toast from "react-hot-toast";

// 🎨 THEME VARIABLES FOR MODERN LOOK (Amber/Dark Theme)
const MAIN_BG = "bg-gray-950"; // Deep dark background
const HEADER_BG = "bg-gray-800"; // Header/Filter block background
const CARD_BG = "bg-gray-900"; // Individual card background
const ACCENT_TEXT = "text-amber-400"; // Vibrant accent color for text
const ACCENT_BG = "bg-amber-400"; // Vibrant accent color for buttons/highlights
const TEXT_COLOR = "text-gray-100";
const TEXT_MUTED = "text-gray-400";
const TABLE_HEADER_BG = "bg-gray-700";

export default function SalesDashboard() {
  const {
    transactions,
    fetchTransactions,
    filterByDate,
    filteredTotal, // Although commented out in JSX, keeping here for completeness
    addTransaction,
    deleteTransaction,
  } = useTransactionStore();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ✅ Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    patientName: "",
    serviceName: "",
    subServiceName: "",
    amount: "",
    paymentType: "One-time",
    date: "",
    remarks: "",
    patientId: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveTransaction = async () => {
    // Basic validation
    if (!form.patientName || !form.amount || !form.date) {
      toast.error("Patient Name, Amount, and Date are required.");
      return;
    }

    const data = {
      ...form,
      amount: Number(form.amount),
      date: new Date(form.date).toISOString(),
    };

    toast.loading("Saving transaction...", { id: "save-toast" });
    const res = await addTransaction(data);
    toast.dismiss("save-toast");

    if (res.success) {
      setShowModal(false);
      setForm({
        patientId: "",
        patientName: "",
        serviceName: "",
        subServiceName: "",
        amount: "",
        paymentType: "One-time",
        date: "",
        remarks: "",
      });
      toast.success("Transaction added successfully!");
    } else {
      toast.error("Failed to add transaction.");
    }

    fetchTransactions();
  };

  // 3. New Delete Handler Function
  const handleDeleteTransaction = async (transactionId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this transaction? This action cannot be undone."
      )
    ) {
      return;
    }

    toast.loading("Deleting transaction...", { id: "delete-toast" });
    const res = await deleteTransaction(transactionId);
    toast.dismiss("delete-toast");

    if (res.success) {
      toast.success("Transaction deleted successfully!");
    } else {
      toast.error("Failed to delete transaction.");
    }

    fetchTransactions();
  };

  // ✅ Automatically set first/last day of month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    setStartDate(firstDay);
    setEndDate(lastDay);
    filterByDate(firstDay, lastDay);
  }, [filterByDate]);

  // ✅ PDF Report
  const generateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont("Roboto-font");
    doc.text("Sales Report", 14, 20);

    if (startDate && endDate) {
      doc.setFontSize(11);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 28);
    }

    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      new Date(t.date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      t.patientName,
      t.serviceName,
      t.paymentType,
      `${t.amount.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Date", "Time", "Patient", "Service", "Type", "Amount"]],
      body: rows,
      theme: "grid",
      styles: {
        font: "Roboto-font",
        fontSize: 10,
        halign: "center",
      },
      headStyles: {
        fillColor: [75, 85, 99], // gray-700
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { halign: "left" },
        5: { halign: "right", fontStyle: "bold" },
      },
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    doc.setFontSize(14);
    doc.setFont("Roboto-font", "bold");
    doc.text(
      `TOTAL REVENUE: ${totalAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      14,
      doc.lastAutoTable.finalY + 15
    );
    doc.save(`sales_report_${startDate}_to_${endDate}.pdf`);
  };

  // ✅ Summary Totals
  const totals = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    let todayTotal = 0,
      monthTotal = 0,
      yearTotal = 0;

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const transactionDateStr = t.date.split("T")[0];

      // Calculate Daily Total
      if (transactionDateStr === todayStr) todayTotal += t.amount;

      // Calculate Monthly Total
      if (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      )
        monthTotal += t.amount;

      // Calculate Yearly Total
      if (d.getFullYear() === now.getFullYear()) yearTotal += t.amount;
    });

    return { today: todayTotal, month: monthTotal, year: yearTotal };
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Format currency
  const formatCurrency = (amount) =>
    `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div
      className={`flex flex-1 flex-col h-full overflow-hidden ${TEXT_COLOR}`}
    >
      {/* 🔹 Header/Controls Block */}
      <div
        className={`shrink-0 ${HEADER_BG} p-4 z-5 rounded-xl border border-gray-700 shadow-xl mb-4`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-3xl font-bold flex items-center gap-2 ${ACCENT_TEXT}`}
          >
            <FaPesoSign /> Sales Dashboard
          </h2>

          <button
            onClick={() => setShowModal(true)}
            className={`${ACCENT_BG} text-gray-950 hover:bg-amber-500 flex items-center gap-2 rounded-lg px-4 py-2 font-bold shadow-md transition`}
          >
            <FiDollarSign size={20} /> New Transaction
          </button>
        </div>

        {/* Totals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className={`card ${CARD_BG} border border-gray-700/50 p-5 shadow-lg`}
          >
            <h3 className={`text-base ${TEXT_MUTED} font-semibold`}>
              Today's Revenue
            </h3>
            <p className={`text-4xl font-extrabold ${TEXT_COLOR}`}>
              {formatCurrency(totals.today)}
            </p>
          </div>
          <div
            className={`card ${CARD_BG} border border-gray-700/50 p-5 shadow-lg`}
          >
            <h3 className={`text-base ${TEXT_MUTED} font-semibold`}>
              This Month
            </h3>
            <p className={`text-4xl font-extrabold ${TEXT_COLOR}`}>
              {formatCurrency(totals.month)}
            </p>
          </div>
          <div
            className={`card ${CARD_BG} border border-gray-700/50 p-5 shadow-lg`}
          >
            <h3 className={`text-base ${TEXT_MUTED} font-semibold`}>
              This Year
            </h3>
            <p className={`text-4xl font-extrabold ${TEXT_COLOR}`}>
              {formatCurrency(totals.year)}
            </p>
          </div>
        </div>

        {/* Filters and Report Button */}
        <div className="flex gap-3 items-center flex-wrap">
          <label className="text-sm font-semibold text-gray-400">
            Filter Range:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-amber-400 focus:border-amber-400`}
          />
          <span className={TEXT_MUTED}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-amber-400 focus:border-amber-400`}
          />
          <button
            onClick={() => filterByDate(startDate, endDate)}
            className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition`}
          >
            <FiFilter /> Filter
          </button>
          <button
            onClick={generateReport}
            className={`${ACCENT_BG} text-gray-950 hover:bg-amber-500 flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold transition ml-auto`}
          >
            <FaFilePdf /> Generate Report
          </button>
        </div>
      </div>

      {/* 🔹 Desktop Table (Scrollable Content) */}
      <div className="flex-1 overflow-hidden mt-4 rounded-xl border border-gray-700 shadow-xl">
        <div className="h-full overflow-y-auto">
          <table className={`table w-full ${TEXT_COLOR}`}>
            <thead className="sticky top-0 z-10">
              <tr className={`${TABLE_HEADER_BG} ${TEXT_COLOR} font-bold`}>
                <th className="py-3 px-4 text-left">Date/Time</th>
                <th className="py-3 px-4 text-left">Patient</th>
                <th className="py-3 px-4 text-left">Service</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.$id}
                  className="border-b border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  <td className="py-3 px-4 text-sm">
                    {new Date(t.date).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {t.patientName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {t.serviceName}
                  </td>
                  <td className="py-3 px-4 text-sm">{t.paymentType}</td>
                  <td className="py-3 px-4 text-right font-bold text-lg text-amber-300">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDeleteTransaction(t.$id)}
                      className="bg-red-600 hover:bg-red-700 text-white btn-xs p-2 rounded-lg transition"
                      title="Delete Transaction"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-gray-400 text-lg"
                  >
                    No transactions found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Filtered Total Summary Row */}
            {/* This block is commented out, removing the HTML comments to ensure no rendering side effects */}
            {/* {filteredTotal > 0 && (
              <tfoot>
                <tr className={`${HEADER_BG} font-extrabold text-white`}>
                  <td colSpan={4} className="py-4 px-4 text-right text-lg">
                    TOTAL REVENUE ({startDate} to {endDate}):
                  </td>
                  <td className="py-4 px-4 text-right text-xl font-extrabold text-amber-400">
                    {formatCurrency(filteredTotal)}
                  </td>
                  <td className="py-4 px-4"></td>
                </tr>
              </tfoot>
            )} */}
          </table>
        </div>
      </div>

      {/* ✅ Modal (Centering Fix Confirmed) */}
      {showModal && (
        <dialog
          // This combination of Tailwind classes ensures the modal is centered
          // fixed: makes it relative to the viewport
          // inset-0: ensures it spans the entire screen (top:0, right:0, bottom:0, left:0)
          // flex items-center justify-center: uses flexbox to center its child (the modal content)
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm w-full h-full"
        >
          <div
            className={`${HEADER_BG} p-6 rounded-xl w-full max-w-sm border border-gray-700 shadow-2xl`}
          >
            <h3 className={`font-bold text-xl mb-4 ${ACCENT_TEXT}`}>
              New Transaction
            </h3>

            <div className="grid gap-3">
              <input
                type="text"
                name="patientName"
                placeholder="Patient Name"
                className={`bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-amber-400 focus:border-amber-400`}
                value={form.patientName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="serviceName"
                placeholder="Service"
                className={`bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-amber-400 focus:border-amber-400`}
                value={form.serviceName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="subServiceName"
                placeholder="Sub-Service (Optional)"
                className={`bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-amber-400 focus:border-amber-400`}
                value={form.subServiceName}
                onChange={handleChange}
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                className={`bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-amber-400 focus:border-amber-400`}
                value={form.amount}
                onChange={handleChange}
              />
              <select
                name="paymentType"
                className={`bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-amber-400 focus:border-amber-400 appearance-none`}
                value={form.paymentType}
                onChange={handleChange}
              >
                <option value="One-time">One-time</option>
                <option value="Installment">Installment</option>
              </select>
              <input
                type="datetime-local"
                name="date"
                className={`bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-amber-400 focus:border-amber-400`}
                value={form.date}
                onChange={handleChange}
              />
              <textarea
                name="remarks"
                placeholder="Remarks (Optional)"
                className={`bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-amber-400 focus:border-amber-400`}
                value={form.remarks}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg px-4 py-2 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${ACCENT_BG} text-gray-950 hover:bg-amber-500 font-bold rounded-lg px-4 py-2 transition`}
                onClick={handleSaveTransaction}
              >
                Save Transaction
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
