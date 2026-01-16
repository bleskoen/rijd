import { db, auth } from './firebase-config.js';
// ... andere imports ...
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const adminEmail = "bleskoen@gmail.com"; // <--- Zelfde email als hierboven

onAuthStateChanged(auth, user => {
    if (!user) {
        // Niet ingelogd? Terug naar start
        window.location.href = "index.html";
    } else if (user.email !== adminEmail) {
        // Wel ingelogd, maar geen admin? Terug naar chauffeur pagina
        alert("Geen toegang! U wordt teruggestuurd.");
        window.location.href = "driver.html";
    }
    // Als we hier komen, is het de admin. De rest van het script mag draaien.
import { db, auth } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

onAuthStateChanged(auth, user => {
    if (!user) window.location.href = "index.html";
});

// Map Setup
const map = L.map('map').setView([52.1, 5.1], 7);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let routeLayer = L.layerGroup().addTo(map);

// Data ophalen (Realtime!)
const q = query(collection(db, "ritten"), orderBy("startTime", "desc"));
const tableBody = document.getElementById('ridesTable');

onSnapshot(q, (snapshot) => {
    tableBody.innerHTML = "";
    snapshot.forEach(docSnap => {
        const rit = docSnap.data();
        const row = document.createElement('tr');
        
        const date = rit.startTime ? new Date(rit.startTime.seconds * 1000).toLocaleDateString() : '-';
        
        row.innerHTML = `
            <td>${rit.userEmail}</td>
            <td><span class="status-badge ${rit.type}">${rit.type}</span></td>
            <td>${date}</td>
            <td>${rit.distance.toFixed(2)} km</td>
            <td><button class="btn btn-sm btn-primary view-btn">Kaart</button></td>
        `;

        // Click handler voor de kaart
        row.querySelector('.view-btn').addEventListener('click', () => showRouteOnMap(rit));
        tableBody.appendChild(row);
    });
});

function showRouteOnMap(rit) {
    routeLayer.clearLayers();
    if (!rit.route || rit.route.length === 0) return alert("Geen GPS data.");

    const latlngs = rit.route.map(p => [p.lat, p.lng]);
    const polyline = L.polyline(latlngs, {color: 'blue', weight: 4}).addTo(routeLayer);
    
    // Markers voor start en eind
    L.marker(latlngs[0]).addTo(routeLayer).bindPopup("Start");
    L.marker(latlngs[latlngs.length - 1]).addTo(routeLayer).bindPopup("Eind");

    map.fitBounds(polyline.getBounds());
    document.getElementById('routeInfo').innerText = `Rit van ${rit.distance.toFixed(2)}km geselecteerd.`;
}

document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
