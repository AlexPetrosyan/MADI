import ChildComponent from './child.js';

export default {
    data() {
        return {
            receivedCount: 0
        };
    },
    methods: {
        handleUpdate(count) {
            this.receivedCount = count;
        }
    },
    components: {
        'child-component': ChildComponent
    },
    template: `
        <p>Количество нажатий: {{ receivedCount }}</p>
        <child-component @update-count="handleUpdate"></child-component>
    `
};