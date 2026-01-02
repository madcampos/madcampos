// TODO: render a cube

const canvas = /** @type {HTMLCanvasElement}*/ (document.querySelector('#canvas-3d'));
const gl = /** @type {WebGLRenderingContext} */ (canvas.getContext('webgl'));

const { width, height } = canvas.getBoundingClientRect();

canvas.width = Math.floor(width);
canvas.height = Math.floor(height);

canvas.style.width = `${canvas.width}px`;
canvas.style.height = `${canvas.height}px`;

gl.canvas.width = canvas.width;
gl.canvas.height = canvas.height;

const vertexShader = /** @type {WebGLShader} */ (gl.createShader(gl.VERTEX_SHADER));
gl.shaderSource(
	vertexShader,
	`#version 100
void main() {
	gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
	gl_PointSize = 64.0;
}
`
);
gl.compileShader(vertexShader);

const fragmentShader = /** @type {WebGLShader} */ (gl.createShader(gl.FRAGMENT_SHADER));
gl.shaderSource(
	fragmentShader,
	`#version 100
void main() {
	gl_FragColor = vec4(0.18, 0.54, 0.34, 1.0);
}
`
);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.detachShader(program, vertexShader);
gl.detachShader(program, fragmentShader);
gl.deleteShader(vertexShader);
gl.deleteShader(fragmentShader);

gl.enableVertexAttribArray(0);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.drawArrays(gl.POINTS, 0, 1);

gl.useProgram(null);
gl.deleteBuffer(buffer);
gl.deleteProgram(program);
