// Provider abstraction.
//
// The SEO pages must never know which supplier is behind a plan. They ask this
// module for plans and get a normalised shape back. Swapping Airalo for Maya,
// MobiMatter, eSIM Access or a direct MNO deal is a change in one adapter, not
// a rewrite of a thousand pages.
//
// Contract:
//   listPlans({ destinationId, regionId, locale })  -> Plan[]
//   getPlan(planId)                                 -> Plan | null
//   availability(destinationId)                     -> { status, reason }
//   createOrder(...)                                -> never called while the
//                                                      active provider is the
//                                                      unconnected stub
//
// Plan shape, normalised:
//   { id, providerId, destinationId, regionId, title, dataAmount, dataUnit,
//     validityDays, price: { amount, currency } | null, hotspot: bool | null,
//     networks: string[], topUp: bool | null, throttleAfter: null,
//     status: 'available' | 'unavailable' | 'not_connected' }

import { stubProvider } from './stub.js';

const REGISTRY = new Map();

export function registerProvider(provider) {
  if (!provider || !provider.id) throw new Error('provider needs an id');
  REGISTRY.set(provider.id, provider);
  return provider;
}

registerProvider(stubProvider);

// One switch. Set LIVDAR_PROVIDER in the environment when a supplier contract
// exists and its adapter is registered above.
export function activeProviderId() {
  return process.env.LIVDAR_PROVIDER || 'stub';
}

export function activeProvider() {
  return REGISTRY.get(activeProviderId()) || stubProvider;
}

export function providerIsConnected() {
  return activeProvider().connected === true;
}

export async function listPlans(query) {
  try {
    const plans = await activeProvider().listPlans(query);
    return Array.isArray(plans) ? plans.map(normalise) : [];
  } catch (err) {
    return [];
  }
}

export async function availability(destinationId) {
  try {
    return await activeProvider().availability(destinationId);
  } catch (err) {
    return { status: 'unknown', reason: 'provider_error' };
  }
}

function normalise(plan) {
  return {
    id: String(plan.id),
    providerId: plan.providerId || activeProviderId(),
    destinationId: plan.destinationId || null,
    regionId: plan.regionId || null,
    title: plan.title || '',
    dataAmount: typeof plan.dataAmount === 'number' ? plan.dataAmount : null,
    dataUnit: plan.dataUnit || 'GB',
    validityDays: typeof plan.validityDays === 'number' ? plan.validityDays : null,
    price: plan.price && typeof plan.price.amount === 'number' ? plan.price : null,
    hotspot: typeof plan.hotspot === 'boolean' ? plan.hotspot : null,
    networks: Array.isArray(plan.networks) ? plan.networks : [],
    topUp: typeof plan.topUp === 'boolean' ? plan.topUp : null,
    status: plan.status || 'not_connected',
  };
}

// Checkout is deliberately a hard stop while no supplier can provision an eSIM
// the moment someone pays. Demand is measured with intent events instead.
export const CHECKOUT_ENABLED = false;
