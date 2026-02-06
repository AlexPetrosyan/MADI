//document.addEventListener('DOMContentLoaded', () => {
	const coll = document.getElementById("c_lab");
	const roww = document.getElementById("r_lab");
	const begin = document.getElementById('start');
	const matrix = [];
	let flag = false;

	//Получение рандомного числа в заданном диапазоне
	function getRandomInt(min, max) {
	    min = Math.ceil(min);
		max = Math.floor(max);
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	//Отрисовка лабиринта
	function draw_lab(row, col) {
		const width = window.innerWidth * 0.8; // Задаем ширину холста
		let canvas = document.getElementById("canvas"); //
		let ctx = canvas.getContext("2d");

        canvas.setAttribute('width', width); // Меняем ширину canvas элемента
        canvas.setAttribute('height', width); // Меняем ширину canvas элемента
  
		const columns = col * 2 + 1;
		const rows = row * 2 + 1;
		let y = 10;
		let y_width = x_width = Math.floor(width / rows);

		//Проходимся по всем элементам массива и отрисовываем его
		for (var i = 0; i < rows; i++){
			let x = 10;
			if (i%2==0){
				y_step = Math.floor(y_width / 5); //Задание высоты для четных позиций
			} else {
				y_step = y_width;
			}
			for (var j = 0; j < columns; j++){
				if (j%2 == 0){
					x_step = Math.floor(x_width / 5); //Задание ширины для четных позиций
				} else {
					x_step = x_width;
				}
				if (matrix[i][j] == 1){	//Отрисовка стены
					ctx.fillStyle = "black";
					ctx.fillRect(x, y, x_step, y_step);
				} else if (matrix[i][j] == 2){ //Отрисовка кратчайшего пути
					ctx.fillStyle = "red"; 
					ctx.fillRect(x, y, x_step, y_step);
				} else if (matrix[i][j] == 4){ //Отрисовка пути, где побывала мышь
					ctx.fillStyle = "orange";
					ctx.fillRect(x, y, x_step, y_step);
				}

				x += x_step;
			}
			y += y_step;
		}
	}

	//Нахождение маршрута прохода лабиринта
	function find_way(x, y, columns){
		while ((x < columns - 1) && (flag == false)){
			if (matrix[y-1][x] == 0){
				y -= 1;
				matrix[y][x] = 2;
				find_way(x, y, columns);
				y += 1;
			} else if (matrix[y][x+1] == 0){
				x += 1;
				matrix[y][x] = 2;
				find_way(x, y, columns);
				x -= 1;
			} else if (matrix[y+1][x] == 0){
				y += 1;
				matrix[y][x] = 2;
				find_way(x, y, columns);
				y -= 1;
			} else if (matrix[y][x-1] == 0){
				x -= 1;
				matrix[y][x] = 2;
				find_way(x, y, columns);
				x += 1;
			} else {
				matrix[y][x] = 4;
				return;
			}
		}
		flag = true;
		return;
	}

	//Алгоритм построение лабиринта
	function labyrinth(){
		const col = coll.value;
		const row = roww.value;
		const columns = col * 2 + 1;
		const rows = row * 2 + 1;
		// сначала заполняем все ячейки карты стенами
		for (var i = 0; i < columns; i++) {

  			matrix[i] = [];

  			for (var j = 0; j < rows; j++) {
  				if ((i%2!=0) && (j%2!=0) && (j>0) && (i>0) && (i <= columns) && (j <= rows)){
  					matrix[i][j] = 0;
  				} else {
    				matrix[i][j] = 1;
    			}
  			}
		}

		let y = 3;
		let rand = 0;

		//Сносим стену в верхнем ряду
		for (var i = 1; i < rows - 1; i++){
			matrix [1][i] = 0;
		}

		//Проходимся по остальным рядам
		while (y < columns){
			let x = 1;

			while (x <= row){
				rand = getRandomInt(1, row - x + 1);
				for (var i = x*2 - 1; i < (x + rand - 1) * 2; i++){
					matrix [y][i] = 0;	//Сносим рандомное число стен в ряду (объединяем их)
				}
				let new_rand = getRandomInt(1, rand);
				matrix [y-1][(x+new_rand-1)*2 - 1] = 0; //Делаем проход в верхний ряд
				x += rand;
			}

			y += 2;
		}
		var rand_1 = getRandomInt(1, col)*2-1;
		matrix[rand_1][0] = 2; //Обозначаем старт лабиринта
		matrix[rand_1][1] = 2;
		var rand_2 = getRandomInt(1, col);
		matrix[rand_2*2 - 1][rows - 1] = 0;	//Обозначаем финиш лабиринта

		console.info(matrix);
		flag = false;
		find_way(1, rand_1, rows); //Поиск пути
		console.info(matrix);
		draw_lab(col, row); //Отрисовка лабиринта
		return;
	}

	
	begin.addEventListener('click', labyrinth);

//});