import { gl } from "./app"

export function createShaderProgram(vertexShaderSrc, fragmentShaderSrc) {
    const vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderSrc)
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSrc)
    const shaderProgram = gl.createProgram()

    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram,)}`)
        return null
    }

    return shaderProgram
}

function loadShader(type, source) {
    const shader = gl.createShader(type)

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`)
        alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`)
        gl.deleteShader(shader)
        return null
    }

    return shader
}

export function setUniformMat4(program, name, matrix) {
    const loc = gl.getUniformLocation(program, name)
    gl.uniformMatrix4fv(loc, false, matrix.values())
}

export function setUniform3f(program, name, x, y, z) {
    const loc = gl.getUniformLocation(program, name)
    gl.uniform3f(loc, x, y, z)
}

export function setUniform2f(program, name, x, y) {
    const loc = gl.getUniformLocation(program, name)
    gl.uniform2f(loc, x, y)
}

export function setUniform1f(program, name, value) {
    const loc = gl.getUniformLocation(program, name)
    gl.uniform1f(loc, value)
}


export function setUniform1i(program, name, value) {
    const loc = gl.getUniformLocation(program, name)
    gl.uniform1i(loc, value)
}

export function setUniform4f(program, name, x, y, z, w) {
    const loc = gl.getUniformLocation(program, name)
    gl.uniform4f(loc, x, y, z, w)
}
