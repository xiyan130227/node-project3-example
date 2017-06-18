/**
 * Created by yangjing on 6/17/17.
 */
const {ChromeLauncher} = require('lighthouse/lighthouse-cli/chrome-launcher')
const chrome = require('chrome-remote-interface')
const fs = require('fs')

let protocol
let launcher

function launchChrome() {
    const launcher = new ChromeLauncher({
        port: 9222,
        autoSelectChrome: true,
        additionalFlags: ['--window-size=412,732', '--disable-gpu', '--headless']
    })
    return launcher.run().then(() => launcher)
}

function search() {
    const {Page, Runtime} = protocol
    return Promise.all([
        Page.enable()
    ])
        .then(() => {
            Page.navigate({url: 'https://www.baidu.com/'})
            return new Promise((resolve, _) => {
                Page.loadEventFired(() => {
                    resolve()
                })
            })
        })
        .then(() => {
            const code = [
                'var input = document.querySelector(\'.s_ipt\')',
                'var btn = document.querySelector(\'#su\')',
                'input.value=\'123\''
            ].join(';')
            return Runtime.evaluate({expression: code})
        })
        .then(() => {
            return new Promise((resolve, _) => {
                setTimeout(() => {
                    resolve(Page.captureScreenshot({format: 'jpeg', fromSurface: true}))
                }, 3000)
            })
        })
        .then(image => {
            const buffer = new Buffer(image.data, 'base64')
            return new Promise((resolve, reject) => {
                fs.writeFile('output_baidu.jpeg', buffer, 'base64', err => {
                    if (err) return reject(err)
                    resolve()
                })
            })
        })
}

launchChrome()
    .then(Launcher => {
        launcher = Launcher
        return new Promise((resolve, reject) => {
            chrome(Protocol => {
                protocol = Protocol
                resolve()
            }).on('error', err => {
                reject(err)
            })
        })
    })
    .then(search)
    .then(() => {
        protocol.close()
        launcher.kill()
    })
    .catch(console.error)
