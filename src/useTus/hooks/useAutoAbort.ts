import { useEffect } from "react";
import { Upload } from "tus-js-client";

type UseAutoAbortParams = {
  upload: Upload | undefined;
  abort: Upload["abort"] | undefined;
  autoAbort: boolean;
};

export const useAutoAbort = ({
  upload,
  abort,
  autoAbort,
}: UseAutoAbortParams) => {
  useEffect(() => {
    const abortUploading = async () => {
      if (!upload || !abort) {
        return;
      }

      await abort();
    };

    return () => {
      if (!autoAbort) {
        return;
      }

      abortUploading();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAbort, upload]);
};
