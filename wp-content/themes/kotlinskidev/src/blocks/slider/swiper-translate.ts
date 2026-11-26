import type Swiper from "swiper";

export interface SwiperWithTranslateControl {
  wrapperEl: HTMLElement;
  animating: boolean;
  snapGrid: number[];
  setTransition: (duration: number) => void;
  setTranslate: (translate: number) => void;
}

const MATRIX_3D_TRANSLATE_X_INDEX = 12;
const MATRIX_2D_TRANSLATE_X_INDEX = 4;

const parseMatrixValues = (matrixSource: string): number[] =>
  matrixSource.split(",").map((value) => Number.parseFloat(value.trim()));

export function asTranslateControl(swiper: Swiper): SwiperWithTranslateControl {
  return swiper as unknown as SwiperWithTranslateControl;
}

export function readTranslateXAcceptingWebKitMatrix3d(el: HTMLElement): number {
  const transform = getComputedStyle(el).transform;
  if (!transform || transform === "none") {
    return 0;
  }
  const matrix3d = transform.match(/matrix3d\(([^)]+)\)/);
  if (matrix3d) {
    return parseMatrixValues(matrix3d[1])[MATRIX_3D_TRANSLATE_X_INDEX] ?? 0;
  }
  const matrix2d = transform.match(/matrix\(([^)]+)\)/);
  if (!matrix2d) {
    return 0;
  }
  return parseMatrixValues(matrix2d[1])[MATRIX_2D_TRANSLATE_X_INDEX] ?? 0;
}

export function freezeAtCurrentPosition(swiper: Swiper): number {
  const controllable = asTranslateControl(swiper);
  if (!controllable.wrapperEl) {
    return 0;
  }
  const currentTranslateX = readTranslateXAcceptingWebKitMatrix3d(controllable.wrapperEl);
  controllable.setTransition(0);
  controllable.setTranslate(currentTranslateX);
  controllable.animating = false;
  return currentTranslateX;
}
