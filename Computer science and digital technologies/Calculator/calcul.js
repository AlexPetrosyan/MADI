//Калькулятор
document.addEventListener('DOMContentLoaded', () => {

	let res = 0;		//результат вычислений
	let znak = '+';		//действие, которое необходимо выполнить с двумя числами
	let output = '';	//вывод строки
	let last_oper = false;	//флаг, что последний символ - оператор
	const elem = document.getElementById("field");	//ссылка на input
	const memory = document.getElementById("memory"); //доп поле с запоминанием предыдущего действия

	//Вычисления результата
	function oper(num, new_znak) {
		if (!last_oper) {
			last_oper = true;
			switch (znak) {
				case '+':
					res += +num;
					break;
				case '-':
					res -= +num;
					break;
				case '/':
					res /= +num;
					break;
				case '*':
					res *= +num;
					break;
				case '=':
					res = +num;
			}
			res = +res.toFixed(12); //округление числа
			memory.value = res + new_znak;
			elem.value = res;
			output = '';
		} else {
			output = output.slice(0, -1) + new_znak;
			elem.value = output;
		}
		znak = new_znak; //смена оператора
	}

	function otvet(num) {
		last_oper = false;
		switch (znak) {
			case '+':
				res += +num;
				break;
			case '-':
				res -= +num;
				break;
			case '/':
				res /= +num;
				break;
			case '*':
				res *= +num;
				break;
		}
		res = +res.toFixed(12); //округление числа
		memory.value = '';
		elem.value = res;
		output = '';
		znak = '=';
	}
	//Добавление цифры
	function dop(last) {
		if (last_oper) {
			output = '';
		}
		output += last;
		elem.value = output;
		last_oper = false;
	}

	function percentage() {
		let full_number = res;
		let per = elem.value;
		switch (znak) {
			case '-':
			case '+':
				elem.value = full_number * per / 100;
				output = elem.value;
				break;
			case '*':
			case '/':
				elem.value = per / 100;
				output = elem.value;
				break;
			default:
				break;
		}
	}

	//Привязка действий к кнопкам на сайте

	const calcul = document.getElementById('calcul');
	calcul.addEventListener('click', function () {
		current_but = event.target;
		if (current_but.classList.contains('digit')) {
			dop(current_but.id);
		} else if (current_but.classList.contains('oper')) {
			oper(elem.value, current_but.id);
		}
	});


	const percent = document.getElementById('percent');
	percent.addEventListener('click', function () { percentage(); });

	function cleaning() {
		output = '';
		res = 0;
		elem.value = '';
		memory.value = '';
		last_oper = false;
		znak = '+';
	}

	const clean = document.getElementById('clean');
	clean.addEventListener('click', function () {
		cleaning();
	});

	function delet() {
		output = output.slice(0, -1);
		elem.value = output;
		let last = elem.value.slice(-1);
		if (last === '+' || last === '-' || last === '*' || last === '/' || last === '%' || last === '=') { sign = true; } //проверка, что новый последний символ не оператор
	}

	const del = document.getElementById('delete');
	del.addEventListener('click', function () {
		delet();
	});

	function changing(new_dig) {
		if (elem.value.slice(0, 1) === '-') {
			new_dig = elem.value.slice(1);
		} else {
			new_dig = '-' + elem.value;
		}
		elem.value = new_dig;
	}

	function change_sign() {
		if (output === '') {
			let new_dig = res;
			changing(new_dig);
			res = +elem.value;
		} else {
			let new_dig = output;
			changing(new_dig);
			output = elem.value;
		}
	}

	const change = document.getElementById('change');
	change.addEventListener('click', function () {
		change_sign();
	});

	const ravno = document.getElementById('=');
	ravno.addEventListener('click', function () {
		otvet(elem.value);
	});

	function new_dot() {
		if (!elem.value.includes('.')) { //Проверка на наличие десятичной точки
			output += '.';
			elem.value = output;
			last_oper = false;
		}
	}

	const dot = document.getElementById('dot');
	dot.addEventListener('click', function () {
		new_dot();
	});

	

	document.addEventListener('keyup', function (event) {
		let key = event.key;

		switch (key) {
			case '+':
			case '-':
			case '/':
			case '*':
				oper(elem.value, key); //Вызов функции, отвечающей за операции
				break;
			case '=':
				otvet(elem.value);
				break;

			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			case '0':
				dop(key);	 //Вызов функции, отвечающей за добавление символа в строку
				break;

			case '.':
				new_dot();
				break;

			case '%':
				percentage();
				break;

			case 'c':
			case 'C':
				cleaning();
				break;

			case 'Backspace':
				delet();
				break;

			default:	//Игнорирование всех недопустимых символов
				break;
		}
	});
});
