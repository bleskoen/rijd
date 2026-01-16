// Init Firebase (zelfde config als app.js)
const db = firebase.firestore();

const tabel = document.getElementById('rittenTabel');

db.collection("ritten").orderBy("startTijd", "desc").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        const rit = doc.data();
        
        // Bereken duur
        let duur = "Nog bezig";
        if(rit.eindTijd) {
            const diffMs = rit.eindTijd.toDate() - rit.startTijd.toDate();
            duur = Math.round(((diffMs % 86400000) % 3600000) / 60000) + " min";
        }

        const row = `<tr>
            <td>${rit.bestuurder}</td>
            <td>${rit.type}</td>
            <td>${rit.startTijd.toDate().toLocaleDateString()}</td>
            <td>${rit.kilometers ? rit.kilometers.toFixed(2) : 0}</td>
            <td>${duur}</td>
        </tr>`;
        
        tabel.innerHTML += row;
    });
});
