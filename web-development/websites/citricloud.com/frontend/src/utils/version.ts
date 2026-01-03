// @ts-ignore
import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
export const GITHUB_REPO = 'devboxdel/citricloud';
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

// Get the commit hash from environment variable (if available)
// You can set this during build process
export const COMMIT_HASH = import.meta.env.VITE_COMMIT_HASH || 'main';

export function getVersionInfo() {
  return {
    version: APP_VERSION,
    githubUrl: GITHUB_URL,
    githubRepo: GITHUB_REPO,
    commitHash: COMMIT_HASH,
    releaseUrl: `${GITHUB_URL}/releases/tag/v${APP_VERSION}`,
    commitUrl: `${GITHUB_URL}/commit/${COMMIT_HASH}`,
  };
}
