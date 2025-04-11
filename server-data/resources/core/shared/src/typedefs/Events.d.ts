import { INetworkEvents } from "../types/Events";

declare module "@citizenfx/server" {
  export function TriggerClientEvent(eventgeci: string, target: string, ...args: any[]): void;
}
