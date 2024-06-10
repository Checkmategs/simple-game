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

const laneWidth = canvas.width / 3;

const player = {
    x: laneWidth,  // Начальная позиция игрока - средняя полоса
    y: canvas.height - 120,  // Отступ от нижней части экрана
    width: 100,  // Измените ширину на нужное значение
    height: 100, // Измените высоту на нужное значение
    speed: 5,
    targetX: laneWidth,  // Целевая позиция по x
    currentLane: 1 // 0: левая полоса, 1: средняя полоса, 2: правая полоса
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
    // Плавное перемещение игрока
    if (player.x < player.targetX) {
        player.x = Math.min(player.x + player.speed, player.targetX);
    } else if (player.x > player.targetX) {
        player.x = Math.max(player.x - player.speed, player.targetX);
    }
}

function updateObstaclesAndCoins() {
    frameCount++;
    if (frameCount % obstacleFrequency === 0) {
        const obstacleWidth = 50;
        const lane = Math.floor(Math.random() * 3); // Случайная полоса
        const obstacleX = lane * laneWidth + laneWidth / 2 - obstacleWidth / 2;
        obstacles.push({ x: obstacleX, y: -50, width: obstacleWidth, height: 50 });
    }
    if (frameCount % coinFrequency === 0) {
        const coinRadius = 15;
        const lane = Math.floor(Math.random() * 3); // Случайная полоса
        const coinX = lane * laneWidth + laneWidth / 2;
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
let touchStartX = 0;

canvas.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
});

canvas.addEventListener('touchmove', function (event) {
    event.preventDefault();
});

canvas.addEventListener('touchend', function (event) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchDiff = touchEndX - touchStartX;

    if (touchDiff > 50) {
        // Свайп вправо
        if (player.currentLane < 2) {
            player.currentLane++;
            player.targetX = player.currentLane * laneWidth + laneWidth / 2 - player.width / 2;
        }
    } else if (touchDiff < -50) {
        // Свайп влево
        if (player.currentLane > 0) {
            player.currentLane--;
            player.targetX = player.currentLane * laneWidth + laneWidth / 2 - player.width / 2;
        }
    }
});

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
    obstacles.length = 0; // Очистка препятствий
    coins.length = 0; // Очистка монет
    obstacleSpeed = 3; // Сброс скорости препятствий
    coinSpeed = 3; // Сброс скорости монет
    obstacleFrequency = 180; // Сброс частоты появления препятствий
    frameCount = 0; // Сброс счетчика кадров
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

window.addEventListener("keydown", function(event) {
    if(event.key === "ArrowLeft") {
        if (player.currentLane > 0) {
            player.currentLane--;
            player.targetX = player.currentLane * laneWidth + laneWidth / 2 - player.width / 2;
        }
    } else if(event.key === "ArrowRight") {
        if (player.currentLane < 2) {
            player.currentLane++;
            player.targetX = player.currentLane * laneWidth + laneWidth / 2 - player.width / 2;
        }
    }
});