import { FC } from "react";
import Counter from "../Counter/Counter";

type ProgressBarProps = {
  value?: number;
};

export const ProgressBar: FC<ProgressBarProps> = ({ value = 0 }) => (
  <div className="w-full space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Progress</span>
      <span className="flex items-baseline gap-0.5 text-xs font-semibold text-indigo-600">
        <Counter
          value={Math.round(value)}
          fontSize={12}
          padding={2}
          gap={0}
          horizontalPadding={0}
          borderRadius={0}
          gradientHeight={2}
          gradientFrom="white"
          gradientTo="transparent"
          textColor="#4F46E5"
          fontWeight="600"
          places={value >= 100 ? [100, 10, 1] : value >= 10 ? [10, 1] : [1]}
        />
        <span>%</span>
      </span>
    </div>
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <div
        style={{ width: `${value}%` }}
        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
      />
    </div>
  </div>
);
