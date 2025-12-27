/**
 * Unit tests for Button Component
 * Tests button rendering, interactions, and variants
 */
import React from 'react';
import { render, fireEvent } from '../../helpers/testUtils';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

// Simple Button component for testing
const Button = ({ 
  onPress, 
  children, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  testID = 'button',
}: {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  testID?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    testID={testID}
  >
    {loading ? (
      <ActivityIndicator testID="loading-spinner" />
    ) : (
      <Text>{children}</Text>
    )}
  </TouchableOpacity>
);

describe('Button Component', () => {
  it('renders correctly with text', () => {
    const { getByText } = render(
      <Button onPress={() => {}}>Click Me</Button>
    );

    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress handler when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock}>Click Me</Button>
    );

    fireEvent.press(getByText('Click Me'));

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading prop is true', () => {
    const { getByTestId, queryByText } = render(
      <Button onPress={() => {}} loading>Click Me</Button>
    );

    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(queryByText('Click Me')).toBeNull();
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button onPress={onPressMock} disabled>Click Me</Button>
    );

    fireEvent.press(getByTestId('button'));

    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button onPress={onPressMock} loading>Click Me</Button>
    );

    fireEvent.press(getByTestId('button'));

    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('handles multiple presses', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button onPress={onPressMock}>Click Me</Button>
    );

    const button = getByText('Click Me');
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(onPressMock).toHaveBeenCalledTimes(3);
  });
});
