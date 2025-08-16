// Global flag to track if we're in offline mode
let isOfflineMode = false;

export const setOfflineMode = (offline: boolean) => {
  isOfflineMode = offline;
};

export const getOfflineMode = () => isOfflineMode;