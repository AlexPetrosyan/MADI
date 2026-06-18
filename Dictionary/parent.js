import SelectedSymbols from './components/SelectedSymbols.js';
import Intersections from './components/Intersections.js';
import ModalWindow from './components/ModalWindow.js';

export default {
    components: { SelectedSymbols, Intersections, ModalWindow },
    data() {
        return {
            currentDictId: 1,
            selectedSymbols: {},
            dictionaries: [],
            modalVisible: false
        };
    },
    computed: {
        currentDict() {
            return this.dictionaries.find(d => d.id === this.currentDictId);
        }
    },
    async created() {
        const dictUrls = [
            './dictionaries/colors.json',
            './dictionaries/grades.json',
            './dictionaries/directions.json'
        ];
        try {
            const promises = dictUrls.map(url => fetch(url).then(res => res.json()));
            const dicts = await Promise.all(promises);
            this.dictionaries = dicts || [];
            this.dictionaries.forEach(dict => {
                if (!this.selectedSymbols[dict.id]) {
                    this.selectedSymbols[dict.id] = [];
                }
            });
            if (this.dictionaries.length) {
                this.currentDictId = this.dictionaries[0].id;
            }
        } catch (err) {
            console.error('Ошибка загрузки словарей:', err);
            this.dictionaries = [];
        }
    },
    methods: {
        openModal(dictId) {
            this.currentDictId = dictId;
            this.modalVisible = true;
        },
        clearDict(dictId) {
            this.selectedSymbols[dictId] = [];
        },
        saveModalData(newSymbols) {
            this.selectedSymbols[this.currentDictId] = newSymbols;
            this.modalVisible = false;
        },
        cancelModal() {
            this.modalVisible = false;
        }
    },
    template: `
        <div>
            <h1>Словарик</h1>

            <div style="margin-bottom: 20px;">
                <select v-model="currentDictId">
                    <option v-for="dict in dictionaries" :key="dict.id" :value="dict.id">{{ dict.name }}</option>
                </select>
                <button @click="openModal(currentDictId)">Выбрать символы</button>
            </div>

            <!-- Рендерим компоненты только когда словари загружены -->
            <template v-if="dictionaries.length">
                <SelectedSymbols 
                    :dictionaries="dictionaries"
                    :selectedSymbols="selectedSymbols"
                    @open-modal="openModal"
                    @clear-dict="clearDict"
                />

                <Intersections 
                    :dictionaries="dictionaries"
                    :selectedSymbols="selectedSymbols"
                />
            </template>

            <ModalWindow 
                v-if="modalVisible && currentDict"
                :dict="currentDict"
                :initialSymbols="selectedSymbols[currentDictId] || []"
                @save="saveModalData"
                @cancel="cancelModal"
            />
        </div>
    `
};