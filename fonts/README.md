# Fonts

The site loads its three typefaces from **Google Fonts** via `<link>` tags in `index.html`:

- **Great Vibes** — couple names (calligraphy)
- **Cormorant Garamond** — headings / serif display
- **Lato** — body text

No font files are required for the site to work.

## Optional: self-host the fonts (fully offline / faster)

If you want the site to work with **no external requests** (e.g. air-gapped, or to squeeze out the last Lighthouse points):

1. Download the families from https://fonts.google.com (Great Vibes, Cormorant Garamond, Lato).
2. Drop the `.woff2` files in this folder.
3. Replace the Google Fonts `<link>` tags in `index.html` with `@font-face` rules in `css/styles.css`, e.g.:

```css
@font-face{
  font-family:'Great Vibes';
  src:url('../fonts/GreatVibes-Regular.woff2') format('woff2');
  font-display:swap;
}
```

A convenient helper is the `google-webfonts-helper` (gwfh.mranftl.com), which packages the exact `@font-face` CSS + `woff2` files for you.
