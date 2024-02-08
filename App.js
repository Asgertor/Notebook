import { StatusBar } from "expo-status-bar";
import * as FileSystem from "expo-file-system";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
const fileName = "notes.txt";
const fileUri = FileSystem.documentDirectory + fileName;

export default function App() {
  const [inputText, setInputText] = useState("");
  const [notes, setNotes] = useState([]);

  // Function to save notes to a file
  const saveNotesToFile = async (notesArray) => {
    try {
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(notesArray));
      console.log("Notes saved to file!" + fileUri);
    } catch (e) {
      console.error("Failed to save notes to file", e);
    }
  };

  // Function to load notes from a file
  const loadNotesFromFile = async () => {
    try {
      let savedNotes = await FileSystem.readAsStringAsync(fileUri);
      setNotes(JSON.parse(savedNotes));
      console.log("Notes loaded from file!" + fileUri);
    } catch (e) {
      console.error("Failed to load notes from file.", e);
    }
  };

  // Load notes when the app starts
  useEffect(() => {
    loadNotesFromFile();
  }, []);

  // Save notes whenever they change
  useEffect(() => {
    saveNotesToFile(notes);
  }, [notes]);

  // Function to add a note if the input is not empty
  function pressMe() {
    if (inputText.trim() !== "") {
      setNotes([...notes, { key: notes.length, value: "• " + inputText }]);
      setInputText("");
    }
  }

  // Function to clear all notes
  function clearNote() {
    setNotes([]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Add a note</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => setInputText(text)}
          value={inputText}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={pressMe}>
            <Text>Add note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={clearNote}>
            <Text>Clear</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.flatList}
          data={notes}
          renderItem={(note) => (
            <Text style={styles.text}>{note.item.value}</Text>
          )}
        />

        <StatusBar style="auto" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#004c4c",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#008080",
    borderRadius: 10,
    padding: 20,
    marginTop: 50,
    alignItems: "center",
    shadowColor: "black",
    shadowOpacity: 1,
    shadowRadius: 7,
    elevation: 5,
  },
  textInput: {
    backgroundColor: "#004c4c",
    color: "white",
    borderRadius: 10,
    padding: 10,
    width: 200,
    shadowColor: "black",
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  button: {
    backgroundColor: "#5FBFBF",
    color: "white",
    borderRadius: 10,
    padding: 5,
    margin: 5,
    width: 95,
    alignItems: "center",
    shadowColor: "black",
    shadowOpacity: 1,
    shadowRadius: 7,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  flatList: {
    marginTop: 20,
    width: 200,
    color: "white",
  },
  text: {
    fontSize: 16,
    color: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
