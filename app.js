// Keys for localStorage
const STORAGE_KEYS = {
  accounts: "et_accounts",
  categories: "et_categories",
  expenses: "et_expenses"
};

let accounts = [];
let categories = [];
let expenses = [];

// DOM references
const accountListEl = document.getElementById("account-list");
const categoryListEl = document.getElementById("category-list");
const accountSelectEl = document.getElementById("expense-account");
const categorySelectEl = document.getElementById("expense-category");
const expenseTableBodyEl = document.getElementById("expense-table-body");

const newAccountInput = document.getElementById("new-account");
const newCategoryInput = document.getElementById("new-category");

const addAccountBtn = document.getElementById("add-account-btn");
const addCategoryBtn = document.getElementById("add-category-btn");

const expenseForm = document.getElementById("expense-form");
const expenseDateInput = document.getElementById("expense-date");
const expenseDescInput = document.getElementById("expense-desc");
const expenseAmountInput = document.getElementById("expense-amount");

// Helpers for localStorage
function loadFromStorage() {
  accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.accounts) || "[]");
  categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.categories) || "[]");
  expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.expenses) || "[]");

  // Default values if empty
  if (accounts.length === 0) {
    accounts = ["Cash", "Credit Card"];
  }
  if (categories.length === 0) {
    categories = ["Food", "Transport", "Entertainment"];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
}

// Render functions
function renderAccounts() {
  accountListEl.innerHTML = "";
  accountSelectEl.innerHTML = "";

  accounts.forEach((acc, idx) => {
    const li = document.createElement("li");
    li.textContent = acc;

    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.className = "chip-delete";
    btn.onclick = () => {
      accounts.splice(idx, 1);
      // Also remove expenses that use this account if you want
      saveToStorage();
      renderAccounts();
      renderExpenses();
    };

    li.appendChild(btn);
    accountListEl.appendChild(li);

    const option = document.createElement("option");
    option.value = acc;
    option.textContent = acc;
    accountSelectEl.appendChild(option);
  });
}

function renderCategories() {
  categoryListEl.innerHTML = "";
  categorySelectEl.innerHTML = "";

  categories.forEach((cat, idx) => {
    const li = document.createElement("li");
    li.textContent = cat;

    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.className = "chip-delete";
    btn.onclick = () => {
      categories.splice(idx, 1);
      // Also remove expenses that use this category if you want
      saveToStorage();
      renderCategories();
      renderExpenses();
    };

    li.appendChild(btn);
    categoryListEl.appendChild(li);

    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelectEl.appendChild(option);
  });
}

function renderExpenses() {
  expenseTableBodyEl.innerHTML = "";

  expenses.forEach((exp, idx) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.desc}</td>
      <td>${exp.account}</td>
      <td>${exp.category}</td>
      <td>${exp.amount.toFixed(2)}</td>
      <td></td>
    `;

    const deleteCell = tr.lastElementChild;
    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.className = "delete-btn";
    btn.onclick = () => {
      expenses.splice(idx, 1);
      saveToStorage();
      renderExpenses();
    };
    deleteCell.appendChild(btn);

    expenseTableBodyEl.appendChild(tr);
  });
}

// Event handlers
addAccountBtn.addEventListener("click", () => {
  const name = newAccountInput.value.trim();
  if (!name || accounts.includes(name)) return;
  accounts.push(name);
  newAccountInput.value = "";
  saveToStorage();
  renderAccounts();
});

addCategoryBtn.addEventListener("click", () => {
  const name = newCategoryInput.value.trim();
  if (!name || categories.includes(name)) return;
  categories.push(name);
  newCategoryInput.value = "";
  saveToStorage();
  renderCategories();
});

expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const exp = {
    date: expenseDateInput.value || new Date().toISOString().slice(0, 10),
    desc: expenseDescInput.value.trim(),
    account: accountSelectEl.value,
    category: categorySelectEl.value,
    amount: parseFloat(expenseAmountInput.value) || 0
  };

  if (!exp.desc || !exp.account || !exp.category) return;

  expenses.push(exp);
  saveToStorage();
  renderExpenses();

  expenseDescInput.value = "";
  expenseAmountInput.value = "";
});

// Initialise
loadFromStorage();
renderAccounts();
renderCategories();
renderExpenses();
