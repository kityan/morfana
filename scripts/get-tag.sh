#!/bin/bash -e

##
# Set the current var tag according the Git branch
#

## Initializing deploy for SemaphoreCI
if [ "${SEMAPHORE}" ]; then
    if [[ ${SEMAPHORE_GIT_BRANCH} == refs/tags/v* ]]; then
        export NPM_PUBLISH_TAG=${NPM_PUBLISH_TAG:-'latest'}
    else
        export NPM_PUBLISH_TAG=${NPM_PUBLISH_TAG:-'beta'}
    fi
else
  echo "SEMAPHORE is undefined" 1>&2; exit 1;
fi
