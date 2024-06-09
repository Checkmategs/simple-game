const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const mainMenu = document.getElementById('mainMenu');
const gameOverMenu = document.getElementById('gameOverMenu');
const playButton = document.getElementById('playButton');
const settingsButton = document.getElementById('settingsButton');
const mainMenuButton = document.getElementById('mainMenuButton');

let score = 0;
const scoreElement = document.createElement('div');
scoreElement.id = 'score';
scoreElement.textContent = `Счет: ${score}`;
document.body.appendChild(scoreElement);

// Установка размеров канваса
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Загрузка фонового изображения
const background = new Image();
background.src = 'images/background.png';

// Загрузка изображения игрока
const playerImage = new Image();
playerImage.src = 'images/player.png';

// Загрузка изображения врага
const enemyImage = new Image();
enemyImage.src = 'images/enemy.png';

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 120,  // Отступ от нижней части экрана
    width: 100,  // Измените ширину на нужное значение
    height: 100, // Измените высоту на нужное значение
    speed: 5
};

const obstacles = [];
const coins = [];
let obstacleSpeed = 3;
let coinSpeed = 3;
let obstacleFrequency = 180; // Новое препятствие каждые 180 кадров
const coinFrequency = 90; // Новая монета каждые 90 кадров
let frameCount = 0;

function drawBackground() {
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    context.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawCircle(x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
}

function updatePlayer() {
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function updateObstaclesAndCoins() {
    frameCount++;
    if (frameCount % obstacleFrequency === 0) {
        const obstacleWidth = 50;
        const obstacleX = Math.random() * (canvas.width - obstacleWidth);
        obstacles.push({ x: obstacleX, y: -50, width: obstacleWidth, height: 50 });
    }
    if (frameCount % coinFrequency === 0) {
        const coinRadius = 15;
        const coinX = Math.random() * (canvas.width - coinRadius * 2) + coinRadius;
        coins.push({ x: coinX, y: -coinRadius, radius: coinRadius, color: 'yellow' });
    }

    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += obstacleSpeed;
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < coins.length; i++) {
        coins[i].y += coinSpeed;
        if (coins[i].y > canvas.height) {
            coins.splice(i, 1);
            i--;
        }
    }

    // Увеличение сложности
    if (frameCount % 600 === 0) { // Каждые 600 кадров (примерно каждые 10 секунд при 60 кадрах в секунду)
        obstacleSpeed += 0.5;
        coinSpeed += 0.5;
        obstacleFrequency = Math.max(60, obstacleFrequency - 10); // Уменьшение частоты, минимальное значение 60
    }
}

function checkCollision() {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            endGame();
            return;
        }
    }

    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        if (player.x < coin.x + coin.radius &&
            player.x + player.width > coin.x - coin.radius &&
            player.y < coin.y + coin.radius &&
            player.y + player.height > coin.y - coin.radius) {
            score++;
            scoreElement.textContent = `Счет: ${score}`;
            coins.splice(i, 1);
            i--;
        }
    }
}

function endGame() {
    cancelAnimationFrame(animationFrameId);
    mainMenu.style.display = 'none';
    canvas.style.display = 'none';
    scoreElement.style.display = 'none';
    gameOverMenu.style.display = 'flex';
}

let animationFrameId;

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawPlayer();

    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        context.drawImage(enemyImage, obs.x, obs.y, obs.width, obs.height);
    }

    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        drawCircle(coin.x, coin.y, coin.radius, coin.color);
    }

    updatePlayer();
    updateObstaclesAndCoins();
    checkCollision();

    animationFrameId = requestAnimationFrame(gameLoop);
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

// Запуск игры только после загрузки изображений
let imagesLoaded = 0;

background.onload = playerImage.onload = enemyImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 3) {
        playButton.addEventListener('click', startGame);
        settingsButton.addEventListener('click', showSettings);
        mainMenuButton.addEventListener('click', showMainMenu);
    }
};

function startGame() {
    score = 0;
    scoreElement.textContent = `Счет: ${score}`;
    mainMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    canvas.style.display = 'block';
    scoreElement.style.display = 'block';
    gameLoop();
}

function showSettings() {
    alert('Настройки пока не реализованы.');
}

function showMainMenu() {
    mainMenu.style.display = 'flex';
    gameOverMenu.style.display = 'none';
    canvas.style.display = 'none';
    scoreElement.style.display = 'none';
}
