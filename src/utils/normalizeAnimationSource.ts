/**
 * Check if the value is a valid animation source that can be passed to Lottie
 * @param source
 */
import { AnimationConfigWithData, AnimationConfigWithPath } from "lottie-web";

const normalizeAnimationSource = (
  source: unknown,
):
  | Pick<AnimationConfigWithData, "animationData">
  | Pick<AnimationConfigWithPath, "path">
  | null => {
  // If JSON file
  if (source && typeof source === "string" && source.endsWith(".json")) {
    return { path: source };
  }

  // If object
  if (source && typeof source === "object") {
    return { animationData: source };
  }

  return null;
};

export default normalizeAnimationSource;
