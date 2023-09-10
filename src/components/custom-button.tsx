import React from "react";

type ButtonProps = {
  small?: boolean;
  grey?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  small = false,
  grey = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const sizeClasses = small ? "px-2 py-1" : "px-4 py-2 font-bold"; // Corrected sizeClasses
  const colorClasses = grey
    ? "bg-gray-400 hover:bg-gray-300 focus-visible:bg-gray-300"
    : "bg-blue-500 hover:bg-blue-400 focus-visible:bg-blue-400";
  return (
    <button
      className={`${sizeClasses} ${colorClasses} ${className} rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50`}
      {...props}
    >
      {children}
    </button>
  );
}
