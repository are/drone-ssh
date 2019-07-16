
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const node_ssh = require('node-ssh')
const ssh = new node_ssh()

  // - apk update
  // - apk add openssh
  // - apk add git
  // - mkdir -p ~/.ssh/
  // - ssh-keyscan -H dokku.are1000.dev >> ~/.ssh/known_hosts
  // - eval $(ssh-agent -s)
  // - npx -q gitea-secret -h git.are1000.dev -t "$GITEA_TOKEN" -r are/secrets -k ssh-keys/dokku-drone/private | ssh-add -
  // - export APP_NAME="$DRONE_TAG-$DOMAIN"
  // - ssh dokku@dokku.are1000.dev apps:create "$APP_NAME"
  // - ssh dokku@dokku.are1000.dev domains:add "$APP_NAME" "$APP_NAME"
  // - ssh dokku@dokku.are1000.dev tar:from "$APP_NAME" "https://git.are1000.dev/are/blog.iama.re/releases/download/$DRONE_TAG/release.tar"
  // - ssh dokku@dokku.are1000.dev letsencrypt "$APP_NAME"

const format = (str = '') => {
    return handlebars.compile(str)(process.env)
}

const USERNAME = format(process.env.PLUGIN_USERNAME)
const HOST = format(process.env.PLUGIN_HOST)
const PRIVATE_KEY_PATH = format(process.env.PLUGIN_PRIVATE_KEY_PATH)
const SCRIPT = process.env.PLUGIN_SCRIPT
const ENV = JSON.parse(process.env.PLUGIN_ENV)

for (let [key, value] of Object.entries(ENV)) {
    console.log(key, value, format(value))
    process.env[key] = format(value)
}

async function main () {
    const connection = await ssh.connect({
        host: HOST,
        username: USERNAME,
        privateKey: PRIVATE_KEY_PATH,
    })

    const lines = SCRIPT.split(',')

    for (let line of lines) {
        const formattedLine = format(line)

        console.log(`${HOST} $ ${formattedLine}`)

        const {stdout, stderr} = await ssh.execCommand(formattedLine)

        if (stderr) {
            throw stderr
        } else {
            console.log(stdout)
        }
    }
}

main().catch(error => {
    console.log(error)
    process.exit(1)
})
