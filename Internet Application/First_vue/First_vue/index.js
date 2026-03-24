import {createApp} from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

import ParentComponent from './parent.js';

const app = createApp(ParentComponent);
app.mount('#app');

console.log('Приложение запущено');