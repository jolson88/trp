# Stories

## Current Milestone

- 📄 Wortwhile posts from immediately previous blog are ported to new site
  - https://github.com/jolson88/blog
- 🔍 Users can search the blog via a simple search box on the site
  - Probably just redirecting to DuckDuckGo?

# WIP

- 💬 There is a disqus form on each blog post for people to leave comments
  - [] Update disqus avatar to new headshot/avatar
  - [] Register new blog for disqus if needed
  - [] Create `generateDisqusSlug` function
  - [] Verify disqus slug gets generated

```
<div id="disqus_thread"></div>
<script>
    var disqus_config = function () {
      this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
      this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    (function() { // DON'T EDIT BELOW THIS LINE
    var d = document, s = d.createElement('script');
    s.src = 'https://jolson88.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
```

# Shipped

## Alpha 0.8 - TBD

- 🚧 Tidying - Settle code down from recent features
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
