bun install
cd src
sed -i -E "s/import.meta.env.CF_PAGES_BRANCH/\"$CF_PAGES_BRANCH\"/g" App.tsx
commit=$(git rev-parse --short HEAD)
sed -i -E "s/import.meta.env.GITHUB_COMMIT_SHA/\"$commit\"/g" App.tsx
cd ..
bun run build