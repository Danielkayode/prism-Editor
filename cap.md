# Website Implementation Guide for Prism Editor

To support the Prism Editor application, the website (`https://prismeditor.com`) needs to implement the following features and endpoints:

## 1. Landing and Download Pages
The application refers to these specific URLs for user redirection:
- `https://prismeditor.com/`: Main landing page.
- `https://prismeditor.com/download-beta`: Direct link for users to download the latest beta version. This should ideally detect the user's OS and provide the correct binary or a list of options (Windows, macOS, Linux).

## 2. Update Server (Optional but Recommended)
The app is currently configured to check for updates using the GitHub API:
`https://api.github.com/repos/prismeditor/binaries/releases/latest`

If you wish to move to a dedicated update server (standard VS Code protocol), you should:
1. Update `product.json` to include an `"updateUrl": "https://prismeditor.com/api/update"`.
2. Implement the following endpoint on your website:
   `GET /api/update/<platform>/<quality>/<commit>`
   
   - **Platform Examples:** `win32-x64`, `darwin-arm64`, `linux-x64`.
   - **Quality:** `stable` or `insider`.
   - **Response (If Update Available - 200 OK):**
     ```json
     {
       "url": "https://prismeditor.com/download/ Prism-setup-1.4.10.exe",
       "name": "1.4.10",
       "releaseNotes": "https://prismeditor.com/releasenotes/1.4.10",
       "version": "1.4.10",
       "tag": "1.4.10",
       "pub_date": "2025-01-03T12:00:00Z",
       "notes": "Bug fixes and performance improvements.",
       "hash": "sha256-hash-of-the-binary"
     }
     ```
   - **Response (If No Update Available):** Return `204 No Content`.

## 3. GitHub Organization
Ensure the GitHub organization `prismeditor` exists and has a repository named `binaries` with a "latest" release tag containing the application binaries. This repository is used by `PrismMainUpdateService` as a fallback or manual check mechanism.

## 4. Documentation
The documentation link in the README points to `https://docs.prismeditor.com`. This should be a sub-domain or a section on the main site providing usage guides and API references.

## 5. Support Email
Ensure `digdoglimited@gmail.com` is an active email address for user support and company inquiries.
