const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Установка размеров канваса
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 70,
    width: 50,
    height: 50,
    color: 'blue',
    speed: 5
};

const obstacles = [];
const obstacleSpeed = 3;
const obstacleFrequency = 90; // Новое препятствие каждые 90 кадров
let frameCount = 0;

function drawRect(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

function updatePlayer() {
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function updateObstacles() {
    frameCount++;
    if (frameCount % obstacleFrequency === 0) {
        const obstacleWidth = 50;
        const obstacleX = Math.random() * (canvas.width - obstacleWidth);
        obstacles.push({ x: obstacleX, y: -50, width: obstacleWidth, height: 50, color: 'red' });
    }

    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += obstacleSpeed;
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
        }
    }
}

function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            alert("Game Over!");
            document.location.reload();
            break;
        }
    }
}

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawRect(player.x, player.y, player.width, player.height, player.color);

    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        drawRect(obs.x, obs.y, obs.width, obs.height, obs.color);
    }

    updatePlayer();
    updateObstacles();
    checkCollision();

    requestAnimationFrame(gameLoop);
}

const keys = {};

window.addEventListener('keydown', function (e) {
    keys[e.key] = true;
});

window.addEventListener('keyup', function (e) {
    keys[e.key] = false;
});

// Поддержка сенсорного управления
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);

function handleTouch(event) {
    const touch = event.touches[0];
    const touchX = touch.clientX - canvas.offsetLeft;

    if (touchX < player.x) {
        player.x -= player.speed;
    } else if (touchX > player.x + player.width) {
        player.x += player.speed;
    }

    event.preventDefault();
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

gameLoop();
