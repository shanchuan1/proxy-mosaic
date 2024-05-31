const templateHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
  <title>Dynamic Index</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
`;

function createHtml(inputHtml, params, additionalScripts = [], newTitle = 'Dynamic Index') {
  // Extract <link> and <script> tags
  const linkTags = [];
  const scriptTags = [];

  // Regular expressions for link and script tags
  const linkRegex = /<link\b[^>]*href="([^"]*)"[^>]*>/g;
  const scriptRegex = /<script\b[^>]*src="([^"]*)"[^>]*><\/script>/g;
  const titleRegex = /<title>([^<]*)<\/title>/;

  let match;

  while ((match = linkRegex.exec(inputHtml)) !== null) {
    linkTags.push(match[0]);
  }

  while ((match = scriptRegex.exec(inputHtml)) !== null) {
    scriptTags.push(match[0]);
  }

  // Function to modify href or src attributes based on params
  function modifyTag(tag, attr, params) {
    return tag.replace(new RegExp(`${attr}="([^"]*)"`, 'g'), (match, p1) => {
      const newValue = params[p1];
      return newValue ? `${attr}="${newValue}"` : match;
    });
  }

  // Modify link tags
  const modifiedLinkTags = linkTags.map(tag => modifyTag(tag, 'href', params));
  // Modify script tags
  const modifiedScriptTags = scriptTags.map(tag => modifyTag(tag, 'src', params));

  // Create additional script tags
  const newScriptTags = additionalScripts.map(src => `<script type="module" src="${src}"></script>`);

  // Modify the title
  const modifiedHtml = templateHtml.replace(titleRegex, `<title>${newTitle}</title>`);

  // Inject modified tags into templateHtml
  const headEndIndex = modifiedHtml.indexOf('</head>');
  const bodyEndIndex = modifiedHtml.indexOf('</body>');

  const finalHtml = [
    modifiedHtml.slice(0, headEndIndex),
    ...modifiedLinkTags,
    modifiedHtml.slice(headEndIndex, bodyEndIndex),
    ...modifiedScriptTags,
    ...newScriptTags,
    modifiedHtml.slice(bodyEndIndex)
  ].join('\n');

  return finalHtml;
}



module.exports = {
  createHtml
}


/*
// Example usage
const inputHtml = `
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <title>文档中心</title>
    <link rel="shortcut icon" type="image/x-icon" href="/doc-manage-web/static/favicon.ico">
    <link rel="shortcut icon" type="image/x-icon" href="/doc-manage-web/static/favicon.ico">
  </head>
  <body>
    <div id="app"></div>
    <div>proxy-mosaic</div>
    <script type="text/javascript" src="/apps/doc-manage-web/public/static/polyfills/object.js"></script>
    <script type="module" src="/apps/doc-manage-web/src/main.js"></script>
    <!-- built files will be auto injected -->
  </body>
</html>
`;

const params = {
  "/doc-manage-web/static/favicon.ico": "/new-path/favicon.ico",
  "/apps/doc-manage-web/public/static/polyfills/object.js": "/new-path/object.js",
  "/apps/doc-manage-web/src/main.js": "/new-path/main.js"
};

const additionalScripts = ["/new-script1.js", "/new-script2.js"];
const newTitle = "新的文档中心";

console.log(createHtml(inputHtml, params, additionalScripts, newTitle));
*/
