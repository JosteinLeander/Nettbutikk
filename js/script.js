//console.log("Hellow wolrd")
const modal = document.getElementById("myModal");
const btn = document.getElementById("myBtn");
const span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}
span.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

document.getElementById("PSbutton").onclick = function () {
  location.href = "/html/Playstation.html";
};

document.getElementById("Sbutton").onclick = function () {
  location.href = "/html/Sega.html";
};

document.getElementById("Nbutton").onclick = function () {
  location.href = "/html/Nintendo.html";
};

document.getElementById("Xbutton").onclick = function () {
  location.href = "/html/Xbox.html";
};

document.getElementById("PS1button").onclick = function () {
  location.href = "/html/Playstation.html";
};
