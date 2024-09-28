import { Quad } from "./quad"

const canvas = document.querySelector("#glcanvas")

export let runtime = 0
export const gl = canvas.getContext("webgl2")

let quad = null

let framebuffer1 = null
let framebuffer2 = null

let texture1 = null
let texture2 = null

let currentFramebuffer = null
let currentTexture = null
let previousFramebuffer = null
let previousTexture = null

function setupFramebuffer(framebuffer, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer not complete')
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}


function main() {
    resize()
    gl.clearColor(0.1, 0.1, 0.1, 1)

    framebuffer1 = gl.createFramebuffer()
    framebuffer2 = gl.createFramebuffer()

    texture1 = gl.createTexture()
    texture2 = gl.createTexture()

    setupFramebuffer(framebuffer1, texture1)
    setupFramebuffer(framebuffer2, texture2)

    currentFramebuffer = framebuffer1
    currentTexture = texture1
    previousFramebuffer = framebuffer2
    previousTexture = texture2

    quad = new Quad()

    update()
}

function update() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, currentFramebuffer)

    quad.render(previousTexture)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    quad.render(currentTexture)

    let tmpBuffer = previousFramebuffer
    previousFramebuffer = currentFramebuffer
    currentFramebuffer = tmpBuffer

    let tmpTexture = previousTexture
    previousTexture = currentTexture
    currentTexture = tmpTexture

    runtime++
    requestAnimationFrame(() => update(gl))
}


addEventListener("resize", () => {
});

onresize = () => {
    resize()
}

function resize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
}

main()
