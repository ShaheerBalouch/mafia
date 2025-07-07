import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  const handlePlay = () => {
    // 👇 Change "Game" to the route where your main game lives

    console.log("button working");

    router.push('/setup');
  };

  return (
    <View style={styles.container}>
      {/* Ensure the status‑bar text stays visible on black */}
      <StatusBar barStyle="light-content" />

      <Image
        source={require('../assets/images/Mafia-Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>MAFIA</Text>

      <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
        <Text style={styles.playText}>Play</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',            // Pure black background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  /* Crest logo */
  logo: {
    width: 220,
    height: 220,
    marginBottom: 24,
  },

  /* Big, bold title */
  title: {
    fontSize: 64,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },

  /* Red rounded Play button */
  playButton: {
    marginTop: 48,
    backgroundColor: '#d71d24',        // Mafia‑red
    paddingVertical: 18,
    paddingHorizontal: 96,
    borderRadius: 14,
    elevation: 4,                       // Small Android shadow
    shadowColor: '#000',                // iOS shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  playText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});