const express = require("express");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// express app
const app = express();

// register view engine
app.set("view enine", "ejs");

// listen for requests
app.listen(3000);

// middleware & static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Firebase
const firebase = require('firebase/app');
const {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where,
  orderBy, serverTimeStamp,
  getDoc, updateDoc, getDocs, enableNetwork
} = require('firebase/firestore');

// Firebase Auth
const {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged
} = require('firebase/auth');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFFHOSb8VtShxGWLjLS8im5iXZKZD6ZI8",
  authDomain: "nettbutikk-ebc90.firebaseapp.com",
  projectId: "nettbutikk-ebc90",
  storageBucket: "nettbutikk-ebc90.appspot.com",
  messagingSenderId: "679899508054",
  appId: "1:679899508054:web:530ade5eb62faae7ac3af7",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//initialize services
const db = getFirestore();
const auth = getAuth();

//collection ref
const colRef = collection(db, 'produkter');

/* //get collection data
getDocs(colRef)
  .then((snapshot) => {
    console.log(snapshot.docs)
  });

const q = query(colRef, orderBy('sold', 'desc'));

onSnapshot(q, (snapshot) => {
    let toppListe = [];
    snapshot.docs.forEach(doc => {
        toppListe.push({...doc.data(), id: doc.id})
    });
    console.log(toppListe);
}) */

let bruker = "";

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    bruker = user.email;
  } else {
    console.log("Bruker logget ut");
  }
});

// Query for å finne mest solgte mot db
const q = query(colRef, orderBy('sold', 'desc'));

let topSolgte = [];
onSnapshot(q, (snapshot) => {
  snapshot.docs.forEach(doc => {
    topSolgte.push({ ...doc.data(), id: doc.id});
  });
});

// JWT
const maxAge = 1 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'Nettbutikk secret', {
    expiresIn: maxAge
  });
}


//Sider
app.get("/", (req, res) => {
  res.render("index.ejs", { title: "Home", topSolgte: topSolgte, user: bruker });
});

app.get("/LoggUt", (req, res) => {
  bruker = "";
  auth.signOut();
  res.redirect("/");
});

app.get("/LoggInn", (req, res) => {
  res.render("LoggInn.ejs", { title: "LoggInn", user: bruker });
});

app.post("/loggInn", (req, res) => {
  const { email, password } = req.body;
  console.log("loggInnBruker", email, password);
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const token = createToken(userCredential.uid);
      res.cookie('jwt', token, {maxAge: maxAge});
      res.redirect('/');
    })
    .catch((err) => {
      const errorCode = err.code;
      res.render('LoggInn.ejs', { title: "Logg Inn", userError: errorCode, user: bruker });
    });
});

app.get("/NyBruker", (req, res) => {
  res.render("NyBruker.ejs", { title: "NyBruker", user: bruker });
});

app.post("/NyBruker", (req, res) => {
  const { email, password } = req.body;
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const token = createToken(userCredential.uid);
      res.cookie('jwt', token, {maxAge: maxAge});
      res.redirect('/');
    })
    .catch((err) => {
      const errorCode = err.code;
      res.render('NyBruker.ejs', { title: "Ny Bruker", userError: errorCode, user: bruker });
    });
});

app.get("/Products", (req, res) => {
  res.render("Products.ejs", { title: "Products", prod: topSolgte, user: bruker });
});

//Playstation
app.get("/Playstation", (req, res) => {
  const playstation = [];
  topSolgte.forEach(doc => {
    if (doc.type == "Playstation") {
      playstation.push(doc);
    }
  });
  res.render("Playstation.ejs", { title: "Playstation", playstation: playstation, user: bruker });
});

app.post("/Playstation", (req, res) => {
  console.log(req.body)
  res.send("playstation");
});

//Xbox
app.get("/Xbox", (req, res) => {
  const xbox = [];
  topSolgte.forEach(doc => {
    if (doc.type == "Xbox") {
      xbox.push(doc);
    }
  });
  res.render("Xbox.ejs", { title: "Xbox", xbox: xbox, user: bruker });
});

app.post("/Xbox", (req, res) => {
  console.log(req.body);
});

//Nintendo
app.get("/Nintendo", (req, res) => {
  const nintendo = [];
  topSolgte.forEach(doc => {
    if (doc.type == "Nintendo") {
      nintendo.push(doc);
    }
  });
  res.render("Nintendo.ejs", { title: "Nintendo", nintendo: nintendo, user: bruker });
});

app.post("/Nintendo", (req, res) => {
  console.log(req.body)
});

//Sega
app.get("/Sega", (req, res) => {
  const sega = [];
  topSolgte.forEach(doc => {
    if (doc.type == "Sega") {
        sega.push(doc);
    }
  });
  res.render("Sega.ejs", { title: "Sega", sega: sega, user: bruker });
});

app.post("/Sega", (req, res) => {
  console.log(req.body)
});

app.get("/order", (req, res) => {
  const order = topSolgte;
  res.render("order.ejs", { title: "Handlekurv", order: order, user: bruker });
});

app.post("/credCard", (req, res) => {
  const huh = req.body;
  console.log("huh", huh);
  res.redirect("/");
});

app.get("/search", (req, res) => {
  const produkt = req.query.search;
  const regex = new RegExp(produkt, "i");
  const result = [];
  topSolgte.forEach(doc => {
    if (regex.test(JSON.stringify(doc))) {
      result.push(doc);
    }
  });
  res.render("Products.ejs", { title: "Produkter", prod: result, user: bruker });
});
