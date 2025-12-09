import { BASE_PATH } from "./Config";

export const resolveAssetPath = (src) => {
  // Remove leading slash from src if it exists
  const cleanSrc = src.startsWith("/") ? src.slice(1) : src;

  // Ensure BASE_PATH ends with a slash
  const base = BASE_PATH.endsWith("/") ? BASE_PATH : BASE_PATH + "/";

  return base + cleanSrc;
};