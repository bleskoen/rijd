import { db, auth } from './firebase-config.js';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

let currentRideId = null;
let watchId = null;
let routeBuffer = [];
let totalDistance = 0;
let wakeLock = null;
let timerInterval;

// Authentication Check
onAuthStateChanged(auth, user => {
    if (!user) window.location.href = "index.html";
    else checkForActiveRide(user.uid); // COMPLEXITEIT: Check of er al een rit bezig is!
});

// 1. Wake Lock (Houd scherm aan)
async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) {
        console.log(`${err.name}, ${err.message}`);
    }
}

// 2. Afstand berekenen (Haversine)
function getDistance(p1, p2) {
    const R = 6371; 
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// 3. Start Rit
document.getElementById('startBtn').addEventListener('click', async () => {
    const type = document.querySelector('input[name="ritType"]:checked').value;
    const user = auth.currentUser;

    if (!navigator.geolocation) return alert("Geen GPS ondersteuning");

    // Maak rit in DB
    const docRef = await addDoc(collection(db, "ritten"), {
        userId: user.uid,
        userEmail: user.email,
        type: type,
        startTime: serverTimestamp(),
        status: "active",
        distance: 0,
        route: []
    });

    currentRideId = docRef.id;
    startTracking();
    updateUI(true);
});

// 4. Stop Rit
document.getElementById('stopBtn').addEventListener('click', async () => {
    if (!currentRideId) return;
    
    navigator.geolocation.clearWatch(watchId);
    clearInterval(timerInterval);
    if (wakeLock) wakeLock.release();

    await updateDoc(doc(db, "ritten", currentRideId), {
        status: "completed",
        endTime: serverTimestamp(),
        distance: totalDistance
    });

    currentRideId = null;
    updateUI(false);
    alert(`Rit gestopt! Totaal: ${totalDistance.toFixed(2)} km`);
});

// 5. Tracking Logica
function startTracking() {
    requestWakeLock();
    startTimer();
    
    const options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };
    
    watchId = navigator.geolocation.watchPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newPoint = { lat, lng, time: new Date().toISOString() };
        
        document.getElementById('gpsStatus').innerText = `GPS Actief: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        // Filter: alleen opslaan als afstand > 10m (voorkomt ruis bij stilstaan)
        if (routeBuffer.length > 0) {
            const lastPoint = routeBuffer[routeBuffer.length - 1];
            const dist = getDistance(lastPoint, newPoint);
            
            if (dist < 0.010) return; // Minder dan 10 meter? Negeer.
            
            totalDistance += dist;
            document.getElementById('kmDisplay').innerText = totalDistance.toFixed(2);
        }

        routeBuffer.push(newPoint);

        // Update DB elke update (of buffer dit voor performance in grote apps)
        if (currentRideId) {
            await updateDoc(doc(db, "ritten", currentRideId), {
                route: routeBuffer,
                distance: totalDistance
            });
        }
    }, (err) => console.error(err), options);
}

// 6. UI Helpers
function updateUI(isActive) {
    document.getElementById('startBtn').classList.toggle('d-none', isActive);
    document.getElementById('stopBtn').classList.toggle('d-none', !isActive);
}

function startTimer() {
    let seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        const date = new Date(0);
        date.setSeconds(seconds);
        document.getElementById('timerDisplay').innerText = date.toISOString().substr(11, 8);
    }, 1000);
}

// 7. Check for active ride (Resuming functionality)
async function checkForActiveRide(userId) {
    const q = query(collection(db, "ritten"), where("userId", "==", userId), where("status", "==", "active"));
    
    // Luister live naar wijzigingen
    onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();
            currentRideId = doc.id;
            routeBuffer = data.route || [];
            totalDistance = data.distance || 0;
            
            // Als we nog niet aan het tracken waren, start tracking
            if (!watchId) {
                startTracking();
                updateUI(true);
            }
        }
    });
}

// Uitloggen
document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
