// ---- DOM 元素 ----
const form = document.getElementById("transaction-form");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");

const tbody = document.getElementById("transaction-body");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");

// Firestore collection 名稱，可以改成你喜歡的
const COLLECTION_NAME = "transactions";

// 放在記憶體裡用來渲染畫面的陣列
let transactions = [];

// ---- 工具函式 ----
function formatCurrency(value) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ---- Firestore 讀寫 ----

// 從 Firestore 把全部交易資料讀出來
async function loadTransactions() {
  try {
    // 以日期排序顯示，如果你用字串 yyyy-mm-dd 儲存，orderBy("date") 可以用
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy("date", "asc")
      .get(); // [web:107][web:117][web:113]

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

// 新增一筆交易到 Firestore
async function addTransactionToDb(tx) {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add(tx); // [web:117]
    return docRef.id;
  } catch (error) {
    console.error("Failed to add transaction:", error);
    alert("儲存資料時發生錯誤，請稍後再試。");
    throw error;
  }
}

// 從 Firestore 刪除一筆交易
async func
