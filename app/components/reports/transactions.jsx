"use client";

import { useEffect, useMemo, useState } from "react";
// 1. Import deleteTransaction from the store
import { useTransactionStore } from "../../stores/useTransactionStore";
import { FiDollarSign, FiFilter, FiTrash2 } from "react-icons/fi"; // Added FiTrash2
import { FaPesoSign } from "react-icons/fa6";

// PDF
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../Roboto-font";
import toast from "react-hot-toast";

export default function SalesDashboard() {
  const {
    transactions,
    fetchTransactions,
    filterByDate,
    filteredTotal,
    addTransaction,
    // 2. Destructure the new deleteTransaction action
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
    const data = {
      ...form,
      amount: Number(form.amount),
      date: new Date(form.date).toISOString(),
    };

    const res = await addTransaction(data);
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

    // Call fetchTransactions after state update
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

    // Re-fetch transactions to ensure dashboard reflects the change
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
    doc.setFontSize(16);
    doc.setFont("Roboto-font");
    doc.text("Sales Report", 14, 20);

    if (startDate && endDate) {
      doc.setFontSize(11);
      doc.text(`From: ${startDate} To: ${endDate}`, 14, 28);
    }

    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleString(),
      t.patientName,
      t.serviceName,
      t.paymentType,
      `PHP ${t.amount.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["Date", "Patient", "Service", "Type", "Amount"]],
      body: rows,
    });

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    doc.setFontSize(12);
    doc.text(
      `Total: PHP ${totalAmount.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 10
    );
    doc.save("sales_report.pdf");
  };

  // ✅ Summary Totals
  const totals = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    let todayTotal = 0,
      monthTotal = 0,
      yearTotal = 0;

    transactions.forEach((t) => {
      const d = new Date(t.date);
      // NOTE: This comparison for today total is incorrect as it includes time.
      // It should compare date only, but since t.date is ISOString from DB,
      // we'll stick with the original for now or recommend a fix.
      if (t.date.startsWith(today)) todayTotal += t.amount;

      if (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      )
        monthTotal += t.amount;
      if (d.getFullYear() === now.getFullYear()) yearTotal += t.amount;
    });

    return { today: todayTotal, month: monthTotal, year: yearTotal };
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden text-[var(--theme-bg)]">
      {/* 🔹 Header */}
      <div className="shrink-0 bg-[var(--theme-text)] p-2 z-5 rounded-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaPesoSign /> Sales Dashboard
          </h2>

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-sm bg-[var(--theme-bg)] text-black"
          >
            New Transaction
          </button>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="card bg-black border border-yellow-500/40 p-4 text-[var(--theme-bg)]">
            <h3 className="text-sm text-gray-400">Today</h3>
            <p className="text-3xl font-bold">
              ₱{totals.today.toLocaleString()}
            </p>
          </div>
          <div className="card bg-black border border-yellow-500/40 p-4 text-[var(--theme-bg)]">
            <h3 className="text-sm text-gray-400">This Month</h3>
            <p className="text-3xl font-bold">
              ₱{totals.month.toLocaleString()}
            </p>
          </div>
          <div className="card bg-black border border-yellow-500/40 p-4 text-[var(--theme-bg)]">
            <h3 className="text-sm text-gray-400">This Year</h3>
            <p className="text-3xl font-bold">
              ₱{totals.year.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center mb-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input input-sm text-black"
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input input-sm text-black"
          />
          <button
            onClick={() => filterByDate(startDate, endDate)}
            className="btn btn-sm"
          >
            <FiFilter /> Filter
          </button>
          <button
            onClick={generateReport}
            className="btn btn-sm bg-[var(--theme-bg)] text-black"
          >
            Generate Sales Report
          </button>
        </div>
      </div>

      {/* 🔹 Desktop Table */}
      <div className="hidden md:block overflow-x-auto border border-base-content/5">
        <table className="table text-[var(--theme-text)]">
          <thead>
            <tr className="bg-[var(--theme-text)] text-black sticky top-0">
              <th>Date</th>
              <th>Patient</th>
              <th>Service</th>
              <th>Type</th>
              <th>Amount</th>
              {/* 4. Add new column header */}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.$id}>
                <td>{new Date(t.date).toLocaleString()}</td>
                <td>{t.patientName}</td>
                <td>{t.serviceName}</td>
                <td>{t.paymentType}</td>
                <td>₱{t.amount.toLocaleString()}</td>
                {/* 5. Add Delete Button */}
                <td>
                  <button
                    onClick={() => handleDeleteTransaction(t.$id)}
                    className="btn btn-xs btn-error text-white"
                    title="Delete Transaction"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                {/* 6. Update colspan to 6 */}
                <td colSpan={6} className="text-center">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Modal (No changes needed here) */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box ">
            <h3 className="font-bold text-lg mb-2">New Transaction</h3>

            <div className="grid gap-2">
              <input
                type="text"
                name="patientName"
                placeholder="Patient Name"
                className="input input-sm text-black"
                value={form.patientName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="serviceName"
                placeholder="Service"
                className="input input-sm text-black"
                value={form.serviceName}
                onChange={handleChange}
              />
              <input
                type="text"
                name="subServiceName"
                placeholder="Sub-Service"
                className="input input-sm text-black"
                value={form.subServiceName}
                onChange={handleChange}
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                className="input input-sm text-black"
                value={form.amount}
                onChange={handleChange}
              />
              <select
                name="paymentType"
                className="select select-sm text-black"
                value={form.paymentType}
                onChange={handleChange}
              >
                <option value="One-time">One-time</option>
                <option value="Installment">Installment</option>
              </select>
              <input
                type="datetime-local"
                name="date"
                className="input input-sm text-black"
                value={form.date}
                onChange={handleChange}
              />
              <textarea
                name="remarks"
                placeholder="Remarks"
                className="textarea textarea-sm text-black"
                value={form.remarks}
                onChange={handleChange}
              />
            </div>

            <div className="modal-action">
              <button
                className="btn btn-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-success"
                onClick={handleSaveTransaction}
              >
                Save
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
