import { StatusBar } from "expo-status-bar";
import { app, firestore, storage } from "./firebase";
import { initializeApp } from "firebase/app";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  getFirestore,
  GeoPoint,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import * as FileSystem from "expo-file-system";
import { useState, useEffect, useCallback, useRef } from "react";
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
  ToastAndroid,
  Image,
  Alert,
} from "react-native";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  ref,
} from "firebase/storage";
import * as React from "react";

import * as ImagePicker from "expo-image-picker";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCamera,
  faFileImport,
  faFloppyDisk,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import MapView, { Callout, Marker, CustomCalloutView } from "react-native-maps";
import * as Location from "expo-location";

import { styles } from "./styles";

export const Notes = ({ navigation, route }) => {
  const [inputText, setInputText] = useState("");
  const [notes, setNotes] = useState([]);
  const [values, loading, error] = useCollection(
    collection(firestore, "notes")
  );
  const data = values?.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

  /*
    // Function to save notes to a file
    const saveNotesToFile = async (notesArray) => {
      try {
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(notesArray));
        console.log("Notes saved to file!" + fileUri);
      } catch (e) {
        console.error("Failed to save notes to file", e);
      }
    };
    */

  /*
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
    */

  /*
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
      */

  // Function to clear all notes
  async function clearNote() {
    Alert.alert(
      "Clear All Notes", // Alert Title
      "Are you sure you want to delete all notes? This action cannot be undone.", // Alert Message
      [
        {
          text: "Cancel",
          onPress: () => console.log("Clear action cancelled"),
          style: "cancel",
        },
        {
          text: "Yes, Delete All",
          onPress: async () => {
            try {
              const querySnapshot = await getDocs(
                collection(firestore, "notes")
              );
              const deletePromises = querySnapshot.docs.map((doc) =>
                deleteDoc(doc.ref)
              );
              await Promise.all(deletePromises);
              console.log("All notes deleted from db!");
              Alert.alert("All notes have been deleted."); // Provide feedback that all notes are deleted
            } catch (e) {
              console.error("Error deleting notes: ", e);
              Alert.alert("Error deleting notes"); // Provide feedback on error
            }
          },
        },
      ],
      { cancelable: true } // This allows the alert to be dismissed by tapping outside of it
    );
  }

  async function navigationButton(item) {
    console.log(item);

    await navigation.navigate("SpecificNote", { id: item });
  }

  async function addNote() {
    try {
      // Add a new document to the "notes" collection and capture the document reference
      const docRef = await addDoc(collection(firestore, "notes"), {
        text: "• " + inputText,
      });
      console.log("Note added to db with ID: ", docRef.id);

      // Clear the input text field
      setInputText("");

      // Show a toast message to indicate success
      ToastAndroid.show("Note added!", ToastAndroid.LONG);

      // Navigate to the SpecificNote screen with the new document's ID
      navigationButton(docRef.id);
    } catch (e) {
      console.log("Error in db: ", e);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Note overview</Text>

        <View style={styles.buttonContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Add a note"
            onChangeText={(text) => setInputText(text)}
            value={inputText}
          />
          <TouchableOpacity style={styles.addButton} onPress={addNote}>
            <FontAwesomeIcon icon={faPlus} />
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.flatList}
          data={data}
          renderItem={(note) => (
            <TouchableOpacity
              style={styles.button2}
              onPress={() => navigationButton(note.item.id)}
            >
              <Text>{note.item.text.substring(0, 100)}</Text>
            </TouchableOpacity>
          )}
        />

        {/* <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={loadNotesFromFile}>
              <Text>Load notes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => saveNotesToFile(notes)}
            >
              <Text>Save notes</Text>
            </TouchableOpacity>
          </View> */}

        <StatusBar style="auto" />
        <TouchableOpacity style={styles.button} onPress={clearNote}>
          <Text>Clear all notes</Text>
          <FontAwesomeIcon icon={faTrash} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
