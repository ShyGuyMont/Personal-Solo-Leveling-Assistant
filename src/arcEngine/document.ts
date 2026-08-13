import archiveAppUrl from './app.js?url';
import archiveDescriptionsUrl from './arts-descriptions.js?url';
import archiveDetailsUrl from './arts-details.js?url';
import archiveCatalogsUrl from './catalogs.js?url';
import archiveTemplate from './index.html?raw';
import archiveStylesUrl from './styles.css?url';

function absoluteAssetUrl(assetUrl: string) {
  return new URL(assetUrl, window.location.href).href;
}

export function createArcForgeDocument() {
  return archiveTemplate
    .replace('href="styles.css"', `href="${absoluteAssetUrl(archiveStylesUrl)}"`)
    .replace('src="arts-descriptions.js"', `src="${absoluteAssetUrl(archiveDescriptionsUrl)}"`)
    .replace('src="arts-details.js"', `src="${absoluteAssetUrl(archiveDetailsUrl)}"`)
    .replace('src="catalogs.js"', `src="${absoluteAssetUrl(archiveCatalogsUrl)}"`)
    .replace('src="app.js"', `src="${absoluteAssetUrl(archiveAppUrl)}"`)
    .replaceAll('content="og.png"', 'content=""');
}
