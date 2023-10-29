# Stories

## Current Milestone

- 🖼 Website uses new avatar for favicons
  - [ ] Create new favicon files
- 💾 Platform-independent way to sync files to blog
  - [ ] Create `sync.ts` script
- ⏲ When I save a blog post, the site is automatically regenerated for instant checking
    - Simplest solution is probably to watch from within Node and re-running the `generateSite` command directly (whose output is picked up by live-server)
- 📄 Wortwhile posts from previous blog are ported to new site
    - https://github.com/jolson88/blog
- 📖 Users can see the the most recent blog posts in one `latest` landing page
- 📖 Users can see all blog posts in one `all` landing page

# WIP

- 📃 I can create a blog post that is included on the site
  - [x] `generateSite` returns Site as well as SiteFiles and smoke test verifies it
  - [x] Site loading loads blog files
  - [x] SiteFiles have destination blog files included
  - [x] Date is included in sidenote
  - [ ] Any Tidying needed?


# Shipped

## Alpha 0.7 - October 23rd, 2023

- 🎯 Website uses a custom site generator that gives me full control over site
- 🎯 Website design adopts tufte.css for a more scholar/book/elegant feel
- 🎯 Website is locked down to HTTPS
