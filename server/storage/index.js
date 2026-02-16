const { MockStorageProvider } = require('./mockProvider');

const createStorageProvider = () => {
  const configured = String(process.env.STORAGE_PROVIDER || 'mock').trim().toLowerCase();

  // Firebase provider will be plugged here later with the same interface.
  if (configured === 'firebase') {
    console.warn('⚠️ STORAGE_PROVIDER=firebase is not implemented yet. Falling back to mock.');
  }

  return new MockStorageProvider();
};

module.exports = {
  createStorageProvider,
};
