// IDE-only type shim — webpack resolves the real bundle via package.json exports at build time.
declare module "swiper/bundle" {
  export { default } from "swiper";
  export { Swiper } from "swiper";
}
