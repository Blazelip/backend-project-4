import path from 'path';

const parseName = (url) => {
  const { protocol, href } = new URL(url);

  const linkWithoutProtocol = href.replace(`${protocol}//`, '');
  const fileName = linkWithoutProtocol.replace(/\.|\//g, '-');
  return fileName;
};

const parseResourceName = (url) => {
  const { protocol, href } = new URL(url);
  const fileExt = path.extname(url);

  const linkWithoutProtocol = href.replace(`${protocol}//`, '');
  const linkWithoutExt = linkWithoutProtocol.replace(fileExt, '');
  const transformedPath = linkWithoutExt.replace(/\.|\//g, '-');
  return `${transformedPath}${fileExt}`;
};

const isResourceLinkLocal = (resourceLink, url) => {
  console.log("🚀 ~ file: utils.js ~ line 22 ~ isResourceLinkLocal ~ url", url)
  console.log("🚀 ~ file: utils.js ~ line 22 ~ isResourceLinkLocal ~ resourceLink", resourceLink)
  
  const absoluteLink = new URL(resourceLink, url);
  console.log("🚀 ~ file: utils.js ~ line 26 ~ isResourceLinkLocal ~ absoluteLink", absoluteLink.hostname)
  const urlInstance = new URL(url);
  console.log("🚀 ~ file: utils.js ~ line 28 ~ isResourceLinkLocal ~ urlInstance", urlInstance.hostname)
  return absoluteLink.hostname === urlInstance.hostname;
};

export { parseName, parseResourceName, isResourceLinkLocal };
