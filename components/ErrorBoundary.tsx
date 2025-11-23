import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type ErrorBoundaryState = { hasError: boolean; errorMessage: string };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} testID="error-boundary">
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle} numberOfLines={3}>
            {this.state.errorMessage || 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity onPress={this.handleReset} style={styles.button} accessibilityLabel="Reload">
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 16 },
  button: { backgroundColor: '#0038A8', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
