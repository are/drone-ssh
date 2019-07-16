const format = require('string-template')
const SSH = require('simple-ssh')
const fs = require('fs')
const path = require('path')

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

const USERNAME = format(process.env.PLUGIN_USERNAME, process.env)
const HOST = format(process.env.PLUGIN_HOST, process.env)
const PRIVATE_KEY_PATH = format(process.env.PLUGIN_PRIVATE_KEY_PATH, process.env)
const SCRIPT = process.env.PLUGIN_SCRIPT

const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8')

const ssh = new SSH({
    host: HOST,
    user: USERNAME,
    key: privateKey,
})

const lines = SCRIPT.split(',')

console.log(privateKey)
console.log(lines)
console.log(HOST, USERNAME, PRIVATE_KEY_PATH)

for (let line of lines) {
    const formattedLine = format(line, process.env)

    console.log(`${HOST} $ ${formattedLine}`)

    ssh.exec(formattedLine, {
        out: (message) => console.log(`${HOST} ${message}`)
    })
}

ssh.start()
  .on('error', () => {
      console.log(error)
      process.exit(1)
  })