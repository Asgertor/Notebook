import { StatusBar } from "expo-status-bar";
import { app, database, storage } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { Alert } from "react-native"; // Make sure to import Alert
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
} from "react-native";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getDatabase,
  ref as dbRef,
  set,
  get,
  remove,
} from "@firebase/database";

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
        <Stack.Screen name="Map" component={Map} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Home = ({ navigation, route }) => {
  function navigateToNotes() {
    navigation.navigate("Notes");
  }
  function navigateToMap() {
    navigation.navigate("Map");
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={navigateToNotes}>
          <Text> Go to Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={navigateToMap}>
          <Text> Go to Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Notes = ({ navigation, route }) => {
  const [inputText, setInputText] = useState("");
  const [notes, setNotes] = useState([]);
  const [values, loading, error] = useCollection(collection(database, "notes"));
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
                collection(database, "notes")
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

  function navigationButton(item) {
    console.log(item);

    navigation.navigate("SpecificNote", { id: item });
  }

  // Function to create a note if the input is not empty
  async function pressMe() {
    try {
      await addDoc(collection(database, "notes"), {
        text: "• " + inputText,
      });
      console.log("Note added to db!");

      setInputText("");
      ToastAndroid.show("Note added!", ToastAndroid.LONG);
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
          <TouchableOpacity style={styles.addButton} onPress={pressMe}>
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

const Map = ({ navigation, route }) => {
  const database = getDatabase();
  const storage = getStorage();
  const [markers, setMarkers] = useState([]);
  const [imagePath, setImagePath] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const [region, setRegion] = useState({
    latitude: 55,
    longitude: 12,
    latitudeDelta: 1,
    longitudeDelta: 1,
  });
  const mapView = useRef(null);
  const locationSubscription = useRef(null);

  useEffect(() => {
    //starter en listener
    async function startListener() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Fik ikke adgang");
        return;
      }
      locationSubscription.current = await Location.watchPositionAsync(
        {
          distanceInterval: 100,
          accuracy: Location.Accuracy.High,
        },
        (lokation) => {
          const newRegion = {
            latitude: lokation.coords.latitude,
            longitude: lokation.coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          };
          setRegion(newRegion);
          if (mapView.current) {
            mapView.current.animateToRegion(newRegion);
          }
        }
      );
    }
    startListener();
    if (locationSubscription.current) {
      locationSubscription.current.remove(); //sluk for listener, når komponenten unmountes
    }
  }, []); //Tomt array betyder at den kun kørere én gang

  async function addMarker(data) {
    const { latitude, longitude } = data.nativeEvent.coordinate;
    const newMarker = {
      coordinate: { latitude, longitude },
      key: data.timeStamp.toString(),
      title: "Good place",
      imageUri: null,
    };
    setMarkers([...markers, newMarker]);
  }

  async function launchImagePicker(markerKey) {
    console.log("Launching image picker... for marker: " + markerKey);
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
    });

    if (!result.canceled) {
      let newSelectedMarker = null;
      const updatedMarkers = markers.map((marker) => {
        if (marker.key === markerKey) {
          const updatedMarker = { ...marker, imageUri: result.assets[0].uri };
          newSelectedMarker = updatedMarker; // Update selectedMarker
          return updatedMarker;
        }
        return marker;
      });

      setMarkers(updatedMarkers); // Update the markers array
      if (newSelectedMarker) {
        setSelectedMarker(newSelectedMarker); // Update the selectedMarker
      }
      console.log(updatedMarkers); // Debug: Log updated markers to verify
    }
  }

  const MarkerOverlay = ({ marker, onEditImage, onClose }) => {
    if (!marker) return null; // Don't render if there's no selected marker

    return (
      <View style={styles.overlay}>
        <Text style={styles.overlayTitle}>{marker.title}</Text>
        {marker.imageUri ? (
          <Image
            source={{ uri: marker.imageUri }}
            style={styles.overlayImage}
            resizeMode="contain"
          />
        ) : (
          <Text>No image selected</Text>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => onEditImage(marker.key)}
          >
            <Text style={{ color: "white" }}>Add Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={{ color: "white" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View>
      <MapView
        style={styles.map}
        region={region}
        onLongPress={addMarker}
        showsUserLocation
        showsMyLocationButton
      >
        {markers.map((marker) => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            onPress={() =>
              setSelectedMarker(
                selectedMarker?.key === marker.key ? null : marker
              )
            }
          >
            <View
              style={
                selectedMarker?.key === marker.key
                  ? styles.selectedMarkerStyle
                  : styles.markerStyle
              }
            >
              {/* Custom marker content here */}
            </View>
          </Marker>
        ))}
      </MapView>
      {/* Conditionally render the MarkerOverlay based on selectedMarker */}
      {selectedMarker && (
        <MarkerOverlay
          marker={selectedMarker}
          onEditImage={launchImagePicker}
          onClose={() => setSelectedMarker(null)}
        />
      )}
    </View>
  );
};

const SpecificNote = ({ navigation, route }) => {
  const noteId = route.params?.id; // Assuming this is how you pass the note ID
  const [note, setNote] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const [inputText, setInputText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  async function getPicture() {
    const resultat = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
    });

    if (!resultat.canceled) {
      console.log("Got the picture..." + resultat);
      setImagePath(resultat.assets[0].uri); //sætter stien til billedet)
    }
  }

  async function uploadBillede(noteId) {
    const res = await fetch(imagePath);
    const blob = await res.blob();
    const storageRef = ref(storage, `${noteId}`);
    uploadBytes(storageRef, blob).then(() => {
      console.log("Image uploaded..." + noteId);
    });
  }

  async function downloadBillede(noteId) {
    await getDownloadURL(ref(storage, `${noteId}`)).then((url) => {
      setImagePath(url);
      console.log("Image downloaded..." + noteId);
    });
  }

  async function deleteNote(id) {
    Alert.alert(
      "Delete Note", // Alert Title
      "Are you sure you want to delete this note?", // Alert Message
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await deleteDoc(doc(database, "notes", id));
              console.log("Note deleted from db!");
              navigation.navigate("Notes"); // Navigate back after deletion
            } catch (e) {
              console.error("Error deleting note: ", e);
              Alert.alert("Error deleting note"); // Error feedback
            }
          },
        },
      ],
      { cancelable: true } // This allows the alert to be dismissed by tapping outside of it
    );
  }

  async function handleSave() {
    if (noteId) {
      try {
        const noteRef = doc(database, "notes", noteId);
        await updateDoc(noteRef, { text: inputText });
        console.log("Note updated in db!");
        ToastAndroid.show("Note updated!", ToastAndroid.LONG);

        uploadBillede(noteId);
      } catch (e) {
        console.log("Error updating note: ", e);
      }
    }
  }

  async function launchCamera() {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (result.granted == false) {
      console.log("Kamera ikke tilladt");
    } else {
      ImagePicker.launchCameraAsync({
        quality: 1,
      }).then((response) => {
        console.log("Billede taget" + response);
        setImagePath(response.assets[0].uri);
      });
    }
  }

  useEffect(() => {
    const fetchNote = async () => {
      if (noteId) {
        try {
          const noteRef = doc(database, "notes", noteId);
          const noteSnap = await getDoc(noteRef);
          if (noteSnap.exists()) {
            const noteData = noteSnap.data();
            setNote(noteData); // Set the fetched note
            setInputText(noteData.text);

            // After fetching the note, also get the download URL for the image
            const imageRef = ref(storage, `${noteId}`);
            const imageUrl = await getDownloadURL(imageRef);
            setImagePath(imageUrl);
            console.log("Image downloaded..." + noteId);
          } else {
            console.log("No such document!");
          }
        } catch (e) {
          console.error("Error fetching note: ", e);
        }
      }
    };

    fetchNote();
  }, [noteId, database, storage]); // Add dependencies used in useEffect

  const handleTextChange = (text) => {
    setInputText(text);
  };

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

        <Image
          source={{ uri: imagePath }}
          style={{ width: 200, height: 250, resizeMode: "contain" }}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={getPicture}>
            <Text>Importér billede</Text>
            <FontAwesomeIcon icon={faFileImport} />
          </TouchableOpacity>
          {/*<TouchableOpacity
            style={styles.button}
            onPress={() => uploadBillede(noteId)}
          >
            <Text>Upload billede</Text>
          </TouchableOpacity>
        */}

          <TouchableOpacity
            style={styles.button}
            onPress={() => launchCamera()}
          >
            <Text>Tag billede</Text>
            <FontAwesomeIcon icon={faCamera} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button2}
          onPress={() => deleteNote(noteId)}
        >
          <Text>Delete note</Text>
          <FontAwesomeIcon icon={faTrash} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button2} onPress={handleSave}>
          <Text>Save note</Text>
          <FontAwesomeIcon icon={faFloppyDisk} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4f6d7a",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#e8dab2",
    borderRadius: 10,
    padding: 20,
    marginTop: 50,
    alignItems: "center",
    shadowColor: "black",
    elevation: 10,
  },
  textInput: {
    color: "black",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    width: 200,
    shadowColor: "black",
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  button: {
    fontSize: 20,
    color: "white",
    backgroundColor: "#c0d6df",
    borderRadius: 10,
    padding: 5,
    margin: 5,
    width: 100,
    alignItems: "center",
    shadowColor: "black",
    shadowOpacity: 1,
    shadowRadius: 7,
    elevation: 5,
  },
  addButton: {
    fontSize: 20,
    color: "white",
    backgroundColor: "#c0d6df",
    borderRadius: 10,
    padding: 5,
    margin: 5,
    width: 30,
    alignItems: "center",
    shadowColor: "black",
    shadowOpacity: 1,
    shadowRadius: 7,
    elevation: 5,
  },
  button2: {
    fontSize: 20,
    color: "white",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 5,
    margin: 5,
    alignItems: "center",
    shadowColor: "black",
    shadowOpacity: 1,
    shadowRadius: 7,
    elevation: 5,
  },
  saveButton: {
    fontSize: 20,
    color: "white",
    backgroundColor: "#449342",
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
  deleteButton: {
    fontSize: 20,
    color: "white",
    backgroundColor: "#ff0000",
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
    justifyContent: "space-between",
  },
  flatList: {
    marginTop: 20,
    color: "white",
  },
  text: {
    fontSize: 20,
    color: "black",
  },
  title: {
    fontSize: 20,
    color: "black",
  },
  editableTitle: {
    fontSize: 20,
    color: "black",
    borderRadius: 10,
    padding: 10,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 20,
    backgroundColor: "white",
    padding: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    elevation: 50,
  },

  overlayTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  overlayImage: {
    width: "100%",
    height: 200, // Adjust as needed
    marginTop: 10,
  },
  markerStyle: {
    width: 30, // Regular marker size
    height: 30,
    backgroundColor: "black",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedMarkerStyle: {
    width: 30, // Larger size for selected marker
    height: 30,
    backgroundColor: "red",
    borderRadius: 15,
  },
});
