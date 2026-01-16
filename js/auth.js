import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const loginForm = document.getElementById('loginForm');

// Check of iemand al is ingelogd
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Stuur door naar driver dashboard (of admin als je dat inbouwt)
        window.location.href = "driver.html";
    }
});

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                window.location.href = "driver.html";
            })
            .catch((error) => {
                alert("Fout bij inloggen: " + error.message);
            });
    });
}
