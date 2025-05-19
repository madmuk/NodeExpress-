import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCetiAbdD7Ysp9u2j9ddnZmPuoQbEMWw20",
    authDomain: "notes-practice-d8767.firebaseapp.com",
    projectId: "notes-practice-d8767",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
