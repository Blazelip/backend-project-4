import path from 'path';

const parseName = (url) => {
  const { protocol, href } = new URL(url);

  const linkWithoutProtocol = href.replace(`${protocol}//`, '');
  const fileName = linkWithoutProtocol.replace(/\.|\//g, '-');
  return fileName;
};

const parseResourceName = (url) => {
  const { protocol, href } = new URL(url);
  const fileExt = path.extname(url) || '.html';

  const linkWithoutProtocol = href.replace(`${protocol}//`, '');
  const linkWithoutExt = linkWithoutProtocol.replace(fileExt, '');
  const transformedPath = linkWithoutExt.replace(/\.|\//g, '-');
  return `${transformedPath}${fileExt}`;
};

const isResourceLinkLocal = (resourceLink, url) => {
  const absoluteLink = new URL(resourceLink, url);
  const urlInstance = new URL(url);

  return absoluteLink.hostname === urlInstance.hostname;
};

export { parseName, parseResourceName, isResourceLinkLocal };
