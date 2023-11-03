# Stories

## Current Milestone

- ⏲ When I save a blog post, the site is automatically regenerated for instant checking
  - Simplest solution is probably to watch from within Node and re-running the `generateSite` command directly (whose output is picked up by live-server)
- 📄 Wortwhile posts from immediately previous blog are ported to new site
  - https://github.com/jolson88/blog

# WIP

- 🐤 Add support for OpenGraph and Twitter Cards for better links
  - [x] Tidying: Add common Metadata enum for quick lookups of Title and Image in site-generator.ts
  - [x] Tidying: Change from Array<[string, string]> in Site types to Map<string, string> (since we aren't serializing)
  - [x] A "social card metadata" section that can be generated given the correct input context
    - https://stackoverflow.com/questions/19632323/default-website-image-for-social-sharing
    - https://ogp.me/#structured
    - https://ogp.me/#types
  - [x] If a blog post doesn't have required fields for og card, output a warning to the console
  - [] There is an input context variable for the site header that allows child-metadata content
  - [] If a post has output metadata for cards, the generated card is placed in the <head> of the post page

# Shipped

## Alpha 0.8 - TBD

- ⛔️ Add support for reporting warnings/errors during site generation

## Alpha 0.7 - October 23rd, 2023

- 💾 Easy command to sync files to blog
- 📖 Users can see the the most recent blog posts in one landing page
- 🖼 Website uses new avatar for favicons
- 📃 I can create a blog post that is included on the site
- 🎯 Website uses a custom site generator that gives me full control over site
- 🎯 Website design adopts tufte.css for a more scholar/book/elegant feel
- 🎯 Website is locked down to HTTPS
