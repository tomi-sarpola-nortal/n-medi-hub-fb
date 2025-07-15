// This file is used to set up the test environment
// Add any global setup code here

// Mock the global fetch function
global.fetch = vi.fn();

// Reset mocks between tests
beforeEach(() => {
  vi.resetAllMocks();
});