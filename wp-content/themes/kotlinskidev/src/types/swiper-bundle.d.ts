// Type shim for swiper/bundle — enables IDE type resolution with moduleResolution: node.
// Webpack v5 resolves the actual bundle at build time via the package.json exports field.
declare module 'swiper/bundle' {
  export { default } from 'swiper';
  export { Swiper } from 'swiper';
}
