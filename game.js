// game.js

// 1. Инициализация Canvas и контекста
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Установим размеры Canvas (можно сделать динамическими)
canvas.width = 800;
canvas.height = 600;

// 2. Переменные состояния игры
let currentLevel = 1;
let starsCollected = 0;
let gameRunning = false;
let gameWon = false;
let gameLost = false;

// 3. Объекты игры (конфета, веревки, звезды, Ам Ням)
// Для каждого объекта нужно будет определить его свойства:
// - Позиция (x, y)
// - Размеры (width, height / radius)
// - Изображение (если есть)
// - Физические свойства (масса, трение, упругость - если используем физ. движок)

let candy = { x: 0, y: 0, radius: 20, image: new Image() /* загрузить изображение конфеты */ };
let ropes = []; // Массив объектов веревок: [{ start: {x,y}, end: {x,y}, attachedToCandy: true, cut: false }]
let stars = []; // Массив объектов звезд: [{ x, y, radius, collected: false, image }]
let omNom = { x: 0, y: 0, width: 60, height: 60, image: new Image() /* загрузить изображение Ам Няма */ };

// 4. Загрузка изображений (асинхронно)
function loadImages() {
    // Пример:
    candy.image.src = 'images/candy.png';
    omNom.image.src = 'images/omnom.png';
    // ... загрузить изображения звезд, фона, веревок и т.д.

    // Убедиться, что все изображения загружены, прежде чем начать игру
    // Можно использовать Promise.all или счетчик загруженных изображений
}

// 5. Определение уровней
// Массив объектов, каждый из которых описывает уровень
const levels = [
    // Уровень 1 (простой)
    {
        candyStart: { x: 100, y: 50 },
        ropes: [
            { start: { x: 100, y: 0 }, end: { x: 100, y: 50 } } // Веревка от точки (100,0) до конфеты
        ],
        stars: [
            { x: 200, y: 200 },
            { x: 300, y: 300 }
        ],
        omNomTarget: { x: 700, y: 500 }
    },
    // Уровень 2 (сложнее)
    {
        candyStart: { x: 400, y: 50 },
        ropes: [
            { start: { x: 350, y: 0 }, end: { x: 400, y: 50 } },
            { start: { x: 450, y: 0 }, end: { x: 400, y: 50 } }
        ],
        stars: [
            { x: 200, y: 400 },
            { x: 600, y: 400 },
            { x: 400, y: 250 }
        ],
        omNomTarget: { x: 100, y: 500 }
    },
    // ... 8 других уровней с возрастающей сложностью
    // Добавляйте интерактивные элементы:
    // - bubbles: [{x,y,radius}] - пузыри, которые поднимают конфету
    // - airPuffs: [{x,y,direction,strength}] - воздушные потоки
    // - spikes: [{x,y,width,height}] - шипы
    // - spiders: [{x,y,path}] - пауки, которые движутся и могут съесть конфету
];

// 6. Функция инициализации уровня
function initLevel(levelNum) {
    const levelData = levels[levelNum - 1];
    if (!levelData) {
        // Все уровни пройдены!
        displayMessage("Поздравляем! Вы прошли все уровни!", "green");
        gameRunning = false;
        document.getElementById('next-level-button').style.display = 'none';
        return;
    }

    // Сброс состояния
    starsCollected = 0;
    gameWon = false;
    gameLost = false;
    gameRunning = true;
    document.getElementById('next-level-button').style.display = 'none';
    document.getElementById('game-messages').textContent = '';

    // Установка начальных позиций и состояний объектов
    candy.x = levelData.candyStart.x;
    candy.y = levelData.candyStart.y;
    // ... сбросить скорость конфеты, если используем физ. движок

    ropes = levelData.ropes.map(r => ({ ...r, attachedToCandy: true, cut: false }));
    stars = levelData.stars.map(s => ({ ...s, collected: false }));
    omNom.x = levelData.omNomTarget.x;
    omNom.y = levelData.omNomTarget.y;

    // Обновить информацию на экране
    document.getElementById('current-level').textContent = currentLevel;
    document.getElementById('stars-collected').textContent = starsCollected;

    // Если используем физ. движок, нужно создать/пересоздать тела и связи
    // Например, Matter.js:
    // Matter.World.clear(engine.world);
    // Matter.Engine.clear(engine);
    // Создать тело для конфеты, веревок, звезд, стен и т.д.
}

// 7. Физический движок (Matter.js или p2.js)
// Это будет самая сложная часть.
// Пример с Matter.js (псевдокод):
/*
import { Engine, Render, World, Bodies, Constraint, Events } from 'matter-js';

let engine;
let render;
let candyBody;
let ropeConstraints = [];

function setupPhysics() {
    engine = Engine.create();
    render = Render.create({
        element: document.body, // Или другой элемент
        canvas: canvas,
        engine: engine,
        options: {
            width: canvas.width,
            height: canvas.height,
            wireframes: false // Для отображения текстур
        }
    });

    // Создать границы мира
    World.add(engine.world, [
        Bodies.rectangle(canvas.width / 2, canvas.height + 25, canvas.width, 50, { isStatic: true }), // Нижняя граница
        // ... другие границы
    ]);

    // Запустить движок
    Engine.run(engine);
    Render.run(render);

    // Обработчики событий столкновений
    Events.on(engine, 'collisionStart', function(event) {
        const pairs = event.pairs;
        pairs.forEach(pair => {
            // Проверка столкновений конфеты со звездами, Ам Нямом, шипами
            // if (pair.bodyA === candyBody && pair.bodyB.label === 'star') { ... }
            // if (pair.bodyA === candyBody && pair.bodyB.label === 'omNom') { ... }
        });
    });
}

function createLevelPhysics(levelData) {
    // Создать тело для конфеты
    candyBody = Bodies.circle(levelData.candyStart.x, levelData.candyStart.y, candy.radius, {
        restitution: 0.5, // Упругость
        density: 0.001,   // Плотность
        label: 'candy'
    });
    World.add(engine.world, candyBody);

    // Создать веревки как Constraint
    ropeConstraints = levelData.ropes.map(r => {
        const ropeAnchor = Bodies.circle(r.start.x, r.start.y, 5, { isStatic: true, render: { visible: false } }); // Невидимая точка крепления
        World.add(engine.world, ropeAnchor);
        const constraint = Constraint.create({
            bodyA: ropeAnchor,
            pointB: { x: 0, y: 0 }, // Точка крепления на конфете (относительно центра конфеты)
            bodyB: candyBody,
            length: Math.sqrt(Math.pow(r.start.x - r.end.x, 2) + Math.pow(r.start.y - r.end.y, 2)), // Длина веревки
            stiffness: 1, // Жесткость
            render: {
                visible: true,
                lineWidth: 3,
                strokeStyle: '#8B4513' // Цвет веревки
            },
            label: 'rope'
        });
        World.add(engine.world, constraint);
        return constraint;
    });

    // Создать тела для звезд, Ам Няма (статические)
    // ...
}
*/

// 8. Функция отрисовки (draw)
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистить Canvas

    // Отрисовка фона (если есть)
    // ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Отрисовка веревок (если не используем Matter.js render)
    ropes.forEach(rope => {
        if (!rope.cut) {
            ctx.beginPath();
            ctx.moveTo(rope.start.x, rope.start.y);
            // Если используем Matter.js, то end веревки будет привязана к candyBody
            // ctx.lineTo(candyBody.position.x, candyBody.position.y);
            ctx.lineTo(rope.end.x, rope.end.y); // Если без физ. движка, просто рисуем
            ctx.strokeStyle = '#8B4513'; // Коричневый цвет веревки
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });

    // Отрисовка звезд
    stars.forEach(star => {
        if (!star.collected) {
            // ctx.drawImage(star.image, star.x - star.radius, star.y - star.radius, star.radius * 2, star.radius * 2);
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Отрисовка Ам Няма
    // ctx.drawImage(omNom.image, omNom.x - omNom.width / 2, omNom.y - omNom.height / 2, omNom.width, omNom.height);
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(omNom.x, omNom.y, omNom.width / 2, 0, Math.PI * 2);
    ctx.fill();


    // Отрисовка конфеты
    // Если используем Matter.js, то candy.x и candy.y будут обновляться из candyBody.position
    // ctx.drawImage(candy.image, candy.x - candy.radius, candy.y - candy.radius, candy.radius * 2, candy.radius * 2);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(candy.x, candy.y, candy.radius, 0, Math.PI * 2);
    ctx.fill();

    // Отрисовка других элементов (пузыри, шипы и т.д.)
}

// 9. Игровой цикл (update)
function gameLoop() {
    if (!gameRunning) return;

    // Обновление физики (если не Matter.js, то вручную: гравитация, столкновения)
    // Например, для конфеты:
    // candy.y += gravity;
    // Проверка столкновений конфеты с границами, звездами, Ам Нямом

    // Обновление позиций объектов на основе физики (если Matter.js, то Matter.Engine.update делает это)
    // candy.x = candyBody.position.x;
    // candy.y = candyBody.position.y;

    // Проверка условий победы/поражения
    checkGameStatus();

    draw(); // Перерисовка
    requestAnimationFrame(gameLoop); // Запустить следующий кадр
}

// 10. Обработка ввода пользователя (разрезание веревок)
canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning) return;

    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    // Проверить, пересекает ли линия от предыдущей точки мыши до текущей какую-либо веревку
    // Это сложная логика, требующая алгоритмов пересечения отрезков.
    // Для простоты можно проверять, находится ли клик рядом с веревкой.
    // Или, если используем Matter.js, можно использовать Matter.Query.point для проверки,
    // попал ли клик на тело веревки (если веревки представлены как тела).

    ropes.forEach(rope => {
        if (!rope.cut) {
            // Простая проверка: если клик близко к веревке
            // Более сложная: алгоритм пересечения отрезка (предыдущая точка мыши - текущая точка мыши) с отрезком веревки
            const dist = distanceToSegment(mouseX, mouseY, rope.start.x, rope.start.y, rope.end.x, rope.end.y);
            if (dist < 10) { // Если клик в пределах 10 пикселей от веревки
                rope.cut = true;
                // Если Matter.js, удалить соответствующий constraint
                // World.remove(engine.world, ropeConstraint);
            }
        }
    });
});

// Вспомогательная функция для расчета расстояния от точки до отрезка
function distanceToSegment(px, py, x1, y1, x2, y2) {
    const L2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (L2 === 0) return Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2));
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / L2;
    t = Math.max(0, Math.min(1, t));
    const projectionX = x1 + t * (x2 - x1);
    const projectionY = y1 + t * (y2 - y1);
    return Math.sqrt(Math.pow(px - projectionX, 2) + Math.pow(py - projectionY, 2));
}


// 11. Проверка условий победы/поражения
function checkGameStatus() {
    // Проверка столкновения конфеты с Ам Нямом
    const distToOmNom = Math.sqrt(Math.pow(candy.x - omNom.x, 2) + Math.pow(candy.y - omNom.y, 2));
    if (distToOmNom < candy.radius + omNom.width / 2 - 10) { // Небольшой допуск
        if (!gameWon) {
            gameWon = true;
            gameRunning = false;
            displayMessage("Уровень пройден!", "green");
            document.getElementById('next-level-button').style.display = 'inline-block';
        }
    }

    // Проверка столкновения конфеты со звездами
    stars.forEach(star => {
        if (!star.collected) {
            const distToStar = Math.sqrt(Math.pow(candy.x - star.x, 2) + Math.pow(candy.y - star.y, 2));
            if (distToStar < candy.radius + star.radius) {
                star.collected = true;
                starsCollected++;
                document.getElementById('stars-collected').textContent = starsCollected;
            }
        }
    });

    // Проверка падения конфеты за пределы экрана или столкновения с шипами
    if (candy.y > canvas.height + 50 || candy.x < -50 || candy.x > canvas.width + 50) {
        if (!gameLost && !gameWon) { // Чтобы не проиграть после победы
            gameLost = true;
            gameRunning = false;
            displayMessage("Попробуйте снова!", "red");
        }
    }
    // Добавить проверку на столкновение с шипами/пауками
}

// 12. Функции управления кнопками
document.getElementById('restart-button').addEventListener('click', () => {
    initLevel(currentLevel);
    gameLoop(); // Перезапустить игровой цикл
});

document.getElementById('next-level-button').addEventListener('click', () => {
    currentLevel++;
    initLevel(currentLevel);
    gameLoop(); // Перезапустить игровой цикл
});

// 13. Функция для отображения сообщений
function displayMessage(message, color) {
    const msgDiv = document.getElementById('game-messages');
    msgDiv.textContent = message;
    msgDiv.style.color = color;
}

// 14. Запуск игры
loadImages(); // Загрузить изображения
// setupPhysics(); // Инициализировать физический движок
initLevel(currentLevel); // Инициализировать первый уровень
gameLoop(); // Запустить игровой цикл
