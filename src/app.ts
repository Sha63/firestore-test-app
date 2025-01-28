import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, getDocs, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC9gcyOwqrZRhwyW0aDM4rv_m_F10zMDG4",
    authDomain: "basic-project-b7079.firebaseapp.com",
    projectId: "basic-project-b7079",
    storageBucket: "basic-project-b7079.firebasestorage.app",
    messagingSenderId: "919982133487",
    appId: "1:919982133487:web:fd5fb4cbeabc5b1ef2cb1a"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();
const provider = new GoogleAuthProvider();
const firestore = getFirestore();
const products = collection(firestore, "products");

function addAction() {
  const product = getNewProduct();
  addNewProduct(product);
}

async function addNewProduct(product) {
  await addDoc(products, product);
  refreshTable();
}

function getNewProduct() {
  return {
    productId: document.getElementById("productId")?.value,
    productName: document.getElementById("productName")?.value,
    productQuantity: document.getElementById("productQuantity")?.value,
    productPrice: document.getElementById("productPrice")?.value
  };
}

async function updateAction() {
  const productDocId = document.getElementById('productDocId')?.value;
  if(productDocId) {
    const product = getNewProduct();
    const productDoc = doc(products, productDocId);
    await setDoc(productDoc, product, {merge: true});
  }
  refreshTable();
}

async function deleteAction() {
  const productDocId = document.getElementById('productDocId')?.value;
  if(productDocId) {
    const productDoc = doc(products, productDocId);
    await deleteDoc(productDoc);
  }
  refreshTable();
}

async function refreshTable() {
  try {
    const productQuery = query(products, orderBy('productId'));
    const productsList = await getDocs(productQuery);
    const table = document.getElementById("productsTable");
    const tbody = table.querySelector("tbody");
    if (tbody) {
      tbody.innerHTML = '';
      let counter = 1;
      productsList.forEach((productSnapshot) => {
        const product = productSnapshot.data();
        const row = tbody.insertRow();
        row.setAttribute("data-bs-toggle", "modal");
        row.setAttribute("data-bs-target", "#productModal");
        const counterCell = row.insertCell();
        counterCell.scope = "row";
        counterCell.textContent = "" + counter;
        const productIdCell = row.insertCell();
        productIdCell.textContent = product.productId;
        const productNameCell = row.insertCell();
        productNameCell.textContent = product.productName;
        const productQuantityCell = row.insertCell();
        productQuantityCell.textContent = product.productQuantity;
        const productPriceCell = row.insertCell();
        productPriceCell.textContent = product.productPrice;
        const hiddenCell = row.insertCell();
        hiddenCell.className = 'd-none';
        hiddenCell.textContent = productSnapshot.id;
        counter++;
      });
    }
  } catch(error) {
    console.log(error);
    window.location.href = 'http://localhost:3000/login';
  }
}

function changeState(event) {
  console.log(event);
  if(event.relatedTarget.tagName === "BUTTON") {
    setupAddModal();
  } else {
    setupEditModal(event.relatedTarget);
  }
}

function setupAddModal() {
  document.getElementById('productModal')?.setAttribute("aria-labelledby", "addModalTitle");
  document.getElementById('addModalTitle')?.classList.remove('d-none');
  document.getElementById('editModalTitle')?.classList.add('d-none');
  document.getElementById('add')?.classList.remove('d-none');
  document.getElementById('edit')?.classList.add('d-none');
  document.getElementById('delete')?.classList.add('d-none');
  document.getElementById('productId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productQuantity').value = '';
  document.getElementById('productPrice').value = '';
}

function setupEditModal(productRow) {
  document.getElementById('productModal')?.setAttribute("aria-labelledby", "editModalTitle");
  document.getElementById('addModalTitle')?.classList.add('d-none');
  document.getElementById('editModalTitle')?.classList.remove('d-none');
  document.getElementById('add')?.classList.add('d-none');
  document.getElementById('edit')?.classList.remove('d-none');
  document.getElementById('delete')?.classList.remove('d-none');
  document.getElementById('productId').value = productRow.cells[1].textContent;
  document.getElementById('productName').value = productRow.cells[2].textContent;
  document.getElementById('productQuantity').value = productRow.cells[3].textContent;
  document.getElementById('productPrice').value = productRow.cells[4].textContent;
  document.getElementById('productDocId').value = productRow.cells[5].textContent;
}

function loginAction() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          console.log(user);
      })
      .catch((error) => {
          console.log(error);
  });
}

function showApp() {
  document.getElementById('appPage')?.classList.remove('d-none');
  document.getElementById('appNav')?.classList.remove('d-none');
  document.getElementById('loginPage')?.classList.add('d-none');
  setupAddModal();
  refreshTable();
}

function showLogin() {
  document.getElementById('appPage')?.classList.add('d-none');
  document.getElementById('appNav')?.classList.add('d-none');
  document.getElementById('loginPage')?.classList.remove('d-none');
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
}

onAuthStateChanged(auth, user => {
  if(user) {
    showApp();
  } else {
    showLogin();
  }
});

function logoutAction() {
  signOut(auth);
}

function signInWithGoogleAction() {
  signInWithPopup(auth, provider)
  .then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    console.log(credential);
    const token = credential.accessToken;
    console.log(token);
    const user = result.user;
    console.log(user);
  }).catch((error) => {
    console.log(error);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const signInWithGoogleBtn = document.getElementById('signInWithGoogle');
  if(signInWithGoogleBtn)
    signInWithGoogleBtn.addEventListener('click', signInWithGoogleAction);
  const loginBtn = document.getElementById('login');
    if(loginBtn)
      loginBtn.addEventListener('click', loginAction);
    const logoutBtn = document.getElementById('logout');
      if(logoutBtn)
        logoutBtn.addEventListener('click', logoutAction);
  const productModal = document.getElementById('productModal');
  productModal?.addEventListener('show.bs.modal', changeState);
  const addBtn = document.getElementById('add');
  if(addBtn)
    addBtn.addEventListener('click', addAction);
  const editBtn = document.getElementById('edit');
  if(editBtn)
    editBtn.addEventListener('click', updateAction);
  const deleteBtn = document.getElementById('delete');
  if(deleteBtn)
    deleteBtn.addEventListener('click', deleteAction);
});