// File: src/utils/analysisExtractor.js

export function extractAnalysisData(resources, savedAddressId = null) {
  if (!resources || !Array.isArray(resources)) return null;

  const groups = {};
  
  // 1. Raggruppamento
  resources.forEach(r => {
      let aiData = {};
      try { aiData = typeof r.ai_analysis === 'string' ? JSON.parse(r.ai_analysis) : (r.ai_analysis || {}); } catch(e) {}
      const aiAddr = aiData?.indirizzo || {};
      
      const via = aiAddr.Via ? String(aiAddr.Via).trim() : (r.address ? String(r.address).trim() : '');
      const civico = aiAddr.NumeroCivico ? String(aiAddr.NumeroCivico).trim() : '';
      const citta = aiAddr.Città ? String(aiAddr.Città).trim() : (r.city ? String(r.city).trim() : '');
      const prov = aiAddr.Provincia ? String(aiAddr.Provincia).trim() : (r.province ? String(r.province).trim() : '');
      
      let displayCity = `${citta} ${prov ? '('+prov+')' : ''}`.trim();
      let displayStreet = `${via} ${civico}`.trim();
      
      let displayAddress = displayCity && displayStreet ? `${displayCity}, ${displayStreet}` : (displayCity || displayStreet || 'Indirizzo Sconosciuto');
      displayAddress = displayAddress.replace(/\s+/g, ' ').trim();

      let normKey = `${citta} ${via}`.toLowerCase().replace(/[^\w\s]/gi, ' ').replace(/\b(di|del|della|dei|degli|via|viale|piazza|corso)\b/g, ' ').replace(/\b[a-z]{2}\b/g, ' ').replace(/\d+/g, ' ').replace(/\s+/g, ' ').trim();
      if (!normKey) normKey = 'unknown_location';

      if (!groups[normKey]) groups[normKey] = { id: normKey, address: displayAddress, items: [] };
      else if (displayAddress.length > groups[normKey].address.length) groups[normKey].address = displayAddress;
      
      groups[normKey].items.push({ ...r, _parsedAi: aiData });
  });

  const groupedResources = Object.values(groups);
  if (groupedResources.length === 0) return null;

  // 2. Identificazione Nucleo Attivo
  let activeGroup = null;
  if (savedAddressId && groupedResources.some(g => g.id === savedAddressId)) {
    activeGroup = groupedResources.find(g => g.id === savedAddressId);
  } else {
    activeGroup = groupedResources[0];
  }

  if (!activeGroup) return null;

  // 3. Estrazione Vettori Universale (Cerca tutti i sinonimi e in inglese/italiano)
  const rPower = activeGroup.items.find(r => 
    !r.resource_type || ['power', 'energia_elettrica', 'luce', 'energia'].includes(String(r.resource_type).toLowerCase())
  );
  const rGas = activeGroup.items.find(r => 
    r.resource_type && ['gas', 'gas_naturale'].includes(String(r.resource_type).toLowerCase())
  );
  const rWater = activeGroup.items.find(r => 
    r.resource_type && ['water', 'acqua', 'idrico'].includes(String(r.resource_type).toLowerCase())
  );

  const pAi = rPower?._parsedAi || {};
  const gAi = rGas?._parsedAi || {};
  const wAi = rWater?._parsedAi || {};

  // 4. Estrazione Lat/Lon flessibile
  const findCoord = (obj, keys) => {
    if (!obj || typeof obj !== 'object') return null;
    for (let k of keys) {
      const foundKey = Object.keys(obj).find(key => key.toLowerCase() === k.toLowerCase());
      if (foundKey !== undefined && obj[foundKey] !== null) {
          const val = parseFloat(obj[foundKey]);
          if (!isNaN(val)) return val;
      }
    }
    for (const k in obj) {
      if (typeof obj[k] === 'object') {
        const res = findCoord(obj[k], keys);
        if (res !== null) return res;
      }
    }
    return null;
  };

  let lat = parseFloat(rPower?.latitude) || parseFloat(rPower?.lat) || findCoord(pAi, ['latitudine', 'lat', 'latitude']);
  let lon = parseFloat(rPower?.longitude) || parseFloat(rPower?.lon) || findCoord(pAi, ['longitudine', 'lon', 'longitude']);

  // 5. PVGIS Profile
  let pvProfile = null;
  if (rPower && rPower.pv_production_profile) {
      try { 
          pvProfile = typeof rPower.pv_production_profile === 'string' 
                   ? JSON.parse(rPower.pv_production_profile) 
                   : rPower.pv_production_profile; 
      } catch(e) { console.error("Errore parsing PVGIS", e); }
      
      if (pvProfile?.inputs?.location) {
          lat = parseFloat(pvProfile.inputs.location.latitude) || lat;
          lon = parseFloat(pvProfile.inputs.location.longitude) || lon;
      }
  }

  // 6. Consumi Annuali
  const getAnnual = (r, aiObj) => {
    if (!r) return 0;
    return parseFloat(r.annual_consumption_kwh) || parseFloat(r.annual_consumption_smc) || parseFloat(r.annual_consumption_m3) || 
           parseFloat(aiObj?.consumption_bands?.total_annual) || parseFloat(aiObj?.consumption?.annual_mc) || parseFloat(aiObj?.consumption?.annual_smc) || 0;
  };

  const d = [
    Math.round((getAnnual(rPower, pAi) / 12) * 0.25) || 120,
    Math.round((getAnnual(rGas, gAi) / 12) * 1.10) || 85,
    Math.round((getAnnual(rWater, wAi) / 12) * 2.50) || 30
  ];

  // 7. Consumi Mensili (Totale e Fascia F1)
  const mKeys = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  let monthlyConsTotal = Array(12).fill(Math.round((getAnnual(rPower, pAi) || 1200) / 12));
  let monthlyConsF1 = monthlyConsTotal.map(v => Math.round(v * 0.33));

  let foundLastYear = pAi?.last_year || pAi?.consumi?.last_year || null;
  if (foundLastYear) {
      monthlyConsTotal = mKeys.map(m => parseFloat(foundLastYear[m]) || 0);
  }

  let foundLastYearFasce = pAi?.last_year_fasce || pAi?.consumi?.last_year_fasce || null;
  if (foundLastYearFasce) {
      monthlyConsF1 = mKeys.map(m => {
          const meseDati = foundLastYearFasce[m];
          return meseDati ? (parseFloat(meseDati.F1) || 0) : 0;
      });
  }

  return {
    activeAddressName: activeGroup.address,
    rPower,
    rGas,
    rWater,
    lat,
    lon,
    pvProfile,
    d,
    monthlyConsTotal,
    monthlyConsF1
  };
}