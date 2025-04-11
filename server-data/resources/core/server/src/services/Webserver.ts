import { fastify, type FastifyInstance } from "fastify";

import config from "../../../config.json";
import type { EventList, Events } from "../types/Events";

type Unsubscribe = () => void;

export class WebserverService {
  private hooks: { [key in EventList]?: Function[] } = {};

  constructor(private server: FastifyInstance = fastify()) {
    this.server.post("/finished", (req, res) => {});
    this.server.listen({ port: config.webserver.port });
  }

  public on<E extends keyof Events>(event: E, callback: (data: Events[E]) => void): Unsubscribe {
    if (!this.hooks[event]) {
      this.hooks[event] = [];
    }

    this.hooks[event].push(callback);

    return () => {
      if (!this.hooks?.[event]) {
        return;
      }

      this.hooks[event] = this.hooks[event].filter((hook) => hook !== callback);
    };
  }
}
