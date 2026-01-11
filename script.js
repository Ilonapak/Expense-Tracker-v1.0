// ===== 取得 DOM 元素 =====
const form = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");

const tbody = document.getElementById("transaction-body");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");

// Firestore collection 名稱
const COLLECTION_NAME = "transactions";

// 暫存在記憶體的資料
let transactions = [];

// ===== 工具函式 =====
function formatCurrency(value) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ===== Firestore 讀寫 =====
async function loadTransactions() {
  try {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy("date", "asc")
      .get();

    transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderSummary();
    renderTable();
  } catch (error) {
    console.error("Failed to load transactions:", error);
    alert("載入資料時發生錯誤，請稍後再試。");
  }
}

async function addTransactionToDb(tx) {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add(tx);
    return docRef.id;
  } catch (error) {
    console.error("Failed to add transaction:", error);
    alert("儲存資料時發生錯誤，請稍後再試。");
    throw error;
  }
}

async function deleteTransactionFromDb(id) {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete();
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    alert("刪除資料時發生錯誤，請稍後再試。");
    throw error;
  }
}

// ===== 畫面渲染 =====
function renderSummary() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expense;

  totalIncomeEl.textContent = formatCurrency(income);
  totalExpenseEl.textContent = formatCurrency(expense);
  balanceEl.textContent = formatCurrency(balance);
}

function renderTable() {
  tbody.innerHTML = "";

  transactions.forEach(tx => {
    const tr = document.createElement("tr");

    const dateTd = document.createElement("td");
    dateTd.textContent = tx.date;

    const descTd = document.createElement("td");
    descTd.textContent = tx.description;

    const typeTd = document.createElement("td");
    typeTd.textContent = tx.type;

    const amountTd = document.createElement("td");
    amountTd.textContent = formatCurrency(tx.amount);
    amountTd.className =
      tx.type === "income" ? "amount-income" : "amount-expense";

    const actionsTd = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.className = "delete-btn";
    btn.addEventListener("click", () => handleDelete(tx.id));
    actionsTd.appendChild(btn);

    tr.appendChild(dateTd);
    tr.appendChild(descTd);
    tr.appendChild(typeTd);
    tr.appendChild(amountTd);
    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  });
}

// ===== 刪除流程 =====
async function handleDelete(id) {
  const ok = confirm("確定要刪除此紀錄嗎？");
  if (!ok) return;

  try {
    await deleteTransactionFromDb(id);
    transactions = transactions.filter(t => t.id !== id);
    renderSummary();
    renderTable();
  } catch (error) {
    // 上面已經有 alert
  }
}

// ===== 表單送出（新增） =====
form.addEventListener("submit", async event => {
  event.preventDefault();

  const type = typeInput.value;
  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;

  if (!description || isNaN(amount) || !date) {
    alert("Please fill in all fields.");
    return;
  }

  const newTx = {
    type,
    description,
    amount,
    date
  };

  try {
    const newId = await addTransactionToDb(newTx);
    transactions.push({ id: newId, ...newTx });
    renderSummary();
    renderTable();

    form.reset();
    typeInput.value = "expense";
    dateInput.valueAsDate = new Date();
  } catch (error) {
    // 上面已經有 alert
  }
});

// ===== 初始化 =====
window.addEventListener("DOMContentLoaded", () => {
  dateInput.valueAsDate = new Date();
  loadTransactions();
});
