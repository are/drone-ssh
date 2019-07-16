
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
