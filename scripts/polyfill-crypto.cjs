// Ensure a web-compatible `crypto` is available in Node (used by some deps)
if (typeof globalThis.crypto === 'undefined') {
  try {
    // Node 16.17+/18+ expose webcrypto at require('crypto').webcrypto
    const { webcrypto } = require('crypto');
    if (webcrypto) {
      globalThis.crypto = webcrypto;
      // Also provide legacy global for libraries checking `global.crypto`
      if (typeof global.crypto === 'undefined') global.crypto = webcrypto;
    }
  } catch (e) {
    // ignore; some older Node versions may not have webcrypto
  }
}
