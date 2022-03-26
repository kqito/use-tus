import { useCallback } from "react";
import {
  useTusClientState,
  useTusClientDispatch,
} from "../TusClientProvider/store/contexts";
import {
  removeUploadInstance,
  resetClient,
} from "../TusClientProvider/store/tucClientActions";

export const useTusClient = () => {
  const tusClientState = useTusClientState();
  const tusClientDispatch = useTusClientDispatch();

  const state = tusClientState.uploads;
  const removeUpload = useCallback(
    (cacheKey: string) => {
      tusClientDispatch(removeUploadInstance(cacheKey));
    },
    [tusClientDispatch]
  );
  const reset = useCallback(() => tusClientDispatch(resetClient()), [
    tusClientDispatch,
  ]);

  return {
    state,
    removeUpload,
    reset,
  };
};
