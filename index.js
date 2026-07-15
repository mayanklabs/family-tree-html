// -----------------------------------------------------
// Global Variables
// -----------------------------------------------------

let autoSaveTimer = null;

const AUTO_SAVE_DELAY = 1000;

let observer = null;

let isSaving = false;

let chart = null;

let card = null;

let editor = null;

let familyData = [];

let currentFileHandle = null;

let hasChanges = false;

// -----------------------------------------------------
// Initial Data
// -----------------------------------------------------

familyData = data();

create(familyData);

// -----------------------------------------------------
// Utility
// -----------------------------------------------------

function setStatus(message, color = "#ccc") {
  const status = document.getElementById("status");

  status.textContent = message;

  status.style.color = color;
}

function markChanged() {
  hasChanges = true;

  setStatus("Unsaved Changes", "#ffb300");
}

function markSaved() {
  hasChanges = false;

  setStatus("Saved", "#4caf50");
}

// -----------------------------------------------------
// Download Helper
// -----------------------------------------------------

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 4)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = filename;

  a.click();

  URL.revokeObjectURL(url);
}

// -----------------------------------------------------
// Open Local JSON
// -----------------------------------------------------

async function loadFamily() {
  try {
    if (!window.showOpenFilePicker) {
      alert("Your browser does not support the File System Access API.");

      return;
    }

    const [handle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Family JSON",

          accept: {
            "application/json": [".json"],
          },
        },
      ],

      multiple: false,
    });

    currentFileHandle = handle;

    const file = await handle.getFile();

    const text = await file.text();

    familyData = JSON.parse(text);

    create(familyData);

    startObserver();

    hasChanges = false;

    setStatus("Loaded: " + file.name, "#4caf50");
  } catch (err) {
    console.log(err);
  }
}

// -----------------------------------------------------
// Save Current File
// -----------------------------------------------------

async function saveFamily() {
  if (isSaving) return;

  try {
    if (!currentFileHandle) {
      return saveFamilyAs();
    }

    const writable = await currentFileHandle.createWritable();

    syncFamilyData();

    await writable.write(JSON.stringify(familyData, null, 4));

    await writable.close();

    markSaved();
  } catch (err) {
    console.log(err);

    setStatus("Save Failed", "#f44336");
  } finally {
    isSaving = false;
  }
}

// -----------------------------------------------------
// Save As
// -----------------------------------------------------

async function saveFamilyAs() {
  try {
    if (!window.showSaveFilePicker) {
      downloadJSON("family.json", familyData);

      return;
    }

    currentFileHandle = await window.showSaveFilePicker({
      suggestedName: "family.json",

      types: [
        {
          description: "JSON",

          accept: {
            "application/json": [".json"],
          },
        },
      ],
    });

    await saveFamily();
  } catch (err) {
    console.log(err);
  }
}

// -----------------------------------------------------
// Export
// -----------------------------------------------------

function exportFamily() {
  syncFamilyData();

  downloadJSON("family-export.json", familyData);
}

// -----------------------------------------------------
// New Family
// -----------------------------------------------------

function newFamily() {
  if (hasChanges && !confirm("Discard current changes?")) {
    return;
  }

  familyData = [
    {
      id: "0",
      rels: {},
      data: {
        "first name": "Name",
        "last name": "Surname",
        birthday: 1970,
        avatar:
          "https://static8.depositphotos.com/1009634/988/v/950/depositphotos_9883921-stock-illustration-no-user-profile-picture.jpg",
        gender: "M",
      },
    },
  ];

  currentFileHandle = null;

  create(familyData);

  setStatus("New Family");
}

function create(data) {
  familyData = data;

  document.getElementById("FamilyChart").innerHTML = "";

  chart = f3
    .createChart("#FamilyChart", familyData)
    .setTransitionTime(800)
    .setCardXSpacing(250)
    .setCardYSpacing(150)
    .setSingleParentEmptyCard(true, { label: "ADD" })
    .setShowSiblingsOfMain(true)
    .setOrientationVertical()
    .setAncestryDepth(2)
    .setSortChildrenFunction((a, b) =>
      a.data["birthday"] === b.data["birthday"]
        ? 0
        : a.data["birthday"] > b.data["birthday"]
          ? 1
          : -1,
    );

  card = chart
    .setCardHtml()
    .setCardDisplay([["first name", "last name"], ["birthday"]])
    .setCardDim({})
    .setMiniTree(true)
    .setStyle("imageRect")
    .setOnHoverPathToMain();

  editor = chart
    .editTree()
    .fixed(true)
    .setFields([
      "first name",
      "last name",
      "birthday",
      "occupation",
      "phone",
      "email",
      "avatar",
    ])
    .setEditFirst(false)
    .setCardClickOpen(card);

  editor.setEdit();

  // Detect edits

  document.addEventListener("input", () => {
    markChanged();
  });

  chart.updateTree({
    initial: true,
  });

  editor.open(chart.getMainDatum());

  chart.updateTree({
    initial: true,
  });

  /*
   * Intercept every tree refresh.
   * Every add/edit/delete eventually
   * refreshes the tree.
   */

  const originalUpdateTree = chart.updateTree.bind(chart);

  chart.updateTree = function (...args) {
    const result = originalUpdateTree(...args);

    autoSave();

    return result;
  };

  startObserver();
}

function data() {
  return [
    {
      id: "0",
      rels: {},
      data: {
        "first name": "Name",
        "last name": "Surname",
        birthday: 1970,
        avatar:
          "https://static8.depositphotos.com/1009634/988/v/950/depositphotos_9883921-stock-illustration-no-user-profile-picture.jpg",
        gender: "M",
      },
    },
  ];
}

// -----------------------------------------------------
// Toolbar Buttons
// -----------------------------------------------------

document.getElementById("loadBtn").addEventListener("click", loadFamily);
document.getElementById("saveBtn").addEventListener("click", saveFamily);
document.getElementById("saveAsBtn").addEventListener("click", saveFamilyAs);
document.getElementById("exportBtn").addEventListener("click", exportFamily);
document.getElementById("newBtn").addEventListener("click", newFamily);

// -----------------------------------------------------
// Synchronize Current Tree
// -----------------------------------------------------

function syncFamilyData() {
  try {
    if (!chart) return;

    /*
     * family-chart stores the current edited tree
     * internally. We clone it so that our JSON always
     * reflects the latest state.
     */

    if (chart.store && chart.store.data) {
      familyData = JSON.parse(JSON.stringify(chart.store.data));

      return;
    }

    if (chart.data) {
      familyData = JSON.parse(JSON.stringify(chart.data));

      return;
    }
  } catch (err) {
    console.error(err);
  }
}

// -----------------------------------------------------
// Auto Save
// -----------------------------------------------------

async function autoSave() {
  syncFamilyData();

  markChanged();

  if (currentFileHandle) {
    await saveFamily();
  }
}

// -----------------------------------------------------
// Schedule Auto Save
// -----------------------------------------------------

function scheduleAutoSave() {
  markChanged();

  clearTimeout(autoSaveTimer);

  autoSaveTimer = setTimeout(async () => {
    if (isSaving) return;

    syncFamilyData();

    if (currentFileHandle) {
      isSaving = true;

      try {
        await saveFamily();
      } finally {
        isSaving = false;
      }
    }
  }, AUTO_SAVE_DELAY);
}

// -----------------------------------------------------
// Observe Tree Changes
// -----------------------------------------------------

function startObserver() {
  if (observer) observer.disconnect();

  const container = document.getElementById("FamilyChart");

  observer = new MutationObserver(() => {
    scheduleAutoSave();
  });

  observer.observe(container, {
    childList: true,

    subtree: true,

    attributes: true,

    characterData: true,
  });
}

window.addEventListener("beforeunload", async function (e) {
  if (!hasChanges) return;

  syncFamilyData();

  if (currentFileHandle) {
    try {
      await saveFamily();
    } catch (err) {}
  }

  e.preventDefault();

  e.returnValue = "";
});

// -----------------------------------------------------
// Detect Editor Changes
// -----------------------------------------------------

document.addEventListener("input", function (e) {
  if (
    e.target.matches("input") ||
    e.target.matches("textarea") ||
    e.target.matches("select")
  ) {
    scheduleAutoSave();
  }
});

document.addEventListener("click", function () {
  setTimeout(() => {
    scheduleAutoSave();
  }, 100);
});
