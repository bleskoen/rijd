// js/auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const adminEmail = "bleskoen@gmail.com"; // <--- PAS DIT AAN

// De slimme redirect
onAuthStateChanged(auth, (user) => {
    if (user) {
        // We zijn op de inlogpagina (index.html), stuur door:
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            if (user.email === adminEmail) {
                console.log("Admin herkend, doorsturen...");
                window.location.href = "admin.html";
            } else {
                console.log("Chauffeur herkend, doorsturen...");
                window.location.href = "driver.html";
            }
        }
    }
});

// De login knop logica blijft hetzelfde...
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                alert("Fout bij inloggen: " + error.message);
            });
    });
}
