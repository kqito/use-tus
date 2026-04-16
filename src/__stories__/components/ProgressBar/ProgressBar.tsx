import { FC } from "react";

type ProgressBarProps = {
  title?: string;
  value?: number;
};

export const ProgressBar: FC<ProgressBarProps> = ({ value = 0, title }) => (
  <div className="w-full space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        Progress
      </span>
      {title && (
        <span className="text-xs font-semibold text-indigo-600">{title}</span>
      )}
    </div>
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div
        style={{ width: `${value}%` }}
        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
      />
    </div>
  </div>
);
