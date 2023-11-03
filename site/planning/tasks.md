# Stories

## Current Milestone

- 💬 There is a disqus form on each blog post for people to leave comments
- 📄 Wortwhile posts from immediately previous blog are ported to new site
  - https://github.com/jolson88/blog
- 🔍 Users can search the blog via a simple search box on the site
  - Probably just redirecting to DuckDuckGo?

# WIP

- 🚧 Tidying - Settle code down from recent features
  - [x] Support an output metadata (like `##TITLE: My Title##` to also be used as input marker)
  - [] Rename outputMarkers -> properties and inputMarkers -> inputs
  - [] Change pageUrl to be an input provided by the engine instead of from output marker
  - [] Investigate changing `blog`/`blogPost` structure to a generic article structure that's just a simple Array of output Articles
    - This could turn into `blog` being a type of `article group` of sorts (which `primer`, `lexicon`, etc. in the future would be)

# Shipped

## Alpha 0.8 - TBD

- ⏲ When I save a blog post, the site is automatically regenerated for instant checking
- 🐤 Add support for OpenGraph for better links
- ⛔️ Add support for reporting warnings/errors during site generation

## Alpha 0.7 - October 23rd, 2023

- 💾 Easy command to sync files to blog
- 📖 Users can see the the most recent blog posts in one landing page
- 🖼 Website uses new avatar for favicons
- 📃 I can create a blog post that is included on the site
- 🎯 Website uses a custom site generator that gives me full control over site
- 🎯 Website design adopts tufte.css for a more scholar/book/elegant feel
- 🎯 Website is locked down to HTTPS
