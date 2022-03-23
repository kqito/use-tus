import { useCallback } from "react";
import { useTusClientDispatch, useTusClientState } from "../core/contexts";
import { resetClient, removeUploadInstance } from "../core/tucClientActions";

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
