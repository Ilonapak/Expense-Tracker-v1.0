const STORAGE_KEY = "expense-tracker-transactions";

const form = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");

const tbody = document.getElementById("transaction-body");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");

let transactions = [];

function loadTransactions() {
  const saved = localStorage.getItem(STORAGE_KEY);
  transactions = saved ? JSON.parse(saved) : [];
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(value) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function renderSummary() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

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
    btn.addEventListener("click", () => deleteTransaction(tx.id));
    actionsTd.appendChild(btn);

    tr.appendChild(dateTd);
    tr.appendChild(descTd);
    tr.appendChild(typeTd);
    tr.appendChild(amountTd);
    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  });
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  renderSummary();
  renderTable();
}

form.addEventListener("submit", event => {
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
    id: Date.now(),
    type,
    description,
    amount,
    date
  };

  transactions.push(newTx);
  saveTransactions();
  renderSummary();
  renderTable();

  form.reset();
  typeInput.value = "expense";
});

// Initialize
loadTransactions();
renderSummary();
renderTable();

// Default date = today
dateInput.valueAsDate = new Date();
