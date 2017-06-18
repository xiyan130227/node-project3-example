/**
 * Created by yangjing on 6/17/17.
 */
const {ChromeLauncher} = require('lighthouse/lighthouse-cli/chrome-launcher')
const chrome = require('chrome-remote-interface')
const fs = require('fs')
const deviceMetrics = {
    width: 1200,
    height: 1000,
    deviceScaleFactor: 0,
    mobile: false,
    fitWindow: false
}
const screenshotMetrics = {
    width: deviceMetrics.width,
    height: deviceMetrics.height
}

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
function getScreenShot() {
    const {Page, Emulation} = protocol
    return Page.enable()
        .then(() => {
            Emulation.setDeviceMetricsOverride(deviceMetrics) // 配置浏览器尺寸
            Emulation.setVisibleSize(screenshotMetrics) // 配置截图尺寸
            Page.navigate({url: 'https://github.com/'})
            return new Promise((resolve, reject) => {
                Page.loadEventFired(() => {
                    resolve(Page.captureScreenshot({format: 'jpeg', fromSurface: true}))
                })
            })
        })
        .then(image => {
            const buffer = new Buffer(image.data, 'base64')
            return new Promise((resolve, reject) => {
                fs.writeFile('output_git.jpeg', buffer, 'base64', err => {
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
    .then(getScreenShot)
    .then(() => {
        protocol.close()
        launcher.kill()
    })
    .catch(console.error)