// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage} from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdh5s2yZUYB8dgCYkcXVxfZy_JRE0qlxY",
  authDomain: "myproject-f3aa1.firebaseapp.com",
  projectId: "myproject-f3aa1",
  storageBucket: "myproject-f3aa1.appspot.com",
  messagingSenderId: "962909545816",
  appId: "1:962909545816:web:36b86d4f8dab44f76c312d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);
export { app, firestore, storage}