import sanitizeHtml from "sanitize-html";

const articleSanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "figure",
    "figcaption",
    "iframe",
    "video",
    "source",
    "pre",
    "code",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    a: ["href", "name", "target", "rel"],
    iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder"],
    code: ["class"],
    "*": ["class", "id"],
  },
  allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
};

export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, articleSanitizeOptions);
}