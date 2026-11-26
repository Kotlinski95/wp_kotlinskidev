import React from "react";
import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/editor";
import { CheckboxControl, Notice, TextControl, TextareaControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { useCurrentPostMeta } from "../shared/use-current-post";
import {
  FEATURED_PROJECTS_MAX,
  LOCAL_FAQ_MAX,
  isLocalContentReady,
  toggleFeaturedProject,
  updateFaqPair,
  type ServiceLocationMeta,
} from "./readiness";

interface ProjectCardRecord {
  id: number;
  title: { rendered?: string; raw?: string };
}

type PatchMeta = (patch: Partial<ServiceLocationMeta>) => void;
type FaqPairs = NonNullable<ServiceLocationMeta["local_faq"]>;

function useProjectCards(): ProjectCardRecord[] {
  return useSelect(
    (select) =>
      (
        select("core") as {
          getEntityRecords: (
            kind: string,
            name: string,
            query: Record<string, unknown>
          ) => ProjectCardRecord[] | null;
        }
      ).getEntityRecords("postType", "kt_project_card", { per_page: 50, status: "publish" }) ?? [],
    []
  );
}

function LocalFaqFields({ faq, patchMeta }: { faq: FaqPairs; patchMeta: PatchMeta }) {
  return (
    <>
      {Array.from({ length: LOCAL_FAQ_MAX }, (_, index) => (
        <div key={index}>
          <TextControl
            label={`${__("Local FAQ question", "kotlinskidev")} ${index + 1}`}
            help={__(
              "A pair is saved only when both question and answer are filled.",
              "kotlinskidev"
            )}
            value={faq[index]?.question ?? ""}
            onChange={(value) =>
              patchMeta({ local_faq: updateFaqPair(faq, index, { question: value }) })
            }
          />
          <TextareaControl
            label={`${__("Local FAQ answer", "kotlinskidev")} ${index + 1}`}
            value={faq[index]?.answer ?? ""}
            rows={3}
            onChange={(value) =>
              patchMeta({ local_faq: updateFaqPair(faq, index, { answer: value }) })
            }
          />
        </div>
      ))}
    </>
  );
}

function FeaturedProjectsField({
  featured,
  patchMeta,
}: {
  featured: number[];
  patchMeta: PatchMeta;
}) {
  const projects = useProjectCards();
  return (
    <fieldset>
      <legend>{__("Featured projects (up to 3)", "kotlinskidev")}</legend>
      <p className="components-base-control__help">
        {__(
          "Only the chosen project cards are shown on this city page. Leave empty to show all.",
          "kotlinskidev"
        )}
      </p>
      {projects.map((project) => (
        <CheckboxControl
          key={project.id}
          label={project.title.raw || project.title.rendered || `#${project.id}`}
          checked={featured.includes(project.id)}
          disabled={!featured.includes(project.id) && featured.length >= FEATURED_PROJECTS_MAX}
          onChange={(checked) =>
            patchMeta({
              featured_projects: toggleFeaturedProject(featured, project.id, checked),
            })
          }
          __nextHasNoMarginBottom
        />
      ))}
    </fieldset>
  );
}

function LocalTextFields({ meta, patchMeta }: { meta: ServiceLocationMeta; patchMeta: PatchMeta }) {
  const intro = meta?.local_intro ?? "";

  return (
    <>
      <TextareaControl
        label={__("Local intro", "kotlinskidev")}
        help={`${__("2–3 sentences, about 150–300 characters, unique to this city.", "kotlinskidev")} ${intro.length}`}
        value={intro}
        rows={4}
        onChange={(value) => patchMeta({ local_intro: value })}
      />
      <TextareaControl
        label={__("Who I help here", "kotlinskidev")}
        help={__("Local industries or client types, one or two sentences.", "kotlinskidev")}
        value={meta?.local_audience ?? ""}
        rows={3}
        onChange={(value) => patchMeta({ local_audience: value })}
      />
      <TextControl
        label={__("Distance and meetings", "kotlinskidev")}
        help={__("For example: 30 min from Katowice, in-person or remote.", "kotlinskidev")}
        value={meta?.local_distance ?? ""}
        onChange={(value) => patchMeta({ local_distance: value })}
      />
    </>
  );
}

function LocalContentNotice({ ready }: { ready: boolean }) {
  return (
    <Notice status={ready ? "success" : "warning"} isDismissible={false}>
      {ready
        ? __("Local content is complete. This city can be indexed.", "kotlinskidev")
        : __(
            "Needs content: until a local intro and at least two more fields below are filled, this city stays noindex, is left out of the sitemap and out of the city lists.",
            "kotlinskidev"
          )}
    </Notice>
  );
}

function LocalContentPanel({
  meta,
  patchMeta,
}: {
  meta: ServiceLocationMeta;
  patchMeta: PatchMeta;
}) {
  return (
    <PluginDocumentSettingPanel
      name="kotlinskidev-service-location-local"
      title={__("Local Content", "kotlinskidev")}
    >
      <LocalContentNotice ready={isLocalContentReady(meta)} />
      <LocalTextFields meta={meta} patchMeta={patchMeta} />
      <LocalFaqFields faq={meta?.local_faq ?? []} patchMeta={patchMeta} />
      <FeaturedProjectsField featured={meta?.featured_projects ?? []} patchMeta={patchMeta} />
    </PluginDocumentSettingPanel>
  );
}

function CityDetailsPanel({ city, patchMeta }: { city: string; patchMeta: PatchMeta }) {
  return (
    <PluginDocumentSettingPanel
      name="kotlinskidev-service-location"
      title={__("City Details", "kotlinskidev")}
    >
      <TextControl
        label={__("City", "kotlinskidev")}
        help={__(
          "Every city mention on the page is bound to this field — changing it updates the whole page.",
          "kotlinskidev"
        )}
        value={city}
        onChange={(value) => patchMeta({ city: value })}
      />
    </PluginDocumentSettingPanel>
  );
}

function ServiceLocationPanel() {
  const [meta, setMeta] = useCurrentPostMeta<ServiceLocationMeta>();

  const patchMeta: PatchMeta = (patch) => setMeta({ ...meta, ...patch });

  return (
    <>
      <CityDetailsPanel city={meta?.city ?? ""} patchMeta={patchMeta} />
      <LocalContentPanel meta={meta} patchMeta={patchMeta} />
    </>
  );
}

registerPlugin("kotlinskidev-service-location-panel", { render: ServiceLocationPanel });
