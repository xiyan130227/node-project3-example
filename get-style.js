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

function getStyle () {
    const { Page, CSS, DOM } = protocol
    return Promise.all([
        DOM.enable(),
        CSS.enable(),
        Page.enable()
    ])
        .then(() => {
            Page.navigate({ url: 'https://github.com/' })
            return new Promise((resolve, _) => {
                Page.loadEventFired(() => { resolve(DOM.getDocument()) })
            })
        })
        .then(res => res.root.nodeId)
        .then(nodeId => DOM.querySelector({ selector: '.btn-primary', nodeId }))
        .then(({ nodeId }) => CSS.getComputedStyleForNode({ nodeId }))
        .then(style => { console.log(style) })
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
    .then(getStyle)
    .then(() => {
        protocol.close()
        launcher.kill()
    })
    .catch(console.error)