// Ensure window exists only in jsdom environment
try {
  if (typeof window === 'undefined') {
    global.window = undefined;
  }
} catch (e) {
  // ignore
}

