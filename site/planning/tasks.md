# Stories

## Current Milestone

- ⏲ When I save a blog post, the site is automatically regenerated for instant checking
  - Simplest solution is probably to watch from within Node and re-running the `generateSite` command directly (whose output is picked up by live-server)
- 📄 Wortwhile posts from immediately previous blog are ported to new site
  - https://github.com/jolson88/blog

# WIP

- 🐤 Add support for OpenGraph and Twitter Cards for better links
  - [x] Add ability for a blog post to have output metadata that is sufficient to build cards
  - [x] Add OutputTracker for tracking a service
  - [ ] Add Reporter to blog generator to report warnings if metadata for cards is not present
  - [ ] A "social card metadata" section can be generated given the correct input context
    - https://stackoverflow.com/questions/19632323/default-website-image-for-social-sharing
  - [ ] There is an input context variable for the site header that allows child-metadata content
  - [ ] If a post has output metadata for cards, the generated card is placed in the <head> of the post page

# Shipped

## Alpha 0.7 - October 23rd, 2023

- 💾 Easy command to sync files to blog
- 📖 Users can see the the most recent blog posts in one landing page
- 🖼 Website uses new avatar for favicons
- 📃 I can create a blog post that is included on the site
- 🎯 Website uses a custom site generator that gives me full control over site
- 🎯 Website design adopts tufte.css for a more scholar/book/elegant feel
- 🎯 Website is locked down to HTTPS
