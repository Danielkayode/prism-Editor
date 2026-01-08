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

# git workaround
if [[ "${CI_BUILD}" != "no" ]]; then
  git config --global --add safe.directory "/__w/$( echo "${GITHUB_REPOSITORY}" | awk '{print tolower($0)}' )"
fi

# Allow PRISM_BRANCH to be overridden, default to main
PRISM_BRANCH="${PRISM_BRANCH:-main}"
echo "Cloning Prism..."

mkdir -p vscode
cd vscode || { echo "'vscode' dir not found"; exit 1; }

git init -q
git remote add origin https://github.com/Danielkayode/prism-Editor.git

# Allow callers to specify a particular commit to checkout via the
# environment variable PRISM_COMMIT.
if [[ -n "${PRISM_COMMIT}" ]]; then
  echo "Using explicit commit ${PRISM_COMMIT}"
  git fetch --depth 1 origin "${PRISM_COMMIT}"
  git checkout "${PRISM_COMMIT}"
else
  # Try to fetch the default branch (main). 
  # We use 'if git fetch' which is safe under 'set -e' because the failure is handled.
  echo "Attempting to fetch branch: ${PRISM_BRANCH}"
  if git fetch --depth 1 origin "${PRISM_BRANCH}" 2>/dev/null; then
    echo "Successfully fetched ${PRISM_BRANCH}"
  else
    echo "Branch '${PRISM_BRANCH}' not found. Trying 'master'..."
    PRISM_BRANCH="master"
    if ! git fetch --depth 1 origin "${PRISM_BRANCH}" 2>/dev/null; then
        echo "Branch 'master' not found. Fetching default remote branch..."
        # Final fallback: fetch whatever the remote head is
        git fetch --depth 1 origin
        PRISM_BRANCH=$(git remote show origin | sed -n '/HEAD branch/s/.*: //p')
        echo "Detected default branch as: ${PRISM_BRANCH}"
        git fetch --depth 1 origin "${PRISM_BRANCH}"
    fi
    echo "Successfully fetched ${PRISM_BRANCH}"
  fi
  git checkout FETCH_HEAD
fi

MS_TAG=$( jq -r '.version' "package.json" )
MS_COMMIT=$PRISM_BRANCH 

# Prism - Attempt to get prismVersion, fallback to null/empty if missing
PRISM_VERSION=$( jq -r '.prismVersion // empty' "product.json" )

# Fallback handling if not in product.json yet
if [[ -z "${PRISM_VERSION}" ]]; then
  echo "Prism version not found in product.json, using default fallback."
  PRISM_VERSION="0.0.1"
fi

if [[ -n "${PRISM_RELEASE}" ]]; then 
  RELEASE_VERSION="${MS_TAG}${PRISM_RELEASE}"
else
  # Prism - Attempt to get prismRelease, fallback
  PRISM_RELEASE=$( jq -r '.prismRelease // empty' "product.json" )
  
  if [[ -z "${PRISM_RELEASE}" ]]; then
     echo "Prism release not found in product.json, using default fallback."
     PRISM_RELEASE=""
  fi
  
  RELEASE_VERSION="${MS_TAG}${PRISM_RELEASE}"
fi

echo "RELEASE_VERSION=\"${RELEASE_VERSION}\""
echo "MS_COMMIT=\"${MS_COMMIT}\""
echo "MS_TAG=\"${MS_TAG}\""

cd ..

# for GH actions
if [[ "${GITHUB_ENV}" ]]; then
  echo "MS_TAG=${MS_TAG}" >> "${GITHUB_ENV}"
  echo "MS_COMMIT=${MS_COMMIT}" >> "${GITHUB_ENV}"
  echo "RELEASE_VERSION=${RELEASE_VERSION}" >> "${GITHUB_ENV}"
  echo "PRISM_VERSION=${PRISM_VERSION}" >> "${GITHUB_ENV}"
fi

echo "----------- get_repo exports -----------"
echo "MS_TAG ${MS_TAG}"
echo "MS_COMMIT ${MS_COMMIT}"
echo "RELEASE_VERSION ${RELEASE_VERSION}"
echo "PRISM VERSION ${PRISM_VERSION}"
echo "----------------------"


export MS_TAG
export MS_COMMIT
export RELEASE_VERSION
export PRISM_VERSION
