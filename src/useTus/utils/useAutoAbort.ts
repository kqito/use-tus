import { useEffect } from "react";
import { Upload } from "tus-js-client";

export const useAutoAbort = (
  upload: Upload | undefined,
  autoAbort: boolean
) => {
  useEffect(() => {
    const abortUploading = async () => {
      if (!upload) {
        return;
      }

      await upload.abort();
    };

    return () => {
      if (!autoAbort) {
        return;
      }

      abortUploading();
    };
  }, [autoAbort, upload]);
};
