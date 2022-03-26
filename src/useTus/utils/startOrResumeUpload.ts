import { Upload } from "tus-js-client";

export const startOrResumeUpload = (upload: Upload): void => {
  upload.findPreviousUploads().then((previousUploads) => {
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }

    upload.start();
  });
};
