import type { FC } from "react";

export const LoadingCircle: FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    <span className="text-sm font-medium text-gray-500">Uploading...</span>
  </div>
);
