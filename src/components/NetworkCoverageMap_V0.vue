<template>
    <div class="network-dashboard">
        <!-- Overlay UI (Intestazione) -->
        <div class="overlay-ui">
            <h1>EDDPS Coverage Matrix</h1>
            <p>Documenti → Revenue Streams → Business Models</p>
        </div>

        <!-- Legenda -->
        <div class="legend">
            <div class="legend-item"><div class="legend-color" style="background-color: var(--doc-color); box-shadow: 0 0 8px var(--doc-glow);"></div><span>Documenti Ingeriti (Source)</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: var(--stream-active); box-shadow: 0 0 8px var(--stream-active-glow);"></div><span>Revenue Streams (Attivi)</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: var(--model-color);"></div><span>Modelli di Business (Regole)</span></div>
            <div class="legend-item"><div class="legend-color" style="background-color: var(--stream-latent);"></div><span>Nodi Latenti / Inattivi</span></div>
        </div>

        <!-- Tooltip Gestito da Vue (Più sicuro e performante rispetto alla manipolazione diretta del DOM di D3) -->
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

        <!-- Contenitore D3 -->
        <div v-if="loading" class="loading-overlay">
            <svg class="spinner" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Generazione Mappa Relazionale...</span>
        </div>
        <div ref="graphContainer" class="d3-container"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as d3 from 'd3';

// Variabili di stato
const graphContainer = ref(null);
const loading = ref(true);
let simulation = null; // Riferimento al motore fisico D3

// Stato reattivo per il Tooltip
const tooltip = ref({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    desc: '',
    badge: '',
    badgeClass: ''
});

// ============================================================================
// 1. DATA FETCHING (Simulazione chiamate al backend API verso MongoDB)
// ============================================================================
const fetchDatabaseData = async () => {
    // In produzione queste sarebbero chamate axios: 
    // const opps = await apiClient.get('/api/opportunities');
    // const matrix = await apiClient.get('/api/revenues_models_map');
    
    // Per garantire che il componente funzioni subito, mockiamo i dati che hai caricato
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                opportunities: [
                    {
                        _id: "doc_1",
                        analyzed_document_title: "Nota Call lunedì 15/06/2026 Uyolo",
                        reasoning: "Il documento identifica una chiara opportunità di orchestrazione dati legata all'estrazione di valore dai flussi quarto-orari di eSurf per alimentare modelli automatizzati di sostenibilità.",
                        opportunity_intents: [
                            {
                                intent: "Automazione reportistica LCA e Carbon Footprint",
                                weight: 1.0,
                                associated_business_models: [
                                    { categoria_codice: 4, modello_codice: 1, modello_titolo: "Generazione Automatica Report LCA" },
                                    { categoria_codice: 4, modello_codice: 2, modello_titolo: "Calcolo Carbon Footprint (Scope 1)" },
                                    { categoria_codice: 4, modello_codice: 3, modello_titolo: "Calcolo Carbon Footprint (Scope 2)" }
                                ]
                            },
                            {
                                intent: "Mappatura consumi storici Albania",
                                weight: 0.85,
                                associated_business_models: [
                                    { categoria_codice: 5, modello_codice: 5, modello_titolo: "Modello Filiera Internazionale" },
                                    { categoria_codice: 4, modello_codice: 5, modello_titolo: "Certificazione e Vendita Carbon Credit" }
                                ]
                            }
                        ]
                    },
                    {
                        _id: "doc_2",
                        analyzed_document_title: "Workshop - Highlights Bologna",
                        reasoning: "Necessità di infrastruttura iDaaS agnostica per centralizzare telemetria e clearing.",
                        opportunity_intents: [
                            {
                                intent: "Modulo Shadow Billing e GSE-Clearing",
                                weight: 1.0,
                                associated_business_models: [
                                    { categoria_codice: 4, modello_codice: 6, modello_titolo: "Shadow Billing (Fatturazione Ombra)" },
                                    { categoria_codice: 4, modello_codice: 7, modello_titolo: "Clearing Finanziario Real-Time" }
                                ]
                            },
                            {
                                intent: "Architettura SaaS Meta-CER",
                                weight: 0.95,
                                associated_business_models: [
                                    { categoria_codice: 1, modello_codice: 14, modello_titolo: "Meta-CER" },
                                    { categoria_codice: 4, modello_codice: 8, modello_titolo: "Onboarding POD Automatizzato" }
                                ]
                            },
                            {
                                intent: "Modulo Predittivo BESS",
                                weight: 0.85,
                                associated_business_models: [
                                    { categoria_codice: 1, modello_codice: 2, modello_titolo: "Autoconsumatore Singolo con Accumulo" },
                                    { categoria_codice: 2, modello_codice: 8, modello_titolo: "Servizi di Flessibilità (Demand Response)" }
                                ]
                            }
                        ]
                    }
                ],
                matrixMap: {
                    revenue_streams: [
                        {
                            stream_id: 1, stream_name: "1. Fee Onboarding / Wholesale", strategic_summary: "Interfacciamento massivo dei flussi storici.",
                            mapped_models: [ { categoria_codice: 1, modello_codice: 13 }, { categoria_codice: 4, modello_codice: 8 }, { categoria_codice: 4, modello_codice: 14 } ]
                        },
                        {
                            stream_id: 3, stream_name: "3. Demand Response", strategic_summary: "Integrazione intelligenza algoritmica con BSP.",
                            mapped_models: [ { categoria_codice: 1, modello_codice: 2 }, { categoria_codice: 2, modello_codice: 8 }, { categoria_codice: 2, modello_codice: 9 }, { categoria_codice: 5, modello_codice: 9 } ]
                        },
                        {
                            stream_id: 4, stream_name: "4. Gestione CER e 'Orfani'", strategic_summary: "Canoni SaaS infrastruttura Meta-CER e Shadow Billing.",
                            mapped_models: [ { categoria_codice: 1, modello_codice: 7 }, { categoria_codice: 1, modello_codice: 14 }, { categoria_codice: 4, modello_codice: 6 }, { categoria_codice: 4, modello_codice: 7 }, { categoria_codice: 5, modello_codice: 4 } ]
                        },
                        {
                            stream_id: 6, stream_name: "6. Compliance ESG", strategic_summary: "Reportistica sostenibilità tramite Agenti AI.",
                            mapped_models: [ { categoria_codice: 4, modello_codice: 1 }, { categoria_codice: 4, modello_codice: 2 }, { categoria_codice: 4, modello_codice: 3 }, { categoria_codice: 4, modello_codice: 5 }, { categoria_codice: 5, modello_codice: 5 } ]
                        },
                        {
                            stream_id: 9, stream_name: "9. Fintech Oracle API", strategic_summary: "API computazionali per polizze parametriche e credito.",
                            mapped_models: [ { categoria_codice: 3, modello_codice: 10 }, { categoria_codice: 3, modello_codice: 11 }, { categoria_codice: 5, modello_codice: 6 } ]
                        }
                    ]
                }
            });
        }, 800); // Finta latenza di rete
    });
};

// ============================================================================
// 2. IL MAPPER: Da Mongo Collections a Formato D3 (Nodi e Archi)
// ============================================================================
const buildNetworkData = (opportunities, matrixMap) => {
    const nodes = [];
    const links = [];
    const streamMap = {};
    const modelMap = {};
    const docMap = {};

    // A. Inizializza tutti i Revenue Streams (Group 2) come "Latenti"
    matrixMap.revenue_streams.forEach(stream => {
        const streamId = `S${stream.stream_id}`;
        streamMap[streamId] = { 
            id: streamId, 
            label: stream.stream_name, 
            group: 2, 
            status: 'latent', 
            desc: stream.strategic_summary 
        };
        nodes.push(streamMap[streamId]);

        // B. Inizializza i Modelli (Group 3) collegati allo stream
        if (stream.mapped_models) {
            stream.mapped_models.forEach(model => {
                const modelId = `M${model.categoria_codice}.${model.modello_codice}`;
                if (!modelMap[modelId]) {
                    modelMap[modelId] = { 
                        id: modelId, 
                        label: `[${model.categoria_codice}.${model.modello_codice}]`, 
                        group: 3, 
                        status: 'latent', 
                        desc: 'Modello mappato, ma attualmente inattivo (Zero coverage).' 
                    };
                    nodes.push(modelMap[modelId]);
                }
                // Crea l'arco Strutturale (Stream -> Modello)
                links.push({ source: streamId, target: modelId, weight: 0.5, status: 'latent' });
            });
        }
    });

    // C. Processa i Documenti (Opportunities) e "Accendi" Nodi e Archi
    opportunities.forEach((doc, index) => {
        const docId = `doc_${index}`;
        const docNode = { 
            id: docId, 
            label: doc.analyzed_document_title || `Doc ${index+1}`, 
            group: 1, 
            status: 'active', 
            desc: doc.reasoning 
        };
        nodes.push(docNode);
        
        const activatedStreamsForDoc = {}; // Per non duplicare le connessioni Doc->Stream

        if (doc.opportunity_intents) {
            doc.opportunity_intents.forEach(intent => {
                if (intent.associated_business_models) {
                    intent.associated_business_models.forEach(bm => {
                        const modelId = `M${bm.categoria_codice}.${bm.modello_codice}`;
                        
                        // 1. Accendi il Modello
                        if (modelMap[modelId]) {
                            modelMap[modelId].status = 'active';
                            modelMap[modelId].label = `[${bm.categoria_codice}.${bm.modello_codice}] ${bm.modello_titolo}`;
                            modelMap[modelId].desc = `Attivato da: "${intent.intent}" (Weight: ${intent.weight})`;
                            
                            // 2. Trova a quale Stream appartiene e Accendilo
                            const parentStream = matrixMap.revenue_streams.find(s => 
                                s.mapped_models && s.mapped_models.some(m => m.categoria_codice === bm.categoria_codice && m.modello_codice === bm.modello_codice)
                            );
                            
                            if (parentStream) {
                                const streamId = `S${parentStream.stream_id}`;
                                streamMap[streamId].status = 'active';
                                
                                // Accendi l'arco Stream -> Modello
                                const smLink = links.find(l => l.source === streamId && l.target === modelId);
                                if (smLink) {
                                    smLink.status = 'active';
                                    smLink.weight = 1.5;
                                }

                                // 3. Registra la connessione Doc -> Stream
                                if (!activatedStreamsForDoc[streamId]) {
                                    activatedStreamsForDoc[streamId] = { weight: intent.weight || 1 };
                                } else {
                                    // Tieni il peso massimo se più intenti attivano lo stesso stream
                                    activatedStreamsForDoc[streamId].weight = Math.max(activatedStreamsForDoc[streamId].weight, intent.weight || 1);
                                }
                            }
                        }
                    });
                }
            });
        }

        // 4. Crea gli Archi Dinamici (Documento -> Stream)
        Object.keys(activatedStreamsForDoc).forEach(streamId => {
            links.push({
                source: docId,
                target: streamId,
                weight: activatedStreamsForDoc[streamId].weight * 2.5, // Amplifica per visualizzazione
                status: 'active'
            });
        });
    });

    return { nodes, links };
};

// ============================================================================
// 3. INIZIALIZZAZIONE D3.JS
// ============================================================================
const initD3Graph = (data) => {
    if (!graphContainer.value) return;

    const width = graphContainer.value.clientWidth;
    const height = graphContainer.value.clientHeight;

    // Pulizia precedente
    d3.select(graphContainer.value).selectAll("*").remove();

    const svg = d3.select(graphContainer.value)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Supporto Zoom e Pan
    const g = svg.append("g");
    svg.call(d3.zoom().scaleExtent([0.3, 3]).on("zoom", (event) => {
        g.attr("transform", event.transform);
    }));

    // Filtri Glow SVG
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // =========================================================
    // FIX: SPOSTATE LE FUNZIONI HELPER IN ALTO
    // =========================================================
    const getRadius = (d) => d.group === 1 ? 26 : (d.group === 2 ? 18 : 10);
    
    const getColor = (d) => {
        if (d.status === 'latent') return 'var(--stream-latent)';
        return d.group === 1 ? 'var(--doc-color)' : (d.group === 2 ? 'var(--stream-active)' : 'var(--model-color)');
    };

    const linkedByIndex = {};
    data.links.forEach(d => {
        linkedByIndex[`${d.source.id},${d.target.id}`] = 1;
        linkedByIndex[`${d.target.id},${d.source.id}`] = 1;
    });
    
    const isConnected = (a, b) => linkedByIndex[`${a.id},${b.id}`] || a.id === b.id;

    // Motore Fisico
    simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(d => d.status === 'latent' ? 70 : 130))
        .force("charge", d3.forceManyBody().strength(-350))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => getRadius(d) + 20).iterations(2));

    // Archi (Links)
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("stroke", d => d.status === 'active' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(55, 65, 81, 0.4)')
        .attr("stroke-width", d => d.status === 'active' ? d.weight : 1);

    // Nodi
    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(data.nodes)
        .enter().append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("r", d => getRadius(d))
        .attr("fill", d => getColor(d))
        .style("filter", d => d.status === 'active' ? "url(#glow)" : "none")
        .attr("stroke", "#06090F")
        .attr("stroke-width", "2px")
        .style("transition", "stroke-width 0.2s")
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
        .style("text-shadow", "0 2px 4px #000")
        .style("pointer-events", "none");

    // Interazioni Hover collegate allo state Vue (Tooltip)
    node.on("mouseover", function(event, d) {
        link.style("stroke-opacity", l => (l.source === d || l.target === d) ? 1 : 0.05);
        node.style("opacity", n => isConnected(d, n) ? 1 : 0.2);

        // Identifica tipologia
        let bClass = 'badge-model', bText = 'Business Model';
        if (d.group === 1) { bClass = 'badge-doc'; bText = 'Source Doc'; }
        else if (d.group === 2) { 
            bClass = d.status === 'active' ? 'badge-stream' : 'badge-stream-latent'; 
            bText = d.status === 'active' ? 'Stream (Attivo)' : 'Stream (Latente)'; 
        }

        tooltip.value = {
            visible: true,
            x: event.pageX,
            y: event.pageY,
            title: d.label,
            desc: d.desc,
            badge: bText,
            badgeClass: bClass
        };
    })
    .on("mousemove", function(event) {
        tooltip.value.x = event.pageX;
        tooltip.value.y = event.pageY;
    })
    .on("mouseout", function() {
        link.style("stroke-opacity", d => d.status === 'active' ? 0.6 : 0.4);
        node.style("opacity", 1);
        tooltip.value.visible = false;
    });

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x; d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
    }

    // Gestione ridimensionamento
    window.addEventListener('resize', handleResize);
};

const handleResize = () => {
    if (graphContainer.value && simulation) {
        const w = graphContainer.value.clientWidth;
        const h = graphContainer.value.clientHeight;
        d3.select(graphContainer.value).select("svg").attr("width", w).attr("height", h);
        simulation.force("center", d3.forceCenter(w / 2, h / 2));
        simulation.alpha(0.3).restart();
    }
};

onMounted(async () => {
    // 1. Fetch Dati (simulato)
    const { opportunities, matrixMap } = await fetchDatabaseData();
    
    // 2. Costruzione della Mappa D3
    const graphData = buildNetworkData(opportunities, matrixMap);
    
    loading.value = false;

    // 3. Render
    nextTick(() => {
        initD3Graph(graphData);
    });
});

onBeforeUnmount(() => {
    if (simulation) simulation.stop();
    window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* ==========================================================================
   CSS SPECIFICO PER NETWORK DASHBOARD
   ========================================================================== */
.network-dashboard {
    --bg-dark: #06090F;
    --text-main: #F3F4F6;
    --text-muted: #9CA3AF;
    --doc-color: #E0F2FE;
    --doc-glow: rgba(224, 242, 254, 0.6);
    --stream-active: #10B981;
    --stream-active-glow: rgba(16, 185, 129, 0.6);
    --stream-latent: #374151;
    --model-color: #8B5CF6;
    --model-glow: rgba(139, 92, 246, 0.5);
    
    width: 100%;
    height: 100vh;
    background-color: var(--bg-dark);
    color: var(--text-main);
    position: relative;
    overflow: hidden;
    font-family: system-ui, -apple-system, sans-serif;
}

.d3-container {
    width: 100%;
    height: 100%;
}

.overlay-ui {
    position: absolute;
    top: 24px;
    left: 24px;
    pointer-events: none;
    z-index: 10;
}

.overlay-ui h1 {
    margin: 0 0 4px 0;
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.overlay-ui p {
    margin: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.8rem;
    color: var(--stream-active);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.legend {
    position: absolute;
    bottom: 24px;
    left: 24px;
    background-color: rgba(11, 16, 26, 0.8);
    border: 1px solid #1F2937;
    padding: 16px;
    border-radius: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.75rem;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
    z-index: 10;
    backdrop-filter: blur(4px);
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.loading-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--text-muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.spinner {
    width: 32px;
    height: 32px;
    animation: spin 1s linear infinite;
    color: var(--stream-active);
}

@keyframes spin { 100% { transform: rotate(360deg); } }

/* ==========================================================================
   TOOLTIP CUSTOM VUE
   ========================================================================== */
.custom-tooltip {
    position: fixed;
    background-color: rgba(11, 16, 26, 0.95);
    border: 1px solid #1F2937;
    border-radius: 8px;
    padding: 16px;
    pointer-events: none;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.1);
    backdrop-filter: blur(8px);
    z-index: 100;
    width: 320px;
    transform: translate(-50%, 15px);
}

.tooltip-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #1F2937;
}

.tooltip-badge {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.65rem;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.badge-doc { background-color: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3); }
.badge-stream { background-color: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge-stream-latent { background-color: rgba(156, 163, 175, 0.15); color: #9CA3AF; border: 1px solid rgba(156, 163, 175, 0.3); }
.badge-model { background-color: rgba(139, 92, 246, 0.15); color: #A78BFA; border: 1px solid rgba(139, 92, 246, 0.3); }

.tooltip-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #F3F4F6;
}

.tooltip-desc {
    margin: 0;
    font-size: 0.8rem;
    color: #D1D5DB;
    line-height: 1.5;
}
</style>