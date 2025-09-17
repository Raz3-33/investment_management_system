import { useEffect, useState } from "react";
import { useNotificationsStore } from "../../store/notifications.store";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "legal";
  const [role, setRole] = useState(initialRole);
  const [status, setStatus] = useState("pending");

  const { lists, fetchList, summaries, fetchSummary } = useNotificationsStore();
  const data = lists?.[role] || { items: [], cursor: null, hasMore: false };

  useEffect(() => {
    fetchSummary(role);
    fetchList(role, { status, limit: 30 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, status]);

   useEffect(() => {
   setSearchParams({ role, status });
  }, [role, status, setSearchParams]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {["legal", "finance", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-lg text-sm border
              ${
                role === r
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700"
              }`}
            >
              {r[0].toUpperCase() + r.slice(1)} ({summaries?.[r]?.pending ?? 0}{" "}
              pending)
            </button>
          ))}
        </div>
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
