const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");
window.onresize = init;

function createTexture() {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
}

function createAlphabetTexture() {
    const texture = createTexture();
    const image = new Image();
    image.onload = () => {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.activeTexture(gl.TEXTURE0);
    };
    image.src = "alphabet.png";
    return texture;
}

const alphabetTexture = createAlphabetTexture();
const matrixTexture = createTexture();

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `uniform vec2 scale;
attribute vec2 position;
varying vec2 texCoord;
void main() {
    texCoord = vec2(position.x, -position.y) * 0.5 + 0.5;
    gl_Position = vec4(position * scale, 0, 1);
}`);
gl.compileShader(vertexShader);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `precision highp float;
uniform sampler2D matrix;
uniform sampler2D alphabet;
uniform vec2 matrixSize;
varying vec2 texCoord;
void main() {
    vec4 m = texture2D(matrix, texCoord);
    vec2 t = mod(texCoord * matrixSize, 1.0);
    t.y = (t.y + m.a * 255.0) / 48.0;
    float a = texture2D(alphabet, t).a;
    gl_FragColor = vec4(m.rgb * a, 1);
}`);
gl.compileShader(fragmentShader);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);
gl.uniform1i(gl.getUniformLocation(program, "alphabet"), 1);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

let numRows;
let numCols;
let cellSize;
let strings;
let matrix;

function init() {
    canvas.width = window.devicePixelRatio * window.innerWidth;
    canvas.height = window.devicePixelRatio * window.innerHeight;
    cellSize = window.devicePixelRatio * 16;
    numRows = Math.ceil(canvas.height / cellSize);
    numCols = Math.ceil(canvas.width / cellSize);
    strings = [];

    gl.viewport(0, 0, canvas.width, canvas.height);
    matrix = new Uint8Array(numRows * numCols * 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, numCols, numRows, 0, gl.RGBA, gl.UNSIGNED_BYTE, matrix);
    gl.uniform2f(gl.getUniformLocation(program, "matrixSize"), numCols, numRows);
    gl.uniform2f(gl.getUniformLocation(program, "scale"), numCols * cellSize / canvas.width, numRows * cellSize / canvas.height);
}

function tick(deltaTime) {
    let probability = 0.3 * deltaTime * numCols;
    for (; Math.random() < probability; probability -= 1) {
        const col = randomInt(numCols);
        const speed = 2.4 + 24 * Math.random();
        const length = 8 + randomInt(32);
        strings.push({row: -1, col, accum: 0, speed, length, symbols: []})
    }

    for (let i = strings.length; i--;) {
        const s = strings[i];
        s.accum += deltaTime * s.speed;
        for (; s.accum > 1; s.accum -= 1) {
            s.row++;
            if (s.row >= numRows + s.length) {
                strings.splice(i, 1);
                break;
            }
            s.symbols.unshift(randomInt(48));
            if (s.symbols.length > s.length) s.symbols.pop();
        }
    }

    matrix.fill(0);
    for (let s of strings) {
        for (let i = 0; i < s.symbols.length; i++) {
            const o = 4 * ((s.row - i) * numCols + s.col);
            if (i == 0) {
                matrix[o + 0] = 0x90;
                matrix[o + 1] = 0xEE;
                matrix[o + 2] = 0x90;
            } else {
                const l = 1 - (i + s.accum) / s.length;
                matrix[o + 0] = 0x40 * l;
                matrix[o + 1] = 0xC0 * l;
                matrix[o + 2] = 0x40 * l;
            }
            matrix[o + 3] = s.symbols[i];
        }
    }
}

let prevTime = 0;
function draw(time) {
    const deltaTime = (time - prevTime) / 1000;
    prevTime = time;
    tick(deltaTime);

    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, numCols, numRows, gl.RGBA, gl.UNSIGNED_BYTE, matrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    window.requestAnimationFrame(draw);
}

init();
draw();
