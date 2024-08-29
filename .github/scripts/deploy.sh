#!/usr/bin/env sh

# Deployment script to deploy web app to GitHub Pages by commiting changes to gh-changes branch

# Notice: Depending on your setup you may need to change
# the directories when moving files into root between at lines 35, 36

# abort on errors
set -e

# Build app
npm run build

# Setup git user
git config --global user.name "$GITHUB_ACTOR"
git config --global user.email "${GITHUB_ACTOR}@bots.github.com"

# Checkout gh-pages branch
git checkout gh-pages

# Remove old and unneccessary files
shopt -s dotglob # enable hidden files
for file in ./*
do
    if [[ "${file##*/}" == "dist" || "${file##*/}" == ".git" || "${file##*/}" == ".gitignore" || "${file##*/}" == ".github" ]]
    then
        printf "******* DONT'T delete: ${file##*/}\n"
    else
        printf "Delete file or folder: ${file##*/} \n"
        rm -rf "$file"
    fi
done

# Move dist folder content to root
cp -r -f dist/* ./
rm -r dist
ls -la

# Add files to commit
git add -A

# Commit or not commit that is the question
if [ -n "$(git status --porcelain)" ]; then
    printf "There are changes. \n"
    git commit -m "updated GitHub Pages"
    git remote set-url origin "https://github.com/${GITHUB_REPOSITORY}"
    git push --force-with-lease origin gh-pages
else
    printf "No changes, the job is done."
fi
