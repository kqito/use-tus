import type { VFC } from 'react';

export const LoadingCircle: VFC = () => (
  <div className="relative block w-20 h-5 loader-dots">
    <i className="absolute top-0 w-3 h-3 mt-1 bg-blue-300 rounded-full left-2 animate-loader1 ease-loading" />
    <i className="absolute top-0 w-3 h-3 mt-1 bg-blue-300 rounded-full left-2 animate-loader2 ease-loading" />
    <i className="absolute top-0 w-3 h-3 mt-1 bg-blue-300 rounded-full left-8 animate-loader2 ease-loading" />
    <i className="absolute top-0 w-3 h-3 mt-1 bg-blue-300 rounded-full left-14 animate-loader3 ease-loading" />
  </div>
);
