export const repoUrl = 'https://github.com/runrunliuliu/swarm-orca';
export function url(path = '') {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
export function dateLabel(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
}
export function imageSet(path: string) {
  if (!['images/ocean.jpg', 'images/coast.jpg'].includes(path)) return undefined;
  return `${url(path.replace('.jpg', '-small.webp'))} 640w, ${url(path)} ${path.includes('ocean') ? 1600 : 1200}w`;
}
