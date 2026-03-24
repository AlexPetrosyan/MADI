import ChildComponent from './child.js';
// Родительский компонент с кнопкой и счетчиком
export default {
    
    data() {
        return {
            clickCount: 0  // Переменная-счетчик
        };
    },
    
    methods: {
        // Метод для увеличения счетчика
        incrementCounter() {
            this.clickCount++;
            console.log(`Счетчик увеличен: ${this.clickCount}`);
        }
    },
    
    components: {
        'child-component': ChildComponent
    },

    template: `
        <button @click="incrementCounter">Нажми меня</button>
        <child-component v-bind:count="clickCount"></child-component>
    `

};