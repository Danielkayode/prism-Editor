#!/usr/bin/env bash
# shellcheck disable=SC2129

set -e

# Echo all environment variables used by this script
echo "----------- get_repo -----------"
echo "Environment variables:"
echo "CI_BUILD=${CI_BUILD}"
echo "GITHUB_REPOSITORY=${GITHUB_REPOSITORY}"
echo "RELEASE_VERSION=${RELEASE_VERSION}"
echo "VSCODE_LATEST=${VSCODE_LATEST}"
echo "VSCODE_QUALITY=${VSCODE_QUALITY}"
echo "GITHUB_ENV=${GITHUB_ENV}"

echo "SHOULD_DEPLOY=${SHOULD_DEPLOY}"
echo "SHOULD_BUILD=${SHOULD_BUILD}"
echo "-------------------------"

# git workaround for CI environments
if [[ "${CI_BUILD}" != "no" ]]; then
  git config --global --add safe.directory "/__w/$( echo "${GITHUB_REPOSITORY}" | awk '{print tolower($0)}' )"
fi

# The default branch for Prism Editor is 'master'
PRISM_BRANCH="master"
echo "Cloning Prism Editor from branch: ${PRISM_BRANCH}..."

# Build tools expect the source to be in a 'vscode' folder
mkdir -p vscode
cd vscode || { echo "'vscode' dir not found"; exit 1; }

git init -q
git remote add origin https://github.com/Danielkayode/prism-Editor.git

# Handle specific commit checkouts (from workflow inputs) or default to master
if [[ -n "${PRISM_COMMIT}" ]]; then
  echo "Using explicit commit ${PRISM_COMMIT}"
  git fetch --depth 1 origin "${PRISM_COMMIT}"
  git checkout "${PRISM_COMMIT}"
else
  echo "Fetching tip of ${PRISM_BRANCH}..."
  git fetch --depth 1 origin "${PRISM_BRANCH}"
  git checkout FETCH_HEAD
fi

# Extract versioning metadata
MS_TAG=$( jq -r '.version' "package.json" )
MS_COMMIT=$PRISM_BRANCH 

# Extract Prism-specific versioning (with fallback for transition period)
# Using 'select(. != null)' and 'empty' to ensure we don't get the string "null"
PRISM_VERSION=$( jq -r '.prismVersion // .voidVersion | select(. != null) // empty' "product.json" )

if [[ -n "${PRISM_RELEASE}" ]]; then 
  # Manual release override from workflow dispatch
  RELEASE_VERSION="${MS_TAG}${PRISM_RELEASE}"
else
  # Automatic release suffix from product.json
  # We filter out null to prevent "1.99.3null" issues
  PRISM_RELEASE_VAL=$( jq -r '.prismRelease // .voidRelease | select(. != null) // empty' "product.json" )
  RELEASE_VERSION="${MS_TAG}${PRISM_RELEASE_VAL}"
fi

echo "RELEASE_VERSION=\"${RELEASE_VERSION}\""
echo "MS_COMMIT=\"${MS_COMMIT}\""
echo "MS_TAG=\"${MS_TAG}\""

cd ..

# Export variables for GitHub Actions environment
if [[ "${GITHUB_ENV}" ]]; then
  echo "MS_TAG=${MS_TAG}" >> "${GITHUB_ENV}"
  echo "MS_COMMIT=${MS_COMMIT}" >> "${GITHUB_ENV}"
  echo "RELEASE_VERSION=${RELEASE_VERSION}" >> "${GITHUB_ENV}"
  echo "PRISM_VERSION=${PRISM_VERSION}" >> "${GITHUB_ENV}"
fi

echo "----------- get_repo exports -----------"
echo "MS_TAG: ${MS_TAG}"
echo "MS_COMMIT: ${MS_COMMIT}"
echo "RELEASE_VERSION: ${RELEASE_VERSION}"
echo "PRISM_VERSION: ${PRISM_VERSION}"
echo "----------------------"

export MS_TAG
export MS_COMMIT
export RELEASE_VERSION
export PRISM_VERSION
