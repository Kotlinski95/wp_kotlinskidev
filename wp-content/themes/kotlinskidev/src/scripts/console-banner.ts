import { logBannerFrame } from "./console-banner/banner-sections";
import {
  CONNECT_STYLE,
  SUBTITLE_STYLE,
  TIP_STYLE,
  TITLE_STYLE,
} from "./console-banner/banner-styles";
import { scheduleLoadTimeLog } from "./console-banner/load-time";
import { logStyled } from "./console-banner/styled-log";

export const logConsoleBanner = (): void => {
  logStyled("🚀 Welcome to KotlinskiDev!", TITLE_STYLE);
  logStyled("📚 Developer Guide & Site Information", SUBTITLE_STYLE);
  logBannerFrame();
  logStyled("💡 Tip: Open DevTools → Sources to explore the codebase!", TIP_STYLE);
  logStyled("🌐 Want to connect? Check out the footer for social links!", CONNECT_STYLE);
  scheduleLoadTimeLog();
};
