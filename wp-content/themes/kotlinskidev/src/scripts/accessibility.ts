import { createAccessibilityUtils } from "./accessibility/accessibility-utils";
import { syncMotionPreferenceWithSystem } from "./accessibility/motion-preference";
import { startVideoController } from "./accessibility/reduced-motion-video-controller";
import { initSubmenuToggles } from "./accessibility/submenu-toggles";

initSubmenuToggles();

const getVideoController = startVideoController();

syncMotionPreferenceWithSystem();

window.accessibilityUtils = createAccessibilityUtils(getVideoController);
