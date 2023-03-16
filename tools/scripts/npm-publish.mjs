#!/usr/bin/env zx
import { $ } from 'zx'

const packageNamePo = await $`cat package.json | jq -r .name`
const packageVerPo = await $`cat package.json | jq -r .version`

if (!process.env.SEMAPHORE) {
  console.log('SEMAPHORE is undefined')
  process.exit(1)
}

const PACKAGE_NAME = packageNamePo.toString().replace('\n', '')
const PACKAGE_VERSION = packageVerPo.toString().replace('\n', '')

const buildPackageVersion = (ver, sha, date) => {
  if (ver.includes(process.env.NPM_PUBLISH_TAG)) return ver
  return `${ver}-beta-${sha}-${date}`
}

const deprecatePrevSimilarVersions = async (currentVer) => {
  console.log('Set previouse version as deprecated from', currentVer)
  const verionsListPo = await $`npm view ${PACKAGE_NAME} versions --json`
  const versions = JSON.parse(verionsListPo.toString())

  const similarVersions = versions.filter((ver) => {
    if (ver === currentVer) return false

    const semverFromVersion = ver.match(/^[0-9]{1,9}.[0-9]{1,9}.[0-9]{1,9}/gi)
    return (
      ver.includes(process.env.NPM_PUBLISH_TAG) && (ver.includes(PACKAGE_VERSION) || ver.includes(semverFromVersion))
    )
  })

  try {
    await Promise.all(similarVersions.map((ver) => $`npm deprecate ${packageNamePo}@${ver} beta`))
  } catch (p) {
    console.log(`Exit code: ${p.exitCode}`)
    console.log(`Error: ${p.stderr}`)
    console.log('!!!!!! Maybe package was deprecated early')
  }
}

if (process.env.NPM_PUBLISH_TAG === 'latest') {
  console.log('Publish with tag:', process.env.NPM_PUBLISH_TAG)
  await $`npm publish --access public --tag ${process.env.NPM_PUBLISH_TAG}`
} else {
  // Calc new version for beta package
  const GIT_HASH = await $`git rev-parse --short HEAD`
  const DATE = await $`date +%Y%m%d`
  const NPM_VERSION = buildPackageVersion(
    PACKAGE_VERSION,
    GIT_HASH.toString().replace('\n', ''),
    DATE.toString().replace('\n', '')
  )

  const newJsonContentPo = await $`jq --arg ver "${NPM_VERSION}" '.version = $ver' package.json`
  const newJsonContent = newJsonContentPo.toString()

  await $`echo ${newJsonContent} > package.json`
  await $`npm publish --access public --tag ${process.env.NPM_PUBLISH_TAG}`

  await deprecatePrevSimilarVersions(NPM_VERSION)
}
