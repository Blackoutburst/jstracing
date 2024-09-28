import { camera, gl, numRenderedFrames, runtime, texture } from "./app"
import { fragmentShader2D, vertexShader2D } from "./shaders/tracer"
import { createShaderProgram, setUniform1f, setUniform1i, setUniform2f, setUniformMat4 } from "./shader"
import { Matrix } from "./math/matrix"

const vertices = [
    -1, -1,
    1, 1,
    -1, 1,
    1, -1,
]

const indices = [
    0, 1, 2,
    0, 3, 1,
]

export class Quad {
    constructor() {
        this.shaderProgram = createShaderProgram(vertexShader2D, fragmentShader2D)
        this.vaoId = gl.createVertexArray()

        gl.bindVertexArray(this.vaoId)

        //VAO
        const vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

        //EBO
        const indexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW)

        //ATTRIB
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0)

        gl.bindVertexArray(null)
    }

    render(previousTexture) {
        gl.useProgram(this.shaderProgram)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, previousTexture)
        setUniform1f(this.shaderProgram, "time", runtime)
        setUniform2f(this.shaderProgram, "resolution", window.innerWidth, window.innerHeight)
        setUniformMat4(this.shaderProgram, "model", new Matrix().scale(window.innerWidth, window.innerHeight).values())
        setUniformMat4(this.shaderProgram, "projection", camera.values())
        setUniform1f(this.shaderProgram, 'numRenderedFrames', numRenderedFrames)
        setUniform1i(this.shaderProgram, 'MainTexOld', 0)

        gl.bindVertexArray(this.vaoId)
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0)
        gl.bindVertexArray(null)
    }
}
