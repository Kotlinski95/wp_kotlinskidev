import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import gradientMetadata from "./layer-gradient/block.json";
import GradientEdit, { type CanvasLayerGradientAttributes } from "./layer-gradient/edit";
import noiseMetadata from "./layer-noise/block.json";
import NoiseEdit, { type CanvasLayerNoiseAttributes } from "./layer-noise/edit";
import gridLinesMetadata from "./layer-grid-lines/block.json";
import GridLinesEdit, { type CanvasLayerGridLinesAttributes } from "./layer-grid-lines/edit";
import blobMetadata from "./layer-blob/block.json";
import BlobEdit, { type CanvasLayerBlobAttributes } from "./layer-blob/edit";
import sweepMetadata from "./layer-sweep/block.json";
import SweepEdit, { type CanvasLayerSweepAttributes } from "./layer-sweep/edit";
import lightRaysMetadata from "./layer-light-rays/block.json";
import LightRaysEdit, { type CanvasLayerLightRaysAttributes } from "./layer-light-rays/edit";
import curvedRaysMetadata from "./layer-curved-rays/block.json";
import CurvedRaysEdit, { type CanvasLayerCurvedRaysAttributes } from "./layer-curved-rays/edit";
import starFieldMetadata from "./layer-star-field/block.json";
import StarFieldEdit, { type CanvasLayerStarFieldAttributes } from "./layer-star-field/edit";
import orbitTrailsMetadata from "./layer-orbit-trails/block.json";
import OrbitTrailsEdit, { type CanvasLayerOrbitTrailsAttributes } from "./layer-orbit-trails/edit";
import warpFieldMetadata from "./layer-warp-field/block.json";
import WarpFieldEdit, { type CanvasLayerWarpFieldAttributes } from "./layer-warp-field/edit";
import nebulaMetadata from "./layer-nebula/block.json";
import NebulaEdit, { type CanvasLayerNebulaAttributes } from "./layer-nebula/edit";
import auroraMetadata from "./layer-aurora/block.json";
import AuroraEdit, { type CanvasLayerAuroraAttributes } from "./layer-aurora/edit";
import neonWavesMetadata from "./layer-neon-waves/block.json";
import NeonWavesEdit, { type CanvasLayerNeonWavesAttributes } from "./layer-neon-waves/edit";
import "./controls/index";

function Save() {
  return null;
}

registerBlockType(
  gradientMetadata as unknown as BlockConfiguration<CanvasLayerGradientAttributes>,
  {
    edit: GradientEdit,
    save: Save,
  }
);

registerBlockType(noiseMetadata as unknown as BlockConfiguration<CanvasLayerNoiseAttributes>, {
  edit: NoiseEdit,
  save: Save,
});

registerBlockType(
  gridLinesMetadata as unknown as BlockConfiguration<CanvasLayerGridLinesAttributes>,
  {
    edit: GridLinesEdit,
    save: Save,
  }
);

registerBlockType(blobMetadata as unknown as BlockConfiguration<CanvasLayerBlobAttributes>, {
  edit: BlobEdit,
  save: Save,
});

registerBlockType(sweepMetadata as unknown as BlockConfiguration<CanvasLayerSweepAttributes>, {
  edit: SweepEdit,
  save: Save,
});

registerBlockType(
  lightRaysMetadata as unknown as BlockConfiguration<CanvasLayerLightRaysAttributes>,
  {
    edit: LightRaysEdit,
    save: Save,
  }
);

registerBlockType(
  curvedRaysMetadata as unknown as BlockConfiguration<CanvasLayerCurvedRaysAttributes>,
  {
    edit: CurvedRaysEdit,
    save: Save,
  }
);

registerBlockType(
  starFieldMetadata as unknown as BlockConfiguration<CanvasLayerStarFieldAttributes>,
  {
    edit: StarFieldEdit,
    save: Save,
  }
);

registerBlockType(
  orbitTrailsMetadata as unknown as BlockConfiguration<CanvasLayerOrbitTrailsAttributes>,
  {
    edit: OrbitTrailsEdit,
    save: Save,
  }
);

registerBlockType(
  warpFieldMetadata as unknown as BlockConfiguration<CanvasLayerWarpFieldAttributes>,
  {
    edit: WarpFieldEdit,
    save: Save,
  }
);

registerBlockType(nebulaMetadata as unknown as BlockConfiguration<CanvasLayerNebulaAttributes>, {
  edit: NebulaEdit,
  save: Save,
});

registerBlockType(auroraMetadata as unknown as BlockConfiguration<CanvasLayerAuroraAttributes>, {
  edit: AuroraEdit,
  save: Save,
});

registerBlockType(
  neonWavesMetadata as unknown as BlockConfiguration<CanvasLayerNeonWavesAttributes>,
  {
    edit: NeonWavesEdit,
    save: Save,
  }
);
