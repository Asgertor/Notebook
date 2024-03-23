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




export const Map = () => {
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

  async function getPicture() {
    const resultat = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
    });

    if (!resultat.canceled) {
      console.log("Got the picture..." + resultat);
      setImagePath(resultat.assets[0].uri);
      console.log("Image path set..." + imagePath);
    }
  }
  async function uploadBillede(markerKey) {
    console.log("Uploading image..." + imagePath);
    const res = await fetch(imagePath);
    const blob = await res.blob();
    const storageRef = ref(storage, `${markerKey}`);
    const uploadResult = await uploadBytes(storageRef, blob);
    console.log("Image uploaded..." + markerKey);

    // Get download URL and update Firestore
    const downloadURL = await getDownloadURL(uploadResult.ref);
    await updateDoc(doc(firestore, "markers", markerKey), {
      imageUri: downloadURL,
    });

    // Update local state to reflect new image URL
    setMarkers((currentMarkers) =>
      currentMarkers.map((marker) =>
        marker.key === markerKey ? { ...marker, imageUri: downloadURL } : marker
      )
    );
  }

  useEffect(() => {
    // const startListener = async () => {
    //   let { status } = await Location.requestForegroundPermissionsAsync();
    //   if (status !== "granted") {
    //     alert("Fik ikke adgang");
    //     return;
    //   }
    //   locationSubscription.current = await Location.watchPositionAsync(
    //     {
    //       distanceInterval: 100,
    //       accuracy: Location.Accuracy.High,
    //     },
    //     (lokation) => {
    //       const newRegion = {
    //         latitude: lokation.coords.latitude,
    //         longitude: lokation.coords.longitude,
    //         latitudeDelta: 0.1,
    //         longitudeDelta: 0.1,
    //       };
    //       setRegion(newRegion);
    //       if (mapView.current) {
    //         mapView.current.animateToRegion(newRegion);
    //       }
    //     }
    //   );
    // };
    const fetchMarkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "markers"));
        const fetchedMarkers = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          key: doc.id,
          coordinate: {
            latitude: doc.data().coordinate.latitude,
            longitude: doc.data().coordinate.longitude,
          },
        }));
        setMarkers(fetchedMarkers);
      } catch (error) {
        console.error("Error fetching markers:", error);
      }
    };
    

    fetchMarkers();
  }, []);

  // Function to add marker and upload image
  const addMarker = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    try {
      const newMarkerRef = await addDoc(collection(firestore, "markers"), {
        coordinate: new GeoPoint(latitude, longitude),
        title: "New Marker",
        imageUri: "", // Placeholder for image URL
      });

      // Add the new marker to the local state array
      setMarkers((prevMarkers) => [
        ...prevMarkers,
        {
          key: newMarkerRef.id,
          coordinate: { latitude, longitude },
          title: "New Marker",
          imageUri: "", // Placeholder for image URL
        },
      ]);
    } catch (error) {
      console.error("Error adding marker: ", error);
    }
  };

  const MarkerOverlay = ({ marker, onEditImage, onClose }) => {
    if (!marker) return null;

    const handleAddImage = async () => {
      await getPicture();
      setTimeout(() => uploadBillede(marker.key), 500); 
    };

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
          <TouchableOpacity style={styles.button} onPress={handleAddImage}>
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
      {selectedMarker && (
        <MarkerOverlay
          marker={selectedMarker}
          onEditImage={getPicture}
          onClose={() => setSelectedMarker(null)}
        />
      )}
    </View>
  );
};
