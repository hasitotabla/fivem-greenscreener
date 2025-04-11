export const emitWebView = (eventName: string, data = {}) => {
  SendNUIMessage({
    eventName,
    data,
  });
};
