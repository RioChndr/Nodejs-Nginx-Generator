#!/usr/bin/env node
import fs from 'fs'
import chalk from 'chalk'
import { exec } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { program } from 'commander';

program
  .option('-u, --url <url>', 'URL of the site')
  .option('-o, --output <dest output>', 'Output file')
  .option('-p, --port <port>', 'Port of the site')
  .option('-c, --certbot', 'Use certbot to generate SSL certificate')

program.parse(process.argv);

const options = program.opts();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const chalkLog = chalk.hex('#a19c9c')
const chalkInfo = chalk.hex('#5869db')

let input = {
  url: options.url,
  proxyUrl: 'http://127.0.0.1:' + options.port,
  outputFile: options.output,
}

let isFilled = Object.values(input).every((v) => !!v)
if(!isFilled) {
  program.help()
}

console.log(chalkInfo('Generating nginx sites configuration file'))
console.log(chalkLog(`input: ${JSON.stringify(input)}`))

console.log(chalkLog('read file format-vhost'))
let pathFormat = path.join(__dirname, '/format-vhost')
console.log(pathFormat)
let format = fs.readFileSync(pathFormat).toString()

Object.keys(input).forEach((key) => {
  format = format.replace(new RegExp(`{${key}}`, 'g'), input[key])
})
console.log(chalkLog('Formatting to nginx sites configuration file'))

fs.writeFileSync(input.outputFile, format, 'utf-8')
console.log(chalkInfo(`output: ${input.outputFile}`))

console.log(chalkInfo(`Copy file to sites-enabled`))
exec(`sudo ln -s ${process.cwd()}/${input.outputFile} /etc/nginx/sites-enabled/${input.outputFile}`)

console.log(chalkInfo(`Reload nginx`))
exec(`sudo nginx -s reload`)

if(options.certbot) {
  console.log(chalkInfo(`Run certbot to generate SSL certificate for ${input.url}`))
  exec(`certbot certonly --nginx --preferred-challenges http -d ${input.url}`, (err, stdout, stderr) => {
    if (err) {
      console.log(chalk.red(`Error: ${err}`))
      return
    }
    console.log(chalk.green(`stdout: ${stdout}`))
    console.log(chalk.green(`stderr: ${stderr}`))
  })
} else {
  console.log(chalkInfo('Finish without SSL certificate'))
  console.log(chalkInfo(`Please run certbot to generate SSL certificate for ${input.url}`))
}