import CleanCSS from 'clean-css';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import objectAssign from 'object-assign';
import sanitizer from 'sanitizer';

import HTML4 from './HTML4';
import CSS from './CSS';
import Tree from './Tree';


const renderRawHTML = (element, options, generateCustomTemplate) => {
  const validatedElement = Tree.insertOyElements(Tree.render(element));
  const bodyContent = ReactDOMServer.renderToStaticMarkup(validatedElement);
  const minifiedHeadCSS = new CleanCSS().minify(options.headCSS).styles;
  options = objectAssign({}, {
    lang: sanitizer.escape(options.lang),
    dir: sanitizer.escape(options.dir),
    title: sanitizer.escape(options.title),
    previewText: sanitizer.escape(options.previewText),
    headCSS: CSS.raiseOnUnsafeCSS(minifiedHeadCSS)
  }, {bodyContent: bodyContent});
  return generateCustomTemplate ? (
    generateCustomTemplate(options)
  ) : HTML4.generateDefaultTemplate(options);
};

const warnIfTemplateIsTooLarge = (html) => {
  const bytes = Buffer.byteLength(html, 'utf8');

  if (bytes > 1024 * 100) {
    console.warn(
      `Email output is ${Math.round(bytes / 1024)}KB. ` +
      'It is recommended to keep the delivered HTML to smaller ' +
      'than 100KB, to avoid getting emails cut off or rejected due to spam.'
    );
  }

  return html;
};


export default {
  renderTemplate: (...args) => {
    const rawHTML = renderRawHTML(...args);
    const html = HTML4.replaceWhitelistedAttributes(rawHTML);
    warnIfTemplateIsTooLarge(html);
    return html;
  }
};
