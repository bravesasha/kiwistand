import htm from "htm";
import vhtml from "vhtml";
import DOMPurify from "isomorphic-dompurify";

import PwaLinks from "./pwaLinks.mjs";

const html = htm.bind(vhtml);

export function custom(
  ogImage = "https://news.kiwistand.com/preview.jpeg",
  ogTitle = "Kiwi News - handpicked web3 alpha",
  ogDescription = "",
  twitterCard = "summary_large_image",
) {
  ogImage = DOMPurify.sanitize(ogImage);
  ogTitle = DOMPurify.sanitize(ogTitle);
  ogDescription = DOMPurify.sanitize(ogDescription);
  return html`
    <script src="event-queue.js"></script>
    <meta charset="utf-8" />
    <meta name="referrer" content="origin" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1,
 user-scalable=0 viewport-fit=cover"
    />
    ${ogImage ? html`<meta property="og:image" content="${ogImage}" />` : null}
    ${ogImage
      ? html`<meta property="twitter:image" content="${ogImage}" />`
      : null}
    <meta property="twitter:card" content="${twitterCard}" />
    <meta property="og:title" content="${ogTitle}" />
    ${ogDescription
      ? html`<meta property="og:description" content="${ogDescription}" />`
      : ""}
    <link rel="stylesheet" type="text/css" href="news.css" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    ${PwaLinks()}
    <title>${ogTitle}</title>
  `;
}
const regular = custom();

export default regular;
