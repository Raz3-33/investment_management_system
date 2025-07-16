import clsx from "clsx";

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const maxButtons = 5;
    const pages = [];

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3 px-4 py-4 border-t border-gray-200 dark:border-white/[0.05]">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full px-3 py-1 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]"
      >
        Prev
      </button>

      {/* Page Numbers */}
      <div className="flex space-x-2">
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              "inline-flex items-center justify-center px-2 rounded-sm h-5 text-xs font-medium transition-colors duration-150",
              page === currentPage
                ? "bg-violet-400 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]"
            )}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full px-3 py-1 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]"
      >
        Next
      </button>
    </div>
  );
}
