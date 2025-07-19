import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { GoogleGenAI } from "@google/genai";
import { PickerField } from '@/components/PickerField';


type Player = { name: string; gender: 'Male' | 'Female' | ''; role: 'Doctor' | 'Sheriff' | 'Mafia' | 'Civilian' | '' };

const GameScreen = () => {

  const { players } = useLocalSearchParams();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [killedName, setKilledName] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);
  const [investigatedName, setInvestigatedName] = useState<string | null>(null);
  const [history, setHistory] = useState<string>("We are playing a game of Mafia. Here is the history of the chats we have had previously, including the prompts and responses: ");
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [prompt, setPrompt] = useState<string>("");
  const [votedPlayer, setVotedPlayer] = useState<string>("");
  const [parsedPlayers, setParsedPlayers] = useState<Player[]>([]);

  const allFieldsFilled = 
  (killedName !== null &&
  savedName !== null &&
  investigatedName !== null) || (votedPlayer !== "");

    const handleNextRound = () => {
      console.log("next round");
      setRoundNumber(roundNumber + 1);
      setLoading(true);
      setText("");

      if(roundNumber % 2 === 0){
        setParsedPlayers(parsedPlayers.filter(p => p.name !== votedPlayer));
      }
      else {

        if(killedName !== savedName){

          setParsedPlayers(parsedPlayers.filter(p => p.name !== killedName));
          console.log("Parsed Players: ", parsedPlayers);
      }
      }

    };

  useEffect(() => {
  try {
    const decoded = JSON.parse(decodeURIComponent(players as string));
    setParsedPlayers(decoded);
  } catch {
    setParsedPlayers([]); // fallback in case of error
  }
}, [players]);

  useEffect(() => {
    const ai = new GoogleGenAI({apiKey: ""});
    const fetchGameData = async () => {

      const playerStrings = parsedPlayers.map(
        (p, idx) => `Player ${idx + 1}:\n  Name: ${p.name}\n  Gender: ${p.gender}\n  Role: ${p.role}`
      );

      let prompt = "";

      if(roundNumber === 1){
        prompt = `We are a group of ${parsedPlayers.length} people playing the game Mafia. We want you to come up with the narrations of the game
        I will provide you with the names, genders and roles of the people playing, and you have to come up with an initial story, along with the narrations
        for each person who is killed by the Mafia, saved by the Doctor, or investigated by the Sherrif. Only output the narration and instructions, no extra words or responses.
        The genders, names and roles are as follows: 
        \n${playerStrings.join('\n\n')} \nThe players do not know their roles yet, so after an initial setting description, provide instructions to the narrator
        to ask the players to close their eyes, and provide them their roles, secretly. Any instructions to the narrator should be highlighted as Instructions.
        At the end of the output, provide a description for how everyone is falling asleep, and then instruct the narrator to ask each role to secretly pick someone.`;
      }
      else if(roundNumber % 2 === 0){
        prompt = `${history}. \nThe person who was investigated was ${investigatedName}. The person who was chosen to be killed was ${killedName}.
        The person who was chosen to be saved was ${savedName}. Now the following players are left alive: 
        \n${playerStrings.join('\n\n')}. \nGive a description of what happened. If the doctor saved the person the mafia decided to kill, then have a dramatic description of what happened.
        Now the players are going to vote on who they think is the Mafia. I will let you know what the results are in the next prompt.`;
      }
      else{
        prompt = `${history}. \nThe person who was voted out was '${votedPlayer}' Now the following players are left alive: 
        \n${playerStrings.join('\n\n')}. \nGive a dramatic description of what happened, whether a player was voted out, or if there was no vote cast. I will update
        you with who the mafia/doctor/sheriff choose in the next query.`;
      }
        
      try {
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: prompt}],
        })
        setText(response.text ?? "");
        setLoading(false);
        setHistory(history + "Prompt: " + prompt + "Your Response: " + text);
      } catch (error) {
        console.error('API error:', error);
      }
    };

    fetchGameData();
  }, [parsedPlayers, roundNumber]);

  return(
    <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#d71d24" />
        ) : 
          roundNumber % 2 !== 0 ? (
          <>
            <Text style={styles.text}>{text}</Text>
            <Text style={styles.label}>Enter who got killed by the Mafia</Text>

            <PickerField
            style={styles.input}
            value={killedName || null}
            onChange={(v) => {
              setKilledName(v as string)
            }}
            options={parsedPlayers.filter(p => p.role !== "Mafia").map(p => p.name)}
            placeholder="Choose player"
            />

            <Text style={styles.label}>Enter who got saved by the Doctor</Text>
            <PickerField
            style={styles.input}
            value={savedName || null}
            onChange={(v) => {
              setSavedName(v as string)
            }}
            options={parsedPlayers.map(p => p.name)}
            placeholder="Choose player"
            />

            <Text style={styles.label}>Enter who got investigated by the Sheriff</Text>
            <PickerField
            style={styles.input}
            value={investigatedName || null}
            onChange={(v) => {
              setInvestigatedName(v as string)
            }}
            options={parsedPlayers.filter(p => p.role !== "Sheriff").map(p => p.name)}
            placeholder="Choose player"
            />

      </>): (<>
            <Text style={styles.text}>{text}</Text>
            <Text style={styles.label}>Enter who got voted by the players</Text>
            <PickerField
            style={styles.input}
            value={votedPlayer || null}
            onChange={(v) => {
              setVotedPlayer(v as string)
            }}
            options={[...parsedPlayers.map(p => p.name), 'No person voted']}
            placeholder="Choose player"
            />
            </>) 
      }
      <TouchableOpacity style={[
              styles.playButton,
              !allFieldsFilled && { opacity: 0.4 } // visually indicate disabled
              ]} 
              disabled={!allFieldsFilled}
              onPress={handleNextRound}
              >
      
                <Text style={styles.playText}>Next Round</Text>
      
              </TouchableOpacity>
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
  input: {
    backgroundColor: '#1c1c1e',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 24,
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

export default GameScreen;
