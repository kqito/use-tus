import { FC } from "react";

export const UploadIcon: FC = () => (
  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 border border-indigo-100 shadow-sm">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6366F1"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  </div>
);
