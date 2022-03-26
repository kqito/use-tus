import { Upload } from "tus-js-client";

export const getDefaultOptions: () => Upload["options"] = () => ({
  endpoint: "http://tus.io/uploads",
  uploadUrl: "http://tus.io/files/upload",
  metadata: {
    filetype: "text/plain",
  },
});
