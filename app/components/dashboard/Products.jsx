"use client";

import { useEffect, useState, useMemo } from "react";
import { useProductStore } from "../../stores/useProductStore";
import { useCategoryStore } from "../../stores/useCategoryStore";
import { FaBoxOpen, FaPesoSign, FaTrash, FaPenToSquare } from "react-icons/fa6"; // Added FaTrash and FaPenToSquare
import { FiPlus } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

// 🎨 THEME VARIABLES FOR MODERN LOOK
const MAIN_BG = "bg-gray-950"; // Deep dark background
const ACCENT_TEXT = "text-amber-400"; // Vibrant accent color for text
const ACCENT_BG = "bg-amber-400"; // Vibrant accent color for backgrounds
const TEXT_COLOR = "text-gray-100";
const CARD_BG = "bg-gray-800"; // Card/component background

// 🔹 Modern Floating-Label Add/Edit Modal
const ProductModal = ({
  isOpen,
  onClose,
  onSave,
  productForm,
  setProductForm,
  isEditing,
  loading,
  categories,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-sm p-4">
      <div
        className={`${CARD_BG} border border-amber-500/30 ${TEXT_COLOR} p-8 rounded-3xl w-full max-w-lg shadow-2xl shadow-amber-900/40`}
      >
        <h3
          className={`text-3xl font-extrabold mb-8 text-center ${ACCENT_TEXT}`}
        >
          {isEditing ? "Edit Product" : "Add New Product"}
        </h3>

        <div className="grid grid-cols-1 gap-6">
          {/* Product Name */}
          <div className="relative">
            <input
              type="text"
              id="productName"
              placeholder=" "
              className={`peer w-full rounded-xl border border-gray-600 bg-gray-900 px-4 pt-5 pb-2 ${TEXT_COLOR} placeholder-transparent focus:outline-none focus:ring-2 focus:ring-amber-400 transition`}
              value={productForm.name}
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
            />
            <label
              htmlFor="productName"
              className={`absolute left-4 top-2 ${ACCENT_TEXT} text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:${ACCENT_TEXT} peer-focus:text-sm`}
            >
              Product Name
            </label>
          </div>

          {/* Category */}
          <div className="relative">
            <select
              id="productCategory"
              className={`peer w-full rounded-xl border border-gray-600 bg-gray-900 px-4 pt-5 pb-2 ${TEXT_COLOR} focus:outline-none focus:ring-2 focus:ring-amber-400 transition appearance-none`}
              value={productForm.category}
              onChange={(e) =>
                setProductForm({ ...productForm, category: e.target.value })
              }
            >
              <option value="" disabled className="text-gray-500">
                Select category
              </option>
              {categories.map((c) => (
                <option key={c.$id} value={c.name} className="bg-gray-800">
                  {c.name}
                </option>
              ))}
            </select>
            {/* Custom arrow for select */}
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              &#9660;
            </span>
            <label
              htmlFor="productCategory"
              className={`absolute left-4 top-2 ${ACCENT_TEXT} text-sm transition-all peer-focus:top-2 peer-focus:${ACCENT_TEXT} peer-focus:text-sm`}
            >
              Category
            </label>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-6">
            <div className="relative">
              <input
                type="number"
                id="productPrice"
                placeholder=" "
                className={`peer w-full rounded-xl border border-gray-600 bg-gray-900 px-4 pt-5 pb-2 ${TEXT_COLOR} placeholder-transparent focus:outline-none focus:ring-2 focus:ring-amber-400 transition`}
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
              />
              <FaPesoSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 peer-focus:text-amber-400 transition opacity-0 peer-placeholder-shown:opacity-100" />
              <label
                htmlFor="productPrice"
                className={`absolute left-4 top-2 ${ACCENT_TEXT} text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:${ACCENT_TEXT} peer-focus:text-sm`}
              >
                Price
              </label>
            </div>

            <div className="relative">
              <input
                type="number"
                id="productStock"
                placeholder=" "
                className={`peer w-full rounded-xl border border-gray-600 bg-gray-900 px-4 pt-5 pb-2 ${TEXT_COLOR} placeholder-transparent focus:outline-none focus:ring-2 focus:ring-amber-400 transition`}
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
              />
              <label
                htmlFor="productStock"
                className={`absolute left-4 top-2 ${ACCENT_TEXT} text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:${ACCENT_TEXT} peer-focus:text-sm`}
              >
                Stock
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-xl px-6 py-3 font-semibold shadow-md transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className={`${ACCENT_BG} text-gray-950 hover:bg-amber-500 rounded-xl px-6 py-3 font-bold shadow-lg transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Saving..." : isEditing ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// 🔹 Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm, product, loading }) => {
  if (!isOpen || !product) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
      <div
        className={`bg-gray-900 border border-red-500/50 ${TEXT_COLOR} p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl`}
      >
        <h3 className="text-xl font-bold mb-4 text-red-500">
          <FaTrash className="inline mr-2" /> Delete Product?
        </h3>
        <p className="mb-6 text-gray-300">
          Are you sure you want to delete{" "}
          <span className="font-extrabold text-amber-400">{product.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-xl px-6 py-3 font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-3 font-bold shadow-lg transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ProductsDashboard() {
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct } =
    useProductStore();

  const { categories, fetchCategories } = useCategoryStore();

  const [productForm, setProductForm] = useState({
    id: null,
    name: "",
    price: "",
    stock: "",
    category: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAddModal = () => {
    setProductForm({ id: null, name: "", price: "", stock: "", category: "" });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setProductForm({
      id: p.$id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      toast.error("Please fill out all required fields.");
      return;
    }

    // Prevent duplicate names
    if (
      products.some(
        (p) =>
          p.name.toLowerCase() === productForm.name.toLowerCase() &&
          p.$id !== productForm.id
      )
    ) {
      toast.error("Product with this name already exists!");
      return;
    }

    const payload = {
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      stock: Number(productForm.stock) || 0,
    };
    setLoading(true);

    try {
      if (isEditing) await updateProduct(productForm.id, payload);
      else await addProduct(payload);

      toast.success(
        isEditing
          ? "Product updated successfully!"
          : "Product added successfully!"
      );
      setIsModalOpen(false);
      // Reset form state
      setProductForm({
        id: null,
        name: "",
        price: "",
        stock: "",
        category: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error saving product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      await deleteProduct(selectedProduct.$id);
      toast.success("Product deleted successfully!");
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch {
      toast.error("Error deleting product.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total value
  const totalValue = useMemo(
    () => products.reduce((acc, p) => acc + p.price * p.stock, 0),
    [products]
  );

  return (
    <div
      className={`flex flex-col h-full overflow-hidden ${MAIN_BG} p-4 rounded-xl shadow-2xl`}
    >
      <Toaster position="top-right" />

      {/* 🔹 Header */}
      <div className="shrink-0 pb-4 border-b border-gray-700 mb-4">
        <h2
          className={`text-3xl font-extrabold mb-3 flex items-center gap-2 ${ACCENT_TEXT}`}
        >
          <FaBoxOpen /> Product Inventory
        </h2>

        <div className="flex justify-between items-center flex-wrap gap-4">
          <button
            onClick={openAddModal}
            className={`${ACCENT_BG} text-gray-950 hover:bg-amber-500 flex items-center gap-2 rounded-xl px-4 py-2 font-bold shadow-md transition`}
          >
            <FiPlus size={20} /> Add New Product
          </button>

          <div
            className={`font-extrabold text-lg ${TEXT_COLOR} bg-gray-800 p-3 rounded-xl shadow-inner`}
          >
            Total Inventory Value:
            <span className={`${ACCENT_TEXT} ml-2 flex items-center gap-1 `}>
              <FaPesoSign size={16} />{" "}
              {totalValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 🔹 Scrollable List */}
      <div
        className="flex-1 overflow-y-auto pr-2" // Added pr-2 for scrollbar spacing
        style={{ maxHeight: "calc(100vh - 160px)" }}
      >
        {products.length === 0 ? (
          <div className={`text-center py-12 ${TEXT_COLOR}`}>
            <FaBoxOpen size={50} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">
              No products found in the inventory.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Click "Add New Product" to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <div
                key={p.$id}
                className={`card ${CARD_BG} border border-gray-700 shadow-xl rounded-2xl p-5 hover:border-amber-400/50 transition-all duration-300`}
              >
                <h2 className={`text-xl font-bold ${ACCENT_TEXT} truncate`}>
                  {p.name}
                </h2>
                <p className="text-sm text-gray-400 mb-3 border-b border-gray-700 pb-2">
                  Category:{" "}
                  <span className="font-semibold text-gray-300">
                    {p.category}
                  </span>
                </p>

                <div className="space-y-2 text-sm">
                  {/* Price */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Unit Price:</span>
                    <span
                      className={`font-extrabold ${TEXT_COLOR} flex items-center gap-1`}
                    >
                      <FaPesoSign size={12} />{" "}
                      {p.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {/* Stock */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Stock:</span>
                    <span
                      className={`font-extrabold ${TEXT_COLOR} ${
                        p.stock <= 5 ? "text-red-400" : ""
                      }`}
                    >
                      {p.stock} pcs
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                  <span className="text-base font-bold text-gray-300">
                    Total Value:
                  </span>
                  <span
                    className={`font-extrabold text-lg ${ACCENT_TEXT} flex items-center gap-1`}
                  >
                    <FaPesoSign size={14} />{" "}
                    {(p.price * p.stock).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => openEditModal(p)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white hover:bg-blue-700 py-2 rounded-xl font-semibold transition shadow-md"
                  >
                    <FaPenToSquare size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(p);
                      setDeleteModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white hover:bg-red-700 py-2 rounded-xl font-semibold transition shadow-md"
                  >
                    <FaTrash size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔹 Modals */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        isEditing={isEditing}
        loading={loading}
        categories={categories}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        product={selectedProduct}
        loading={loading} // Pass loading to disable delete button during operation
      />
    </div>
  );
}
