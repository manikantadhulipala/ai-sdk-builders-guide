// Hook tokens shared by the workflow (which waits on them) and the API routes
// (which resume them). Keep these in one place so the two sides cannot drift.
export const hookTokens = {
  kitchenReady: (orderId: string) => `kitchen-ready:${orderId}`,
  driverPickup: (orderId: string) => `driver-pickup:${orderId}`,
  delivered: (orderId: string) => `delivered:${orderId}`,
};
