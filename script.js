const correctPassword = "1234"; // CHANGE THIS
const cardsPerPage = 50;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", renderPage);

// --- UPLOAD FILE ---
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
      name: removeExtension(file.name),
      type: file.type,
      data: e.target.result,
      link: ""
    };

    let files = getFiles();
    files.push(fileData);
    localStorage.setItem("files", JSON.stringify(files));

    currentPage = Math.ceil(files.length / cardsPerPage);
    renderPage();
    fileInput.value = "";
  };

  reader.readAsDataURL(file);
}

function removeExtension(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}

function getFiles() {
  return JSON.parse(localStorage.getItem("files")) || [];
}

// --- RENDER PAGE ---
function renderPage() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  let files = getFiles();
  const start = (currentPage - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const pageFiles = files.slice(start, end);

  // real cards
  pageFiles.forEach(file => addCard(file));

  // fill empty cards
  const remaining = cardsPerPage - pageFiles.length;
  for (let i = 0; i < remaining; i++) {
    const emptyCard = document.createElement("div");
    emptyCard.className = "card empty-card";
    gallery.appendChild(emptyCard);
  }

  renderPagination(files.length);
}

// --- ADD CARD ---
function addCard(fileData) {
  const gallery = document.getElementById("gallery");

  const card = document.createElement("div");
  card.className = "card";

  // TITLE
  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = fileData.name;
  card.appendChild(title);

  // IMAGE
  if (fileData.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = fileData.data;
    card.appendChild(img);
  }

  // LINK CONTAINER
  const linkContainer = document.createElement("div");
  linkContainer.style.marginTop = "8px";

  // VIEW BUTTON
  const viewBtn = document.createElement("button");
  viewBtn.innerText = "View";
  viewBtn.className = "view-btn";
  viewBtn.onclick = function() {
    linkContainer.innerHTML = "";

    const enteredPassword = prompt("Enter password:");

    if (enteredPassword === correctPassword) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "link-input";
      input.value = fileData.link;
      input.placeholder = "Enter or edit link";

      input.addEventListener("blur", function() {
        fileData.link = input.value;
        updateLink(fileData, input.value);
      });

      linkContainer.appendChild(input);
    } else {
      const text = document.createElement("div");
      text.style.fontSize = "12px";
      text.style.wordBreak = "break-word";
      text.style.color = "#aaa";
      text.textContent = fileData.link
        ? fileData.link
        : "No link set by owner.";
      linkContainer.appendChild(text);
    }
  };

  card.appendChild(viewBtn);
  card.appendChild(linkContainer);

  // DELETE BUTTON
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Delete";
  deleteBtn.className = "delete-btn";

  deleteBtn.onclick = function() {
    const enteredPassword = prompt("Enter password to delete:");

    if (enteredPassword === correctPassword) {
      deleteCard(fileData);
      renderPage();
    } else {
      alert("Wrong password! Cannot delete.");
    }
  };

  card.appendChild(deleteBtn);

  gallery.appendChild(card);
}

// --- UPDATE LINK ---
function updateLink(fileData, newLink) {
  let files = getFiles();
  const index = files.findIndex(f => f.data === fileData.data);
  if (index !== -1) {
    files[index].link = newLink;
    localStorage.setItem("files", JSON.stringify(files));
  }
}

// --- DELETE CARD ---
function deleteCard(fileData) {
  let files = getFiles();
  files = files.filter(f => f.data !== fileData.data);
  localStorage.setItem("files", JSON.stringify(files));
}

// --- PAGINATION ---
function renderPagination(totalCards) {
  let totalPages = Math.ceil(totalCards / cardsPerPage);
  let pagination = document.querySelector(".pagination");

  if (!pagination) {
    pagination = document.createElement("div");
    pagination.className = "pagination";
    document.body.appendChild(pagination);
  }

  pagination.innerHTML = "";

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.innerText = "Prev";
    prevBtn.className = "page-btn";
    prevBtn.onclick = function() {
      currentPage--;
      renderPage();
    };
    pagination.appendChild(prevBtn);
  }

  const pageInfo = document.createElement("span");
  pageInfo.innerText = ` Page ${currentPage} of ${totalPages} `;
  pagination.appendChild(pageInfo);

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Next";
    nextBtn.className = "page-btn";
    nextBtn.onclick = function() {
      currentPage++;
      renderPage();
    };
    pagination.appendChild(nextBtn);
  }
}
