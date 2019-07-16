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

const lines = SCRIPT.split(',')
let currentIdx = 0

function go() {
  const line = lines[currentIdx]
  currentIdx += 1

  if (line === undefined) {
    process.exit(0)
  }

  const formattedLine = format(line)

  console.log(`[${USERNAME}@${HOST}] $ ${formattedLine}`)

  const stream = exec(
    formattedLine,
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
      } else {
        go()
      }
    }
  )

  stream.on('data', chunk => {
    const output = chunk.toString('utf8')

    for (let line of output.split('\n')) {
      console.log(`[ssh] ${line}`)
    }
  })
}

go()
