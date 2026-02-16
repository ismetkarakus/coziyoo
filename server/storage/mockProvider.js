const makeObjectKey = (prefix = 'media') =>
  `${prefix}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.jpg`;

const toPlaceholderUrl = (key) =>
  `https://placehold.co/600x600?text=${encodeURIComponent(key)}`;

class MockStorageProvider {
  constructor() {
    this.provider = 'mock';
    this.bucket = 'mock-assets';
  }

  async createAsset(input = {}) {
    const objectKey = input.objectKey || makeObjectKey(input.prefix || 'media');
    return {
      provider: this.provider,
      bucket: this.bucket,
      objectKey,
      publicUrl: toPlaceholderUrl(objectKey),
    };
  }

  async deleteAsset(_asset) {
    return true;
  }
}

module.exports = {
  MockStorageProvider,
};
