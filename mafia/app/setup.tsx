import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PickerField } from '@/components/PickerField';

type Player = { name: string; gender: 'Male' | 'Female' | '' };

const MafiaSetupScreen: React.FC = () => {
  const [numPlayers, setNumPlayers] = useState<number | null>(null);
  const [numMafia,  setNumMafia]  = useState<number | null>(null);
  const [players,   setPlayers]   = useState<Player[]>([]);

  const maxMafia = numPlayers ? Math.floor(numPlayers / 3) : 0;

  /* ── keep players[] length in sync with numPlayers ────────────── */
  useEffect(() => {
    if (!numPlayers) {
      setPlayers([]);          // picker reset ⇒ clear
      setNumMafia(null);
      return;
    }

    setPlayers(prev => {
      if (prev.length < numPlayers) {
        // add empty players
        return [
          ...prev,
          ...Array(numPlayers - prev.length).fill({ name: '', gender: '' }),
        ];
      }
      if (prev.length > numPlayers) {
        // remove extras
        return prev.slice(0, numPlayers);
      }
      return prev;
    });

    if (numMafia && numMafia > numPlayers) setNumMafia(null);
  }, [numPlayers]);

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0} // adjust as needed
  >
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
        {/* ── # Players ─────────────────────────────── */}
        <Text style={styles.label}>Enter the number of players</Text>
        <PickerField
          value={numPlayers}
          onChange={setNumPlayers}
          options={[...Array(12)].map((_, i) => i + 1)}
        />

        {/* ── # Mafia ───────────────────────────────── */}
        <Text style={styles.label}>Enter the number of Mafia</Text>
        <PickerField
          key={numPlayers}                     // force remount
          value={numMafia}
          onChange={setNumMafia}
          options={[...Array(maxMafia)].map((_, i) => i + 1)}
          placeholder="Select…"
        />

        {/* ── Player blocks ─────────────────────────── */}
        {players.map((p, idx) => (
          <React.Fragment key={idx}>
            <Text style={styles.section}>Player {idx + 1}</Text>

            {/* labels */}
            <View style={styles.row}>
              <Text style={styles.inputLabel}>Name</Text>
              <Text style={styles.inputLabel}>Gender</Text>
            </View>

            {/* inputs */}
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#777"
                value={p.name}
                onChangeText={t => {
                  const next = [...players];
                  next[idx] = { ...next[idx], name: t };
                  setPlayers(next);
                }}
              />

              <PickerField
                style={styles.input}           // ⬅ same look/size as TextInput
                value={p.gender || null}
                onChange={v => {
                    const next = [...players];
                    next[idx] = { ...next[idx], gender: v as 'Male' | 'Female' };
                    setPlayers(next);
                }}
                options={['Male', 'Female']}
                placeholder="Gender"
                />
            </View>
          </React.Fragment>
        ))}
      </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MafiaSetupScreen;

/* ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: { paddingHorizontal: 24, paddingBottom: 32 },
  label: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 24,
  },
  section: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 32,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel: {
    color: '#888',
    width: '46%',
    marginBottom: 4,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1c1c1e',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    width: '46%',
    marginBottom: 16,
  },
});
