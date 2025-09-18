import { useEffect, useMemo, useState } from "react";
import { useNotificationsStore } from "../../store/notifications.store";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authentication"; // <-- must expose { user }

const ALL_TABS = ["legal", "finance", "admin"];

export default function NotificationsPage() {
  const { user } = useAuthStore(); // expects: user?.isAdmin, user?.role?.name
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine allowed tabs for this user
  const { allowedTabs, isAdmin } = useMemo(() => {
    console.log(user,"==============0=-0=-0=-0=-0=-0=-0");
    
    const admin = !!user?.isAdmin;
    if (admin) return { allowedTabs: [...ALL_TABS], isAdmin: true };

    const userRole = (user?.role?.name || "").toLowerCase();
    if (userRole === "legal") return { allowedTabs: ["legal"], isAdmin: false };
    if (userRole === "finance")
      return { allowedTabs: ["finance"], isAdmin: false };

    // Fallback: no recognized role -> show nothing (or only legal if you prefer)
    return { allowedTabs: [], isAdmin: false };
  }, [user]);

  // Role coming from URL, but clamp it to what's allowed
  const initialRoleParam =
    searchParams.get("role") || (allowedTabs[0] ?? "legal");
  const initialRole = ALL_TABS.includes(initialRoleParam)
    ? initialRoleParam
    : allowedTabs[0] ?? "legal";

  const [role, setRole] = useState(initialRoleParam);
  const [status, setStatus] = useState("pending");

  // If URL (or reload) picks a disallowed role, snap to first allowed
  useEffect(() => {
    if (!allowedTabs.includes(role) && allowedTabs.length > 0) {
      setRole(allowedTabs[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedTabs.join("|")]);

  const { lists, fetchList, summaries, fetchSummary } = useNotificationsStore();
  const data = lists?.[role] || { items: [], cursor: null, hasMore: false };

  // Fetch summary + list whenever role/status changes
  useEffect(() => {
    if (allowedTabs.includes(role)) {
      fetchSummary(role);
      fetchList(role, { status, limit: 30 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status]);

  // Keep URL in sync—but always write the clamped role
  useEffect(() => {
    if (allowedTabs.length > 0) {
      const safeRole = allowedTabs.includes(role) ? role : allowedTabs[0];
      setSearchParams({ role: safeRole, status });
    }
  }, [role, status, setSearchParams, allowedTabs]);

  // Helper to render a tab button with locking
  const TabButton = ({ r }) => {
    const allowed = allowedTabs.includes(r);
    const active = role === r;
    const base = "px-3 py-1.5 rounded-lg text-sm border transition-colors";
    const activeCls = "bg-gray-900 text-white border-gray-900";
    const inactiveCls =
      "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700";
    const lockedCls = "opacity-50 cursor-not-allowed relative";
    return (
      <button
        key={r}
        onClick={() => allowed && setRole(r)}
        disabled={!allowed}
        aria-disabled={!allowed}
        title={!allowed ? "Locked for your role" : ""}
        className={[
          base,
          active ? activeCls : inactiveCls,
          !allowed ? lockedCls : "",
        ].join(" ")}
      >
        {r[0].toUpperCase() + r.slice(1)} ({summaries?.[r]?.pending ?? 0}{" "}
        pending)
        {!allowed && (
          <span className="ml-2 text-[10px] uppercase tracking-wide">
            • Locked
          </span>
        )}
      </button>
    );
  };

  // If somehow no tabs are allowed (unexpected), show a guard
  if (allowedTabs.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
        You don’t have access to Notifications.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {ALL_TABS.map((r) => (
            <TabButton key={r} r={r} />
          ))}
        </div>
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value, "pending" | "all")}
            className="px-2 py-1 text-sm border rounded-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          >
            <option value="pending">Pending</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Message</th>
              <th className="text-left px-4 py-2">Severity</th>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((n) => (
              <tr
                key={n.id + n.type}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="px-4 py-2 font-medium">{n.title}</td>
                <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                  {n.message}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs
                    ${
                      n.severity === "critical"
                        ? "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300"
                        : n.severity === "warning"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-200"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-200"
                    }`}
                  >
                    {n.severity}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(n.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <a
                    className="text-blue-600 hover:underline"
                    href={`/booking_details_management/${n.entityId}`}
                  >
                    Open
                  </a>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {data.hasMore && (
          <div className="p-3 flex justify-center">
            <button
              onClick={() =>
                fetchList(role, { status, limit: 30, cursor: data.cursor })
              }
              className="px-3 py-1.5 text-sm rounded-md border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
