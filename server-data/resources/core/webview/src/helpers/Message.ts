import config from "$/config.json";

type Unsubscriber = () => void;

const eventHandlers: Record<string, Function> = {};

export const onEvent = <T = any>(name: string, handler: (data: T) => void): Unsubscriber => {
  if (eventHandlers[name]) {
    throw new Error(`Event handler already exists with name: ${name}`);
  }

  console.log(`Registering event handler: ${name}`);
  eventHandlers[name] = handler;

  return () => {
    delete eventHandlers[name];
  };
};

export const emitServer = (action: string, data = {}) => {
  fetch(`http://127.0.0.1:${config.webserver.port}/onAction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      data,
    }),
  });
};

window.addEventListener("message", (event) => {
  const { eventName, body } = event.data;
  if (!eventName) {
    return;
  }

  const handler = eventHandlers[eventName];
  if (!handler) {
    return;
  }

  handler(body ?? {});
});
