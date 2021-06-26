
let unsentStrokes = [];
const serverUrl = 'https://localhost:5001';

const canvas = document.getElementById("chalkboard");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const strokeStyle = 'white';
const lineWidth = 5;

let lastX = 0;
let lastY = 0;

const setLastCoords = (e) => {
    const { x, y } = canvas.getBoundingClientRect();
    lastX = e.clientX - x;
    lastY = e.clientY - y;
};

const freeForm = (e) => {
    const xCoorObj = document.getElementById("xCoor");
    const yCoorObj = document.getElementById("yCoor");

    xCoorObj.innerHTML = e.clientX;
    yCoorObj.innerHTML = e.clientY;

    // Check if left mouse click is pushed, otherwise do nothing
    if (e.buttons !== 1) return;


    const { x, y } = canvas.getBoundingClientRect();

    const startCoordinate = {
        x: lastX,
        y: lastY
    };

    const endCoordinate = {
        x: e.clientX - x,
        y: e.clientY - y
    };

    unsentStrokes.push({
        start: startCoordinate,
        end: endCoordinate
    });

    draw(startCoordinate, endCoordinate);
}

const draw = (start, end) => {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    ctx.closePath();

    lastX = end.x;
    lastY = end.y;

    if (unsentStrokes.length) {
        connection.invoke('NewStrokes', unsentStrokes).catch(e => {
            console.log(e.toString());
        });

        unsentStrokes = [];
    }
}

const clearBoard = () => {
    ctx.clearRect(0, 0, width, height);
}

// Declare Variable
const clearBtn = document.getElementById('clearBtn');

// Add Click Event Listener
clearBtn.addEventListener('click', ev => {
    ev.preventDefault()
    if (confirm("Are you sure you want to clear everyone's canvases?")) {
        clearBoard();
        connection.invoke('ClearCanvas');
    }
});


// Canvas Event Listener
canvas.addEventListener("mousedown", setLastCoords);
canvas.addEventListener("mousemove", freeForm);

const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${serverUrl}/draw`)
    .configureLogging(signalR.LogLevel.Error).build();

// SignalR Event Listeners
connection.on('shareStrokes', draw);
connection.on('newCanvas', clearBoard);

connection
    .start()
    .then(() => console.log('connected!'))
    .catch(err => console.error)
