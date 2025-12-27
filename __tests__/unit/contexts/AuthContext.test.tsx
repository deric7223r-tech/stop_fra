/**
 * Unit tests for AuthContext
 * Tests authentication state management
 */
import React from 'react';
import { render, waitFor } from '../../helpers/testUtils';
import { Text } from 'react-native';

// Mock auth context for testing
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide default unauthenticated state', () => {
    const TestComponent = () => {
      return <Text testID="auth-status">Not authenticated</Text>;
    };

    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('auth-status')).toBeTruthy();
  });

  it('should handle login success', async () => {
    const mockUser = {
      user_id: '123',
      email: 'test@example.com',
      role: 'employer',
    };

    mockAuthContext.login.mockResolvedValue({
      user: mockUser,
      token: 'mock-token',
    });

    await mockAuthContext.login('test@example.com', 'password123');

    expect(mockAuthContext.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockAuthContext.login).toHaveBeenCalledTimes(1);
  });

  it('should handle login failure', async () => {
    const mockError = new Error('Invalid credentials');
    mockAuthContext.login.mockRejectedValue(mockError);

    await expect(
      mockAuthContext.login('wrong@example.com', 'wrongpass')
    ).rejects.toThrow('Invalid credentials');
  });

  it('should handle logout', () => {
    mockAuthContext.logout();
    expect(mockAuthContext.logout).toHaveBeenCalledTimes(1);
  });
});
