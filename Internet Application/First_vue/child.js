export default {
    props: {
        count: {
            type: Number,
            default: 0
        }
    },
    template: `
        <p>Количество нажатий: {{ count }}</p>
    `
};

/*
Кнопка в дочерний, а увеличивается значение в родительском.
*/