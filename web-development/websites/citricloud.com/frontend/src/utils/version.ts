// @ts-ignore
import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
export const GITHUB_REPO = 'devboxdel/citricloud';
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

// Get the commit hash from environment variable (if available)
// You can set this during build process
export const COMMIT_HASH = import.meta.env.VITE_COMMIT_HASH || 'main';

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
}

export function getVersionInfo() {
  return {
    version: APP_VERSION,
    githubUrl: GITHUB_URL,
    githubRepo: GITHUB_REPO,
    commitHash: COMMIT_HASH,
    releaseUrl: `${GITHUB_URL}/releases/tag/v${APP_VERSION}`,
    commitUrl: `${GITHUB_URL}/commit/${COMMIT_HASH}`,
    releasesUrl: `${GITHUB_URL}/releases`,
    apiReleasesUrl: `https://api.github.com/repos/${GITHUB_REPO}/releases`,
  };
}

export async function fetchGitHubReleases(limit: number = 10): Promise<GitHubRelease[]> {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch releases');
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub releases:', error);
    return [];
  }
}
