const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const node_ssh = require('node-ssh')
const exec = require('ssh-exec')
const ssh = new node_ssh()

const format = (str = '') => {
  return handlebars.compile(str)(process.env)
}

const USERNAME = format(process.env.PLUGIN_USERNAME)
const HOST = format(process.env.PLUGIN_HOST)
const PRIVATE_KEY_PATH = format(process.env.PLUGIN_PRIVATE_KEY_PATH)
const SCRIPT = process.env.PLUGIN_SCRIPT
const ENV = JSON.parse(process.env.PLUGIN_ENV)

for (let [key, value] of Object.entries(ENV)) {
  process.env[key] = format(value)
}

const STR_REGEX = /^\"([^\"]+)\"$/

const stream = exec(
  '/bin/sh',
  {
    host: HOST,
    user: USERNAME,
    key: PRIVATE_KEY_PATH
  },
  function(err, stdout, stderr) {
    if (err) {
      console.log(`[!!!] ${err.message}`)
      console.log(stdout, stderr)
      process.exit(1)
    }
  }
)
// await ssh.connect({
//   host: HOST,
//   username: USERNAME,
//   privateKey: PRIVATE_KEY_PATH
// })

const lines = SCRIPT.split(',')
const currentIdx = 0

function cont() {
  const line = lines[currentIdx]

  if (line === undefined) {
    stream.end()
    process.exit(0)
  }

  const formattedLine = format(line)

  console.log(`[${USERNAME}@${HOST}] $ ${formattedLine}`)

  stream.write(formattedLine + '\n')

  currentIdx += 1
}

stream.on('data', chunk => {
  const output = chunk.toString('utf8')
  for (let line of output.split('\n')) {
    console.log(`[ssh] ${line}`)
  }

  cont()
})

cont()
