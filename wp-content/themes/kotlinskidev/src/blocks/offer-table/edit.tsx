import React from "react";
import { __ } from "@wordpress/i18n";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, SelectControl, Placeholder } from "@wordpress/components";
import ServerSideRender from "@wordpress/server-side-render";
import { useSelect } from "@wordpress/data";
import { store as coreStore } from "@wordpress/core-data";

export interface OfferTableAttributes {
  offerKey: string;
}

interface EditProps {
  attributes: OfferTableAttributes;
  setAttributes: (attrs: Partial<OfferTableAttributes>) => void;
}

interface OfferSummary {
  key: string;
  name: string;
}

interface CoreSelectors {
  getEntityRecords: (
    kind: string,
    type: string,
    query: Record<string, unknown>
  ) => { meta?: { offer_key?: string }; title?: { raw?: string } }[] | null;
}

const OfferTableEdit = ({ attributes, setAttributes }: EditProps): React.ReactElement => {
  const blockProps = useBlockProps();
  const { offerKey } = attributes;

  const offers = useSelect((select): OfferSummary[] => {
    const records = (select(coreStore) as unknown as CoreSelectors).getEntityRecords(
      "postType",
      "kt_offer",
      { per_page: -1, status: "publish,draft", orderby: "menu_order", order: "asc" }
    );
    return (records ?? [])
      .filter((record) => record.meta?.offer_key)
      .map((record) => ({
        key: record.meta?.offer_key ?? "",
        name: record.title?.raw || record.meta?.offer_key || "",
      }));
  }, []);

  const options = [
    { value: "", label: __("Select an offer", "kotlinskidev") },
    ...offers.map((offer) => ({ value: offer.key, label: offer.name })),
  ];

  const select = (
    <SelectControl
      label={__("Offer", "kotlinskidev")}
      value={offerKey}
      options={options}
      onChange={(value) => setAttributes({ offerKey: value })}
      __nextHasNoMarginBottom
    />
  );

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Offer Table Settings", "kotlinskidev")}>{select}</PanelBody>
      </InspectorControls>
      <div {...blockProps}>
        {offerKey ? (
          <ServerSideRender block="kotlinskidev/offer-table" attributes={attributes} />
        ) : (
          <Placeholder label={__("Offer Table", "kotlinskidev")}>{select}</Placeholder>
        )}
      </div>
    </>
  );
};

export default OfferTableEdit;
