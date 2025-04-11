export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const waitFor = async (condition: () => boolean, timeoutAfter = 5000, interval = 50) => {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeoutAfter) {
      return false;
    }

    await wait(interval);
  }

  return true;
};
