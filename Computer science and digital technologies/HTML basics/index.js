//Сложить два числа

document.addEventListener('DOMContentLoaded', () => {

	//Доступ к полям ввода
	const first_num = document.getElementById('first_num');
	const second_num = document.getElementById('second_num');
	const result = document.getElementById('result');
	const res = document.getElementById('res');

	//Функция запускается при нажатии на кнопку
	result.addEventListener('click', function () {
		ans = get_res();
		res.value = ans;
		setTimeout(function () {
			alert('Сумма чисел равна ' + ans);
		}, 10);
	});

	//Сложение двух чисел
	function get_res() {
		first = first_num.valueAsNumber;
		second = +second_num.value;
		ans = first + second;
		return ans;
	}
});

//анимация наливания кувшинов. пауза\сброс. защита от дебила