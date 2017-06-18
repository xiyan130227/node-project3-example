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

function getPageHtml() {
    const {Page, Emulation} = protocol
    return Page.enable()
        .then(() => {
            const result = Page.getResourceContent(
                    {frameId: Page.navigate({url: 'https://github.com/'})},
                    {url: 'https://github.com/'})
            console.log(result.content)
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
    .then(getPageHtml)
    .then(() => {
        protocol.close()
        launcher.kill()
    })
    .catch(console.error)