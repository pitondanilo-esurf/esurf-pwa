<template>
    <AppNavbar />
    <div class="sankey-dashboard" @click.self="unpinTooltip">
        <div class="overlay-ui">
            <h1>EDDPS Sankey Flow</h1>
            <p>Distribuzione del Valore: Documenti → Intenti → Modelli → Revenue</p>
        </div>

        <div class="legend">
            <div class="legend-item"><div class="legend-color doc-color"></div><span>Documenti Ingeriti</span></div>
            <div class="legend-item"><div class="legend-color intent-color"></div><span>Intenti Analitici</span></div>
            <div class="legend-item"><div class="legend-color model-color"></div><span>Modelli di Business</span></div>
            <div class="legend-item"><div class="legend-color stream-color"></div><span>Revenue Streams</span></div>
        </div>

        <div 
            v-if="tooltip.visible" 
            class="custom-tooltip" 
            :class="{ 'is-pinned': tooltip.pinned }"
            :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        >
            <div class="tooltip-header">
                <span class="tooltip-badge" :style="{ backgroundColor: tooltip.color }">{{ tooltip.badge }}</span>
                <span v-if="tooltip.pinned" class="pin-icon">📌</span>
                <h3 class="tooltip-title">{{ tooltip.title }}</h3>
            </div>
            <p class="tooltip-desc">
                {{ tooltip.desc || 'Nessuna descrizione aggiuntiva disponibile per questo nodo.' }}
            </p>
            <div class="tooltip-value">Peso del Flusso: <strong>{{ tooltip.value.toFixed(2) }}</strong></div>
        </div>

        <div v-if="loading" class="loading-overlay">
            <svg class="spinner" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Estrazione flussi da MongoDB in corso...</span>
        </div>
        
        <div v-if="error" class="error-overlay">
            <p>⚠️ {{ error }}</p>
        </div>

        <div ref="sankeyContainer" class="d3-container"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import apiClient from '@/services/axios.js'; 
import AppNavbar from '@/components/eddpsNavBar.vue';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey'; 

const sankeyContainer = ref(null);
const loading = ref(true);
const error = ref(null);

const tooltip = ref({
    visible: false, x: 0, y: 0, title: '', desc: '', badge: '', color: '', value: 0, pinned: false
});

const COLORS = {
    1: '#38BDF8', // Doc
    2: '#FBBF24', // Intent
    3: '#A78BFA', // Model
    4: '#10B981'  // Stream
};

// ============================================================================
// 1. DATA FETCHING 
// ============================================================================
const fetchDatabaseData = async () => {
    try {
        const [oppResponse, matrixResponse] = await Promise.all([
            apiClient.get('/api/eddps/opportunities'),
            apiClient.get('/api/eddps/matrix-mapping')
        ]);

        const opportunities = oppResponse.data?.data || [];
        const matrixMap = matrixResponse.data?.data || { revenue_streams: [] };

        if (!matrixMap.revenue_streams) {
            matrixMap.revenue_streams = [];
        }

        return { opportunities, matrixMap };

    } catch (err) {
        console.error("[EDDPS Sankey] Errore API:", err);
        let errorMsg = "Impossibile caricare i dati dal server.";
        if (err.response && err.response.status === 404) errorMsg = "Errore 404: Rotta non trovata.";
        if (err.response && err.response.status === 500) errorMsg = "Errore 500: Database MongoDB non raggiungibile.";
        error.value = errorMsg;
        return { opportunities: [], matrixMap: { revenue_streams: [] } };
    }
};

// ============================================================================
// 2. FUNZIONE DI RICERCA MIRATA (TARGETED SEARCH)
// ============================================================================
// Esplora l'oggetto cercando specificamente un nodo che abbia 'codice' == target 
// e che possieda il campo 'descrizione'. Evita falsi positivi con ID di categorie.
const findTargetDescription = (obj, targetCode) => {
    let foundDesc = "";
    
    const search = (current) => {
        if (!current || typeof current !== 'object') return;
        if (foundDesc) return; // Interrompi se trovata
        
        // Se troviamo un array, esploriamolo
        if (Array.isArray(current)) {
            for (let i = 0; i < current.length; i++) search(current[i]);
            return;
        }

        const currentCode = current.codice || current.modello_codice;
        
        // Match esatto: è l'oggetto del modello e ha la descrizione
        if (String(currentCode) === String(targetCode) && (current.descrizione || current.modello_descrizione)) {
            foundDesc = current.descrizione || current.modello_descrizione;
            return;
        }
        
        // Continua a cercare nelle proprietà annidate (es. array 'business_models' dentro la categoria)
        for (const key in current) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
                search(current[key]);
            }
        }
    };
    
    search(obj);
    return foundDesc;
};

// ============================================================================
// 3. PARSER
// ============================================================================
const buildSankeyData = (opportunities, matrixMap) => {
    const nodesMap = new Map();
    const linksMap = new Map();

    const addNode = (id, name, group, desc = "") => {
        const safeId = String(id).trim();
        if (!nodesMap.has(safeId)) {
            nodesMap.set(safeId, { id: safeId, name: name || "Sconosciuto", group, desc });
        } else {
            const existingNode = nodesMap.get(safeId);
            const isGeneric = !existingNode.desc || existingNode.desc.includes("attivo per la categoria") || existingNode.desc === "";
            const isNewBetter = desc && !desc.includes("attivo per la categoria") && desc !== "";
            if (isGeneric && isNewBetter) existingNode.desc = desc;
        }
    };

    const addLink = (source, target, value) => {
        const s = String(source).trim();
        const t = String(target).trim();
        if (s === t) return; 

        const linkId = `${s}___${t}`;
        if (!linksMap.has(linkId)) {
            linksMap.set(linkId, { source: s, target: t, value: 0 });
        }
        linksMap.get(linkId).value += Number(value) || 1; 
    };

    opportunities.forEach((doc, dIdx) => {
        const docId = `D_${doc._id || dIdx}`;
        const docDesc = doc.reasoning || doc.descrizione || doc.description || doc.abstract || "Documento analizzato dalla pipeline.";
        addNode(docId, doc.analyzed_document_title || `Documento ${dIdx+1}`, 1, docDesc);

        if (doc.opportunity_intents && Array.isArray(doc.opportunity_intents)) {
            doc.opportunity_intents.forEach((intent, iIdx) => {
                if (!intent.intent) return;

                const intentId = `I_${docId}_${iIdx}`;
                const intentLabel = intent.intent.length > 35 ? intent.intent.substring(0, 32) + "..." : intent.intent;
                const flowValue = (intent.weight || 1) * 10; 
                
                addNode(intentId, intentLabel, 2, intent.intent);
                addLink(docId, intentId, flowValue);

                if (intent.associated_business_models && Array.isArray(intent.associated_business_models)) {
                    const bmCount = intent.associated_business_models.length;
                    
                    intent.associated_business_models.forEach(bm => {
                        const targetCode = bm.modello_codice;
                        let extractedTitolo = bm.modello_titolo || bm.titolo || 'N/A';
                        let modelDesc = "";

                        // FASE 1: Ricerca diretta. 
                        // Se l'oggetto 'bm' è la categoria e ha dentro un array di modelli, ispezioniamo quell'array.
                        const arraysToCheck = [bm.business_models, bm.modelli, bm.models, bm.array];
                        for (const arr of arraysToCheck) {
                            if (Array.isArray(arr)) {
                                const matchedModel = arr.find(m => String(m.codice) === String(targetCode) || String(m.modello_codice) === String(targetCode));
                                if (matchedModel) {
                                    modelDesc = matchedModel.descrizione || matchedModel.modello_descrizione || "";
                                    if (extractedTitolo === 'N/A') extractedTitolo = matchedModel.titolo || matchedModel.modello_titolo || 'N/A';
                                }
                            }
                        }

                        // FASE 2: Se non trovato negli array interni, controlliamo se fosse già al primo livello
                        if (!modelDesc) {
                            modelDesc = bm.modello_descrizione || bm.descrizione || "";
                        }

                        // FASE 3: Ricerca ricorsiva globale (Matrix o Documento) per quel preciso targetCode
                        if (!modelDesc) {
                            modelDesc = findTargetDescription(matrixMap, targetCode);
                        }
                        if (!modelDesc) {
                            modelDesc = findTargetDescription(doc, targetCode);
                        }

                        // Fallback finale se il database non ha la stringa salvata da nessuna parte
                        if (!modelDesc) {
                            modelDesc = `Modello di Business attivo per la categoria ${bm.categoria_codice} (Codice: ${targetCode}).`;
                        }

                        const modelId = `M_${bm.categoria_codice}_${targetCode}`;
                        const modelLabel = `[${bm.categoria_codice}.${targetCode}] ${extractedTitolo}`;

                        addNode(modelId, modelLabel, 3, modelDesc);
                        
                        const bmFlowValue = flowValue / (bmCount || 1);
                        addLink(intentId, modelId, bmFlowValue);

                        const matchingStreams = (matrixMap.revenue_streams || []).filter(stream => {
                            if (!stream.mapped_models) return false;
                            return stream.mapped_models.some(m => String(m.categoria_codice) === String(bm.categoria_codice) && String(m.modello_codice) === String(targetCode));
                        });

                        if (matchingStreams.length > 0) {
                            const streamFlowValue = bmFlowValue / matchingStreams.length;
                            matchingStreams.forEach(stream => {
                                const streamId = `S_${stream.stream_id}`;
                                const streamDesc = stream.strategic_summary || stream.descrizione || "Flusso Monetario Generato.";
                                addNode(streamId, stream.stream_name, 4, streamDesc);
                                addLink(modelId, streamId, streamFlowValue);
                            });
                        }
                    });
                }
            });
        }
    });

    const rawLinks = Array.from(linksMap.values());
    const validLinks = rawLinks.filter(l => nodesMap.has(l.source) && nodesMap.has(l.target) && l.value > 0);
    const activeNodeIds = new Set();
    
    validLinks.forEach(l => {
        activeNodeIds.add(l.source);
        activeNodeIds.add(l.target);
    });
    
    const validNodes = Array.from(nodesMap.values()).filter(n => activeNodeIds.has(n.id));
    return { nodes: validNodes, links: validLinks };
};

// ============================================================================
// 4. MOTORE GRAFICO D3 SANKEY E INTERAZIONI
// ============================================================================
const initSankeyGraph = (data) => {
    if (!sankeyContainer.value || data.nodes.length === 0 || data.links.length === 0) return;

    const width = sankeyContainer.value.clientWidth || 800;
    const height = sankeyContainer.value.clientHeight || 600;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    d3.select(sankeyContainer.value).selectAll("*").remove();

    const svg = d3.select(sankeyContainer.value).append("svg")
        .attr("width", width)
        .attr("height", height);

    const sankeyGenerator = sankey()
        .nodeId(d => d.id)
        .nodeWidth(16)
        .nodePadding(20)
        .nodeAlign(sankeyJustify)
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    const safeNodes = JSON.parse(JSON.stringify(data.nodes));
    const safeLinks = JSON.parse(JSON.stringify(data.links));

    const { nodes, links } = sankeyGenerator({
        nodes: safeNodes,
        links: safeLinks
    });

    const link = svg.append("g")
        .attr("fill", "none")
        .selectAll("g")
        .data(links)
        .enter().append("g");

    const path = link.append("path")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke", d => d3.color(COLORS[d.target.group]).copy({ opacity: 0.35 }))
        .attr("stroke-width", d => Math.max(1, d.width))
        .style("transition", "stroke-opacity 0.2s")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            if (tooltip.value.pinned) return;
            d3.select(this).attr("stroke-opacity", 0.8);
            showTooltip(event, `Flusso: ${d.source.name} → ${d.target.name}`, "Connessione logica e passaggio di peso tra entità.", "Flow", COLORS[d.target.group], d.value);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", function() {
            if (tooltip.value.pinned) return;
            d3.select(this).attr("stroke-opacity", 0.35);
            hideTooltip();
        })
        .on("click", function(event, d) {
            togglePinTooltip(event, `Flusso: ${d.source.name} → ${d.target.name}`, "Connessione logica e passaggio di peso tra entità.", "Flow", COLORS[d.target.group], d.value);
            event.stopPropagation();
        });

    const node = svg.append("g")
        .selectAll("rect")
        .data(nodes)
        .enter().append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => Math.max(2, d.y1 - d.y0))
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => COLORS[d.group])
        .attr("stroke", "#06090F")
        .attr("stroke-width", 1)
        .attr("rx", 2)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            if (tooltip.value.pinned) return;
            d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2);
            path.style("stroke-opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 0.8 : 0.1);
            showTooltip(event, d.name, d.desc, `Pilastro ${d.group}`, COLORS[d.group], d.value);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", function() {
            if (tooltip.value.pinned) return;
            d3.select(this).attr("stroke", "#06090F").attr("stroke-width", 1);
            path.style("stroke-opacity", 0.35);
            hideTooltip();
        })
        .on("click", function(event, d) {
            togglePinTooltip(event, d.name, d.desc, `Pilastro ${d.group}`, COLORS[d.group], d.value);
            event.stopPropagation();
        });

    svg.append("g")
        .style("font-family", "system-ui, sans-serif")
        .style("font-size", "11px")
        .style("fill", "#E5E7EB")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name)
        .style("pointer-events", "none")
        .style("text-shadow", "0px 2px 4px rgba(0,0,0,0.8)");
};

// ============================================================================
// 5. LOGICA INTERATTIVA TOOLTIP
// ============================================================================
const showTooltip = (event, title, desc, badge, color, value) => {
    tooltip.value = { ...tooltip.value, visible: true, x: event.pageX, y: event.pageY, title, desc, badge, color, value };
};

const moveTooltip = (event) => {
    if (tooltip.value.pinned) return;
    tooltip.value.x = event.pageX;
    tooltip.value.y = event.pageY;
};

const hideTooltip = () => {
    if (tooltip.value.pinned) return;
    tooltip.value.visible = false;
};

const togglePinTooltip = (event, title, desc, badge, color, value) => {
    if (tooltip.value.pinned && tooltip.value.title === title) {
        unpinTooltip();
    } else {
        tooltip.value = { visible: true, x: event.pageX, y: event.pageY, title, desc, badge, color, value, pinned: true };
    }
};

const unpinTooltip = () => {
    tooltip.value.pinned = false;
    tooltip.value.visible = false;
    d3.select(sankeyContainer.value).selectAll("path").style("stroke-opacity", 0.35);
    d3.select(sankeyContainer.value).selectAll("rect").attr("stroke", "#06090F").attr("stroke-width", 1);
};

onMounted(async () => {
    try {
        const { opportunities, matrixMap } = await fetchDatabaseData();
        loading.value = false;
        
        if (opportunities && opportunities.length > 0) {
            const sankeyData = buildSankeyData(opportunities, matrixMap);
            if (sankeyData.links.length > 0) {
                nextTick(() => initSankeyGraph(sankeyData));
            } else {
                error.value = "Documenti presenti nel DB, ma nessun flusso ha superato i filtri relazionali.";
            }
        } else if (!error.value) { 
            error.value = "Nessun documento utile trovato nel DB per generare i flussi.";
        }
    } catch (err) {
        loading.value = false;
        error.value = err.message || "Errore sconosciuto nel rendering del grafico.";
    }
});
</script>

<style scoped>
.sankey-dashboard {
    --bg-dark: #06090F; 
    --text-main: #F3F4F6; 
    --text-muted: #9CA3AF;
    width: 100%;
    height: calc(100vh - 64px);
    background-color: var(--bg-dark); color: var(--text-main);
    position: relative; overflow: hidden; font-family: system-ui, sans-serif;
}
.d3-container { width: 100%; height: 100%; }
.overlay-ui { position: absolute; top: 24px; left: 24px; pointer-events: none; z-index: 10; }
.overlay-ui h1 { margin: 0 0 4px 0; font-size: 1.75rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.overlay-ui p { margin: 0; font-family: monospace; font-size: 0.8rem; color: #10B981; text-transform: uppercase; }
.legend { position: absolute; bottom: 24px; left: 24px; background: rgba(11, 16, 26, 0.8); border: 1px solid #1F2937; padding: 16px; border-radius: 12px; display: flex; flex-direction: column; gap: 12px; pointer-events: none; z-index: 10; backdrop-filter: blur(4px); }
.legend-item { display: flex; align-items: center; gap: 10px; font-size: 0.75rem; color: var(--text-muted); }
.legend-color { width: 12px; height: 12px; border-radius: 2px; }
.doc-color { background-color: #38BDF8; box-shadow: 0 0 8px rgba(56, 189, 248, 0.4); }
.intent-color { background-color: #FBBF24; box-shadow: 0 0 8px rgba(251, 191, 36, 0.4); }
.model-color { background-color: #A78BFA; box-shadow: 0 0 8px rgba(167, 139, 250, 0.4); }
.stream-color { background-color: #10B981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
.loading-overlay, .error-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--text-muted); }
.error-overlay p { background: rgba(239, 68, 68, 0.1); border: 1px solid #EF4444; padding: 16px; border-radius: 8px; color: #FCA5A5; }
.spinner { width: 32px; height: 32px; animation: spin 1s linear infinite; color: #10B981; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.custom-tooltip { 
    position: fixed; 
    background: rgba(11, 16, 26, 0.95); 
    border: 1px solid #1F2937; 
    border-radius: 8px; 
    padding: 16px; 
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); 
    backdrop-filter: blur(8px); 
    z-index: 100; 
    width: 340px; 
    transform: translate(-50%, 15px); 
    pointer-events: none;
    transition: opacity 0.15s ease-in-out;
}
.custom-tooltip.is-pinned {
    border-color: #A78BFA; 
    box-shadow: 0 0 15px rgba(167, 139, 250, 0.25);
}
.tooltip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #1F2937; flex-wrap: wrap; }
.tooltip-badge { font-family: monospace; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase; color: #06090F; }
.pin-icon { font-size: 12px; margin-left: auto; }
.tooltip-title { margin: 0; font-size: 0.95rem; font-weight: 600; color: #F3F4F6; flex-basis: 100%; margin-top: 4px; }
.tooltip-desc { margin: 0 0 12px 0; font-size: 0.8rem; color: #D1D5DB; line-height: 1.5; white-space: normal; word-wrap: break-word; }
.tooltip-value { font-family: monospace; font-size: 0.8rem; color: #9CA3AF; background: #1F2937; padding: 6px; border-radius: 4px; text-align: center; }
</style>