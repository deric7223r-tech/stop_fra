/**
 * Early setup file that runs before React Native Testing Library
 * Prevents auto-registration of cleanup hooks
 */

// Set environment variable to disable auto-cleanup
process.env.RNTL_SKIP_AUTO_CLEANUP = 'true';

// Mock the problematic ViewConfigIgnore file
jest.mock('react-native/Libraries/NativeComponent/ViewConfigIgnore', () => ({
  ConditionallyIgnoredEventHandlers: (value) => value,
  DynamicallyInjectedByGestureHandler: (value) => value,
}), { virtual: true });

// Disable host component name detection
jest.mock('@testing-library/react-native/build/helpers/host-component-names', () => ({
  configureHostComponentNamesIfNeeded: jest.fn(),
  getHostComponentNames: jest.fn(() => new Set()),
}));
