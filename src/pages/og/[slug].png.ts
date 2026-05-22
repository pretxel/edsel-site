/**
 * Dynamic Open Graph image generator.
 *
 * Endpoint: `/og/<slug>.png`
 *
 * Resolves the slug against the `projects` collection first, then `posts`.
 * Renders a 1200×630 PNG using `@vercel/og`. If the slug doesn't resolve,
 * returns a generic Edsel Serrano splash so OG tags never 404.
 *
 * We use `React.createElement` (kept inside this `.ts` file) rather than JSX
 * to avoid forcing a `.tsx` page-extension change. The shape Satori receives
 * is identical either way.
 */
import type { APIRoute } from "astro";
import { ImageResponse } from "@vercel/og";
import * as React from "react";
import { getProjectBySlug, getPostBySlug } from "../../lib/content";
import { colors } from "../../lib/colors";

const WIDTH = 1200;
const HEIGHT = 630;

const h = React.createElement;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  const project = await getProjectBySlug(slug);
  const post = project ? null : await getPostBySlug(slug);

  let title: string;
  let subtitle: string;
  let eyebrow: string;
  let accent: string;

  if (project) {
    title = project.data.i18n.es.title;
    subtitle = project.data.i18n.es.description;
    eyebrow = "Project · Proyecto";
    accent = colors[project.data.color].accent;
  } else if (post) {
    title = post.data.title;
    subtitle = post.data.description;
    eyebrow = post.data.lang === "en" ? "Article" : "Artículo";
    accent = "#46b4ff";
  } else {
    title = "Edsel Serrano";
    subtitle = "Full Stack Developer";
    eyebrow = "edselserrano.com";
    accent = "#46b4ff";
  }

  return new ImageResponse(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #09090b 0%, #18181b 60%, #1a1a22 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        },
      },
      // Header row
      h(
        "div",
        {
          style: { display: "flex", alignItems: "center", gap: "20px" },
        },
        h("div", {
          style: {
            width: "20px",
            height: "20px",
            background: accent,
            borderRadius: "999px",
          },
        }),
        h(
          "div",
          {
            style: {
              fontSize: "26px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#a1a1aa",
              fontWeight: 600,
            },
          },
          eyebrow,
        ),
      ),
      // Title block
      h(
        "div",
        {
          style: { display: "flex", flexDirection: "column", gap: "24px" },
        },
        h(
          "div",
          {
            style: {
              fontSize: "76px",
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              display: "flex",
            },
          },
          title,
        ),
        h(
          "div",
          {
            style: {
              fontSize: "30px",
              lineHeight: 1.4,
              color: "#d4d4d8",
              maxWidth: "1000px",
              display: "flex",
            },
          },
          truncate(subtitle, 180),
        ),
      ),
      // Footer
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "24px",
            color: "#71717a",
          },
        },
        h(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "12px" } },
          "edselserrano.com",
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              padding: "8px 18px",
              borderRadius: "999px",
              border: `2px solid ${accent}`,
              color: accent,
              fontWeight: 600,
            },
          },
          "Edsel Serrano",
        ),
      ),
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    },
  );
};

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trimEnd() + "…";
}
