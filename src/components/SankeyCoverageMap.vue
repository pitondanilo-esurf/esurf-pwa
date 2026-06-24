<template>
    <div class="sankey-dashboard">
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
            :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
        >
            <div class="tooltip-header">
                <span class="tooltip-badge" :style="{ backgroundColor: tooltip.color }">{{ tooltip.badge }}</span>
                <h3 class="tooltip-title">{{ tooltip.title }}</h3>
            </div>
            <p class="tooltip-desc">{{ tooltip.desc }}</p>
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
import * as d3 from 'd3';
// FIX: importiamo esplicitamente sankeyJustify da d3-sankey
import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey'; 

const sankeyContainer = ref(null);
const loading = ref(true);
const error = ref(null);

const tooltip = ref({
    visible: false, x: 0, y: 0, title: '', desc: '', badge: '', color: '', value: 0
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
// 2. PARSER BLINDATO CON FILTRO ESTREMO 
// ============================================================================
const buildSankeyData = (opportunities, matrixMap) => {
    const nodesMap = new Map();
    const linksMap = new Map();

    const addNode = (id, name, group, desc = "") => {
        const safeId = String(id).trim();
        if (!nodesMap.has(safeId)) {
            nodesMap.set(safeId, { id: safeId, name: name || "Sconosciuto", group, desc });
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
        addNode(docId, doc.analyzed_document_title || `Documento ${dIdx+1}`, 1, doc.reasoning || "Doc Ingerito");

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
                        const modelId = `M_${bm.categoria_codice}_${bm.modello_codice}`;
                        const modelLabel = `[${bm.categoria_codice}.${bm.modello_codice}] ${bm.modello_titolo || 'N/A'}`;
                        
                        addNode(modelId, modelLabel, 3, "Modello Attivato");
                        const bmFlowValue = flowValue / (bmCount || 1);
                        addLink(intentId, modelId, bmFlowValue);

                        const matchingStreams = (matrixMap.revenue_streams || []).filter(stream => {
                            if (!stream.mapped_models) return false;
                            return stream.mapped_models.some(m => m.categoria_codice === bm.categoria_codice && m.modello_codice === bm.modello_codice);
                        });

                        if (matchingStreams.length > 0) {
                            const streamFlowValue = bmFlowValue / matchingStreams.length;
                            matchingStreams.forEach(stream => {
                                const streamId = `S_${stream.stream_id}`;
                                addNode(streamId, stream.stream_name, 4, stream.strategic_summary || "Flusso Monetario Generato");
                                addLink(modelId, streamId, streamFlowValue);
                            });
                        }
                    });
                }
            });
        }
    });

    // --- FILTRO SALVAVITA (Garantisce che non ci siano nodi/link corrotti passati a D3) ---
    const rawLinks = Array.from(linksMap.values());
    
    // 1. Tieni solo i link dove source e target esistono effettivamente nei nodi
    const validLinks = rawLinks.filter(l => nodesMap.has(l.source) && nodesMap.has(l.target) && l.value > 0);
    
    // 2. Raccogli gli ID dei nodi che sono coinvolti attivamente in un link valido
    const activeNodeIds = new Set();
    validLinks.forEach(l => {
        activeNodeIds.add(l.source);
        activeNodeIds.add(l.target);
    });
    
    // 3. Tieni SOLO i nodi coinvolti (elimina nodi fluttuanti)
    const validNodes = Array.from(nodesMap.values()).filter(n => activeNodeIds.has(n.id));

    return { nodes: validNodes, links: validLinks };
};

// ============================================================================
// 3. MOTORE GRAFICO D3 SANKEY
// ============================================================================
const initSankeyGraph = (data) => {
    if (!sankeyContainer.value || data.nodes.length === 0 || data.links.length === 0) return;

    // Aggiunto fallback per sicurezza sulle misure
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
        .nodeAlign(sankeyJustify) // FIX PRINCIPALE: rimosso il prefisso 'd3.'
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    // CLONE PROFONDO: Evita i crash distruggendo i proxy reattivi di Vue
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
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke-opacity", 0.8);
            showTooltip(event, `Flusso: ${d.source.name} → ${d.target.name}`, "", "Flow", COLORS[d.target.group], d.value);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", function() {
            d3.select(this).attr("stroke-opacity", 0.35);
            hideTooltip();
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
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2);
            path.style("stroke-opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 0.8 : 0.1);
            showTooltip(event, d.name, d.desc, `Pilastro ${d.group}`, COLORS[d.group], d.value);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", function() {
            d3.select(this).attr("stroke", "#06090F").attr("stroke-width", 1);
            path.style("stroke-opacity", 0.35);
            hideTooltip();
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

const showTooltip = (event, title, desc, badge, color, value) => {
    tooltip.value = { visible: true, x: event.pageX, y: event.pageY, title, desc, badge, color, value };
};
const moveTooltip = (event) => {
    tooltip.value.x = event.pageX;
    tooltip.value.y = event.pageY;
};
const hideTooltip = () => {
    tooltip.value.visible = false;
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
                error.value = "Documenti presenti nel DB, ma nessun Intent o Business Model ha superato il filtro per il flusso.";
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
    width: 100%; height: 100vh; background-color: var(--bg-dark); color: var(--text-main);
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
.custom-tooltip { position: fixed; background: rgba(11, 16, 26, 0.95); border: 1px solid #1F2937; border-radius: 8px; padding: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); backdrop-filter: blur(8px); z-index: 100; width: 320px; transform: translate(-50%, 15px); pointer-events: none; }
.tooltip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #1F2937; }
.tooltip-badge { font-family: monospace; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase; color: #06090F; }
.tooltip-title { margin: 0; font-size: 0.95rem; font-weight: 600; color: #F3F4F6; }
.tooltip-desc { margin: 0 0 8px 0; font-size: 0.8rem; color: #D1D5DB; line-height: 1.5; }
.tooltip-value { font-family: monospace; font-size: 0.8rem; color: #9CA3AF; background: #1F2937; padding: 6px; border-radius: 4px; text-align: center; }
</style>