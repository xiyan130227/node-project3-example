/**
 * Created by yangjing on 6/17/17.
 */
const {ChromeLauncher} = require('lighthouse/lighthouse-cli/chrome-launcher')
const chrome = require('chrome-remote-interface')

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

function setUAandCookie () {
    const { Page, Network } = protocol
    return Promise.all([
        Network.enable(),
        Page.enable()
    ])
        .then(() => {
            Network.setUserAgentOverride({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.71 Safari/537.36" })
            Network.setCookie({
                url: 'https://github.com',
                name: 'test',
                value: '123',
                domain: '.github.com',
                path: '/',
                httpOnly: true
            })
            Page.navigate({ url: 'https://github.com/' })
            return new Promise((resolve, _) => {
                Page.loadEventFired(() => { resolve() })
            })
        })
        .then(() => {
            return Network.getCookies()
        })
        .then(console.log)
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
    .then(setUAandCookie)
    .then(() => {
        protocol.close()
        launcher.kill()
    })
    .catch(console.error)

