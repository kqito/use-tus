import { VFC } from "react";

type ProgressBarProps = {
  title?: string;
  value?: number;
};

export const ProgressBar: VFC<ProgressBarProps> = ({ value = 0, title }) => (
  <div className="relative w-full">
    {title && (
      <div className="w-full h-6 absolute flex items-center justify-center">
        <span className="text-white">{title}</span>
      </div>
    )}
    <div className="flex h-6 overflow-hidden text-xs bg-blue-300 rounded-full">
      <div
        style={{ width: `${value}%` }}
        className="flex flex-col justify-center text-center text-white bg-blue-500 shadow-none whitespace-nowrap transition"
      />
    </div>
  </div>
);
