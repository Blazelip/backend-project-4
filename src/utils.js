import path from 'path';

const parseName = (url) => url.replace(/htt(p|ps):\/\//, '').replace(/\W/g, '-');

const parseResourceName = (url) => {
  const { href, pathname } = url;
  const fileExt = path.extname(pathname) || '.html';

  const nameForChange = `${path.parse(href).dir}/${path.parse(href).name}`;
  const nameWithoutExt = parseName(nameForChange);

  return `${nameWithoutExt}${fileExt}`;
};

const isResourceLinkLocal = (resourceLink, url) => {
  const absoluteLink = new URL(resourceLink, url);
  const urlInstance = new URL(url);

  return absoluteLink.hostname === urlInstance.hostname;
};

export { parseName, parseResourceName, isResourceLinkLocal };
