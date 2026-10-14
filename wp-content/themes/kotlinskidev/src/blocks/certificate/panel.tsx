import React, { useState } from "react";
import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/editor";
import { TextControl, TextareaControl, Button, Notice } from "@wordpress/components";
import { useSelect, useDispatch } from "@wordpress/data";
import { useEntityProp } from "@wordpress/core-data";
import { __ } from "@wordpress/i18n";

declare global {
  interface Window {
    kotlinskidevCertificateConfig?: {
      ajaxUrl: string;
      nonce: string;
    };
  }
}

interface CertificateMeta {
  cert_issuer?: string;
  cert_issued_date?: string;
  cert_description?: string;
  cert_credential_id?: string;
  cert_verify_url?: string;
  cert_source_url?: string;
}

interface FetchBadgeResponse {
  name: string;
  issuer: string;
  description: string;
  credential_image_id: number;
  verify_url: string;
}

function CertificatePanel() {
  const postType = useSelect(
    (select) =>
      (select("core/editor") as { getCurrentPostType: () => string }).getCurrentPostType(),
    []
  );

  const [meta, setMeta] = useEntityProp<CertificateMeta>(
    "postType",
    postType,
    "meta"
  ) as unknown as [CertificateMeta, (value: CertificateMeta) => void];

  const [title, setTitle] = useEntityProp<string>("postType", postType, "title") as unknown as [
    string,
    (value: string) => void,
  ];

  const { editPost } = useDispatch("core/editor") as {
    editPost: (edits: Record<string, unknown>) => void;
  };

  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const sourceUrl = meta?.cert_source_url ?? "";

  const handleFetch = async () => {
    const config = window.kotlinskidevCertificateConfig;
    if (!config || !sourceUrl) {
      return;
    }

    setIsFetching(true);
    setFetchError("");

    try {
      const body = new FormData();
      body.append("action", "kotlinskidev_fetch_certificate_badge");
      body.append("nonce", config.nonce);
      body.append("url", sourceUrl);

      const response = await fetch(config.ajaxUrl, { method: "POST", body });
      const result = (await response.json()) as {
        success: boolean;
        data: FetchBadgeResponse | string;
      };

      if (!result.success || typeof result.data === "string") {
        setFetchError(
          typeof result.data === "string"
            ? result.data
            : __("Could not fetch badge details.", "kotlinskidev")
        );
        return;
      }

      const data = result.data;
      const edits: Record<string, unknown> = {};
      if (data.name) {
        setTitle(data.name);
        edits.title = data.name;
      }
      if (data.credential_image_id) {
        edits.featured_media = data.credential_image_id;
      }
      if (Object.keys(edits).length > 0) {
        editPost(edits);
      }
      setMeta({
        ...meta,
        cert_issuer: data.issuer || meta?.cert_issuer,
        cert_description: data.description || meta?.cert_description,
        cert_verify_url: data.verify_url || meta?.cert_verify_url,
      });
    } catch {
      setFetchError(__("Network error while fetching badge details.", "kotlinskidev"));
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <PluginDocumentSettingPanel
      name="kotlinskidev-certificate"
      title={__("Certificate Details", "kotlinskidev")}
    >
      <TextControl
        label={__("Badge / credential URL", "kotlinskidev")}
        type="url"
        help={__(
          "A Credly or Accredible badge link. Click Fetch to pre-fill the fields below.",
          "kotlinskidev"
        )}
        value={sourceUrl}
        onChange={(value) => setMeta({ ...meta, cert_source_url: value })}
      />
      <Button
        variant="secondary"
        isBusy={isFetching}
        disabled={!sourceUrl || isFetching}
        onClick={handleFetch}
      >
        {isFetching ? __("Fetching…", "kotlinskidev") : __("Fetch details", "kotlinskidev")}
      </Button>
      {fetchError && (
        <Notice status="error" isDismissible={false}>
          {fetchError}
        </Notice>
      )}
      <TextControl
        label={__("Certificate name", "kotlinskidev")}
        help={__("Also the post title.", "kotlinskidev")}
        value={title ?? ""}
        onChange={(value) => {
          setTitle(value);
          editPost({ title: value });
        }}
      />
      <TextControl
        label={__("Issuer", "kotlinskidev")}
        value={meta?.cert_issuer ?? ""}
        onChange={(value) => setMeta({ ...meta, cert_issuer: value })}
      />
      <TextControl
        label={__("Issued date", "kotlinskidev")}
        type="date"
        value={meta?.cert_issued_date ?? ""}
        onChange={(value) => setMeta({ ...meta, cert_issued_date: value })}
      />
      <TextareaControl
        label={__("Description", "kotlinskidev")}
        help={__("Shown by the feature-cards layout only.", "kotlinskidev")}
        value={meta?.cert_description ?? ""}
        onChange={(value) => setMeta({ ...meta, cert_description: value })}
      />
      <TextControl
        label={__("Credential ID", "kotlinskidev")}
        value={meta?.cert_credential_id ?? ""}
        onChange={(value) => setMeta({ ...meta, cert_credential_id: value })}
      />
      <TextControl
        label={__("Verify URL", "kotlinskidev")}
        type="url"
        help={__("Falls back to the badge URL above when left empty.", "kotlinskidev")}
        value={meta?.cert_verify_url ?? ""}
        onChange={(value) => setMeta({ ...meta, cert_verify_url: value })}
      />
    </PluginDocumentSettingPanel>
  );
}

registerPlugin("kotlinskidev-certificate-panel", { render: CertificatePanel });
