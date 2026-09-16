// The unconnected provider.
//
// It returns no plans and no prices, because inventing a price, a data amount
// or a coverage claim for a product nobody can deliver yet would be a lie the
// customer only discovers at checkout. What it does return is the shape the UI
// needs, so every plan component is built and tested against the real contract
// and the day a supplier is connected nothing on the page has to change.

export const stubProvider = {
  id: 'stub',
  label: 'Not connected',
  connected: false,

  async listPlans() {
    return [];
  },

  async getPlan() {
    return null;
  },

  async availability() {
    return { status: 'not_connected', reason: 'no_supplier_contract' };
  },

  async createOrder() {
    throw new Error('No supplier is connected. Checkout is disabled by design.');
  },
};
