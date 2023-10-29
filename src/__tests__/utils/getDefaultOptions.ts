import { Upload } from "tus-js-client";

export const getDefaultOptions: () => Upload["options"] = () => ({
  endpoint: "",
  uploadUrl: "",
  metadata: {
    filetype: "text/plain",
  },
});
