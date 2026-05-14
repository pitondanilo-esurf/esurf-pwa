import * as pdfjsLib from 'pdfjs-dist';

// Configurazione Worker (essenziale per le prestazioni)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Valida se un PDF è una bolletta e se appartiene all'utente.
 * La funzione accetterà il file e un oggetto con i dati dell'utente (userCf, userPiva) per il confronto.
 * @param {File} file - Il file da analizzare
 * @param {Object} userData - Oggetto contenente { cf: '...', piva: '...' }
 * @returns {Promise<{valid: boolean, error: string|null, foundValue?: string}>}
 */
export const validaBollettaPreUpload = async (file, userData = { cf: '', piva: '' }) => {
    // Se è un'immagine, per ora bypassiamo (l'AI farà il resto)
    if (file.type !== 'application/pdf') return { valid: true, error: null };

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const primaPagina = await pdf.getPage(1);
        const textContent = await primaPagina.getTextContent();
        
        // Estrazione e normalizzazione testo
        const testoEstratto = textContent.items
            .map(item => item.str)
            .join(' ')
            .toUpperCase()
            .replace(/\s\s+/g, ' ');

        // 1. Check Keywords
        const keywords = ['BOLLETTA', 'FATTURA', 'POD', 'PDR', 'FORNITURA', 'ENERGIA', 'GAS', 'ACQUA'];
        const matchesKeywords = keywords.filter(kw => testoEstratto.includes(kw));
        
        if (matchesKeywords.length < 2) {
            return { valid: false, error: "Il documento non sembra essere una bolletta valida." };
        }

        // 2. Estrazione ID (CF e PIVA) tramite Regex dai pattern analizzati nei tuoi PDF
        const cfRegex = /[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]/g;
        const pivaRegex = /\b\d{11}\b/g;

        const idsNelPdf = [
            ...(testoEstratto.match(cfRegex) || []),
            ...(testoEstratto.match(pivaRegex) || [])
        ];

        // 3. Confronto Cross-Check con dati utente
        const identitaUtente = [
            userData.cf?.toUpperCase().replace(/\s/g, ''),
            userData.piva?.replace(/\s/g, '')
        ].filter(id => id && id !== '');

        if (identitaUtente.length > 0 && idsNelPdf.length > 0) {
            const matchTrovato = idsNelPdf.some(id => identitaUtente.includes(id));
            
            if (!matchTrovato) {
                // Rimuoviamo eventuali duplicati estratti e li uniamo in una stringa
                const foundValuesStr = [...new Set(idsNelPdf)].join(', ');

                return { 
                    valid: false, 
                    error: "Attenzione: Il Codice Fiscale o la P.IVA in questa bolletta non corrispondono ai dati del tuo profilo.",
                    foundValue: foundValuesStr // <-- PASSATO A VUE PER IL MESSAGGIO DINAMICO
                };
            }
        }
        
        return { valid: true, error: null };
        
    } catch (error) {
        console.error("Errore validazione esterna PDF:", error);
        return { valid: false, error: "Errore tecnico durante la lettura del documento." };
    }
};