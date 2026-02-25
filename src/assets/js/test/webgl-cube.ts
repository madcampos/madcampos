/**
 * Based on: https://www.geeksforgeeks.org/javascript/how-to-load-3d-models-in-webgl/
 */
/* eslint-disable no-bitwise, @typescript-eslint/no-magic-numbers */

import { mat4 } from 'gl-matrix';

interface ProgramInfo {
	program: WebGLProgram;
	attribLocations: {
		vertexPosition: number,
		vertexColor: number
	};
	uniformLocations: {
		projectionMatrix: WebGLUniformLocation | null,
		modelViewMatrix: WebGLUniformLocation | null
	};
}

interface Buffers {
	position: WebGLBuffer;
	color: WebGLBuffer;
	indices: WebGLBuffer;
}

const canvas = document.querySelector('#canvas-3d') as HTMLCanvasElement;
const glContext = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext;

let curWidth = 0;
let curHeight = 0;

let cubeRotation = 0.0;

function loadShader(type: WebGLRenderingContext['FRAGMENT_SHADER'] | WebGLRenderingContext['VERTEX_SHADER'], source: string) {
	const shader = glContext.createShader(type);

	if (!shader) {
		return;
	}

	glContext.shaderSource(shader, source);
	glContext.compileShader(shader);

	if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
		console.error(
			`An error occurred compiling the shaders: ${glContext.getShaderInfoLog(shader)}`
		);
		glContext.deleteShader(shader);

		return;
	}

	return shader;
}

function initShaderProgram(vsSource: string, fsSource: string) {
	const vertexShader = loadShader(glContext.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(glContext.FRAGMENT_SHADER, fsSource);

	if (!vertexShader || !fragmentShader) {
		return;
	}

	const shaderProgram = glContext.createProgram();
	glContext.attachShader(shaderProgram, vertexShader);
	glContext.attachShader(shaderProgram, fragmentShader);
	glContext.linkProgram(shaderProgram);

	if (!glContext.getProgramParameter(shaderProgram, glContext.LINK_STATUS)) {
		console.error('Unable to initialize the shader program: ', glContext.getProgramInfoLog(shaderProgram));

		return;
	}

	return shaderProgram;
}

function initBuffers() {
	const positionBuffer = glContext.createBuffer();
	glContext.bindBuffer(glContext.ARRAY_BUFFER, positionBuffer);

	// dprint-ignore-line
	const positions = [ -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0 ];

	glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(positions), glContext.STATIC_DRAW);

	const faceColors = [
		[0.8, 0.2, 0.2, 1.0],
		[0.2, 0.8, 0.2, 1.0],
		[0.2, 0.2, 0.8, 1.0],
		[0.8, 0.8, 0.2, 1.0],
		[0.8, 0.2, 0.8, 1.0],
		[0.2, 0.8, 0.8, 1.0]
	];

	let colors: number[] = [];

	faceColors.forEach((color) => {
		colors = colors.concat(color, color, color, color);
	});

	const colorBuffer = glContext.createBuffer();
	glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);
	glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(colors), glContext.STATIC_DRAW);

	const indexBuffer = glContext.createBuffer();
	glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// dprint-ignore-line
	const indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];

	glContext.bufferData(glContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), glContext.STATIC_DRAW);

	return {
		position: positionBuffer,
		color: colorBuffer,
		indices: indexBuffer
	};
}

function drawScene(programInfo: ProgramInfo, buffers: Buffers, deltaTime: number) {
	glContext.clearColor(0.2, 0.35, 0.15, 1.0);
	glContext.clearDepth(1.0);
	glContext.enable(glContext.DEPTH_TEST);
	glContext.depthFunc(glContext.LEQUAL);
	glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);

	const fieldOfView = (45 * Math.PI) / 180;
	const aspect = (glContext.canvas as HTMLCanvasElement).width / (glContext.canvas as HTMLCanvasElement).height;
	const projectionMatrix = mat4.create();
	mat4.perspective(projectionMatrix, fieldOfView, aspect, 1, Infinity);

	const modelViewMatrix = mat4.create();
	mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -10.0]);
	mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 1, 0]);
	mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.7, [1, 0, 0]);

	{
		const numComponents = 3;
		const type = glContext.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		glContext.bindBuffer(glContext.ARRAY_BUFFER, buffers.position);
		glContext.vertexAttribPointer(
			programInfo.attribLocations
				.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset
		);
		glContext.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
	}

	{
		const numComponents = 4;
		const type = glContext.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		glContext.bindBuffer(glContext.ARRAY_BUFFER, buffers.color);
		glContext.vertexAttribPointer(
			programInfo.attribLocations
				.vertexColor,
			numComponents,
			type,
			normalize,
			stride,
			offset
		);
		glContext.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
	}

	glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, buffers.indices);

	glContext.useProgram(programInfo.program);
	glContext.uniformMatrix4fv(
		programInfo.uniformLocations
			.projectionMatrix,
		false,
		projectionMatrix
	);
	glContext.uniformMatrix4fv(
		programInfo.uniformLocations
			.modelViewMatrix,
		false,
		modelViewMatrix
	);

	{
		const vertexCount = 36;
		const type = glContext.UNSIGNED_SHORT;
		const offset = 0;
		glContext.drawElements(glContext.TRIANGLES, vertexCount, type, offset);
	}

	cubeRotation += deltaTime;
}
function resizeCanvas(width: number, height: number) {
	canvas.width = width;
	canvas.height = height;

	glContext.viewport(0, 0, width, height);
}

function main() {
	if (!glContext) {
		return;
	}

	const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying lowp vec4 vColor;
        void main(void) {
            gl_Position = uProjectionMatrix *
            uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    `;

	const fsSource = `
        varying lowp vec4 vColor;
        void main(void) {
            gl_FragColor = vColor;
        }
    `;

	const shaderProgram = initShaderProgram(vsSource, fsSource);

	if (!shaderProgram) {
		return;
	}

	const programInfo: ProgramInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: glContext.getAttribLocation(shaderProgram, 'aVertexPosition'),
			vertexColor: glContext.getAttribLocation(shaderProgram, 'aVertexColor')
		},
		uniformLocations: {
			projectionMatrix: glContext.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: glContext.getUniformLocation(shaderProgram, 'uModelViewMatrix')
		}
	};

	const buffers = initBuffers();

	let then = 0;
	let rafReference: number;

	function render(now: DOMHighResTimeStamp) {
		const nowPlusEpsilon = now * 0.001;
		const deltaTime = nowPlusEpsilon - then;

		then = nowPlusEpsilon;

		drawScene(programInfo, buffers, deltaTime);

		rafReference = requestAnimationFrame(render);
	}

	const resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const newWidth = Math.floor((entry.borderBoxSize[0]?.inlineSize ?? 0) * window.devicePixelRatio);
			const newHeight = Math.floor((entry.borderBoxSize[0]?.blockSize ?? 0) * window.devicePixelRatio);

			if (curHeight !== newHeight || curWidth !== newWidth) {
				curWidth = newWidth;
				curHeight = newHeight;

				resizeCanvas(newWidth, newHeight);
				cancelAnimationFrame(rafReference);
				rafReference = requestAnimationFrame(render);
			}
		}
	});

	resizeObserver.observe(canvas);
}

main();
