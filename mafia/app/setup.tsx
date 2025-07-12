import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PickerField } from '@/components/PickerField';
import { useRouter } from 'expo-router';

type Player = { name: string; gender: 'Male' | 'Female' | ''; role: 'Doctor' | 'Sheriff' | 'Mafia' | 'Civilian' | '' };

const MafiaSetupScreen: React.FC = () => {

  const router = useRouter();

  const [numPlayers, setNumPlayers] = useState<number | null>(null);
  const [numMafia,  setNumMafia]  = useState<number | null>(null);
  const [players,   setPlayers]   = useState<Player[]>([]);

  const maxMafia = numPlayers ? Math.floor(numPlayers / 3) : 0;

  const allFieldsFilled =
  numPlayers !== null &&
  numMafia !== null &&
  players.length === numPlayers &&
  players.every(
    (p) => p.name.trim() && p.gender
  );

  const getRoles = (numPlayers: number, numMafia: number): string[] => {
  const roles: string[] = [];

  // Add roles
  roles.push('Doctor');
  roles.push('Sheriff');

  // Add Mafia
  for (let i = 0; i < numMafia; i++) {
    roles.push('Mafia');
  }

  // Fill remaining players with Civilian
  const remaining = numPlayers - roles.length;
  for (let i = 0; i < remaining; i++) {
    roles.push('Civilian');
  }

  return roles;
};

const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const handleStartGame = () => {
  if (!numPlayers || !numMafia) return;

  const shuffledRoles = shuffle(getRoles(numPlayers, numMafia));

  const playersWithRoles = players.map((player, index) => ({
    ...player,
    role: shuffledRoles[index],
  }));

  const serializedPlayers = encodeURIComponent(JSON.stringify(playersWithRoles));

  router.push(`/game?players=${serializedPlayers}`);

  // Proceed to game screen, pass playersWithRoles
};

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
          ...Array(numPlayers - prev.length).fill({ name: '', gender: '', role: '' }),
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

                {/* <PickerField
                style={styles.input}           // ⬅ same look/size as TextInput
                value={p.role || null}
                onChange={v => {
                    const next = [...players];
                    next[idx] = { ...next[idx], role: v as 'Citizen' | 'Doctor' | 'Sheriff' | 'Mafia'};
                    setPlayers(next);
                }}
                options={['Citizen', 'Doctor', 'Sheriff', 'Mafia']}
                placeholder="Role"
                /> */}
            </View>
          </React.Fragment>
        ))}

        <TouchableOpacity style={[
        styles.playButton,
        !allFieldsFilled && { opacity: 0.4 } // visually indicate disabled
        ]} 
        disabled={!allFieldsFilled}
        onPress={handleStartGame}
        >

          <Text style={styles.playText}>Start Game</Text>

        </TouchableOpacity>
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

  playButton: {
    marginTop: 48,
    backgroundColor: '#d71d24',        // Mafia‑red
    paddingVertical: 18,
    paddingHorizontal: 64,
    borderRadius: 14,
    elevation: 4,                       // Small Android shadow
    shadowColor: '#000',                // iOS shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: 'center',               // ✅ Center text horizontally
    justifyContent: 'center',   
  },

  playText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
