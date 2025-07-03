// --- Инициализация ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Размеры канваса (можно настроить)
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Размеры плиток (для пиксельной графики)
const TILE_SIZE = 32;

// --- Игровые объекты ---

// Игрок
const player = {
    x: CANVAS_WIDTH / 2 - TILE_SIZE / 2,
    y: CANVAS_HEIGHT - TILE_SIZE * 3, // Начинаем чуть выше дна
    width: TILE_SIZE,
    height: TILE_SIZE,
    speed: 5,
    dx: 0, // Горизонтальное движение
    dy: 0, // Вертикальное движение (для гравитации/прыжка)
    health: 100,
    isGrounded: false,
    facing: 'right', // Направление взгляда
    currentSpellIndex: 0,
    spells: [
        { name: "Огненный шар", damage: 20, color: "orange", speed: 8, size: 10 },
        { name: "Ледяная стрела", damage: 15, color: "lightblue", speed: 10, size: 8 },
        { name: "Каменная пуля", damage: 25, color: "gray", speed: 7, size: 12 }
    ]
};

// Снаряды (заклинания)
const projectiles = [];

// Враги
const enemies = [];

// Карта (первая локация)
// 0: Воздух/Пустота
// 1: Земля/Камень (неразрушимый)
// 2: Разрушаемый блок (например, мягкая порода)
// 3: Враг (стартовая позиция)
// 4: Игрок (стартовая позиция)
const gameMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
// Добавим несколько разрушаемых блоков и врагов
gameMap[17][5] = 2;
gameMap[17][6] = 2;
gameMap[17][7] = 2;
gameMap[17][15] = 2;
gameMap[17][16] = 2;
gameMap[17][17] = 2;
gameMap[18][10] = 3; // Враг
gameMap[18][14] = 3; // Враг

// --- Константы игры ---
const GRAVITY = 0.5;
const JUMP_STRENGTH = -10; // Отрицательное значение для движения вверх

// --- Состояние ввода ---
const keys = {};

// --- Функции отрисовки ---

function drawPlayer() {
    ctx.fillStyle = 'white'; // Игрок
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Простая индикация направления
    ctx.fillStyle = player.facing === 'right' ? 'blue' : 'red';
    ctx.fillRect(player.x + (player.facing === 'right' ? player.width - 5 : 0), player.y + player.height / 4, 5, player.height / 2);
}

function drawProjectiles() {
    projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = 'purple'; // Враг
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        // Простая индикация здоровья врага
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * (enemy.health / enemy.maxHealth), 5);
    });
}

function drawMap() {
    for (let row = 0; row < gameMap.length; row++) {
        for (let col = 0; col < gameMap[row].length; col++) {
            const tileType = gameMap[row][col];
            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;

            if (tileType === 1) { // Неразрушимый блок
                ctx.fillStyle = '#555'; // Темно-серый
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#333'; // Границы
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            } else if (tileType === 2) { // Разрушаемый блок
                ctx.fillStyle = '#8B4513'; // Коричневый (земля)
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#652C0A';
                ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            }
            // Для 0 (воздух) ничего не рисуем
        }
    }
}

function updateUI() {
    document.getElementById('player-health').textContent = Math.max(0, Math.floor(player.health));
    document.getElementById('current-spell').textContent = player.spells[player.currentSpellIndex].name;
}

// --- Функции обновления логики ---

function updatePlayer() {
    // Применяем гравитацию
    player.dy += GRAVITY;

    // Горизонтальное движение
    player.x += player.dx;

    // Вертикальное движение
    player.y += player.dy;

    // Коллизии с картой
    handlePlayerMapCollision();

    // Ограничение по краям канваса (для простоты)
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > CANVAS_WIDTH) player.x = CANVAS_WIDTH - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > CANVAS_HEIGHT) {
        player.y = CANVAS_HEIGHT - player.height;
        player.dy = 0;
        player.isGrounded = true;
    } else {
        player.isGrounded = false;
    }

    // Обновление направления
    if (player.dx > 0) player.facing = 'right';
    else if (player.dx < 0) player.facing = 'left';
}

function handlePlayerMapCollision() {
    const playerLeft = player.x;
    const playerRight = player.x + player.width;
    const playerTop = player.y;
    const playerBottom = player.y + player.height;

    // Проверяем только плитки, с которыми игрок может столкнуться
    const startCol = Math.floor(playerLeft / TILE_SIZE);
    const endCol = Math.ceil(playerRight / TILE_SIZE);
    const startRow = Math.floor(playerTop / TILE_SIZE);
    const endRow = Math.ceil(playerBottom / TILE_SIZE);

    for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
            if (row < 0 || row >= gameMap.length || col < 0 || col >= gameMap[0].length) continue;

            const tileType = gameMap[row][col];
            if (tileType === 1 || tileType === 2) { // Столкновение с твердым блоком
                const tileX = col * TILE_SIZE;
                const tileY = row * TILE_SIZE;

                // Простая обработка коллизий (без сложных отталкиваний)
                // Если игрок пересекается с блоком
                if (playerRight > tileX && playerLeft < tileX + TILE_SIZE &&
                    playerBottom > tileY && playerTop < tileY + TILE_SIZE) {

                    // Коллизия по Y
                    if (player.dy > 0 && playerBottom - player.dy <= tileY) { // Падает на блок
                        player.y = tileY - player.height;
                        player.dy = 0;
                        player.isGrounded = true;
                    } else if (player.dy < 0 && playerTop - player.dy >= tileY + TILE_SIZE) { // Ударяется головой
                        player.y = tileY + TILE_SIZE;
                        player.dy = 0;
                    }

                    // Коллизия по X
                    if (player.dx > 0 && playerRight - player.dx <= tileX) { // Движется вправо
                        player.x = tileX - player.width;
                        player.dx = 0;
                    } else if (player.dx < 0 && playerLeft - player.dx >= tileX + TILE_SIZE) { // Движется влево
                        player.x = tileX + TILE_SIZE;
                        player.dx = 0;
                    }
                }
            }
        }
    }
}


function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.dx;
        p.y += p.dy;

        // Удаление снаряда, если он вышел за пределы экрана
        if (p.x < 0 || p.x > CANVAS_WIDTH || p.y < 0 || p.y > CANVAS_HEIGHT) {
            projectiles.splice(i, 1);
            continue;
        }

        // Коллизии снаряда с картой
        const tileCol = Math.floor(p.x / TILE_SIZE);
        const tileRow = Math.floor(p.y / TILE_SIZE);

        if (tileRow >= 0 && tileRow < gameMap.length && tileCol >= 0 && tileCol < gameMap[0].length) {
            const tileType = gameMap[tileRow][tileCol];
            if (tileType === 1) { // Столкновение с неразрушимым блоком
                projectiles.splice(i, 1);
                continue;
            } else if (tileType === 2) { // Столкновение с разрушаемым блоком
                gameMap[tileRow][tileCol] = 0; // Разрушаем блок
                projectiles.splice(i, 1);
                continue;
            }
        }

        // Коллизии снаряда с врагами
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (p.x < enemy.x + enemy.width &&
                p.x + p.size > enemy.x &&
                p.y < enemy.y + enemy.height &&
                p.y + p.size > enemy.y) {
                // Столкновение!
                enemy.health -= p.damage;
                projectiles.splice(i, 1); // Удаляем снаряд
                if (enemy.health <= 0) {
                    enemies.splice(j, 1); // Удаляем врага
                }
                break; // Выходим из внутреннего цикла, так как снаряд уже удален
            }
        }
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        // Простая логика движения врагов: просто двигаются влево/вправо
        enemy.x += enemy.dx;

        // Проверка на столкновение с краями платформы или другими блоками
        const nextX = enemy.x + enemy.dx;
        const nextTileCol = Math.floor((nextX + (enemy.dx > 0 ? enemy.width : 0)) / TILE_SIZE);
        const nextTileRow = Math.floor((enemy.y + enemy.height + 1) / TILE_SIZE); // Проверяем плитку под врагом

        if (nextTileRow >= gameMap.length || nextTileCol < 0 || nextTileCol >= gameMap[0].length ||
            gameMap[nextTileRow][nextTileCol] === 0) { // Если под врагом пусто или он упрется в стену
            enemy.dx *= -1; // Меняем направление
        }

        // Коллизия врага с игроком (простой урон)
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            player.health -= 0.5; // Небольшой постоянный урон при контакте
        }
    });
}

// --- Обработчики событий ---

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // Переключение заклинаний
    if (e.code === 'Digit1') player.currentSpellIndex = 0;
    if (e.code === 'Digit2') player.currentSpellIndex = 1;
    if (e.code === 'Digit3') player.currentSpellIndex = 2;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Левая кнопка мыши (стрельба)
        const spell = player.spells[player.currentSpellIndex];
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;

        // Вычисляем направление снаряда к курсору мыши
        const angle = Math.atan2(mouseY - (player.y + player.height / 2), mouseX - (player.x + player.width / 2));
        const dx = Math.cos(angle) * spell.speed;
        const dy = Math.sin(angle) * spell.speed;

        projectiles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            dx: dx,
            dy: dy,
            damage: spell.damage,
            color: spell.color,
            size: spell.size
        });
    }
});

// --- Главный игровой цикл ---

function gameLoop() {
    // Обновление ввода
    player.dx = 0;
    if (keys['KeyA']) {
        player.dx = -player.speed;
    }
    if (keys['KeyD']) {
        player.dx = player.speed;
    }
    if (keys['Space'] && player.isGrounded) {
        player.dy = JUMP_STRENGTH;
        player.isGrounded = false; // Чтобы нельзя было прыгать в воздухе
    }

    // Обновление логики
    updatePlayer();
    updateProjectiles();
    updateEnemies();

    // Очистка канваса
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Отрисовка
    drawMap();
    drawPlayer();
    drawProjectiles();
    drawEnemies();
    updateUI();

    // Проверка на конец игры
    if (player.health <= 0) {
        alert('Вы погибли! Игра окончена.');
        // Можно перезагрузить игру или показать экран "Game Over"
        location.reload();
        return; // Останавливаем цикл
    }

    requestAnimationFrame(gameLoop);
}

// --- Инициализация врагов на основе карты ---
function initializeEnemiesFromMap() {
    for (let row = 0; row < gameMap.length; row++) {
        for (let col = 0; col < gameMap[row].length; col++) {
            if (gameMap[row][col] === 3) { // Если это стартовая позиция врага
                enemies.push({
                    x: col * TILE_SIZE,
                    y: row * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    health: 50,
                    maxHealth: 50,
                    dx: 1 // Начальное движение вправо
                });
                gameMap[row][col] = 0; // Удаляем маркер врага с карты, чтобы он не был нарисован как блок
            }
        }
    }
}

// Запускаем игру
initializeEnemiesFromMap();
gameLoop();
