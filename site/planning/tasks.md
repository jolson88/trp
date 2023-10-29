# Stories

## Current Milestone

- ⏲ When I save a blog post, the site is automatically regenerated for instant checking
    - Simplest solution is probably to watch from within Node and re-running the `generateSite` command directly (whose output is picked up by live-server)
- 📄 Wortwhile posts from previous blog are ported to new site
    - https://github.com/jolson88/blog
- 📖 Users can see the the most recent blog posts in one `latest` landing page
- 📖 Users can see all blog posts in one `all` landing page

# WIP

- 💾 Platform-independent way to sync files to blog
  - [ ] Create `sync.ts` script

# Shipped

## Alpha 0.7 - October 23rd, 2023

- 🖼 Website uses new avatar for favicons
- 📃 I can create a blog post that is included on the site
- 🎯 Website uses a custom site generator that gives me full control over site
- 🎯 Website design adopts tufte.css for a more scholar/book/elegant feel
- 🎯 Website is locked down to HTTPS
