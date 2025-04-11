import { wait, type Vector3 } from "@shared/index";
import { requestModel } from "./Model";

export const spawnPlayer = async (model: string, position: Vector3, heading: number) => {
  await requestModel(model);

  FreezeEntityPosition(PlayerPedId(), true);

  NetworkResurrectLocalPlayer(position[0], position[1], position[2], heading, 1, false);
  SetEntityCoordsNoOffset(PlayerPedId(), position[0], position[1], position[2], false, false, false);
  SetEntityHeading(PlayerPedId(), heading);
  SetEntityVisible(PlayerPedId(), true, true);
  SetEntityCollision(PlayerPedId(), true, true);

  await wait(0);

  FreezeEntityPosition(PlayerPedId(), false);
};
