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
    maxHealth: 100,
    isGrounded: false,
    facing: 'right', // Направление взгляда
    currentSpellIndex: 0,
    spells: [
        { name: "Огненный шар", damage: 100//20, color: "orange", speed: 10//8, size: 10, hasGravity: true },
        { name: "Ледяная стрела", damage: 15, color: "lightblue", speed: 10, size: 8, hasGravity: false },
        { name: "Каменная пуля", damage: 25, color: "gray", speed: 7, size: 12, hasGravity: true },
        { name: "Электрический разряд", damage: 30//10, color: "yellow", speed: 14//12, size: 6, hasGravity: false }
    ]
};

// Снаряды (заклинания игрока)
const playerProjectiles = [];
// Снаряды врагов
const enemyProjectiles = [];

// Враги
const enemies = [];
let boss = null; // Босс будет отдельным объектом

// Карта (первая локация)
// 0: Воздух/Пустота
// 1: Земля/Камень (неразрушимый)
// 2: Разрушаемый блок (например, мягкая порода)
// 3: Враг (стартовая позиция)
// 4: Игрок (стартовая позиция) - не используется, игрок спавнится по координатам
// 5: Босс (стартовая позиция) - не используется, босс спавнится динамически
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

// --- Генерация более сложной пещеры ---
function generateCaveMap() {
    const rows = gameMap.length;
    const cols = gameMap[0].length;

    // Заполняем все воздухом, кроме границ
    for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
            gameMap[r][c] = 0;
        }
    }

    // Создаем несколько "комнат" и соединяем их
    const numRooms = 5;
    const rooms = [];
    for (let i = 0; i < numRooms; i++) {
        const roomWidth = Math.floor(Math.random() * 5) + 5; // 5-9
        const roomHeight = Math.floor(Math.random() * 3) + 3; // 3-5
        const roomX = Math.floor(Math.random() * (cols - roomWidth - 2)) + 1;
        const roomY = Math.floor(Math.random() * (rows - roomHeight - 2)) + 1;

        rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });

        for (let r = roomY; r < roomY + roomHeight; r++) {
            for (let c = roomX; c < roomX + roomWidth; c++) {
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    gameMap[r][c] = 2; // Разрушаемый блок
                }
            }
        }
    }

    // Соединяем комнаты "коридорами"
    for (let i = 0; i < rooms.length - 1; i++) {
        const r1 = rooms[i];
        const r2 = rooms[i + 1];

        // Горизонтальный коридор
        const startX = Math.min(r1.x + Math.floor(r1.width / 2), r2.x + Math.floor(r2.width / 2));
        const endX = Math.max(r1.x + Math.floor(r1.width / 2), r2.x + Math.floor(r2.width / 2));
        const corridorY = r1.y + Math.floor(r1.height / 2);
        for (let x = startX; x <= endX; x++) {
            if (corridorY >= 0 && corridorY < rows && x >= 0 && x < cols) {
                gameMap[corridorY][x] = 0;
                if (corridorY + 1 < rows) gameMap[corridorY + 1][x] = 0; // Делаем коридор 2 клетки в высоту
            }
        }

        // Вертикальный коридор
        const startY = Math.min(r1.y + Math.floor(r1.height / 2), r2.y + Math.floor(r2.height / 2));
        const endY = Math.max(r1.y + Math.floor(r1.height / 2), r2.y + Math.floor(r2.height / 2));
        const corridorX = r2.x + Math.floor(r2.width / 2);
        for (let y = startY; y <= endY; y++) {
            if (y >= 0 && y < rows && corridorX >= 0 && corridorX < cols) {
                gameMap[y][corridorX] = 0;
                if (corridorX + 1 < cols) gameMap[y][corridorX + 1] = 0; // Делаем коридор 2 клетки в ширину
            }
        }
    }

    // Добавляем случайные разрушаемые блоки для "шума"
    for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
            if (gameMap[r][c] === 0 && Math.random() < 0.15) { // 15% шанс на разрушаемый блок в пустом пространстве
                gameMap[r][c] = 2;
            }
        }
    }
}

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

function drawProjectiles(projectilesArray, color) {
    projectilesArray.forEach(p => {
        ctx.fillStyle = color || p.color; // Используем цвет снаряда или переданный цвет
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color; // Цвет врага
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        // Простая индикация здоровья врага
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * (enemy.health / enemy.maxHealth), 5);
    });

    if (boss) {
        ctx.fillStyle = boss.color; // Цвет босса
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        // Индикация здоровья босса
        ctx.fillStyle = 'red';
        ctx.fillRect(boss.x, boss.y - 15, boss.width, 8);
        ctx.fillStyle = 'green';
        ctx.fillRect(boss.x, boss.y - 15, boss.width * (boss.health / boss.maxHealth), 8);
        ctx.font = '12px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('БОСС', boss.x + boss.width / 2, boss.y - 20);
    }
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

function updateProjectiles(projectilesArray, isEnemyProjectile = false) {
    for (let i = projectilesArray.length - 1; i >= 0; i--) {
        const p = projectilesArray[i];

        // Применяем гравитацию, если снаряд имеет свойство hasGravity
        if (p.hasGravity) {
            p.dy += GRAVITY / 2; // Гравитация для снарядов может быть меньше
        }

        p.x += p.dx;
        p.y += p.dy;

        // Удаление снаряда, если он вышел за пределы экрана
        if (p.x < -p.size || p.x > CANVAS_WIDTH + p.size || p.y < -p.size || p.y > CANVAS_HEIGHT + p.size) {
            projectilesArray.splice(i, 1);
            continue;
        }

        // Коллизии снаряда с картой
        const tileCol = Math.floor(p.x / TILE_SIZE);
        const tileRow = Math.floor(p.y / TILE_SIZE);

        if (tileRow >= 0 && tileRow < gameMap.length && tileCol >= 0 && tileCol < gameMap[0].length) {
            const tileType = gameMap[tileRow][tileCol];
            if (tileType === 1) { // Столкновение с неразрушимым блоком
                projectilesArray.splice(i, 1);
                continue;
            } else if (tileType === 2) { // Столкновение с разрушаемым блоком
                gameMap[tileRow][tileCol] = 0; // Разрушаем блок
                projectilesArray.splice(i, 1);
                continue;
            }
        }

        // Коллизии снаряда с игроком (если это вражеский снаряд)
        if (isEnemyProjectile) {
            if (p.x < player.x + player.width &&
                p.x + p.size > player.x &&
                p.y < player.y + player.height &&
                p.y + p.size > player.y) {
                // Столкновение с игроком!
                player.health -= p.damage;
                projectilesArray.splice(i, 1); // Удаляем снаряд
                continue; // Переходим к следующему снаряду
            }
        } else { // Если это снаряд игрока
            // Коллизии снаряда игрока с врагами
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (p.x < enemy.x + enemy.width &&
                    p.x + p.size > enemy.x &&
                    p.y < enemy.y + enemy.height &&
                    p.y + p.size > enemy.y) {
                    // Столкновение!
                    enemy.health -= p.damage;
                    projectilesArray.splice(i, 1); // Удаляем снаряд
                    if (enemy.health <= 0) {
                        enemies.splice(j, 1); // Удаляем врага
                    }
                    break; // Выходим из внутреннего цикла, так как снаряд уже удален
                }
            }
            // Коллизии снаряда игрока с боссом
            if (boss) {
                if (p.x < boss.x + boss.width &&
                    p.x + p.size > boss.x &&
                    p.y < boss.y + boss.height &&
                    p.y + p.size > boss.y) {
                    boss.health -= p.damage;
                    projectilesArray.splice(i, 1);
                    if (boss.health <= 0) {
                        alert('БОСС ПОБЕЖДЕН! ВЫ ВЫИГРАЛИ!');
                        location.reload(); // Перезагружаем игру
                    }
                    break;
                }
            }
        }
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        // Простая логика движения врагов:
        // Если игрок близко, преследуем, иначе - патрулируем.
        const distanceToPlayer = Math.sqrt(Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2));
        const chaseDistance = 200; // Расстояние, на котором враг начинает преследовать

        if (distanceToPlayer < chaseDistance) {
            // Преследование игрока
            if (player.x < enemy.x) {
                enemy.dx = -enemy.speed;
            } else if (player.x > enemy.x) {
                enemy.dx = enemy.speed;
            } else {
                enemy.dx = 0;
            }
        } else {
            // Патрулирование (движение влево/вправо)
            const nextX = enemy.x + enemy.dx;
            const nextTileCol = Math.floor((nextX + (enemy.dx > 0 ? enemy.width : 0)) / TILE_SIZE);
            const nextTileRow = Math.floor((enemy.y + enemy.height + 1) / TILE_SIZE); // Проверяем плитку под врагом

            if (nextTileRow >= gameMap.length || nextTileCol < 0 || nextTileCol >= gameMap[0].length ||
                gameMap[nextTileRow][nextTileCol] === 0) { // Если под врагом пусто или он упрется в стену
                enemy.dx *= -1; // Меняем направление
            }
        }

        enemy.x += enemy.dx;

        // Простая логика атаки врага (стрельба в игрока)
        if (Math.random() < enemy.fireRate) { // Шанс выстрела (можно настроить)
            const angle = Math.atan2(player.y + player.height / 2 - (enemy.y + enemy.height / 2), player.x + player.width / 2 - (enemy.x + enemy.width / 2));
            
            enemyProjectiles.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                dx: Math.cos(angle) * enemy.projectileSpeed,
                dy: Math.sin(angle) * enemy.projectileSpeed,
                damage: enemy.projectileDamage,
                color: enemy.projectileColor,
                size: enemy.projectileSize,
                hasGravity: enemy.projectileHasGravity
            });
        }

        // Коллизия врага с игроком (простой урон)
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            player.health -= enemy.contactDamage; // Небольшой постоянный урон при контакте
        }
    });
}

function updateBoss() {
    if (!boss) return;

    // Босс тоже подвержен гравитации
    boss.dy += GRAVITY;
    boss.y += boss.dy;

    // Простая коллизия с полом для босса
    if (boss.y + boss.height > CANVAS_HEIGHT) {
        boss.y = CANVAS_HEIGHT - boss.height;
        boss.dy = 0;
    }

    // Босс всегда преследует игрока
    if (player.x < boss.x) {
        boss.dx = -boss.speed;
    } else if (player.x > boss.x) {
        boss.dx = boss.speed;
    } else {
        boss.dx = 0;
    }
    boss.x += boss.dx;

    // Ограничение по краям канваса для босса
    if (boss.x < 0) boss.x = 0;
    if (boss.x + boss.width > CANVAS_WIDTH) boss.x = CANVAS_WIDTH - boss.width;

    // Логика атаки босса (более частая и, возможно, несколько снарядов)
    if (Math.random() < boss.fireRate) {
        // Пример: босс стреляет 3 снарядами веером
        for (let i = -1; i <= 1; i++) {
            const angleOffset = i * 0.2; // Небольшое смещение угла
            const angle = Math.atan2(player.y + player.height / 2 - (boss.y + boss.height / 2), player.x + player.width / 2 - (boss.x + boss.width / 2)) + angleOffset;
            
            enemyProjectiles.push({
                x: boss.x + boss.width / 2,
                y: boss.y + boss.height / 2,
                dx: Math.cos(angle) * boss.projectileSpeed,
                dy: Math.sin(angle) * boss.projectileSpeed,
                damage: boss.projectileDamage,
                color: boss.projectileColor,
                size: boss.projectileSize,
                hasGravity: boss.projectileHasGravity
            });
        }
    }

    // Коллизия босса с игроком (больший урон)
    if (player.x < boss.x + boss.width &&
        player.x + player.width > boss.x &&
        player.y < boss.y + boss.height &&
        player.y + player.height > boss.y) {
        player.health -= boss.contactDamage;
    }
}


// --- Обработчики событий ---

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // Переключение заклинаний по 'T'
    if (e.code === 'KeyT') {
        player.currentSpellIndex = (player.currentSpellIndex + 1) % player.spells.length;
    }
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

        playerProjectiles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            dx: dx,
            dy: dy,
            damage: spell.damage,
            color: spell.color,
            size: spell.size,
            hasGravity: spell.hasGravity // Передаем свойство гравитации снаряду
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
    updateProjectiles(playerProjectiles, false); // Снаряды игрока
    updateProjectiles(enemyProjectiles, true);  // Снаряды врагов
    updateEnemies();
    updateBoss(); // Обновляем босса

    // Очистка канваса
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Отрисовка
    drawMap();
    drawPlayer();
    drawProjectiles(playerProjectiles); // Отрисовка снарядов игрока
    drawProjectiles(enemyProjectiles); // Отрисовка снарядов врагов
    drawEnemies(); // Отрисовка врагов и босса

    updateUI();

    // Проверка на конец игры
    if (player.health <= 0) {
        alert('Вы погибли! Игра окончена.');
        location.reload(); // Перезагружаем игру
        return; // Останавливаем цикл
    }

    // Проверка на появление босса
    if (enemies.length === 0 && !boss) {
        spawnBoss();
    }

    requestAnimationFrame(gameLoop);
}

// --- Инициализация врагов на основе карты ---
function initializeEnemies() {
    const numEnemies = Math.floor(Math.random() * 5) + 3; // 3-7 врагов
    for (let i = 0; i < numEnemies; i++) {
        let placed = false;
        while (!placed) {
            const randCol = Math.floor(Math.random() * (gameMap[0].length - 2)) + 1;
            const randRow = Math.floor(Math.random() * (gameMap.length - 5)) + 1; // Избегаем спавна слишком низко

            // Проверяем, что место пустое и есть земля под ним
            if (gameMap[randRow][randCol] === 0 && gameMap[randRow + 1][randCol] !== 0) {
                enemies.push({
                    x: randCol * TILE_SIZE,
                    y: randRow * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    health: 50,
                    maxHealth: 50,
                    dx: (Math.random() < 0.5 ? 1 : -1) * 1, // Начальное движение
                    speed: 1, // Скорость движения врага
                    color: 'purple',
                    fireRate: 0.005, // Шанс выстрела за кадр
                    projectileDamage: 10,
                    projectileColor: 'red',
                    projectileSize: 6,
                    projectileSpeed: 5,
                    projectileHasGravity: false,
                    contactDamage: 0.5 // Урон при контакте
                });
                placed = true;
            }
        }
    }
}

function spawnBoss() {
    console.log('Все враги уничтожены! Появляется босс!');
    boss = {
        x: CANVAS_WIDTH / 2 - TILE_SIZE * 2, // Центр экрана
        y: CANVAS_HEIGHT / 2 - TILE_SIZE * 2,
        width: TILE_SIZE * 4, // Большой размер
        height: TILE_SIZE * 4,
        health: 500, // Много здоровья
        maxHealth: 500,
        dx: 0,
        dy: 0,
        speed: 2, // Медленнее, но мощнее
        color: 'darkred',
        fireRate: 0.02, // Чаще стреляет
        projectileDamage: 20, // Больше урона
        projectileColor: 'darkorange',
        projectileSize: 15,
        projectileSpeed: 7,
        projectileHasGravity: true, // Снаряды босса могут иметь гравитацию
        contactDamage: 2 // Большой урон при контакте
    };
}

// Запускаем игру
generateCaveMap(); // Генерируем карту
initializeEnemies(); // Инициализируем врагов
gameLoop();
