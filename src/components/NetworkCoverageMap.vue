<template>
<AppNavbar />
    <div class="network-dashboard">
        <div class="overlay-ui">
            <h1>EDDPS Coverage Matrix</h1>
            <p>Documenti → Intenti Estratti → Business Models → Revenue Streams</p>
        </div>

        <div class="legend">
            <div class="legend-item"><div class="legend-color" style="background-color: var(--doc-color); box-shadow: 0 0 8px var(--doc-glow);"></div><span>Documenti Ingeriti</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: var(--intent-color); box-shadow: 0 0 8px var(--intent-glow);"></div><span>Intenti Analitici</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: var(--model-color); box-shadow: 0 0 8px var(--model-glow);"></div><span>Modelli di Business</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: var(--stream-active); box-shadow: 0 0 8px var(--stream-active-glow);"></div><span>Revenue Streams</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: var(--stream-latent);"></div><span>Nodi Latenti / Orfani</span></div>
        </div>

        <div 
            v-if="tooltip.visible" 
            class="custom-tooltip" 
            :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        >
            <div class="tooltip-header">
                <span class="tooltip-badge" :class="tooltip.badgeClass">{{ tooltip.badge }}</span>
                <h3 class="tooltip-title">{{ tooltip.title }}</h3>
            </div>
            <p class="tooltip-desc">{{ tooltip.desc }}</p>
        </div>

        <div v-if="loading" class="loading-overlay">
            <svg class="spinner" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Sincronizzazione Dati da MongoDB...</span>
        </div>
        
        <div v-if="error" class="error-overlay">
            <p>⚠️ {{ error }}</p>
        </div>

        <div ref="graphContainer" class="d3-container"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import apiClient from '@/services/axios.js'; // Stesso client usato dalla Dashboard
import AppNavbar from '@/components/eddpsNavBar.vue';
import * as d3 from 'd3';

const graphContainer = ref(null);
const loading = ref(true);
const error = ref(null);
let simulation = null;

const tooltip = ref({
    visible: false, x: 0, y: 0, title: '', desc: '', badge: '', badgeClass: ''
});

// ============================================================================
// 1. DATA FETCHING DIRETTAMENTE DA LARAVEL/MONGO
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
        console.error("[EDDPS Network] Errore API Axios:", err);
        let errorMsg = "Impossibile caricare i dati dal server.";
        
        if (err.response && err.response.status === 404) {
            errorMsg = "Errore 404: Rotta non trovata.";
        } else if (err.response && err.response.status === 500) {
            errorMsg = "Errore 500: Database MongoDB non raggiungibile.";
        }
        
        error.value = errorMsg;
        return { opportunities: [], matrixMap: { revenue_streams: [] } };
    }
};

// ============================================================================
// 2. PARSER BLINDATO A 4 PILASTRI
// ============================================================================
const buildNetworkData = (opportunities, matrixMap) => {
    const nodesMap = new Map();
    const linksMap = new Map();

    const addNode = (id, label, group, status, desc = "") => {
        const safeId = String(id).trim();
        if (!nodesMap.has(safeId)) {
            nodesMap.set(safeId, { id: safeId, label: label || "Sconosciuto", group, status, desc });
        } else {
            // Se esiste già latente e ora è attivo, lo aggiorniamo
            if (status === 'active') {
                nodesMap.get(safeId).status = 'active';
            }
        }
    };

    const addLink = (source, target, weight) => {
        const s = String(source).trim();
        const t = String(target).trim();
        if (s === t) return; 
        
        const linkId = `${s}___${t}`;
        if (!linksMap.has(linkId)) {
            linksMap.set(linkId, { source: s, target: t, weight: weight, status: 'active' });
        }
    };

    // A. Pilastro 4: Inizializza Revenue Streams (Latenti di base)
    matrixMap.revenue_streams.forEach(stream => {
        const streamId = `S_${stream.stream_id}`;
        addNode(streamId, stream.stream_name, 4, 'latent', stream.strategic_summary);

        // Pilastro 3 Base: Inizializza Modelli Mappati
        if (stream.mapped_models) {
            stream.mapped_models.forEach(model => {
                const modelId = `M_${model.categoria_codice}_${model.modello_codice}`;
                addNode(modelId, `[${model.categoria_codice}.${model.modello_codice}]`, 3, 'latent', 'Inattivo (Zero coverage)');
                
                // Creiamo un link latente tra Modello e Revenue
                const linkId = `${modelId}___${streamId}`;
                linksMap.set(linkId, { source: modelId, target: streamId, weight: 1, status: 'latent' });
            });
        }
    });

    // B. Processa i Documenti Reali e Attiva la catena
    opportunities.forEach((doc, dIdx) => {
        const docId = `D_${doc._id || dIdx}`;
        addNode(docId, doc.analyzed_document_title || `Documento ${dIdx+1}`, 1, 'active', doc.reasoning || "Doc Ingerito");

        if (doc.opportunity_intents && Array.isArray(doc.opportunity_intents)) {
            doc.opportunity_intents.forEach((intent, iIdx) => {
                if (!intent.intent) return;

                const intentId = `I_${docId}_${iIdx}`;
                const intentLabel = intent.intent.length > 40 ? intent.intent.substring(0, 40) + "..." : intent.intent;
                
                addNode(intentId, intentLabel, 2, 'active', intent.intent);
                addLink(docId, intentId, 2.5); // Link Doc -> Intent

                if (intent.associated_business_models && Array.isArray(intent.associated_business_models)) {
                    intent.associated_business_models.forEach(bm => {
                        const modelId = `M_${bm.categoria_codice}_${bm.modello_codice}`;
                        const modelLabel = `[${bm.categoria_codice}.${bm.modello_codice}] ${bm.modello_titolo}`;
                        
                        // Attiva il Modello
                        addNode(modelId, modelLabel, 3, 'active', `Attivato da Intento`);
                        nodesMap.get(modelId).label = modelLabel;
                        nodesMap.get(modelId).desc = `Attivato da: "${intentLabel}"`;
                        
                        addLink(intentId, modelId, 2.0); // Link Intent -> Model

                        // Attiva a cascata la Revenue Stream
                        const matchingStreams = matrixMap.revenue_streams.filter(stream => {
                            if (!stream.mapped_models) return false;
                            return stream.mapped_models.some(m => m.categoria_codice === bm.categoria_codice && m.modello_codice === bm.modello_codice);
                        });

                        matchingStreams.forEach(stream => {
                            const streamId = `S_${stream.stream_id}`;
                            addNode(streamId, stream.stream_name, 4, 'active', stream.strategic_summary);
                            nodesMap.get(streamId).status = 'active'; // Wake up stream
                            
                            // Wake up link
                            const linkId = `${modelId}___${streamId}`;
                            if (linksMap.has(linkId)) {
                                linksMap.get(linkId).status = 'active';
                                linksMap.get(linkId).weight = 2.0;
                            } else {
                                addLink(modelId, streamId, 2.0);
                            }
                        });
                    });
                }
            });
        }
    });

    return { nodes: Array.from(nodesMap.values()), links: Array.from(linksMap.values()) };
};

// ============================================================================
// 3. MOTORE GRAFICO D3.JS
// ============================================================================
const initD3Graph = (data) => {
    if (!graphContainer.value || data.nodes.length === 0) return;

    const width = graphContainer.value.clientWidth;
    const height = graphContainer.value.clientHeight;

    d3.select(graphContainer.value).selectAll("*").remove();

    const svg = d3.select(graphContainer.value).append("svg").attr("width", width).attr("height", height);
    const g = svg.append("g");
    
    svg.call(d3.zoom().scaleExtent([0.3, 3]).on("zoom", (event) => g.attr("transform", event.transform)));

    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const getRadius = (d) => {
        if (d.group === 1) return 22; // Doc
        if (d.group === 2) return 16; // Intent
        if (d.group === 3) return 12; // Model
        return 18;                    // Stream
    };

    const getColor = (d) => {
        if (d.status === 'latent') return 'var(--stream-latent)';
        if (d.group === 1) return 'var(--doc-color)';
        if (d.group === 2) return 'var(--intent-color)';
        if (d.group === 3) return 'var(--model-color)';
        return 'var(--stream-active)';
    };

    // CLONE PROFONDO per evitare conflitti coi Proxy di Vue
    const safeNodes = JSON.parse(JSON.stringify(data.nodes));
    const safeLinks = JSON.parse(JSON.stringify(data.links));

    const linkedByIndex = {};
    safeLinks.forEach(d => {
        linkedByIndex[`${d.source},${d.target}`] = 1;
        linkedByIndex[`${d.target},${d.source}`] = 1;
    });
    const isConnected = (a, b) => linkedByIndex[`${a.id},${b.id}`] || a.id === b.id;

    simulation = d3.forceSimulation(safeNodes)
        .force("link", d3.forceLink(safeLinks).id(d => d.id).distance(d => d.status === 'latent' ? 70 : 120))
        .force("charge", d3.forceManyBody().strength(-350))
        .force("collide", d3.forceCollide().radius(d => getRadius(d) + 20).iterations(2))
        .force("x", d3.forceX(d => {
            if (d.group === 1) return width * 0.10; // Colonna 1: Documenti
            if (d.group === 2) return width * 0.36; // Colonna 2: Intenti
            if (d.group === 3) return width * 0.63; // Colonna 3: Modelli
            if (d.group === 4) return width * 0.90; // Colonna 4: Revenue
            return width / 2;
        }).strength(1.2))
        .force("y", d3.forceY(height / 2).strength(0.08));

    const link = g.append("g").attr("class", "links").selectAll("line").data(safeLinks)
        .enter().append("line")
        .attr("stroke", d => d.status === 'active' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(55, 65, 81, 0.2)')
        .attr("stroke-width", d => d.status === 'active' ? d.weight : 1);

    const node = g.append("g").attr("class", "nodes").selectAll("g").data(safeNodes)
        .enter().append("g")
        .call(d3.drag()
            .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append("circle")
        .attr("r", d => getRadius(d))
        .attr("fill", d => getColor(d))
        .style("filter", d => d.status === 'active' ? "url(#glow)" : "none")
        .attr("stroke", "#06090F").attr("stroke-width", "2px")
        .on("mouseover", function() { d3.select(this).attr("stroke", "#fff").attr("stroke-width", "3px").style("cursor", "pointer"); })
        .on("mouseout", function() { d3.select(this).attr("stroke", "#06090F").attr("stroke-width", "2px"); });

    node.append("text")
        .attr("dx", d => getRadius(d) + 8)
        .attr("dy", 4)
        .text(d => d.label)
        .style("fill", d => d.status === 'active' ? "#F3F4F6" : "#6B7280")
        .style("font-weight", d => d.group === 1 ? "bold" : "normal")
        .style("font-size", "11px")
        .style("font-family", "system-ui, sans-serif")
        .style("text-shadow", "0 2px 4px #000").style("pointer-events", "none");

    node.on("mouseover", function(event, d) {
        link.style("stroke-opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.05);
        node.style("opacity", n => isConnected(d, n) ? 1 : 0.2);

        let bClass = '', bText = '';
        if (d.group === 1) { bClass = 'badge-doc'; bText = 'Source Doc'; }
        else if (d.group === 2) { bClass = 'badge-intent'; bText = 'Intent'; }
        else if (d.group === 3) { bClass = 'badge-model'; bText = 'Business Model'; }
        else if (d.group === 4) { bClass = d.status === 'active' ? 'badge-stream' : 'badge-stream-latent'; bText = d.status === 'active' ? 'Stream (Attivo)' : 'Stream (Latente)'; }

        tooltip.value = { visible: true, x: event.pageX, y: event.pageY, title: d.label, desc: d.desc, badge: bText, badgeClass: bClass };
    })
    .on("mousemove", (event) => { tooltip.value.x = event.pageX; tooltip.value.y = event.pageY; })
    .on("mouseout", () => {
        link.style("stroke-opacity", d => d.status === 'active' ? 0.6 : 0.4);
        node.style("opacity", 1);
        tooltip.value.visible = false;
    });

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
};

onMounted(async () => {
    try {
        const data = await fetchDatabaseData();
        loading.value = false;

        if (data.opportunities.length > 0) {
            const graphData = buildNetworkData(data.opportunities, data.matrixMap);
            nextTick(() => initD3Graph(graphData));
        } else {
            error.value = "Nessun documento utile trovato nel DB per generare la mappa.";
        }
    } catch (err) {
        loading.value = false;
        error.value = err.message || "Impossibile recuperare i dati dal server.";
    }
});

onBeforeUnmount(() => { if (simulation) simulation.stop(); });
</script>

<style scoped>
.network-dashboard {
    --bg-dark: #06090F; --text-main: #F3F4F6; --text-muted: #9CA3AF;
    --doc-color: #38BDF8; --doc-glow: rgba(56, 189, 248, 0.6);
    --intent-color: #FBBF24; --intent-glow: rgba(251, 191, 36, 0.6);
    --model-color: #A78BFA; --model-glow: rgba(167, 139, 250, 0.5);
    --stream-active: #10B981; --stream-active-glow: rgba(16, 185, 129, 0.6);
    --stream-latent: #374151;
    
    width: 100%;
    height: calc(100vh - 64px);
    background-color: var(--bg-dark); color: var(--text-main);
    position: relative; overflow: hidden; font-family: system-ui, sans-serif;
}
.d3-container { width: 100%; height: 100%; }
.overlay-ui { position: absolute; top: 24px; left: 24px; pointer-events: none; z-index: 10; }
.overlay-ui h1 { margin: 0 0 4px 0; font-size: 1.75rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
.overlay-ui p { margin: 0; font-family: monospace; font-size: 0.8rem; color: var(--stream-active); text-transform: uppercase; }
.legend { position: absolute; bottom: 24px; left: 24px; background: rgba(11, 16, 26, 0.8); border: 1px solid #1F2937; padding: 16px; border-radius: 12px; display: flex; flex-direction: column; gap: 12px; pointer-events: none; z-index: 10; backdrop-filter: blur(4px); }
.legend-item { display: flex; align-items: center; gap: 10px; font-size: 0.75rem; color: var(--text-muted); }
.legend-color { width: 12px; height: 12px; border-radius: 50%; }
.loading-overlay, .error-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--text-muted); }
.error-overlay p { background: rgba(239, 68, 68, 0.1); border: 1px solid #EF4444; padding: 16px; border-radius: 8px; color: #FCA5A5; }
.spinner { width: 32px; height: 32px; animation: spin 1s linear infinite; color: var(--stream-active); }
@keyframes spin { 100% { transform: rotate(360deg); } }

.custom-tooltip { position: fixed; background: rgba(11, 16, 26, 0.95); border: 1px solid #1F2937; border-radius: 8px; padding: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px); z-index: 100; width: 320px; transform: translate(-50%, 15px); pointer-events: none; }
.tooltip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #1F2937; }
.tooltip-badge { font-family: monospace; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
.badge-doc { background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3); }
.badge-intent { background: rgba(251, 191, 36, 0.15); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.3); }
.badge-model { background: rgba(167, 139, 250, 0.15); color: #A78BFA; border: 1px solid rgba(167, 139, 250, 0.3); }
.badge-stream { background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-stream-latent { background: rgba(156, 163, 175, 0.15); color: #9CA3AF; border: 1px solid rgba(156, 163, 175, 0.3); }
.tooltip-title { margin: 0; font-size: 0.95rem; font-weight: 600; color: #F3F4F6; }
.tooltip-desc { margin: 0; font-size: 0.8rem; color: #D1D5DB; line-height: 1.5; }
</style>