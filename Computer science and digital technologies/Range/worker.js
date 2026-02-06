// Переменные для хранения состояния
let rangeX, rangeY = 0;
let dx, dy = 0;
let paused = true;
let speedGame = 1;
let rangeSpeed = 0;
let changeDirectionTimeout = null;
let changeMovingInterval = null;
let nextChangeTime = 0;
let window_width, window_height;
let rangeWidth, rangeHeight;
let angle;


// Функция для генерации случайного числа в диапазоне
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Функция для изменения направления и скорости
function changeDirection() {

    if (!paused) {
        // Генерируем случайную скорость
        angle = Math.random() * Math.PI * 2;
        rangeSpeed = randomInRange(1, 3) * speedGame;
        rangeSpeed = rangeSpeed.toFixed(1);
        dx = Math.cos(angle) * rangeSpeed;
        dy = Math.sin(angle) * rangeSpeed;

        // Отправляем информацию о новом направлении и скорости
        self.postMessage({
            type: 'directionChanged',
            rangeSpeed: rangeSpeed,
            angle: Math.atan2(dy, dx) * 180 / Math.PI
        });

        
        // Планируем следующее изменение направления через случайное время (от 0.5 до 3 секунд)
        nextChangeTime = randomInRange(500, 2000);
        clearTimeout(changeDirectionTimeout);
        changeDirectionTimeout = setTimeout(changeDirection, nextChangeTime);

        // Отправляем время до следующего изменения
        self.postMessage({
            type: 'nextChangeTime',
            time: nextChangeTime / 1000
        });
    }

}

// Функция перемещения изображения
function moveImage() {
    //Если на паузе, выходим из функции
    if (!paused) {
        //self.a();
    
        //Обновляем позицию
        rangeX += dx;
        rangeY += dy;
        
        //Проверяем границы поля 
        if (rangeX < 0) {
            rangeX = 0;
            dx = Math.abs(dx); //Отражение от левой границы
        } else if (rangeX + rangeWidth > window_width) {
            rangeX = window_width - rangeWidth;
            dx = -Math.abs(dx); //Отражение от правой границы
        }
        
        if (rangeY < 0) {
            rangeY = 0;
            dy = Math.abs(dy); //Отражение от верхней границы
        } else if (rangeY + rangeHeight > window_height) {
            rangeY = window_height - rangeHeight;
            dy = -Math.abs(dy); //Отражение от нижней границы
        }

        //Отправляем новые координаты основному потоку
        self.postMessage({
            type: 'position',
            rangeX: rangeX,
            rangeY: rangeY,
            rangeSpeed: rangeSpeed,
            angle: angle
        });
        
        //Планируем следующий кадр анимации
        clearInterval(changeMovingInterval);
        changeMovingInterval = setTimeout(moveImage, 10); // ~100 кадров в секунду
    }
}

// Обработчик сообщений от основного потока
self.onmessage = function(e) {
    const data = e.data;
    
    // Обрабатываем разные типы сообщений
    switch(data.type) {
        case 'init':
            // Инициализация начальных значений
            window_width = data.window_width;
            window_height = data.window_height;
            rangeWidth = data.rangeWidth;
            rangeHeight = data.rangeHeight;
            rangeX = Math.random() * (window_width- rangeWidth);
            rangeY = Math.random() * (window_height - rangeHeight);
            paused = false;
            
            self.postMessage({
                type: 'reset',
                rangeX: rangeX,
                rangeY: rangeY
            });
            // Запускаем изменение направления
            changeDirection();

            
            // Запускаем движение
            moveImage();
            break;
            
        case 'pause':
            // Пауза/возобновление движения
            paused = data.paused;
            // Если движение возобновляется, запускаем цикл движения
            if (!paused) {
                changeDirection();
                moveImage();
            }
            break;
        
        case 'resize':
            window_width = data.window_width;
            window_height = data.window_height;
            break;
        
        case 'changeDifficulty':
            speedGame = data.speedGame;
            break;
    }
};