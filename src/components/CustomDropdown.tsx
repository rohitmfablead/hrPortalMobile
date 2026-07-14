import React, { useState } from 'react';
import { View, StyleSheet, Modal, FlatList, TouchableOpacity, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ChevronDown, X } from 'lucide-react-native';

interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  icon?: any;
  placeholder?: string;
  style?: any;
}

export default function CustomDropdown({ label, value, options, onSelect, icon, placeholder, style }: CustomDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  return (
    <>
      <View style={[styles.container, style]}>
        <TextInput
          mode="outlined"
          label={label}
          value={displayValue}
          placeholder={placeholder}
          editable={false}
          textColor="#0F172A"
          left={icon ? <TextInput.Icon icon={icon} /> : undefined}
          right={<TextInput.Icon icon={() => <ChevronDown color="#64748B" size={20} />} />}
          theme={{
            roundness: 12,
            colors: {
              background: '#F8FAFC',
              onSurfaceVariant: '#64748B',
              primary: '#F97316',
              outline: '#E2E8F0',
            },
          }}
          style={[{ fontSize: 17, height: 54 }, styles.input]}
        />
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => setModalVisible(true)} 
          style={StyleSheet.absoluteFill} 
        />
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#64748B" size={24} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, value === item.value && styles.optionItemSelected, { flexDirection: 'row', alignItems: 'center' }]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  {icon && (
                    <View style={{ marginRight: 12 }}>
                      {typeof icon === 'function' ? icon() : null}
                    </View>
                  )}
                  <Text style={[styles.optionText, value === item.value && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No options available</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: '#FFF7ED',
  },
  optionText: {
    fontSize: 17,
    color: '#334155',
  },
  optionTextSelected: {
    color: '#D97706',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 20,
  },
});
