import * as startOrResumeUploadObject from "../../useTus/utils/startOrResumeUpload";

export const createConsoleErrorMock = () => {
  const consoleMock = jest.spyOn(console, "error");
  consoleMock.mockImplementation(() => undefined);

  return consoleMock;
};

export const insertEnvValue = (value: NodeJS.Process["env"]) => {
  window.process = {
    ...window.process,
    env: {
      ...window.process.env,
      ...value,
    },
  };
};

export const startOrResumeUploadMock = jest
  .spyOn(startOrResumeUploadObject, "startOrResumeUpload")
  .mockImplementationOnce(() => jest.fn());
