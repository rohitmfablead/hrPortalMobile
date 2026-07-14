import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';

interface CustomTextInputProps extends Omit<TextInputProps, 'theme'> {
  theme?: any;
}

export default function CustomTextInput(props: CustomTextInputProps) {
  return (
    <TextInput
      mode="outlined"
      textColor="#0F172A"
      {...props}
      theme={{
        roundness: 12,
        colors: {
          background: '#F8FAFC',
          onSurfaceVariant: '#64748B', // Unfocused placeholder color
          primary: '#F97316', // Focused placeholder and outline color
          outline: '#E2E8F0', // Inactive outline color
        },
        ...props.theme,
      }}
      style={[{ fontSize: 17, height: 54 }, styles.input, props.style]}
    />
  );
}

// You can add properties like .Icon onto CustomTextInput so that it matches react-native-paper's TextInput API
CustomTextInput.Icon = TextInput.Icon;
CustomTextInput.Affix = TextInput.Affix;

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
});
