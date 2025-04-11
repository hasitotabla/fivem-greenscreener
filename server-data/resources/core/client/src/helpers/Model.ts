import { waitFor } from "@shared/index";

export const requestModel = async (model: string | number) => {
  let hash = 0;
  if (typeof model === "string") {
    hash = GetHashKey(model);
  } else {
    hash = model;
  }

  RequestModel(hash);
  await waitFor(() => HasModelLoaded(hash));

  return hash;
};
