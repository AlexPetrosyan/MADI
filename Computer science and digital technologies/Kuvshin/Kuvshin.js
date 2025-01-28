document.addEventListener('DOMContentLoaded', () => {
	const water_1 = document.getElementById("water_1");
	const water_2 = document.getElementById("water_2");
	const kuvsh2 = document.getElementById("kuvsh2");
	const kuvsh1 = document.getElementById("kuvsh1");
	const final = document.getElementById("final");
	const bk = document.getElementById("bk");
	const mk = document.getElementById("mk");
	const text_2 = document.getElementById("text_2");
	const stop = document.getElementById("stop");
	//let kt_s = kt_b = k_b = k_s = finale = 0;
	let mal = bol = vm_b = vm_m = fin = 0;


	//kuvsh2.style.height = '300px';
	let step = 0;
	let flag = false;

	const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

		/*(async () => {
  		// Задержка в 2 секунды
  		await sleep(2000);
		})();*/

	function upd(kt_b, kt_s, k_b, k_s){
			water_1.style.height = 300/(k_b)*(kt_b)+'px';
			water_2.style.height = 300/(k_b)*(kt_s)+'px';
			text_1.textContent = "Сейчас в кувшине "+ kt_b + " литров";
			text_2.textContent = "Сейчас в кувшине "+ kt_s + " литров";
			console.log("Новые значения:", kt_b, kt_s);

	}

	/*function naliv(kt_b, kt_s, k_b, k_s, finale){
		(async () => {
			step = 1;
			if (flag){ 
			mal = kt_s;
			bol = kt_b; 
			console.log("Значения при остановке:", bol, mal, step);
			return;}
			if (pause_step <= 1){
				pause_step = -1;
				kt_s = 0;

				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);
				
			} 
			

			while (kt_b > k_s){
				step = 2
				if (flag){ 
				mal = kt_s;
				bol = kt_b;
				console.log("Значения при остановке:", bol, mal, step);
				return;}
				if (pause_step <= 2){
					pause_step = -1;

				kt_b -= k_s;
				kt_s += parseInt(k_s);
				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);
				
			}

			if (pause_step <= 3){
					pause_step = -1;
				step = 3;
				if (flag){ 
				mal = kt_s;
				bol = kt_b;
				console.log("Значения при остановке:", bol, mal, step);
				return;}

				kt_s = 0;
				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);
				

				if (kt_b == finale){ 
					alert(finale + ' литров в кувшине с вместимостью '+ k_b); 
				} 

				//naliv(kt_b, kt_s, k_b, k_s, finale);
			}
			}
			if (kt_b == k_s) {
				alert('Невозможно получить');
			} else if (kt_b != finale){
				step = 4;
				if (flag){ 
					mal = kt_s;
					bol = kt_b;
					console.log("Значения при остановке:", bol, mal, step);
					return;}
				if (pause_step <= 4){
					pause_step = -1;
				

				kt_s = parseInt(kt_b);
				kt_b = 0;
				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);
				
			}

				step = 5;
				if (flag){console.log("Значения при остановке:", kt_b, kt_s, step);
				mal = kt_s;
				bol = kt_b;
				 return;}
				if (pause_step <= 5){
					pause_step = -1;
				

				kt_b = k_b;
				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);
				
			}
				step = 6;
				if (flag){ console.log("Значения при остановке:", kt_b, kt_s, step);
				mal = kt_s;
				bol = kt_b;
				return;}
				if (pause_step <= 6){
					pause_step = -1;
				

				kt_b = parseInt(kt_b) - (parseInt(k_s) - parseInt(kt_s));
				kt_s = parseInt(kt_s) + (parseInt(k_s) - parseInt(kt_s));
				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);
			}
				step = 7;
				if (flag){console.log("Значения при остановке:", kt_b, kt_s, step);
				mal = kt_s;
				bol = kt_b;
				 return;}

				if(kt_b == finale){ 
					alert(finale + ' литров в кувшине с вместимостью '+ k_b);
				} else {
					naliv(kt_b, kt_s, k_b, k_s, finale);
				}
			}
		})();
	}



	const begin = document.getElementById('start');

	function start(kt_b, kt_s, k_b, k_s, finale) {
		(async () => {
			step = 0;
			if (flag){ console.log("Значения при остановке:", kt_b, kt_s, step);
			mal = kt_s;
			bol = kt_b;
			return;}
			if (pause_step > 0){

				naliv(kt_b, kt_s, k_b, k_s, finale);
				return;
			} else if (pause_step == 0){
				pause_step = -1;
			}

			k_b = bk.value;
			k_s = mk.value;

			if (k_b < k_s){
				k_b = mk.value;
				k_s = bk.value;
			}

			finale = final.value;
			kt_b = kt_s = 0;
			water_1.style.height = '300px';
			kuvsh2.style.height = 300/(k_b)*(k_s)+'px';
			water_2.style.height = kuvsh2.style.height;
			await sleep(4000);
			upd(kt_b, kt_s, k_b, k_s);
			await sleep(4000);

			if (finale > k_b){
				alert('Просите воды больше, чем возможно');
			} else if (finale == k_b){
				kt_b = finale;
				kt_s = 0;
				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);

				alert(finale + ' литров в кувшине с вместимостью '+ k_b);
			} else if (finale == k_s){
				kt_b = 0;
				kt_s = finale;
				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);

				alert(finale + ' литров в кувшине с вместимостью '+ k_s);
			} else {
				if (flag) {kt_b = 0;}
				else {kt_b = k_b;}
				naliv(kt_b, kt_s, k_b, k_s, finale);
			}
		})();
	}

	begin.onclick = function(){
		start(0,0,0,0,0);
	}

	stop.onclick = function() {
		if (!flag) {
			flag = true;
			pause_step = step;
		} else {
			flag = false;
			console.log("Значения при запуске:", mal, bol);
			start(bol, mal, k_b, k_s, finale);
		}
	}

	document.getElementById('reset').onclick = function() {
		location.reload();
	}

	*/



	const seventh_step = async() =>{
			step = 7;
			if (flag){
				mal = kt_s;
				bol = kt_b;
				vm_bol = k_b;
				vm_mal = k_s;
				fin = finale;
				console.log("Значения при остановке:", bol, mal, step);
				return;
			}

			kt_b = parseInt(kt_b) - (parseInt(k_s) - parseInt(kt_s));
			kt_s = parseInt(kt_s) + (parseInt(k_s) - parseInt(kt_s));
			upd(kt_b, kt_s, k_b, k_s);
			await sleep(4000);
			
			if(kt_b == finale){ 
				alert(finale + ' литров в кувшине с вместимостью '+ k_b);
			} else {
				second_step();
			}
				
	}




	const sixth_step = async() =>{
			step = 6;
			if (flag){
				mal = kt_s;
				bol = kt_b;
				vm_bol = k_b;
				vm_mal = k_s;
				fin = finale;
				console.log("Значения при остановке:", bol, mal, step);
				return;
			}

			kt_b = k_b;
			upd(kt_b, kt_s, k_b, k_s);
			await sleep(4000);

			seventh_step();
	}


	const fifth_step = async() =>{
			step = 5;

			if (kt_b == k_s) {
				alert('Невозможно получить');
				return;
			} 
			if (flag){ 
				mal = kt_s;
				bol = kt_b;
				vm_bol = k_b;
				vm_mal = k_s;
				fin = finale;
				console.log("Значения при остановке:", bol, mal, step);
				return;
			}
				
			kt_s = parseInt(kt_b);
			kt_b = 0;
			upd(kt_b, kt_s, k_b, k_s);
			await sleep(4000);
				
			sixth_step();
	}


	const forth_step = async () =>{
			step = 4;
			if (flag){ 
				mal = kt_s;
				bol = kt_b;
				vm_bol = k_b;
				vm_mal = k_s;
				fin = finale;
				console.log("Значения при остановке:", bol, mal, step);
				return;
			}

			kt_s = 0;
			upd(kt_b, kt_s, k_b, k_s);
			await sleep(4000);
				

			if (kt_b == finale){ 
				alert(finale + ' литров в кувшине с вместимостью '+ k_b); 
				return;
			} else {
				third_step();
			}
	}




	const third_step = async () =>{
			step = 3;
			console.log("Шаг", step, kt_b, kt_s, k_b, k_s);
			if (flag){ 
				mal = kt_s;
				bol = kt_b;
				vm_bol = k_b;
				vm_mal = k_s;
				fin = finale;
				console.log("Значения при остановке:", bol, mal, step);
				return;
			}

			if (kt_b > k_s){
				kt_b -= k_s;
				kt_s += parseInt(k_s);
				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);

				forth_step();
			} else {
				fifth_step();
			}

	}

	const second_step = async () =>{
			step = 2;
			if (flag){ 
				mal = kt_s;
				bol = kt_b;
				vm_bol = k_b;
				vm_mal = k_s;
				fin = finale;
				console.log("Значения при остановке:", bol, mal, step);
				return;
			}
			kt_s = 0;

			upd(kt_b, kt_s, k_b, k_s);
			await sleep(4000);

			third_step();		
	}



	const begin = document.getElementById('start');

	async function start() {
			step = 1;
			k_b = bk.value;
	 		k_s = mk.value;

			if (k_b < k_s){
				k_b = mk.value;
				k_s = bk.value;
			}

			finale = final.value;
			kt_b = kt_s = 0;
			water_1.style.height = kuvsh1.clientHeight+'px';
			kuvsh2.style.height = kuvsh1.clientHeight/(k_b)*(k_s)+'px';
			water_2.style.height = kuvsh2.style.height;
			await sleep(4000);
			upd(kt_b, kt_s, k_b, k_s);
			await sleep(4000);

			if (finale > k_b){
				alert('Просите воды больше, чем возможно');
			} else if (finale == k_b){
				kt_b = finale;
				kt_s = 0;
				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);

				alert(finale + ' литров в кувшине с вместимостью '+ k_b);
			} else if (finale == k_s){
				kt_b = 0;
				kt_s = finale;
				upd(kt_b, kt_s, k_b, k_s);
				await sleep(4000);

				alert(finale + ' литров в кувшине с вместимостью '+ k_s);
			} else {
				if (flag){ 
					mal = kt_s;
					bol = kt_b;
					vm_bol = k_b;
					vm_mal = k_s;
					fin = finale;
					console.log("Значения при остановке:", bol, mal, step);
					return;
				}

				kt_b = k_b;
				second_step();
			}
	}

	begin.onclick = function(){
		flag = false;
		start();
	}

	stop.onclick = function() {
		if (!flag) {
			flag = true;
		} else {
			flag = false;
			console.log("Значения при запуске:", bol, mal, vm_b, vm_m, step);
			switch (step) {
				case 1:
					start();
					break;
				case 2:
					second_step();
					break;
				case 3:
					third_step();
					break;
				case 4:
					forth_step();
					break;
				case 5:
					fifth_step();
					break;
				case 6:
					sixth_step();
					break;
				case 7:
					seventh_step();
					break;
			}
		}
	}

	document.getElementById('reset').onclick = function() {
		location.reload();
	}

});
