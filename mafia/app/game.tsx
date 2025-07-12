import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { GoogleGenAI } from "@google/genai";


type Player = { name: string; gender: 'Male' | 'Female' | ''; role: 'Doctor' | 'Sheriff' | 'Mafia' | 'Civilian' | '' };

const GameScreen = () => {

  const { players } = useLocalSearchParams();

  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);

  const parsedPlayers: Player[] = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(players as string));
    } catch {
      return [];
    }
  }, [players]);

  useEffect(() => {
    const ai = new GoogleGenAI({apiKey: ""});
    const fetchGameData = async () => {
        
        const playerStrings = parsedPlayers.map(
        (p, idx) => `Player ${idx + 1}:\n  Name: ${p.name}\n  Gender: ${p.gender}\n  Role: ${p.role}`
        );

        const prompt = `We are a group of ${parsedPlayers.length} people playing the game Mafia. We want you to come up with the narrations of the game
        I will provide you with the names, genders and roles of the people playing, and you have to come up with an initial story, along with the narrations
        for each person who is killed by the Mafia, saved by the Doctor, or investigated by the Sherrif. Only output the narration and instructions, no extra words or responses.
        The genders, names and roles are as follows: 
        \n${playerStrings.join('\n\n')} \nThe players do not know their roles yet, so after an initial setting description, provide instructions to the narrator
        to ask the players to close their eyes, and provide them their roles, secretly. Any instructions to the narrator should be highlighted as Instructions.
        At the end of the output, provide a description for how everyone is falling asleep, and then instruct the narrator to ask each role to secretly pick someone.`;

        console.log("PROMPT: " + prompt);
      try {
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: prompt}],
        })
        console.log(response.text);
        setText(response.text ?? "");
        setLoading(false);
      } catch (error) {
        console.error('API error:', error);
      }
    };

    fetchGameData();
  }, [parsedPlayers]);

  return(
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        {loading ? (
          <ActivityIndicator size="large" color="#d71d24" />
        ) : (
          <Text style={styles.text}>{text}</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#000',    // keep your background consistent
  },
  text: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 28,
    // maxWidth: 600,           // optional, if you want to restrict width on tablets
  },
});

export default GameScreen;
