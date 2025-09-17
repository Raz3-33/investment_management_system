import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";

/**
 * Roles supported: 'legal' | 'finance' | 'admin'
 * Back-end endpoints:
 *  - GET /notifications/summary?role=legal|finance|admin
 *  - GET /notifications/list?role=...&status=pending|all&limit=20&cursor=...
 * Item shape (from API):
 *  {
 *    id, // personalDetailsId or generated
 *    role: 'legal'|'finance'|'admin',
 *    type, // e.g. 'PAN_PENDING_APPROVAL'
 *    title, // short heading
 *    message, // human readable
 *    entityId, // personalDetailsId
 *    severity: 'info'|'warning'|'critical',
 *    createdAt, // ISO
 *    meta: {...} // optional extra fields
 *  }
 */

export const useNotificationsStore = create(
  persist(
    (set, get) => ({
      summaries: {
        legal: { pending: 0, added: 0, total: 0, updatedAt: null },
        finance: { pending: 0, added: 0, total: 0, updatedAt: null },
        admin: { pending: 0, added: 0, total: 0, updatedAt: null },
      },
      lists: {
        legal: { items: [], cursor: null, hasMore: false },
        finance: { items: [], cursor: null, hasMore: false },
        admin: { items: [], cursor: null, hasMore: false },
      },
      loading: false,
      error: null,

      _headers() {
        const token =
          localStorage.getItem("token") ??
          JSON.parse(localStorage.getItem("token"));
        return { authorization: `Bearer ${token}` };
      },

      async fetchSummary(role) {
        set({ loading: true, error: null });
        try {
          const res = await api.get(`/notifications/summary`, {
            params: { role },
            headers: get()._headers(),
          });
          const data = res?.data?.data ?? {};
          set((s) => ({
            summaries: {
              ...s.summaries,
              [role]: {
                pending: data.pending ?? 0,
                added: data.added ?? 0,
                total: data.total ?? 0,
                updatedAt: new Date().toISOString(),
              },
            },
            loading: false,
          }));
        } catch (e) {
          set({ error: e.response?.data?.message || "Failed to fetch summary", loading: false });
        }
      },

      async fetchList(role, { status = "pending", limit = 20, cursor = null } = {}) {
        set({ loading: true, error: null });
        try {
          const res = await api.get(`/notifications/list`, {
            params: { role, status, limit, cursor },
            headers: get()._headers(),
          });
          const { items = [], nextCursor = null, hasMore = false } = res?.data?.data ?? {};
          set((s) => ({
            lists: {
              ...s.lists,
              [role]: {
                items: cursor ? [...s.lists[role].items, ...items] : items,
                cursor: nextCursor,
                hasMore,
              },
            },
            loading: false,
          }));
        } catch (e) {
          set({ error: e.response?.data?.message || "Failed to fetch list", loading: false });
        }
      },

      // Optional: optimistic marking as seen on client (no persistence)
      markLocalSeen(role, id) {
        set((s) => ({
          lists: {
            ...s.lists,
            [role]: {
              ...s.lists[role],
              items: s.lists[role].items.map((it) =>
                it.id === id ? { ...it, seen: true } : it
              ),
            },
          },
        }));
      },
    }),
    {
      name: "notifications-store",
      partialize: (s) => ({ summaries: s.summaries, lists: s.lists }),
    }
  )
);
