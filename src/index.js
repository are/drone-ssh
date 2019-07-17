const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const format = (str = '') => {
  return handlebars.compile(str)(process.env)
}

const assert = (variable, message) => {
  if (variable === undefined) {
    throw message
  }

  return variable
}

const run = (command, { handleOut = data => console.log(data), handleErr = data => console.error(data), onStart = () => {} } = {}) => new Promise((res, rej) => {
  const process = exec(command, {
    timeout: 1000 * 60
  })

  onStart(process)

  process.on('close', (code, signal) => {
    if (code !== 0) {
      return rej(`Exited with non-zero code ${code}`)
    } 

    res(code)
  })

  process.on('error', rej)

  process.stdout.on('data', chunk => {
    handleOut && handleOut(chunk.toString('utf8'))
  })

  process.stderr.on('data', chunk => {
    handleErr && handleErr(chunk.toString('utf8'))
  })
})

const USERNAME = process.env.PLUGIN_USERNAME
const HOST = process.env.PLUGIN_HOST
const KEY_PATH = process.env.PLUGIN_PRIVATE_KEY_PATH
const SCRIPT = process.env.PLUGIN_SCRIPT
const ENV = process.env.PLUGIN_ENV

async function main () {
  const username = format(assert(USERNAME, 'Username must be defined'))
  const host = format(assert(HOST, 'Host must be defined'))
  const keyPath = format(assert(KEY_PATH, 'Private key path must be defined'))
  const script = assert(SCRIPT, 'Script must be defined').split(',')

  const sshKey = fs.readFileSync(keyPath, 'utf8')

  if (ENV !== undefined) {
    for (let [key, value] of Object.entries(JSON.parse(ENV))) {
      process.env[key] = format(value)
    }
  }

  await run('mkdir -p ~/.ssh/')
  await run(`ssh-keyscan -H ${host} >> ~/.ssh/known_hosts`)
  await run(`cat << EOF > ./key\n${sshKey}\nEOF`)
  await run(`chmod 600 ./key`)

  for (let line of script) {
    let formattedLine = format(line)

    console.log(`[ssh] ${formattedLine}`)

    await run(`ssh -i ./key ${username}@${host} ${formattedLine}`)
  }
}

main().then(() => {
  process.exit(0)
}).catch(err => {
  console.error(err)
  process.exit(1)
})