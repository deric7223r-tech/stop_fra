/**
 * Test utilities and helpers for React Native Testing Library
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';

// Mock router for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };

// Common test data factories
export const createMockUser = (overrides = {}) => ({
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User',
  role: 'employer',
  organisation_id: '123e4567-e89b-12d3-a456-426614174001',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockOrganisation = (overrides = {}) => ({
  organisation_id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Test Organisation',
  type: 'private-sme',
  employee_band: '11-50',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockAssessment = (overrides = {}) => ({
  assessment_id: '123e4567-e89b-12d3-a456-426614174002',
  organisation_id: '123e4567-e89b-12d3-a456-426614174001',
  status: 'draft',
  overall_risk_level: null,
  created_by_user_id: '123e4567-e89b-12d3-a456-426614174000',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Mock navigation helpers
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
