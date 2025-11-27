import '@testing-library/jest-dom';

// Mock for masonry-layout
const mockMasonryInstance = {
  layout: jest.fn(),
  reloadItems: jest.fn(),
  appended: jest.fn(),
  prepended: jest.fn(),
  remove: jest.fn(),
  destroy: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

class MockMasonry {
  static instances: MockMasonry[] = [];
  
  layout = mockMasonryInstance.layout;
  reloadItems = mockMasonryInstance.reloadItems;
  appended = mockMasonryInstance.appended;
  prepended = mockMasonryInstance.prepended;
  remove = mockMasonryInstance.remove;
  destroy = mockMasonryInstance.destroy;
  on = mockMasonryInstance.on;
  off = mockMasonryInstance.off;

  constructor(_element: Element, _options?: Record<string, unknown>) {
    MockMasonry.instances.push(this);
  }

  static reset() {
    MockMasonry.instances = [];
    jest.clearAllMocks();
  }
}

// Mock masonry-layout with default export for ESM dynamic import compatibility
jest.mock('masonry-layout', () => ({
  __esModule: true,
  default: MockMasonry,
}));

// Mock for imagesloaded
const mockImagesLoaded = jest.fn().mockImplementation(() => ({
  on: jest.fn().mockReturnThis(),
  off: jest.fn().mockReturnThis(),
  once: jest.fn().mockReturnThis(),
  isComplete: true,
  hasAnyBroken: false,
  progressedCount: 0,
  images: [],
  elements: [],
  options: {},
}));

// Mock imagesloaded with default export for ESM dynamic import compatibility
jest.mock('imagesloaded', () => ({
  __esModule: true,
  default: mockImagesLoaded,
}));

// Mock for element-resize-detector
const mockErd = {
  listenTo: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  uninstall: jest.fn(),
};

// Mock element-resize-detector with default export for ESM dynamic import compatibility
jest.mock('element-resize-detector', () => ({
  __esModule: true,
  default: () => mockErd,
}));

// Add CSS to document for layout tests (only in browser environment)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .container {
      width: 180px;
      position: relative;
      list-style: none;
      padding: 0;
    }

    .item {
      width: 60px;
      height: 30px;
      float: left;
      background-color: lightblue;
    }

    .item.w2 {
      width: 120px;
      background-color: lightsalmon;
    }

    .item.h2 {
      height: 50px;
      background-color: lightsteelblue;
    }

    .item.h3 {
      height: 70px;
      background-color: lightgrey;
    }

    .item.h4 {
      height: 90px;
      background-color: lightgoldenrodyellow;
    }

    .item.imagesloaded {
      background: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7);
    }
  `;
  document.head.appendChild(styleSheet);
}

// Export mocks for tests to access
export { MockMasonry, mockMasonryInstance, mockImagesLoaded, mockErd };

// Clean up mocks before each test
beforeEach(() => {
  MockMasonry.reset();
  mockImagesLoaded.mockClear();
  jest.clearAllMocks();
});
