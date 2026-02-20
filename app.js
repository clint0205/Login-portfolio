import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  getFirestore, 
  setDoc, 
  doc, 
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBj3fgIQ6YA0ObelifTIjfPxsCLKYIrFnk",
  authDomain: "clint-cd854.firebaseapp.com",
  projectId: "clint-cd854",
  storageBucket: "clint-cd854.firebasestorage.app",
  messagingSenderId: "617260247227",
  appId: "1:617260247227:web:c7a75d47b3a74db3c2e19e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ================== REGISTER ==================
window.register = async function() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save additional data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email
    });

    alert("Registration Successful!");
    window.location.href = "index.html";

  } catch (error) {
    alert(error.message);
  }
}

// ================== LOGIN ==================
window.login = async function() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
  }
}

// ================== LOGOUT ==================
window.logout = async function() {
  await signOut(auth);
  window.location.href = "index.html";
}

// ================== PROTECT DASHBOARD ==================
onAuthStateChanged(auth, async (user) => {
  if (window.location.pathname.includes("dashboard.html")) {
    if (user) {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        document.getElementById("welcome").innerText =
          "Welcome " + docSnap.data().name;
      }
    } else {
      window.location.href = "index.html";
    }
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.sidenav a[data-target]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      document.querySelectorAll('.content > section').forEach(s => s.style.display = 'none');
      const el = document.getElementById(target);
      if (el) el.style.display = '';
    });
  });

 
  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const nameEl = document.getElementById('profileName');
        const roleEl = document.getElementById('profileRole');
        const imgEl = document.getElementById('profileImageLarge');
        if (nameEl && data.name) nameEl.textContent = data.name;
        if (roleEl && data.role) roleEl.textContent = data.role;
        if (imgEl && data.photoURL) imgEl.src = data.photoURL;
      }
    } catch (err) {
      console.warn('Could not load profile:', err);
    }
  };

  loadProfile();
  
 
  const asideAvatar = document.querySelector('.contacts .profile-photo');
  if (asideAvatar) {
    asideAvatar.addEventListener('click', (e) => {
   
      document.querySelectorAll('.content > section').forEach(s => s.style.display = 'none');
      const pv = document.getElementById('profileView');
      if (pv) pv.style.display = '';
     
    });
  }

  // Contact form handlers (sends message to Firestore)
  const contactBtn = document.getElementById('contactBtn');
  const contactForm = document.getElementById('contactForm');
  const contactCancel = document.getElementById('contactCancel');
  const contactSubmit = document.getElementById('contactSubmit');
  const contactStatus = document.getElementById('contactStatus');

  if (contactBtn && contactForm) {
    contactBtn.addEventListener('click', (e) => {
      contactForm.style.display = '';
    });
  }
  if (contactCancel && contactForm) {
    contactCancel.addEventListener('click', (e) => {
      e.preventDefault();
      contactForm.style.display = 'none';
      if (contactStatus) { contactStatus.style.display = 'none'; contactStatus.textContent = ''; }
    });
  }

  if (contactSubmit) {
    contactSubmit.addEventListener('click', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value || 'Anonymous';
      const email = document.getElementById('contactEmail').value || '';
      const message = document.getElementById('contactMessage').value || '';
      if (!message.trim()) {
        if (contactStatus) { contactStatus.style.display = ''; contactStatus.textContent = 'Please enter a message.'; }
        return;
      }

      try {
        await addDoc(collection(db, 'messages'), {
          senderName: name,
          senderEmail: email,
          message: message,
          toProfile: document.getElementById('profileName') ? document.getElementById('profileName').textContent : 'unknown',
          uid: auth.currentUser ? auth.currentUser.uid : null,
          createdAt: serverTimestamp()
        });
        if (contactStatus) { contactStatus.style.display = ''; contactStatus.textContent = 'Message sent — thank you!'; }
        // clear fields
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactMessage').value = '';
        // Optionally hide form after send
        setTimeout(() => { if (contactForm) contactForm.style.display = 'none'; if (contactStatus) contactStatus.style.display='none'; }, 1800);
      } catch (err) {
        console.error('Failed to send message', err);
        if (contactStatus) { contactStatus.style.display = ''; contactStatus.textContent = 'Failed to send message. Try again.'; }
      }
    });
  }


});