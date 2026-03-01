const correctPassword = "1234"; // CHANGE THIS

document.addEventListener("DOMContentLoaded", loadGallery);

function uploadFile() {
  const password = document.getElementById("password").value;
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Select a file first.");
    return;
  }

  if (password !== correctPassword) {
    alert("Wrong password!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const fileData = {
      name: removeExtension(file.name), // remove .jpg etc
      type: file.type,
      data: e.target.result,
      link: ""
    };

    saveToLocalStorage(fileData);
    addCard(fileData);
    fileInput.value = "";
  };

  reader.readAsDataURL(file);
}

function removeExtension(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}

function saveToLocalStorage(fileData) {
  let files = JSON.parse(localStorage.getItem("files")) || [];
  files.push(fileData);
  localStorage.setItem("files", JSON.stringify(files));
}

function loadGallery() {
  let files = JSON.parse(localStorage.getItem("files")) || [];
  files.forEach(file => addCard(file));
}

function addCard(fileData) {
  const gallery = document.getElementById("gallery");

  const card = document.createElement("div");
  card.className = "card";

  // 🏷 Title (no extension)
  const title = document.createElement("div");
  title.className = "card-title";
  title.innerText = fileData.name;
  card.appendChild(title);

  // Image Preview
  if (fileData.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = fileData.data;
    card.appendChild(img);
  }

  // 🔴 View Button
  const viewBtn = document.createElement("button");
  viewBtn.innerText = "View";
  viewBtn.className = "view-btn";

  viewBtn.onclick = function() {
    if (fileData.link) {
      window.open(fileData.link, "_blank");
    } else {
      alert("No link set for this file.");
    }
  };

  // 🔗 Custom Link Input (locked by default)
  const linkInput = document.createElement("input");
  linkInput.className = "link-input";
  linkInput.placeholder = "Custom link (password required)";
  linkInput.value = fileData.link;
  linkInput.disabled = true;

  // Unlock only with password
  linkInput.addEventListener("click", function() {
    const password = prompt("Enter password to edit link:");
    if (password === correctPassword) {
      linkInput.disabled = false;
      linkInput.focus();
    } else {
      alert("Wrong password!");
    }
  });

  // Save link
  linkInput.addEventListener("change", function() {
    fileData.link = linkInput.value;
    updateLocalStorage();
  });

  card.appendChild(viewBtn);
  card.appendChild(linkInput);
  gallery.appendChild(card);
}

function updateLocalStorage() {
  const cards = document.querySelectorAll(".card");
  let files = JSON.parse(localStorage.getItem("files")) || [];

  cards.forEach((card, index) => {
    const input = card.querySelector(".link-input");
    files[index].link = input.value;
  });

  localStorage.setItem("files", JSON.stringify(files));
}
