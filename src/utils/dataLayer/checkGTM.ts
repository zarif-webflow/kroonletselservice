export const isGTMLoaded = (): boolean => {
  return !!window.dataLayer && Array.isArray(window.dataLayer);
};
