export function checkForIndexedDb() {
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
    return false;
  }
  return true;
}

const request = window.indexedDB.open("budget", 1);
let db, tx, store;

request.onupgradeneeded = function (e) {
  const db = request.result;
  db.createObjectStore("transactions", { autoIncrement: true });
};

request.onerror = function (e) {
  console.log("There was an error");
};

function checkBudgetDB() {
  tx = db.transaction(["transactions"], "readwrite");
  store = tx.objectStore("transactions");
  const all = store.getAll();
  console.log(all);
  all.onsuccess = async function () {
    try {
      const response = await fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(all.results),
        header: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
      });
      await response.json();
      const tx = db.transaction(["transactions"], "readwrite");
      const store = tx.objectStore("transactions");
      store.clear();
    } catch (e) {
      console.log(e);
    }
  };
  tx.oncomplete = function () {
    db.close();
  };
}

request.onsuccess = function (e) {
  console.log("success");
  db = e.target.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    console.log("Backend online! 🗄️");
    checkBudgetDB();
  }
};

const saveRecord = (record) => {
  console.log("Save record invoked");

  const transaction = db.transaction(["transactions"], "readwrite");

  const store = transaction.objectStore("transactions");

  store.add(record);
};

window.addEventListener("online", checkBudgetDB);
