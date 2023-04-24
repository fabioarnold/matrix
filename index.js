const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const alphabet = [
    "ア", "イ", "ウ", "エ", "オ",
    "カ", "キ", "ク", "ケ", "コ",
    "サ", "シ", "ス", "セ", "ソ",
    "タ", "チ", "ツ", "テ", "ト",
    "ナ", "ニ", "ヌ", "ネ", "ノ",
    "ハ", "ヒ", "フ", "ヘ", "ホ",
    "マ", "ミ", "ム", "メ", "モ",
    "ヤ", "ユ", "ヨ",
    "ラ", "リ", "ル", "レ", "ロ",
    "ワ", "ヰ", "ヱ", "ヲ", "ン"
];
window.onresize = init;

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

let numRows;
let numCols;
let cellSize;
let matrix;
let strings;

function init() {
    canvas.width = window.devicePixelRatio * window.innerWidth;
    canvas.height = window.devicePixelRatio * window.innerHeight;
    cellSize = window.devicePixelRatio * 16;
    numRows = Math.ceil(canvas.height / cellSize);
    numCols = Math.ceil(canvas.width / cellSize);
    matrix = [];
    strings = [];
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
            s.symbols.unshift(alphabet[randomInt(alphabet.length)]);
            if (s.symbols.length > s.length) s.symbols.pop();
        }
    }

    matrix.length = 0;
    for (let s of strings) {
        for (let i = 0; i < s.symbols.length; i++) {
            const color = i == 0 ? "lightgreen" : "hsl(120, 50%, " + (50 - 50 * (i + s.accum) / s.length) + "%)";
            matrix[(s.row - i) * numCols + s.col] = { color, symbol: s.symbols[i] };
        }
    }
}

let prevTime = 0;
function draw(time) {
    const deltaTime = (time - prevTime) / 1000;
    prevTime = time;
    tick(deltaTime);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "top"
    ctx.font = cellSize + "px sans-serif";

    for (let i = 0, row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++, i++) {
            if (matrix[i]) {
                ctx.fillStyle = matrix[i].color;
                ctx.fillText(matrix[i].symbol, col * cellSize, row * cellSize);
            }
        }
    }
    window.requestAnimationFrame(draw);
}

init();
draw();
