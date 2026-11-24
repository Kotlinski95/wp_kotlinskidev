import React, { useState } from "react";
import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/editor";
import { TextControl, TextareaControl, Button, Notice } from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import { useEntityProp } from "@wordpress/core-data";
import { __ } from "@wordpress/i18n";
import { useCurrentPostMeta, useCurrentPostType } from "../shared/use-current-post";

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

interface BadgeResponse {
  success: boolean;
  data: FetchBadgeResponse | string;
}

type SetMeta = (value: CertificateMeta) => void;
type EditPost = (edits: Record<string, unknown>) => void;

async function requestBadge(
  config: { ajaxUrl: string; nonce: string },
  sourceUrl: string
): Promise<BadgeResponse> {
  const body = new FormData();
  body.append("action", "kotlinskidev_fetch_certificate_badge");
  body.append("nonce", config.nonce);
  body.append("url", sourceUrl);
  const response = await fetch(config.ajaxUrl, { method: "POST", body });
  return (await response.json()) as BadgeResponse;
}

function badgeErrorMessage(result: BadgeResponse): string {
  return typeof result.data === "string"
    ? result.data
    : __("Could not fetch badge details.", "kotlinskidev");
}

interface CertificateEditing {
  meta: CertificateMeta;
  setMeta: SetMeta;
  setTitle: (value: string) => void;
  editPost: EditPost;
}

function applyBadge(badge: FetchBadgeResponse, editing: CertificateEditing) {
  const { meta, setMeta, setTitle, editPost } = editing;
  const edits: Record<string, unknown> = {};
  if (badge.name) {
    setTitle(badge.name);
    edits.title = badge.name;
  }
  if (badge.credential_image_id) {
    edits.featured_media = badge.credential_image_id;
  }
  if (Object.keys(edits).length > 0) {
    editPost(edits);
  }
  setMeta({
    ...meta,
    cert_issuer: badge.issuer || meta?.cert_issuer,
    cert_description: badge.description || meta?.cert_description,
    cert_verify_url: badge.verify_url || meta?.cert_verify_url,
  });
}

function useBadgeFetch(sourceUrl: string, editing: CertificateEditing) {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const fetchBadge = async () => {
    const config = window.kotlinskidevCertificateConfig;
    if (!config || !sourceUrl) {
      return;
    }

    setIsFetching(true);
    setFetchError("");

    try {
      const result = await requestBadge(config, sourceUrl);
      if (!result.success || typeof result.data === "string") {
        setFetchError(badgeErrorMessage(result));
        return;
      }
      applyBadge(result.data, editing);
    } catch {
      setFetchError(__("Network error while fetching badge details.", "kotlinskidev"));
    } finally {
      setIsFetching(false);
    }
  };

  return { isFetching, fetchError, fetchBadge };
}

interface BadgeSourceControlsProps {
  sourceUrl: string;
  onSourceUrlChange: (value: string) => void;
  isFetching: boolean;
  fetchError: string;
  onFetch: () => void;
}

function BadgeSourceControls(props: BadgeSourceControlsProps) {
  const { sourceUrl, onSourceUrlChange, isFetching, fetchError, onFetch } = props;
  return (
    <>
      <TextControl
        label={__("Badge / credential URL", "kotlinskidev")}
        type="url"
        help={__(
          "A Credly or Accredible badge link. Click Fetch to pre-fill the fields below.",
          "kotlinskidev"
        )}
        value={sourceUrl}
        onChange={onSourceUrlChange}
      />
      <Button
        variant="secondary"
        isBusy={isFetching}
        disabled={!sourceUrl || isFetching}
        onClick={onFetch}
      >
        {isFetching ? __("Fetching…", "kotlinskidev") : __("Fetch details", "kotlinskidev")}
      </Button>
      {fetchError && (
        <Notice status="error" isDismissible={false}>
          {fetchError}
        </Notice>
      )}
    </>
  );
}

interface CertificateFieldsProps {
  title: string;
  onTitleChange: (value: string) => void;
  meta: CertificateMeta;
  setMeta: SetMeta;
}

function CertificateIdentityFields({
  title,
  onTitleChange,
  meta,
  setMeta,
}: CertificateFieldsProps) {
  return (
    <>
      <TextControl
        label={__("Certificate name", "kotlinskidev")}
        help={__("Also the post title.", "kotlinskidev")}
        value={title ?? ""}
        onChange={onTitleChange}
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
    </>
  );
}

function CertificateDetailFields({
  meta,
  setMeta,
}: Pick<CertificateFieldsProps, "meta" | "setMeta">) {
  return (
    <>
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
    </>
  );
}

function useCertificateEditing(): CertificateEditing & { title: string } {
  const postType = useCurrentPostType();
  const [meta, setMeta] = useCurrentPostMeta<CertificateMeta>();

  const [title, setTitle] = useEntityProp<string>("postType", postType, "title") as unknown as [
    string,
    (value: string) => void,
  ];

  const { editPost } = useDispatch("core/editor") as { editPost: EditPost };

  return { meta, setMeta, title, setTitle, editPost };
}

function CertificatePanel() {
  const editing = useCertificateEditing();
  const { meta, setMeta, title, setTitle, editPost } = editing;
  const sourceUrl = meta?.cert_source_url ?? "";
  const { isFetching, fetchError, fetchBadge } = useBadgeFetch(sourceUrl, editing);

  return (
    <PluginDocumentSettingPanel
      name="kotlinskidev-certificate"
      title={__("Certificate Details", "kotlinskidev")}
    >
      <BadgeSourceControls
        sourceUrl={sourceUrl}
        onSourceUrlChange={(value) => setMeta({ ...meta, cert_source_url: value })}
        isFetching={isFetching}
        fetchError={fetchError}
        onFetch={fetchBadge}
      />
      <CertificateIdentityFields
        title={title}
        onTitleChange={(value) => {
          setTitle(value);
          editPost({ title: value });
        }}
        meta={meta}
        setMeta={setMeta}
      />
      <CertificateDetailFields meta={meta} setMeta={setMeta} />
    </PluginDocumentSettingPanel>
  );
}

registerPlugin("kotlinskidev-certificate-panel", { render: CertificatePanel });
