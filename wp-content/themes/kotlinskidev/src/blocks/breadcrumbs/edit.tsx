import React from "react";
import { __ } from "@wordpress/i18n";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import ServerSideRender from "@wordpress/server-side-render";

export interface BreadcrumbsAttributes {
  showOnHomepage: boolean;
}

interface EditProps {
  attributes: BreadcrumbsAttributes;
  setAttributes: (attrs: Partial<BreadcrumbsAttributes>) => void;
}

const BreadcrumbsEdit = ({ attributes, setAttributes }: EditProps): React.ReactElement => {
  const blockProps = useBlockProps();
  const { showOnHomepage } = attributes;

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Breadcrumbs Settings", "kotlinskidev")}>
          <ToggleControl
            label={__("Show on homepage", "kotlinskidev")}
            checked={showOnHomepage}
            onChange={(value) => setAttributes({ showOnHomepage: value })}
          />
        </PanelBody>
      </InspectorControls>
      <div {...blockProps}>
        <ServerSideRender block="kotlinskidev/breadcrumbs" />
      </div>
    </>
  );
};

export default BreadcrumbsEdit;
