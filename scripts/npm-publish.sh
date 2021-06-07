#!/bin/bash -e

PACKAGE_NAME=$(cat package.json | jq .name | sed "s/\"//g")

if [ "${SEMAPHORE}" ]; then
    if [ "${NPM_PUBLISH_TAG}" == latest ]; then
        npm dist-tag add ${PACKAGE_NAME}@$(cat package.json | jq .version | sed "s/\"//g") ${NPM_PUBLISH_TAG}
        npm dist-tag rm ${PACKAGE_NAME} beta
    else
        npm publish --tag ${NPM_PUBLISH_TAG} --access=public
    fi
else
    echo "SEMAPHORE is undefined" 1>&2; exit 1;
fi
