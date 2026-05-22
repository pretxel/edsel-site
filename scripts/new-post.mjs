#!/usr/bin/env node
/**
 * Scaffold a new blog post under `src/content/posts/`.
 *
 * Usage: pnpm new:post
 *   Slug (kebab-case): hello-world
 *   Title: Hello, world
 *   Lang (es/en) [es]: en
 *   ✓ src/content/posts/hello-world-en.mdx
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";

const POSTS_DIR = path.join("src", "content", "posts");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const rawSlug = (await rl.question("Slug (kebab-case): ")).trim();
const title = (await rl.question("Title: ")).trim();
const rawLang = (await rl.question("Lang (es/en) [es]: ")).trim().toLowerCase();

rl.close();

if (!rawSlug) {
  console.error("Aborting: slug is required.");
  process.exit(1);
}

if (!title) {
  console.error("Aborting: title is required.");
  process.exit(1);
}

const slug = rawSlug
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const lang = rawLang === "en" ? "en" : "es";
const date = new Date().toISOString().slice(0, 10);

const fileName = `${slug}-${lang}.mdx`;
const filePath = path.join(POSTS_DIR, fileName);

if (fs.existsSync(filePath)) {
  console.error(`Aborting: ${filePath} already exists.`);
  process.exit(1);
}

fs.mkdirSync(POSTS_DIR, { recursive: true });

const escapedTitle = title.replace(/"/g, '\\"');

const frontmatter = `---
title: "${escapedTitle}"
description: ""
date: ${date}
lang: ${lang}
tags: []
draft: true
---

${lang === "es" ? "Escribe aquí." : "Write here."}
`;

fs.writeFileSync(filePath, frontmatter);
console.log(`✓ ${filePath}`);
