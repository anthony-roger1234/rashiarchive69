const correctPassword = "1234"; // change this
const cardsPerPage = 50;
let currentPage = 1;

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

function loadGallery() {
  renderPage();
}

function renderPage() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  let files = getFiles();

  const start = (currentPage - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const pageFiles = files.slice(start, end);

  pageFiles.forEach(file => addCard(file));

  renderPagination(files.length);
}

function addCard(fileData) {
  const gallery = document.getElementById("gallery");

  const card = document.createElement("div");
  card.className = "card";

  const title = document.createElement("div");
  title.className = "card-title";
  title.innerText = fileData.name;
  card.appendChild(title);

  if (fileData.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = fileData.data;
    card.appendChild(img);
  }

  const viewBtn = document.createElement("button");
  viewBtn.innerText = "View";
  viewBtn.className = "view-btn";
  viewBtn.onclick = function() {
    if (fileData.link) {
      window.open(fileData.link, "_blank");
    } else {
      alert("No link set.");
    }
  };

  const linkInput = document.createElement("input");
  linkInput.className = "link-input";
  linkInput.placeholder = "Custom link (password required)";
  linkInput.value = fileData.link;
  linkInput.disabled = true;

  linkInput.addEventListener("click", function() {
    const password = prompt("Enter password to edit link:");
    if (password === correctPassword) {
      linkInput.disabled = false;
      linkInput.focus();
    } else {
      alert("Wrong password!");
    }
  });

  linkInput.addEventListener("change", function() {
    updateLink(fileData, linkInput.value);
  });

  card.appendChild(viewBtn);
  card.appendChild(linkInput);
  gallery.appendChild(card);
}

function updateLink(fileData, newLink) {
  let files = getFiles();
  const index = files.findIndex(f => f.name === fileData.name && f.data === fileData.data);
  if (index !== -1) {
    files[index].link = newLink;
    localStorage.setItem("files", JSON.stringify(files));
  }
}

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
