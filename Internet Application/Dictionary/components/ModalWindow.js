function loadCSSIfNotAlreadyLoadedForSomeReason() {
    var ss = document.styleSheets;
    for (var i = 0, max = ss.length; i < max; i++) {
        if (ss[i].href == 'styles/ModalWindow.css')
            return;
    }
    var link = document.createElement("link");
    link.rel = 'stylesheet';
    link.href = 'styles/ModalWindow.css';
    document.getElementsByTagName("head")[0].appendChild(link);
}

loadCSSIfNotAlreadyLoadedForSomeReason();

export default {
    name: 'ModalWindow',

    props: {
        dict: { type: Object, required: true },
        initialSymbols: { type: Array, default: () => [] }
    },

    data() {
        return {
            tempSymbols: [],
            inputString: '',
            inputError: [],
            skipValidation: false   // флаг для пропуска валидации
        };
    },

    watch: {
        inputString(newVal, oldVal) {
            // Если включен пропуск, просто выходим (сбрасываем флаг)
            if (this.skipValidation) {
                this.skipValidation = false;
                return;
            }

            // 1. Сохраняем старую строку (до изменений)
            const oldSymbols = [...oldVal];
            const newSymbols = newVal.split('');

            const removed = oldSymbols.filter(s => !newSymbols.includes(s));
            removed.forEach(sym => {
                const idx = this.tempSymbols.indexOf(sym);
                if (idx !== -1) this.tempSymbols.splice(idx, 1);
            });

            const addedPart = newVal.slice(oldSymbols.length);
            const addedSymbols = new Set(addedPart.split(''));

            this.inputError = [];
            let hasError = false;
            for (let sym of addedSymbols) {
                sym = sym.toUpperCase();
                if (oldSymbols.includes(sym)) {
                    this.inputError.push(`Символ "${sym}" уже есть в словаре "${this.dict.name}"`);
                    hasError = true;
                } else {
                    const exists = this.dict.items?.some(item => item.symbol === sym);
                    if (!exists) {
                        hasError = true;
                        this.inputError.push(`Символ "${sym}" не существует в словаре "${this.dict.name}"`);
                    } else {
                        this.tempSymbols.push(sym);
                    }
                }
            }

            const corrected = this.tempSymbols.join('');
            if (corrected !== newVal) {
                this.skipValidation = true;
                this.inputString = corrected;
            }
        },

        initialSymbols: {
            immediate: true,
            handler(newVal) {
                this.tempSymbols = Array.isArray(newVal) ? [...newVal] : [];
                this.skipValidation = true;
                this.inputString = this.tempSymbols.join('');
            }
        }
    },

    methods: {
        toggleSymbol(sym, isChecked) {
            sym = sym.toUpperCase();
            if (isChecked) {
                if (!this.tempSymbols.includes(sym)) {
                    this.tempSymbols.push(sym);
                    this.inputError = [];
                }
            } else {
                const idx = this.tempSymbols.indexOf(sym);
                if (idx !== -1) this.tempSymbols.splice(idx, 1);
                this.inputError = [];
            }
            this.skipValidation = true;
            this.inputString = this.tempSymbols.join('');
        },

        handleCheckboxChange(item, event) {
            this.toggleSymbol(item.symbol, event.target.checked);
        },

        save() {
            const uniqueSymbols = [...new Set(this.tempSymbols)];
            this.$emit('save', uniqueSymbols);
        },

        cancel() {
            this.$emit('cancel');
        }
    },

    template: `
        <div class="modal-window">
            <div class="modal-background">
                <h3>Выбор символов – {{ dict.name }}</h3>
                <div>
                    <input type="text" v-model="inputString" placeholder="Введите символы">
                    <div v-for="error in inputError" class="error">{{ error }}</div>
                </div>
                <div class="toggle-field">
                    <div v-for="item in dict.items" :key="item.symbol">
                        <label>
                            <input type="checkbox" :value="item.symbol" 
                                   :checked="tempSymbols.includes(item.symbol)" 
                                   @change="handleCheckboxChange(item, $event)">
                            {{ item.symbol }} – {{ item.description }}
                        </label>
                    </div>
                </div>
                <button @click="save">Сохранить</button>
                <button @click="cancel">Отменить</button>
            </div>
        </div>
    `
};