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
      dense={true}
      {...props}
      theme={{
        colors: {
          background: '#FFFFFF',
          onSurfaceVariant: '#64748B', // Unfocused placeholder color
          primary: '#F97316', // Focused placeholder and outline color
        },
        ...props.theme,
      }}
      style={[{ fontSize: 13 }, styles.input, props.style]}
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
