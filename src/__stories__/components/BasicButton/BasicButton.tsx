import clsx from "clsx";
import { ComponentProps, FC } from "react";

type BasicButtonProps = {
  onClick: ComponentProps<"button">["onClick"];
  title: string;
  disabled?: ComponentProps<"button">["disabled"];
  styleColor?: "primary" | "basic" | "error";
};

const colorVariants: Record<NonNullable<BasicButtonProps["styleColor"]>, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:bg-indigo-200 disabled:text-indigo-400 disabled:shadow-none",
  basic:
    "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-200 disabled:shadow-none",
  error:
    "bg-red-500 hover:bg-red-600 text-white shadow-sm disabled:bg-red-200 disabled:text-red-400 disabled:shadow-none",
};

export const BasicButton: FC<BasicButtonProps> = ({
  onClick,
  title,
  disabled,
  styleColor = "primary",
}) => (
  <button
    className={clsx(
      "py-2.5 px-5 rounded-lg font-medium text-sm transition-colors duration-150 w-full disabled:cursor-not-allowed",
      colorVariants[styleColor]
    )}
    onClick={onClick}
    type="button"
    disabled={disabled}
  >
    {title}
  </button>
);
