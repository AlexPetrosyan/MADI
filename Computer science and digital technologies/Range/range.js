const imageWorker = new Worker('worker.js'); //Подключение worker'а

//ПОЛУЧЕНИЕ ССЫЛКИ НА ВСЕ ЭЛЕМЕНТЫ СТРАНИЦЫ
const range = document.getElementById('moving-image');
const container = document.getElementById('container');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const statusEl = document.getElementById('status');
const currentClickEl = document.getElementById('current-click');
const currentPoints = document.getElementById('current-point');
const allClickEl = document.getElementById('all-click');
const timeRemainingEl = document.getElementById('time-remaining');
const currentSpeedEl = document.getElementById('current-speed');
const currentDirectionEl = document.getElementById('current-direction');
const restartBtn = document.getElementById('restart-btn');
const currentDifficultyEl = document.getElementById('current-difficulty');
const livesCountEl = document.getElementById('lives-count');
const livesContainer = document.getElementById('lives-container');
const gameOverEl = document.getElementById('game-over');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const customCursor = document.getElementById('customCursor');


//СОЗДАНИЕ ВСЕХ НЕОБХОДИМЫХ ПЕРЕМЕННЫХ
let lives = 7;                                          //Текущее количество жизней
let maxLives = 7;                                       //Максимальное количество жизней
let currentDifficulty = 'easy';                         //Текущая сложность игры
let countdownInterval = null; 
let isPaused = true;                                    //Состояние игры на паузе
let timeRemaining = 0;                                  //Счетчик до изменения направления
let speedGame = 1;                               //Коэффициент скорости перемещения
let rect = range.getBoundingClientRect();               //Получение координат цели
let rangeWidth = rect.width;                            //Получение ширины мишени
let rangeHeight = rect.height;                          //Получение высоты мишени
let cursorX = window.innerWidth / 2;                    //Положение курсора по X
let cursorY = window.innerHeight / 2;                   //Положение курсора по Y
let rangeX = (container.offsetWidth - rangeWidth)/2;    //Положение мишени по X
let rangeY = (container.offsetWidth - rangeWidth)/2;    //Положение мишение по Y
let rangeSpeed = 10;                                    //Скорость перемещения мишени
let aimSpeed = 20;                                         //Скорость перемещения прицела
let angle = 0;                                          //Угол направления движения мишени
let halfTargetSize = customCursor.style.height;         //Размер половины прицела
range.style.left = rangeX + 'px';                       //Начальное положение мишени по X
range.style.top = rangeY + 'px';                        //Начальное положение мишени по Y

//ОСНОВНЫЕ ФУНКЦИИ ПРИЛОЖЕНИЯ

//Создание функции ожидания при помощи Promise
const sleep = ms => new Promise(function(resolve) {
    return setTimeout(resolve, ms);
});

// Функция для обновления обратного отсчета
function updateCountdown() {
    if (timeRemaining > 0) {
        timeRemaining -= 0.1;
        timeRemainingEl.textContent = timeRemaining.toFixed(1);
    } else {
        clearInterval(countdownInterval);
    }
}

// Обработчик сообщений от Worker'а
imageWorker.onmessage = function(e) {
    const data = e.data;
    
    switch(data.type) {
        case 'position':
            // Обновляем позицию изображения
            rangeX = data.rangeX;
            rangeY = data.rangeY;
            range.style.left = rangeX + 'px';
            range.style.top = rangeY + 'px';
            rangeSpeed = data.rangeSpeed;
            angle = data.angle;
            
        case 'directionChanged':
            currentSpeedEl.textContent = data.rangeSpeed;
            // Вычисляем угол направления в градусах
            angle = data.angle;
            break;
            
        case 'nextChangeTime':
            // Устанавливаем время до следующего изменения направления
            timeRemaining = data.time;
            timeRemainingEl.textContent = timeRemaining.toFixed(1);
            
            // Запускаем обратный отсчет
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            countdownInterval = setInterval(updateCountdown, 100);
            break;

        case 'reset':
            rangeX = data.rangeX;
            rangeY = data.rangeY;
            break;
        
    }
};

// Функция запуска игры
function startGame(){
    if (isPaused) {
        currentClickEl.textContent = '0';
        // Запускаем Worker с начальными параметрами
        imageWorker.postMessage({
            type: 'init',
            window_width: container.offsetWidth,
            window_height: container.offsetHeight,
            rangeHeight: rangeHeight,
            rangeWidth: rangeWidth
        });
        
        isPaused = false;
        pauseBtn.innerHTML = isPaused ? 'Возобновить': 'Пауза';
        statusEl.textContent = 'Статус: Запущено';
    }
}

//Функция изменения состояния паузы
function pauseGame(){
    isPaused = !isPaused;
    // Отправляем команду паузы/возобновления
    imageWorker.postMessage({
        type: 'pause',
        paused: isPaused
    });

    pauseBtn.innerHTML = isPaused ? 'Возобновить': 'Пауза';
    statusEl.textContent = isPaused ? 'Статус: На паузе' : 'Статус: Запущено';

    if (isPaused) {
        clearInterval(countdownInterval);
    }
}

//Функция завершения игры
function endGame() {
    pauseGame();
    

    
    //Показываем экран окончания игры
    gameOverEl.classList.remove('hidden');
    currentPoints.textContent = (parseInt(currentClickEl.textContent)).toString();
    statusEl.textContent = 'Статус: Игра окончена!';
    
    //Блокируем кнопки управления
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
}


//Функция потери жизни
function loseLife() {
    if (!isPaused){ 
        //Уменьшение кол-ва жизней
        lives--;
        livesCountEl.textContent = lives;
        
        
        // Проверяем окончание игры
        if (lives <= 0) {
            endGame();
        } else {
            statusEl.textContent = 'Статус: Потеряна жизнь! Осталось: ' + lives;
            // Мигание изображения при потере жизни
            range.style.animation = 'blink 0.5s 3';
            setTimeout(() => {
                range.style.animation = '';
            }, 1500);
        }
    }
}

//Функция перезапуска игры
function restartGame() {
    currentClickEl.textContent = '0';
    //Сбрасываем жизни
    lives = maxLives;               
    livesCountEl.textContent = lives;

    gameOverEl.classList.add('hidden'); // Скрываем экран окончания игры
    
    //Разблокируем кнопки управления
    startBtn.disabled = false;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    pauseGame();
    startGame();
    
}

//Функция изменения уровня сложности
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    //Изменение статусов у кнопок выбора сложености
    difficultyBtns.forEach(btn => {
        if (btn.dataset.difficulty === difficulty) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    //Устанавливаем количество жизней в зависимости от сложности
    switch(difficulty) {
        case 'easy':
            maxLives = 7;
            currentDifficultyEl.textContent = 'Легкий';
            speedGame = 1;
            break;
        case 'medium':
            maxLives = 5;
            currentDifficultyEl.textContent = 'Средний';
            speedGame = 3;
            break;
        case 'hard':
            maxLives = 3;
            currentDifficultyEl.textContent = 'Тяжелый';
            speedGame = 5;
            break;
    }
    lives = maxLives;
    livesCountEl.textContent = lives;
    imageWorker.postMessage({
        type: 'changeDifficulty',
        speedGame: speedGame
    });
    restartGame();
}

//Фиксируем попадание по мишени
async function trigger(){
    currentClickEl.textContent = (parseInt(currentClickEl.textContent) + speedGame).toString();
    allClickEl.textContent = (parseInt(allClickEl.textContent) + 1).toString();
    range.src = 'Побитая.png';
    pauseGame();
    await sleep(1000);
    range.src = 'Крольчиха.png';
    imageWorker.postMessage({
        type: 'init',
        window_width: container.offsetWidth,
        window_height: container.offsetHeight,
        rangeHeight: rangeHeight,
        rangeWidth: rangeWidth
    });
    isPaused = true;
    pauseGame();
};

//Проверка подания по мишени
function isHit(){
    if (!isPaused) {
        rect = range.getBoundingClientRect();
        rangeX = rect.left;
        rangeY = rect.top;
        if (Math.abs(rangeX - cursorX) < rangeWidth && Math.abs(rangeY - cursorY) < rangeHeight){
            trigger();
        } else {
            loseLife();
        }
    }
}

//Обновление позиции кастомного курсора
function updateCursorPosition() {
    customCursor.style.left = cursorX + 'px';
    customCursor.style.top = cursorY + 'px';
}

//Обновление положения курсора
function mouseMoved(event){
    cursorX = event.clientX;
    cursorY = event.clientY;
    updateCursorPosition();
}

//Обработчик нажатия клавиш
function pressedKey(event){
    //Визуальная обратная связь для нажатых клавиш
    switch(event.key) {
        case 'ArrowUp':
            cursorY = Math.max(halfTargetSize, cursorY - aimSpeed);
            break;
        case 'ArrowDown':
            cursorY = Math.min(window.innerHeight - halfTargetSize, cursorY + aimSpeed);
            break;
        case 'ArrowLeft':
            cursorX = Math.max(halfTargetSize, cursorX - aimSpeed);
            break;
        case 'ArrowRight':
            cursorX = Math.min(window.innerWidth - halfTargetSize, cursorX + aimSpeed);
            break;
        case ' ':
            isHit();
            break;
    }
    
    updateCursorPosition();
    
    //Предотвращение прокрутки страницы при использовании стрелок
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }
}

//Функция обработки изменения размеров окна браузера
function resizeWindow(){
    statusEl.textContent = 'Статус: Размер окна изменен';
    imageWorker.postMessage({
        type: 'resize',
        window_width: container.offsetWidth,
        window_height: container.offsetHeight
    });
}

container.addEventListener('click', isHit); //Проверка нажатия по мишени
restartBtn.addEventListener('click', restartGame); //Нажатие по кнопке RESTART
pauseBtn.addEventListener('click', pauseGame); //Нажатие по кнопке PAUSE
resetBtn.addEventListener('click', restartGame); //Нажатие по кнопке RESET
startBtn.addEventListener('click', startGame); //Нажатие по кнопке START

window.addEventListener('resize', resizeWindow); // Обработчик изменения размера окна
document.addEventListener('keydown', pressedKey); // Обработчик события нажатия клавиш
document.addEventListener('mousemove', mouseMoved); //Обработчик перемещения курсора

//Нажатие по кнопкам изменения сложности
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        setDifficulty(this.dataset.difficulty);
    });
});