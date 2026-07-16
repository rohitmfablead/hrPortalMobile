import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';

import AppNavigator from './src/navigation/AppNavigator';
import { store } from './src/redux/store';

import NetworkStatus from './src/components/NetworkStatus';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={MD3DarkTheme}>
        <AppNavigator />
        <NetworkStatus />
        <StatusBar style="light" />
      </PaperProvider>
    </ReduxProvider>
  );
}