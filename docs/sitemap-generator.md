# Sitemap Generator for ToolsJockey

This document explains how the sitemap generation works for ToolsJockey.com.

## Overview

We've implemented two methods for generating the sitemap:

1. **Dynamic generation** via an API route
2. **Static generation** during the build process

Both methods produce a standard XML sitemap that follows Google Search Console requirements.

## Dynamic Generation (API Route)

The dynamic generation happens through an API route at:
- `/api/sitemap.xml`

When this endpoint is accessed, it generates the sitemap on-demand with the current date as the `lastmod` value.

**Source file:** `src/pages/api/sitemap.xml.js`

## Static Generation (Build Script)

The static generation happens during the build process through an npm script. It creates a static `sitemap.xml` file in the public directory.

**Source file:** `scripts/generate-sitemap.js`

This script is run automatically during the build process via the npm script:
```
npm run build
```

You can also run it manually:
```
npm run generate-sitemap
```

## Implementation Notes

Instead of dynamically importing from TypeScript files (which can cause issues in a Node.js context), both the API route and build script use hardcoded arrays for:

1. Tool paths - All tool paths are explicitly listed in the code
2. Blog post IDs - All blog post IDs are explicitly listed in the code

This approach ensures compatibility with both ESM imports and TypeScript without requiring additional build steps.

## Sitemap Structure

The sitemap includes:

- Homepage (priority: 1.0)
- Main static pages (priority: 0.8)
  - /pdf-tools
  - /word-docs
  - /video-tools
  - /about
  - /contact
  - /blog
- Tool pages (priority: 0.7)
- Blog posts (priority: 0.6)

All entries have:
- `lastmod`: Current date in YYYY-MM-DD format
- `changefreq`: "weekly" for main pages, "monthly" for blog posts

## Robots.txt

The `robots.txt` file in the public directory references the sitemap:

```
# robots.txt for https://toolsjockey.com

User-agent: *
Allow: /

# Sitemap
Sitemap: https://toolsjockey.com/sitemap.xml
```

## Updating the Sitemap

The sitemap is automatically updated:
1. During each build (static sitemap)
2. On each request to the API route (dynamic sitemap)

All entries will have the current date as the `lastmod` value.

## Maintenance

If you add new tools or blog posts, update these arrays in both files:
1. `toolPaths` in both the API route and build script
2. `blogPostIds` in both the API route and build script 