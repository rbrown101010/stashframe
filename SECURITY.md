# Security

Please report vulnerabilities privately through GitHub's **Security → Report a vulnerability** for this repository. Do not include secrets or private images in a public issue.

Use the latest release. This is a local desktop utility with a sandboxed renderer and restricted IPC, but it fetches third-party images and calls external services with your credentials. Avoid running unreviewed forks with your API keys.

Keys are encrypted locally through Electron safeStorage. They are never intended for source control, release archives, test fixtures, or logs. If you accidentally publish a key, revoke it at its provider and replace it in Settings.

Your library remains on your computer. Image search, background removal, and AI features send the inputs described in the README to their respective providers.
