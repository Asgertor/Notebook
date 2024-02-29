import { StatusBar } from "expo-status-bar";
import { app, database } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {useCollection} from "react-firebase-hooks/firestore";
import * as FileSystem from "expo-file-system";
import { useState, useEffect, useCallback } from "react";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Button,
} from "react-native";


const fileName = "notes.txt";
const fileUri = FileSystem.documentDirectory + fileName;

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Notes" component={Notes} />
        <Stack.Screen name="SpecificNote" component={SpecificNote} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const Home = ({ navigation, route }) => {
  function pressMe() {
    navigation.navigate("Notes");
  }
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pressMe}>
          <Text>Go to notes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Notes = ({ navigation, route }) => {
  const [inputText, setInputText] = useState('');
  const [notes, setNotes] = useState([]);
  const [values, loading, error] = useCollection(collection(database, "notes"));
  const data = values?.docs.map((doc) => ({...doc.data(), id: doc.id}));
  
  
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

  // autoload notes when returning to note overview
  useFocusEffect(
    useCallback(() => {
      loadNotesFromFile();
      console.log("saved");
    }, [])
  );

  // Save notes whenever they change
  useEffect(() => {
    saveNotesToFile(notes);
  }, [notes]);

  // Load notes when the app starts
  useEffect(() => {
    loadNotesFromFile();
  }, []);

  // Function to clear all notes
  function clearNote() {
    setNotes([]);
  }
  function handleButton(item) {
    navigation.navigate("SpecificNote", { message: item });
  }

  // Function to create a note if the input is not empty
  async function pressMe() {
    try {
    await addDoc(collection(database, "notes"), { 
      text: inputText });
      console.log("Note added to db!");
      setInputText("");
    } catch (e) {
      console.log("Fejl i db: ", e);
    }
    /*
    if (inputText.trim() !== "") {
      setNotes([...notes, { key: notes.length, value: "• " + inputText }]);
      setInputText("");
    }
    */
  }

  async function deleteNote(id) {
    try {
      await deleteDoc(doc(database, "notes", "id"));
      console.log("Note deleted from db!");
    } catch (e) {
      console.log("Fejl i db: ", e);
    }
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
          data={data}

          renderItem={( note ) => (
            <TouchableOpacity
              style={styles.button2}
              onPress={() => deleteNote(note.item.id)}
            >
              <Text>{note.item.text.substring(0, 25)}</Text>
            </TouchableOpacity>
          )}
          
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={loadNotesFromFile}>
            <Text>Load notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => saveNotesToFile(notes)}
          >
            <Text>Save notes</Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="auto" />
      </View>
    </View>
  );
};

const SpecificNote = ({ navigation, route }) => {
  const message = route.params?.message;
  const [notes, setNotes] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [inputText, setInputText] = useState(message ? message.value : "");

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {isEditing ? (
          <TextInput
            style={styles.editableTitle}
            onChangeText={handleTextChange} // Updated to use handleTextChange
            value={inputText}
            autoFocus={true}
            onBlur={() => setIsEditing(false)} // Optionally, you could save on blur as well
            returnKeyType="done"
            multiline={true}
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.title}>{inputText}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
    fontSize: 16,
    color: "white",
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
  button2: {
    fontSize: 16,
    color: "white",
    backgroundColor: "#5FBFBF",
    color: "white",
    borderRadius: 10,
    padding: 5,
    margin: 5,
    width: 190,
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
  editableTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#008080", // Match your design
    borderRadius: 10,
    padding: 10,
    width: 250, // Adjust width as needed
    minHeight: 40, // Adjust height as needed
  },
});
