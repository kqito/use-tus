export const createConsoleErrorMock = () => {
  const consoleMock = jest.spyOn(console, 'error');
  consoleMock.mockImplementation(() => undefined);
  return consoleMock;
};

export const insertEnvValue = (value: NodeJS.Process['env']) => {
  window.process = {
    ...window.process,
    env: {
      ...window.process.env,
      ...value,
    },
  };
};
