function loadCSSIfNotAlreadyLoadedForSomeReason () {
    var ss = document.styleSheets;
    for (var i = 0, max = ss.length; i < max; i++) {
        if (ss[i].href == 'styles/SelectedSymbols.css')
            return;
    }
    var link = document.createElement("link");
    link.rel = 'stylesheet';
    link.href = 'styles/SelectedSymbols.css';

    document.getElementsByTagName("head")[0].appendChild(link);
}

loadCSSIfNotAlreadyLoadedForSomeReason();

export default {
    name: 'SelectedSymbols',
    props: {
        dictionaries: { type: Array, required: true },
        selectedSymbols: { type: Object, required: true }
    },
    computed: {
        dictionariesWithSelection() {
            if (!Array.isArray(this.dictionaries)) return [];
            return this.dictionaries.filter(dict => {
                const symbols = this.selectedSymbols?.[dict.id];
                return symbols && symbols.length > 0;
            });
        },
        selectedItemsByDict() {
            const result = {};
            if (!Array.isArray(this.dictionaries)) return result;
            for (const dict of this.dictionaries) {
                if (!dict || dict.id === undefined) continue;
                const symbols = this.selectedSymbols?.[dict.id] || [];
                const items = symbols.map(sym => {
                    const item = dict.items?.find(i => i.symbol === sym);
                    return item ? { symbol: sym, description: item.description } : null;
                }).filter(Boolean);
                result[dict.id] = items;
            }
            return result;
        }
    },
    template: `
        <div>
            <div v-for="dict in dictionariesWithSelection" :key="dict.id" class="dict-card">
                <h3>{{ dict.name }}</h3>
                <div>
                    <div v-for="item in selectedItemsByDict[dict.id]" :key="item.symbol" class="symbol-chip">
                        {{ item.symbol }} – {{ item.description }}
                    </div>
                </div>
                <button @click="$emit('open-modal', dict.id)">Изменить</button>
                <button @click="$emit('clear-dict', dict.id)">Очистить</button>
            </div>
        </div>
    `
};