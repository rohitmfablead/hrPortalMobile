import React, { createElement, useRef, useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import CustomTextInput from './CustomTextInput';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CustomDatePickerProps {
  label: string;
  value: string;
  onDateChange: (val: string) => void;
  style?: any;
  minimumDate?: string; // Expects YYYY-MM-DD
}

export default function CustomDatePicker({ label, value, onDateChange, style, minimumDate }: CustomDatePickerProps) {
  const dateInputRef = useRef<any>(null);
  const [showPicker, setShowPicker] = useState(false);

  // Web Implementation
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
                min: minimumDate,
                onChange: (e: any) => onDateChange(e.target.value),
                style: {
                  height: 54,
                  width: '100%',
                  paddingLeft: 40,
                  paddingRight: 14,
                  fontSize: 17,
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

  // Native Implementation (iOS / Android)
  const onNativeDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      // Format as YYYY-MM-DD
      const dateString = selectedDate.toISOString().split('T')[0];
      onDateChange(dateString);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setShowPicker(true)}>
        <View pointerEvents="none">
          <CustomTextInput
            label={label}
            value={value}
            placeholder="YYYY-MM-DD"
            left={<CustomTextInput.Icon icon={() => <CalendarIcon color="#F97316" size={18} />} />}
          />
        </View>
      </TouchableOpacity>
      
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          minimumDate={minimumDate ? new Date(minimumDate) : undefined}
          mode="date"
          display="default"
          onChange={onNativeDateChange}
        />
      )}
      {/* iOS needs an explicit close button if display is inline or spinner, but 'default' handles it decently.
          To keep it simple, we use the default modal behavior on Android, and inline/spinner on iOS. */}
      {Platform.OS === 'ios' && showPicker && (
        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPicker(false)}>
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  webLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    marginLeft: 4,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },
  closeBtnText: {
    color: '#F97316',
    fontWeight: 'bold',
  }
});
