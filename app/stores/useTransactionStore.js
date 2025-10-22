import { create } from "zustand";
import { persist } from "zustand/middleware";
import { databases, ID } from "../lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID;
const TRANSACTIONS_COLLECTION_ID = "transactions";

export const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      loading: false,
      filteredTotal: 0,

      // ✅ Add Transaction
      addTransaction: async (data) => {
        try {
          const res = await databases.createDocument(
            DATABASE_ID,
            TRANSACTIONS_COLLECTION_ID,
            ID.unique(), // ✅ Auto ID like Appwrite UI
            data
          );

          // ✅ Add new record to local store
          set((state) => ({
            transactions: [res, ...state.transactions],
          }));

          return { success: true, data: res };
        } catch (error) {
          console.error("Error adding transaction:", error);
          return { success: false, error };
        }
      },

      // 🚀 DELETE TRANSACTION FUNCTION
      deleteTransaction: async (transactionId) => {
        try {
          // 1. Call Appwrite API to delete the document
          await databases.deleteDocument(
            DATABASE_ID,
            TRANSACTIONS_COLLECTION_ID,
            transactionId
          );

          // 2. Update local state: remove the transaction from the array
          set((state) => {
            // Calculate new total based on the documents *currently* in the store
            const newTransactions = state.transactions.filter(
              (t) => t.$id !== transactionId
            );

            // Re-calculate the filtered total (if the deleted item was part of the filtered view)
            const newFilteredTotal = newTransactions.reduce(
              (sum, t) => sum + t.amount,
              0
            );

            return {
              transactions: newTransactions,
              // Update filteredTotal only if it makes sense for your UI flow.
              // Since 'transactions' is also used for the filtered list, this should work.
              filteredTotal: newFilteredTotal,
            };
          });

          return { success: true };
        } catch (error) {
          console.error(`Error deleting transaction ${transactionId}:`, error);
          return { success: false, error };
        }
      },

      // ✅ Fetch all
      fetchTransactions: async () => {
        set({ loading: true });
        try {
          const res = await databases.listDocuments(
            DATABASE_ID,
            TRANSACTIONS_COLLECTION_ID,
            [Query.limit(1000)]
          );
          set({ transactions: res.documents });
        } catch (error) {
          console.error("Error fetching transactions:", error);
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Filter by date
      filterByDate: async (startDate, endDate) => {
        if (!startDate || !endDate) return;

        try {
          const res = await databases.listDocuments(
            DATABASE_ID,
            TRANSACTIONS_COLLECTION_ID,
            [
              Query.greaterThanEqual("date", new Date(startDate).toISOString()),
              Query.lessThanEqual("date", new Date(endDate).toISOString()),
            ]
          );

          const docs = res.documents;
          const total = docs.reduce((sum, t) => sum + t.amount, 0);

          set({ transactions: docs, filteredTotal: total });
        } catch (error) {
          console.error("Error filtering transactions:", error);
        }
      },
    }),
    {
      name: "transactions-store",
    }
  )
);
