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
    cellSize = window.devicePixelRatio * 20;
    numRows = Math.floor(canvas.height / cellSize);
    numCols = Math.floor(canvas.width / cellSize);
    matrix = new Array(numRows * numCols);
    strings = [];
}

function tick(deltaTime) {
    let probability = 0.3 * deltaTime * numCols;
    for (; Math.random() < probability; probability -= 1) {
        const col = randomInt(numCols);
        const speed = 2.4 + 12 * Math.random();
        const length = 8 + randomInt(16);
        strings.push({row: -1, col, accum: 0, speed, length})
    }

    let i = strings.length;
    while (i--) {
        const s = strings[i];
        s.accum += deltaTime * s.speed;
        for (; s.accum > 1; s.accum -= 1) {
            s.row++;
            if (s.row < numRows) {
                matrix[s.row * numCols + s.col] = alphabet[randomInt(alphabet.length)];
            }
            if (s.row - s.length >= numRows) {
                strings.splice(i, 1);
                break;
            }
            if (s.row - s.length >= 0) {
                matrix[(s.row - s.length) * numCols + s.col] = undefined;
            }
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

    const heads = [];
    strings.forEach(s => heads[s.row * numCols + s.col] = true);
    for (let i = 0, row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++, i++) {
            if (matrix[i]) {
                ctx.fillStyle = heads[i] ? "lightgreen" : "green";
                ctx.fillText(matrix[i], col * cellSize, row * cellSize);
            }
        }
    }
    window.requestAnimationFrame(draw);
}

init();
draw();
