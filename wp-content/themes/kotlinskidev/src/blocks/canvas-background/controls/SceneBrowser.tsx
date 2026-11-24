import React from "react";
import { __ } from "@wordpress/i18n";
import { Dropdown, Button } from "@wordpress/components";
import type { CanvasRecipe } from "../../../scripts/canvas-background/types";
import CanvasRecipePreview from "../shared/CanvasRecipePreview";

export interface CanvasSceneRecord {
  id: number;
  title: { rendered: string };
  canvas_recipe: CanvasRecipe;
}

export const EMPTY_RECIPE: CanvasRecipe = { layers: [] };

const SCENE_GRID_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "8px",
  width: "280px",
  maxHeight: "320px",
  overflowY: "auto",
  padding: "4px",
};

const SCENE_TITLE_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  padding: "2px 4px",
  textAlign: "center",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

function sceneButtonStyle(isSelected: boolean): React.CSSProperties {
  return {
    display: "block",
    height: "auto",
    padding: 0,
    border: isSelected
      ? "2px solid var(--wp-admin-theme-color, #3858e9)"
      : "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "4px",
    overflow: "hidden",
  };
}

interface SceneBrowserProps {
  scenes: CanvasSceneRecord[];
  selectedSceneId: number;
  onSelectScene: (sceneId: number) => void;
}

export function SceneBrowser({ scenes, selectedSceneId, onSelectScene }: SceneBrowserProps) {
  return (
    <Dropdown
      contentClassName="kotlinskidev-canvas-scene-browser"
      renderToggle={({ isOpen, onToggle }) => (
        <Button variant="link" onClick={onToggle} aria-expanded={isOpen}>
          {__("Browse scenes by preview", "kotlinskidev")}
        </Button>
      )}
      renderContent={() => (
        <div style={SCENE_GRID_STYLE}>
          {scenes.map((scene) => (
            <Button
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              style={sceneButtonStyle(scene.id === selectedSceneId)}
            >
              <CanvasRecipePreview
                recipe={scene.canvas_recipe ?? EMPTY_RECIPE}
                height={64}
                animate={false}
              />
              <span style={SCENE_TITLE_STYLE}>
                {scene.title.rendered || __("(no title)", "kotlinskidev")}
              </span>
            </Button>
          ))}
        </div>
      )}
    />
  );
}
