import React, { createElement, useRef } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import CustomTextInput from './CustomTextInput';
import { Calendar as CalendarIcon } from 'lucide-react-native';

interface CustomDatePickerProps {
  label: string;
  value: string;
  onDateChange: (val: string) => void;
  style?: any;
}

export default function CustomDatePicker({ label, value, onDateChange, style }: CustomDatePickerProps) {
  const dateInputRef = useRef<any>(null);

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={[styles.container, style]}
        onPress={() => {
          if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
            dateInputRef.current.showPicker();
          } else if (dateInputRef.current) {
            dateInputRef.current.focus();
            dateInputRef.current.click();
          }
        }}
      >
        <View style={{ pointerEvents: 'none' }}>
          <CustomTextInput
            label={label}
            value={value}
            left={<CustomTextInput.Icon icon={() => <CalendarIcon color="#F97316" size={18} />} />}
            render={(props: any) => {
              return createElement('input', {
                ref: dateInputRef,
                type: 'date',
                value: value,
                onChange: (e: any) => onDateChange(e.target.value),
                style: {
                  height: '100%',
                  width: '100%',
                  minHeight: 46,
                  paddingLeft: 40,
                  paddingRight: 14,
                  fontSize: 13,
                  outline: 'none',
                  border: 'none',
                  color: value ? '#0F172A' : 'transparent',
                  backgroundColor: 'transparent',
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }
              });
            }}
          />
        </View>
      </TouchableOpacity>
    );
  }

  // Fallback for Mobile (we can add a proper native DatePicker library later if needed)
  return (
    <View style={[styles.container, style]}>
      <CustomTextInput
        label={label}
        value={value}
        onChangeText={onDateChange}
        placeholder="YYYY-MM-DD"
        left={<CustomTextInput.Icon icon={() => <CalendarIcon color="#F97316" size={18} />} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  webLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    marginLeft: 4,
  }
});
