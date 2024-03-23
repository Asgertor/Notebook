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


const fileName = "notes.txt";
const fileUri = FileSystem.documentDirectory + fileName;

export const Home = ({ navigation, route }) => {
  function navigateToNotes() {
    navigation.navigate("Notes");
  }
  function navigateToMap() {
    navigation.navigate("Map");
  }

  return (
    <View style={[styles.container]}>
      <TouchableOpacity
        style={[styles.card, { width: "90%" }]}
        onPress={navigateToNotes}
      >
        <Text> Go to Notes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.card]} onPress={navigateToMap}>
        <Text> Go to Map</Text>
      </TouchableOpacity>
    </View>
  );
};
