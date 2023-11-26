import { TusHooksUploadOptions } from "../../types";

export const getDefaultOptions: () => TusHooksUploadOptions = () => ({
  endpoint: "",
  uploadUrl: "",
  metadata: {
    filetype: "text/plain",
  },
});
