import { useMemo } from 'react';
import { defaultUseTusOptionsValue } from '../options';
import { UseTusOptions } from '../types';

export const useMergeTusOptions = (options: UseTusOptions | undefined) =>
  useMemo(
    () => ({
      ...defaultUseTusOptionsValue,
      ...(options || {}),
    }),
    [options]
  );
