const socket = io();

// Initialize the map
const map = L.map('map').setView([0, 0], 10);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', { foo: 'bar', attribution: 'hii' }).addTo(map);

// Store markers for each user
const markers = {};

// Handle initial list of connected users
socket.on("initial-users", (users) => {
    for (const [id, data] of Object.entries(users)) {
        const { latitude, longitude } = data;
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle new location updates
socket.on("recive-location", (data) => {
    const { id, latitude, longitude } = data;
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle user disconnection
socket.on("user-dissconenct", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

// Send user's location to the server
if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('send-location', { latitude, longitude });
    }, (error) => {
        console.error(error);
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    });
}// Handle initial list of connected users
socket.on("initial-users", (users) => {
    console.log("Received initial users:", users);
    for (const [id, data] of Object.entries(users)) {
        const { latitude, longitude } = data;
        console.log(`Adding marker for user ${id} at (${latitude}, ${longitude})`);
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});// Send user's location to the server
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Sending location: (${latitude}, ${longitude})`);
            socket.emit('send-location', { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}// Handle new location updates
socket.on("recive-location", (data) => {
    const { id, latitude, longitude } = data;
    console.log(`Received location update for user ${id}: (${latitude}, ${longitude})`);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        console.log(`Adding new marker for user ${id}`);
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});// Handle user disconnection
socket.on("user-dissconenct", (id) => {
    console.log(`User  ${id} disconnected`);
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});