import { shallowRef } from 'vue';

// --- IMPORT COMPONENTI BLOCCHI ---
import FeatureActivation from '@/components/blocks/FeatureActivation.vue';
import FeatureNotifications from '@/components/blocks/FeatureNotifications.vue';
import FeaturesMarketNewsBlock from '@/components/blocks/FeaturesMarketNewsBlock.vue';
import FeatureMonitoraggioElettricoBlock from '@/components/blocks/FeatureMonitoraggioElettricoBlock.vue';

// --- REGISTRY DEI BLOCCHI (Frontend Mapping) ---
export const availableBlocks = shallowRef({
  'FeatureActivation': FeatureActivation,
  'FeatureNotifications': FeatureNotifications,
  'FeaturesMarketNewsBlock': FeaturesMarketNewsBlock,
  'FeatureMonitoraggioElettricoBlock': FeatureMonitoraggioElettricoBlock,
});