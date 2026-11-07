import React from "react";
import { registerPlugin } from "@wordpress/plugins";
import { PluginDocumentSettingPanel } from "@wordpress/editor";
import { CheckboxControl, Notice, TextControl, TextareaControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { useEntityProp } from "@wordpress/core-data";
import { __ } from "@wordpress/i18n";
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

function ServiceLocationPanel() {
  const postType = useSelect(
    (select) =>
      (select("core/editor") as { getCurrentPostType: () => string }).getCurrentPostType(),
    []
  );

  const projects = useSelect(
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

  const [meta, setMeta] = useEntityProp<ServiceLocationMeta>(
    "postType",
    postType,
    "meta"
  ) as unknown as [ServiceLocationMeta, (value: ServiceLocationMeta) => void];

  const city = meta?.city ?? "";
  const intro = meta?.local_intro ?? "";
  const faq = meta?.local_faq ?? [];
  const featured = meta?.featured_projects ?? [];
  const ready = isLocalContentReady(meta);

  const patchMeta = (patch: Partial<ServiceLocationMeta>) => setMeta({ ...meta, ...patch });

  return (
    <>
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
      <PluginDocumentSettingPanel
        name="kotlinskidev-service-location-local"
        title={__("Local Content", "kotlinskidev")}
      >
        <Notice status={ready ? "success" : "warning"} isDismissible={false}>
          {ready
            ? __("Local content is complete. This city can be indexed.", "kotlinskidev")
            : __(
                "Needs content: until a local intro and at least two more fields below are filled, this city stays noindex, is left out of the sitemap and out of the city lists.",
                "kotlinskidev"
              )}
        </Notice>
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
      </PluginDocumentSettingPanel>
    </>
  );
}

registerPlugin("kotlinskidev-service-location-panel", { render: ServiceLocationPanel });
