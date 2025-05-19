import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

const signUp = async () => {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await userCred.user.getIdToken(true);  // Force token refresh
    setMessage("User registered!");
    setEmail("");
    setPassword("");
    // Fetch notes after token is ready
    fetchNotes(userCred.user);
  } catch (err) {
    setMessage(err.message);
  }
};

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchNotes(u);
    });
    return () => unsub();
  }, []);

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Logged in!");
    } catch (err) {
      setMessage(err.message);
    }
  };

const fetchNotes = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    setMessage("No user found");
    return;
  }

  const token = await currentUser.getIdToken();
  const res = await fetch("http://localhost:5000/notes", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  setNotes(data.notes || []);
};

  const addNote = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch("http://localhost:5000/add_note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text: note }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Note added!");
      setNote("");
      await fetchNotes();
    } else {
      setMessage(data.error);
    }
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
    setNotes([]);
  };

  if (!user)
    return (
      <div style={{ padding: "1rem" }}>
        <h2>Login / Sign Up</h2>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={login}>Login</button>
        <button onClick={signUp}>Sign Up</button>
        <p>{message}</p>
      </div>
    );

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Welcome, {user.email}</h2>
      <button onClick={logout}>Logout</button>
      <hr />
      <input
        placeholder="Write note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button onClick={addNote}>Add</button>
      <button onClick={fetchNotes}>Refresh</button>
      <p>{message}</p>
      <ul>
        {notes.map((n, i) => (
          <li key={i}>{n.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
