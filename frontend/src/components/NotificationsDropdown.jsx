import { useEffect, useState, useMemo } from "react";
import { useNotificationsStore } from "../store/notifications.store";
import { useAuthStore } from "../store/authentication"; // must expose { user }

const ALL_TABS = [
  { key: "legal", label: "Legal" },
  { key: "finance", label: "Finance" },
  { key: "admin", label: "Admin" },
];

export default function NotificationsDropdown({ align = "right" }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore(); // expects: user?.isAdmin and user?.role?.name

  // Allowed tabs based on user
  const allowedTabs = useMemo(() => {
    if (user?.isAdmin) return ["legal", "finance", "admin"];
    const roleName = (user?.role?.name || "").toLowerCase();
    if (roleName === "legal") return ["legal"];
    if (roleName === "finance") return ["finance"];
    return [];
  }, [user]);

  // Active tab clamped to first allowed
  const [tab, setTab] = useState(allowedTabs[0] || "legal");

  useEffect(() => {
    if (!allowedTabs.includes(tab) && allowedTabs.length > 0) {
      setTab(allowedTabs[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedTabs.join("|")]);

  const { summaries, lists, fetchSummary, fetchList, loading } = useNotificationsStore();

  // Initial fetch: summaries only for allowed, list for current tab
  useEffect(() => {
    if (allowedTabs.length === 0) return;
    allowedTabs.forEach((r) => fetchSummary(r));
    fetchList(allowedTabs.includes(tab) ? tab : allowedTabs[0], { status: "pending", limit: 6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On tab change
  useEffect(() => {
    if (allowedTabs.includes(tab)) {
      fetchList(tab, { status: "pending", limit: 6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, allowedTabs.join("|")]);

  const badgeFor = (role) => (summaries?.[role]?.pending ?? 0);
  const items = useMemo(
    () => (allowedTabs.includes(tab) ? (lists?.[tab]?.items ?? []) : []),
    [lists, tab, allowedTabs]
  );

  const anyPending = allowedTabs.reduce((sum, r) => sum + (summaries?.[r]?.pending ?? 0), 0) > 0;

  const TabButton = ({ t }) => {
    const allowed = allowedTabs.includes(t.key);
    const active = tab === t.key;
    const base = "flex-1 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800";
    const activeCls = "text-gray-900 dark:text-white";
    const inactiveCls = "text-gray-600 dark:text-gray-300";
    const lockedCls = "opacity-50 cursor-not-allowed";

    return (
      <button
        className={[base, active ? activeCls : inactiveCls, !allowed ? lockedCls : ""].join(" ")}
        onClick={() => allowed && setTab(t.key)}
        disabled={!allowed}
        aria-disabled={!allowed}
        title={!allowed ? "Locked for your role" : ""}
      >
        <div className="flex items-center justify-center gap-2">
          <span>{t.label}</span>
          {allowed && badgeFor(t.key) > 0 && (
            <span className="inline-flex px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300">
              {badgeFor(t.key)}
            </span>
          )}
          {!allowed && (
            <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              Locked
            </span>
          )}
        </div>
      </button>
    );
  };

  if (allowedTabs.length === 0) {
    return (
      <div className="relative">
        <button
          className="relative w-8 h-8 flex items-center justify-center rounded-full"
          disabled
          title="No notification access"
        >
          <span className="sr-only">Notifications</span>
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 24a2.6 2.6 0 0 0 2.6-2.4H9.4A2.6 2.6 0 0 0 12 24Zm7.8-6v-5.4c0-3.6-2.1-6.6-5.4-7.4V4a2.4 2.4 0 0 0-4.8 0v1.2C6.3 6 4.2 9 4.2 12.6V18l-2.4 2.4V21h20.4v-.6L19.8 18Z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        className="relative w-8 h-8 flex items-center justify-center hover:bg-gray-100 lg:hover:bg-gray-200 dark:hover:bg-gray-700/50 dark:lg:hover:bg-gray-800 rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <span className="sr-only">Notifications</span>
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 24a2.6 2.6 0 0 0 2.6-2.4H9.4A2.6 2.6 0 0 0 12 24Zm7.8-6v-5.4c0-3.6-2.1-6.6-5.4-7.4V4a2.4 2.4 0 0 0-4.8 0v1.2C6.3 6 4.2 9 4.2 12.6V18l-2.4 2.4V21h20.4v-.6L19.8 18Z" />
        </svg>
        {anyPending && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-[380px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl overflow-hidden z-40`}
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {ALL_TABS.map((t) => (
              <TabButton key={t.key} t={t} />
            ))}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-auto divide-y divide-gray-100 dark:divide-gray-800">
            {loading && <div className="p-4 text-sm text-gray-500">Loading…</div>}
            {!loading && items.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No pending items.</div>
            )}
            {items.map((n) => (
              <div key={n.id + n.type} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1 w-2 h-2 rounded-full ${
                      n.severity === "critical"
                        ? "bg-red-500"
                        : n.severity === "warning"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {n.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{n.message}</div>
                    {n.meta?.investorName && (
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        Investor: {n.meta.investorName}
                        {n.meta?.phone ? ` · ${n.meta.phone}` : ""}
                      </div>
                    )}
                    <div className="mt-1 text-[11px] text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <a
                    href={`/booking_details_management/${n.entityId}`}
                    className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-2 flex justify-end">
            <a
              href={`/notifications?role=${tab}`}
              className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              View all
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
