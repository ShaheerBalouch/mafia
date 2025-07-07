import React, { useState, useEffect } from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  StyleProp,
  ViewStyle
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

type Option = string | number;

interface PickerFieldProps<T extends Option> {
  value: T | null;
  onChange: (v: T) => void;
  placeholder?: string;
  options: readonly T[];
  labelExtractor?: (v: T) => string;
  style?: StyleProp<ViewStyle>;        // ⬅ NEW
}

export function PickerField<T extends Option>({
  value,
  onChange,
  placeholder = 'Select…',
  options,
  labelExtractor = (v) => String(v),
  style
}: PickerFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState<T | null>(
  value ?? options[0] ?? null
);

  useEffect(() => {
  if (open) setTempValue(value ?? options[0] ?? null);
}, [open, value, options]);

  const confirmSelection = () => {
    if (tempValue !== null) onChange(tempValue);
    setOpen(false);
  };

  return (
    <>
      <Pressable
  style={[styles.field, style]}   // ⬅ merge custom style
  onPress={() => setOpen(true)}
>
  <Text style={value == null ? styles.placeholder : styles.value}>
    {value == null ? placeholder : labelExtractor(value)}
  </Text>
</Pressable>

      <Modal
  visible={open}
  transparent
  animationType="fade"
  onRequestClose={() => setOpen(false)}
>
  <View style={styles.backdrop}>
    {/* Tappable backdrop */}
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={() => setOpen(false)}
    />

    {/* Picker Card (blocks touch bubbling) */}
    <View style={styles.card} pointerEvents="box-none">
      {Platform.OS === 'ios' && (
        <View style={styles.modalHeader}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={confirmSelection}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      <Picker
        selectedValue={tempValue}
        onValueChange={(v) => {
          if (Platform.OS === 'android') {
            onChange(v as T);
            setOpen(false);
          } else {
            setTempValue(v as T);
          }
        }}
        mode="dialog"
      >
        {options.map((o) => (
          <Picker.Item
            key={labelExtractor(o)}
            label={labelExtractor(o)}
            value={o}
          />
        ))}
      </Picker>
    </View>
  </View>
</Modal>

    </>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  placeholder: { color: '#777' },
  value: { color: '#fff' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: '#2c2c2e',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  doneText: {
    color: '#0a84ff',
    fontSize: 20,             // ⬆︎ bigger text
    fontWeight: '600',
    paddingHorizontal: 20,    // ⬆︎ wider press area
    paddingVertical: 6, 
  },
});
