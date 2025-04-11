import { fastify, type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import { BaseEventProvider } from "./BaseEvent";

import config from "../../../../config.json";

export class WebEventProvider extends BaseEventProvider {
  constructor(private webServer: FastifyInstance = fastify(config.webserver.settings)) {
    super();

    this.webServer.post("/onAction", this.onRequest.bind(this));
    this.webServer.listen({ port: config.webserver.port });
  }

  override destroy(): void {
    this.webServer.close();
    super.destroy();
  }

  private onRequest(req: FastifyRequest, res: FastifyReply) {
    const { action, data } = req.body as any;
    if (!action) {
      return res.status(400).send({ error: "Invalid action" });
    }

    if (!data) {
      return res.status(400).send({ error: "Invalid data" });
    }

    this.emit(action, data);
    return res.send({ success: true });
  }
}
