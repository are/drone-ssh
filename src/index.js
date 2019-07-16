const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const node_ssh = require('node-ssh')
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

async function main() {
  await ssh.connect({
    host: HOST,
    username: USERNAME,
    privateKey: PRIVATE_KEY_PATH
  })

  const lines = SCRIPT.split(',')

  for (let line of lines) {
    const formattedLine = format(line)

    console.log(`[${USERNAME}@${HOST}] $ ${formattedLine}`)

    const [command, ...args] = formattedLine.split(' ')

    const strippedArgs = args.map(arg => {
      // if (STR_REGEX.test(arg)) {
      //   let [_, result] = arg.match(STR_REGEX)

      //   return result
      // }

      return arg
    })

    console.log(command, strippedArgs)

    const result = await ssh.exec(command, strippedArgs, {
      onStdout: chunk => {
        console.log(chunk.toString('utf8'))
      },
      onStderr: chunk => {
        console.error(chunk.toString('utf8'))
      }
    })

    console.log(result)

    if (result.code !== 0) {
      throw 'Failed'
    }
  }
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.log(error)
    process.exit(1)
  })
