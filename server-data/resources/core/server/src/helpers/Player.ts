import type { INetEvents } from "@shared/types/NetEvents";

export const getProcessingPlayer = () => getPlayers().at(0);

export const emitClient = <E extends keyof INetEvents>(eventName: E, player: string | number, data: Parameters<INetEvents[E]>[0]) => {
  TriggerClientEvent(eventName, player, data);
};
