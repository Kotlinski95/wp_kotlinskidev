import { PLEIADES_STAR_CATALOG_SHADER } from "./pleiades-star-catalog";
import { PLEIADES_DUST_AND_MILKY_WAY_SHADER } from "./pleiades-dust-and-milky-way";
import { PLEIADES_BACKGROUND_STARS_AND_MAIN_SHADER } from "./pleiades-background-stars-and-main";

export const PLEIADES_FRAGMENT_SHADER =
  PLEIADES_STAR_CATALOG_SHADER +
  PLEIADES_DUST_AND_MILKY_WAY_SHADER +
  PLEIADES_BACKGROUND_STARS_AND_MAIN_SHADER;
