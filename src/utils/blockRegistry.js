import { defineAsyncComponent } from 'vue';

// Mappa la colonna 'component_key' del DB -> al File Vue fisico
export const blockRegistry = {
  // DB Key (vedi tua img) : File Vue
  'FeatureActivation': defineAsyncComponent(() => import('@/components/dashboard/blocks/FeatureActivation.vue')),
  'FeatureNotifications': defineAsyncComponent(() => import('@/components/dashboard/blocks/FeatureNotifications.vue')),
  'FeaturesMarketNewsBlock': defineAsyncComponent(() => import('@/components/dashboard/blocks/FeaturesMarketNewsBlock.vue')),
};

/**
 * Funzione helper per risolvere il componente in sicurezza
 */
export const getComponentByKey = (dbKey) => {
  if (blockRegistry[dbKey]) {
    return blockRegistry[dbKey];
  }
  console.warn(`⚠️ Il DB ha richiesto il blocco '${dbKey}' ma non esiste un file Vue mappato.`);
  return null; 
};