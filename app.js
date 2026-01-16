// 1. Initialiseer Firebase (Vervang dit met jouw config van Stap 1)
const firebaseConfig = {
    apiKey: "JOUW_API_KEY",
    authDomain: "JOUW_PROJECT.firebaseapp.com",
    projectId: "JOUW_PROJECT_ID",
    storageBucket: "JOUW_PROJECT_ID.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let watchID;
let currentRitID = null;
let startTime;
let routeCoords = [];
let totalKm = 0;

// Hulpfunctie om afstand te berekenen (Haversine formule)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius aarde in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Start de rit
async function startRit() {
    const type = document.getElementById('ritType').value;
    startTime = new Date();
    routeCoords = [];
    totalKm = 0;

    // Maak een nieuw document in Firestore
    const docRef = await db.collection("ritten").add({
        bestuurder: "Jan Jansen", // Dit zou je normaal uit Firebase Auth halen
        type: type,
        startTijd: startTime,
        status: "onderweg",
        kilometers: 0
    });
    
    currentRitID = docRef.id;

    // UI Update
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;

    // Start GPS Tracking
    if (navigator.geolocation) {
        watchID = navigator.geolocation.watchPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const timestamp = new Date();

            // Voeg toe aan route array
            routeCoords.push({ lat, lng, timestamp });

            // Bereken afstand als er minstens 2 punten zijn
            if (routeCoords.length > 1) {
                const prev = routeCoords[routeCoords.length - 2];
                const dist = calculateDistance(prev.lat, prev.lng, lat, lng);
                totalKm += dist;
                document.getElementById('kmTeller').innerText = totalKm.toFixed(2);
            }

            // Update database elke keer (of buffer dit voor minder schrijfacties)
            db.collection("ritten").doc(currentRitID).update({
                route: routeCoords,
                kilometers: totalKm
            });

        }, error => {
            console.error("GPS Fout:", error);
        }, {
            enableHighAccuracy: true
        });
    }
}

// Stop de rit
function stopRit() {
    if(!currentRitID) return;

    navigator.geolocation.clearWatch(watchID);
    const endTime = new Date();
    
    // Final update naar database
    db.collection("ritten").doc(currentRitID).update({
        eindTijd: endTime,
        status: "voltooid",
        kilometers: totalKm
    });

    // Reset UI
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    alert("Rit opgeslagen! Totaal: " + totalKm.toFixed(2) + " km");
}
