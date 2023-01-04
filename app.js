const express = require("express");

// express app
const app = express();

// register view engine
app.set("view enine", "ejs");

// listen for requests
app.listen(3000);

// middleware & static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//Firebase
const firebase = require('firebase/app');
const {
    getFirestore, collection, onSnapshot,
    addDoc, deleteDoc, doc,
    query, where,
    orderBy, serverTimeStamp,
    getDoc, updateDoc, getDocs
} = require('firebase/firestore');

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

const q = query(colRef, orderBy('sold', 'desc'));

let topSolgte = [];
onSnapshot(q, (snapshot) => {
    snapshot.docs.forEach(doc => {
        topSolgte.push({ ...doc.data(), id: doc.id});
    });
});


//Sider
app.get("/", (req, res) => {
  res.render("index.ejs", { title: "Home", topSolgte: topSolgte });
});

app.get("/LoggInn", (req, res) => {
  res.render("LoggInn.ejs", { title: "LoggInn" });
});

app.get("/NyBruker", (req, res) => {
  res.render("NyBruker.ejs", { title: "NyBruker" });
});

app.get("/Products", (req, res) => {
  res.render("Products.ejs", { title: "Products", prod: topSolgte });
});

//Playstation
app.get("/Playstation", (req, res) => {

    const playstation = [];
    topSolgte.forEach(doc => {
      if (doc.type == "Playstation") {
          playstation.push(doc);
      }
    });
    
  res.render("Playstation.ejs", { title: "Playstation", playstation: playstation });
});

app.post("/Playstation", (req, res) => {
    console.log(req.body)
})

//Xbox
app.get("/Xbox", (req, res) => {

    const xbox = [];
    topSolgte.forEach(doc => {
        if (doc.type == "Xbox") {
            xbox.push(doc);
        }
    });

  res.render("Xbox.ejs", { title: "Xbox", xbox: xbox });
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
  
res.render("Nintendo.ejs", { title: "Nintendo", nintendo: nintendo });
});

app.post("/Nintendo", (req, res) => {
  console.log(req.body)
})

//Sega
app.get("/Sega", (req, res) => {

  const sega = [];
  topSolgte.forEach(doc => {
    if (doc.type == "Sega") {
        sega.push(doc);
    }
  });
  
res.render("Sega.ejs", { title: "Sega", sega: sega });
});

app.post("/Sega", (req, res) => {
  console.log(req.body)
})

 