import { ComponentProps, VFC } from 'react';

import './progressBar.css';

type ProgressBarProps = {
  value: ComponentProps<'progress'>['value'];
  max?: number;
};

export const ProgressBar: VFC<ProgressBarProps> = ({ value, max = 100 }) => (
  <div className="progress-wrapper">
    <p className="progress-status">progress: {value}%</p>
    <progress className="progress-bar" max={max} value={value} />
  </div>
);
