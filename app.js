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
  getDoc, updateDoc, getDocs, enableNetwork, setDoc, QuerySnapshot
} = require('firebase/firestore');

// Firebase Auth
const {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  prodErrorMap
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
const orderRef = collection(db, 'order');
const roleRef = collection(db, 'rolle');

// Laget en bruker som er innloggings bruker og som jeg sender til view filene
let bruker = "";

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    bruker = user.email;
  } else {
    console.log("Bruker logget ut");
  }
});

// Funksjon som kalles fra de forskjellige mulighetene for å legge til produkter i handlekurv
// Laget denne for å redusere koden
const leggTilProd = (req) => {
  let prod = req.body;
  prod.user = bruker;

  addDoc(orderRef, prod)
    .then((docRef) => {
      console.log("Data lagt til");
    })
    .catch((err) => {
      console.log("Klarte ikke å lagre...");
      console.log(err);
    })
};

// Finner alle admin brukere
let role = [];
const qRole = query(roleRef, orderBy('admin'));
onSnapshot(qRole, (snapshot) => {
  snapshot.docs.forEach(doc => {
    role.push({ ...doc.data(), id: doc.id});
  });
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
};

//Sider
app.get("/", (req, res) => {
  res.render("index.ejs", { title: "Home", topSolgte: topSolgte, user: bruker });
});

// Logg ut
app.get("/LoggUt", (req, res) => {
  bruker = "";
  signOut(auth);
  res.redirect("/");
});

// Logg inn
app.get("/LoggInn", (req, res) => {
  res.render("LoggInn.ejs", { title: "LoggInn", user: bruker });
});

app.post("/loggInn", (req, res) => {
  const { email, password } = req.body;
  console.log("loggInnBruker", email, password);
  admin = 0; // Brukes for å sjekke om det er admin bruker

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const token = createToken(userCredential.uid);
      res.cookie('jwt', token, {maxAge: maxAge});

      // Sjekker om bruker som logger inn er admin
      role.forEach(doc => {
        if (doc.admin == email) {
          admin = 1;
        }
      });

      if (admin) {
        // Admin Bruker
        res.redirect("/admin")
      } else {
        res.redirect('/');
      }
    })
    .catch((err) => {
      const errorCode = err.code;
      res.render('LoggInn.ejs', { title: "Logg Inn", userError: errorCode, user: bruker });
    });
});

// Legg inn ny bruker
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

// Alle produkter
app.get("/Products", (req, res) => {
  res.render("Products.ejs", { title: "Products", prod: topSolgte, user: bruker });
});

app.post("/Products", (req, res) => {
  if (bruker != '') {
    leggTilProd(req);

    res.render("Products.ejs", { title: "Produkter", prod: topSolgte, user: bruker });
  } else {
    res.redirect('/LoggInn');
  }
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
  if (bruker != '') {
    const playstation = [];
    topSolgte.forEach(doc => {
      if (doc.type == "Playstation") {
        playstation.push(doc);
      }
    });
    leggTilProd(req);
    res.render("Playstation.ejs", { title: "Playstation", playstation: playstation, user: bruker });
  } else {
    res.redirect('/LoggInn');
  }
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
  if (bruker != '') {
    const xbox = [];
    topSolgte.forEach(doc => {
      if (doc.type == "Xbox") {
        xbox.push(doc);
      }
    });
    leggTilProd(req);
    res.render("Xbox.ejs", { title: "Xbox", xbox: xbox, user: bruker });
  } else {
    res.redirect('/LoggInn');
  }
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
  if (bruker != '') {
    const nintendo = [];
    topSolgte.forEach(doc => {
      if (doc.type == "Nintendo") {
        nintendo.push(doc);
      }
    });
    leggTilProd(req);
    res.render("Nintendo.ejs", { title: "Nintendo", nintendo: nintendo, user: bruker });
  } else {
    res.redirect('/LoggInn');
  }
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
  if (bruker != '') {
    const sega = [];
    topSolgte.forEach(doc => {
      if (doc.type == "Sega") {
          sega.push(doc);
      }
    });
    leggTilProd(req);
    res.render("Sega.ejs", { title: "Sega", sega: sega, user: bruker });
  } else {
    res.redirect('/LoggInn');
  }
});

// For å vise handlekurv med produkter og pris
app.get("/order", async (req, res) => {
  if (bruker != '') {
    let order = [];
    const qOrder = query(orderRef, where('user', '==', bruker));
    const querySnapshot = await getDocs(qOrder);

    querySnapshot.forEach((doc) => {
      order.push({ ...doc.data(), id: doc.id});
    })

    let totalPris = 0;
    for (let i = 0; i < order.length; i++) {
      totalPris += Number(order[i].price) * Number(order[i].antall);
    }

    totalPris += 150;
    order.totalPris = totalPris;

    res.render("order.ejs", { title: "Handlekurv", order: order, user: bruker });
  } else {
    res.redirect('/LoggInn');
  }
});

// For å registrere leveranse informasjon og kredittkort og fullføre kjøpet
app.post("/credCard", (req, res) => {
  const shopinfo = req.body;
  console.log("Info ved kjøp:", shopinfo);
  res.redirect("/");
});

// Søk etter produkter fra søkerfelt
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

// Admin side
app.get("/admin", (req, res) => {
  res.render("admin.ejs", { title: "Admin", user: bruker });
});

// Om oss
app.get("/AboutUs", (req, res) => {
  res.render("AboutUs.ejs", { title: "AboutUs", user: bruker });
});