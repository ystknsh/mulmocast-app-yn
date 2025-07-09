
# Mulmo app



## 🚀 Assets

- Vue 3
- Tailwind CSS
- Express

---

## ▶️ Run

```bash
npm install -g @electron-forge/cli
yarn install
yarn run start
```

## GitHub Actions Build

### Running Mac Build via GitHub Actions

1. Navigate to the repository: https://github.com/receptron/mulmocast-app
2. Go to the "Actions" tab
3. Select "Build for Mac" workflow or directly access: https://github.com/receptron/mulmocast-app/actions/workflows/ci-mac.yml
4. Click "Run workflow" button
5. Select the target branch (default: `main`)
6. Once complete, download from Artifacts section

### Fixing Downloaded App Permissions

```bash
# Remove all extended attributes
xattr -c mulmocast-app.app
```

### Debug Mode

```bash
# Run app directly to see console output
./mulmocast-app.app/Contents/MacOS/mulmocast-app

# Or use Developer Tools within the app
# Press Cmd+Option+I after app launches
```

### Note

**GitHub Actions downloads are slow**: Building and downloading from GitHub Actions takes time. Local builds are recommended during development.

# info

install
https://www.electronforge.io/

add vue-3
https://www.electronforge.io/guides/framework-integration/vue-3

tailwindcss
https://tailwindcss.com/docs/installation/using-vite

# install command

npx create-electron-app@latest mulmocast-app --template=vite-typescript
