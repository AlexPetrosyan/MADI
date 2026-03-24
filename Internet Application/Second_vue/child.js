export default {
    data() {
        return {
            localCount: 0
        };
    },
    methods: {
        increment() {
            this.localCount++;        
            this.$emit('update-count', this.localCount);
        }
    },
    template: `
        <button @click="increment">Нажми меня</button>
    `
};