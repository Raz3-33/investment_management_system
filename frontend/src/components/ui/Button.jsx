import clsx from "clsx";

const variantStyles = {
  primary:
    "bg-violet-400 text-white hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-white/[0.05]",
  danger:
    "text-red-500 hover:underline",
  ghost:
    "bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
};

export default function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center h-5 text-xs font-medium px-2 rounded-sm transition-colors duration-150",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
