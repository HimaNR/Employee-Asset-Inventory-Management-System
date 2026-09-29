export const PROBLEM_BASE_URI = 'https://assetflow.local/problems';

export const problemType = (slug: string): string =>
  `${PROBLEM_BASE_URI}/${slug}`;