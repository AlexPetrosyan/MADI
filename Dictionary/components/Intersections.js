function loadCSSIfNotAlreadyLoadedForSomeReason () {
    var ss = document.styleSheets;
    for (var i = 0, max = ss.length; i < max; i++) {
        if (ss[i].href == 'styles/Intersections.css')
            return;
    }
    var link = document.createElement("link");
    link.rel = 'stylesheet';
    link.href = 'styles/Intersections.css';

    document.getElementsByTagName("head")[0].appendChild(link);
}

loadCSSIfNotAlreadyLoadedForSomeReason();

export default {
    name: 'Intersections',

    props: {
        dictionaries: { type: Array, required: true },
        selectedSymbols: { type: Object, required: true }
    },

    computed: {
        intersections() {
            if (!Array.isArray(this.dictionaries)) return [];
            const map = new Map();
            for (const dict of this.dictionaries) {
                if (!dict || dict.id === undefined) continue;
                const selected = this.selectedSymbols?.[dict.id] || [];
                for (const sym of selected) {
                    const item = dict.items?.find(i => i.symbol === sym);
                    if (!item) continue;
                    if (!map.has(sym)) {
                        map.set(sym, { entries: [] });
                    }
                    const entry = map.get(sym);
                    if (!entry.entries.find(e => e.dictId === dict.id)) {
                        entry.entries.push({
                            dictId: dict.id,
                            dictName: dict.name,
                            description: item.description
                        });
                    }
                }
            }
            const result = [];
            for (const [symbol, data] of map.entries()) {
                if (data.entries.length > 1) {
                    result.push({ symbol, entries: data.entries });
                }
            }
            return result;
        },
        hasIntersections() {
            return this.intersections.length > 0;
        }
    },
    
    template: `
        <div v-if="hasIntersections" class="intersections">
            <h2>Пересечения</h2>
            <div v-for="item in intersections" :key="item.symbol">
                <strong>Символ «{{ item.symbol }}»</strong>
                <ul>
                    <li v-for="entry in item.entries" :key="entry.dictId">
                        Словарь «{{ entry.dictName }}» - описание: {{ entry.description }}
                    </li>
                </ul>
            </div>
        </div>
    `
};