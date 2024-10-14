// Your code here
// Load movie data 
document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:3000/films/1")
        .then(response => response.json())
        .then(movie => renderMovieDetails(movie));

    fetch("http://localhost:3000/films")
        .then(response => response.json())
        .then(movies => renderFilmList(movies));
});

// Render movie details
function renderMovieDetails(movie) {
    const availableTickets = movie.capacity - movie.tickets_sold;

    document.getElementById("poster").src = movie.poster;
    document.getElementById("title").textContent = movie.title;
    document.getElementById("runtime").textContent = `${movie.runtime} minutes`;
    document.getElementById("film-info").textContent = movie.description;
    document.getElementById("showtime").textContent = movie.showtime;
    document.getElementById("ticket-num").textContent = availableTickets;

    const buyTicketButton = document.getElementById("buy-ticket");
    buyTicketButton.disabled = availableTickets <= 0;

    // Attach event listener for the Buy Ticket button
    buyTicketButton.onclick = () => {
        if (availableTickets > 0) {
            buyTicket(movie.id, availableTickets);
        }
    };
}

// Render the list of films
function renderFilmList(movies) {
    const filmsList = document.getElementById("films");
    filmsList.innerHTML = movies.map(movie => 
        `<li class="film item" id="film-${movie.id}">
            ${movie.title} 
            <button class="delete-btn" data-id="${movie.id}">Delete</button>
        </li>`).join("");

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.onclick = () => deleteFilm(button.dataset.id);
    });

    // Allow clicking on a movie title to show details
    filmsList.querySelectorAll(".film.item").forEach(item => {
        item.onclick = () => fetchMovieDetails(item.id.split('-')[1]);
    });
}

// Buy a ticket for a movie
function buyTicket(filmId, availableTickets) {
    fetch(`http://localhost:3000/films/${filmId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tickets_sold: availableTickets + 1
        })
    })
    .then(response => response.json())
    .then(updatedFilm => {
        renderMovieDetails(updatedFilm); 
        // Check if sold out 
        if (updatedFilm.tickets_sold >= updatedFilm.capacity) {
            const filmItem = document.querySelector(`#film-${filmId}`);
            filmItem.classList.add("sold-out");
            document.getElementById("buy-ticket").textContent = "Sold Out";
        }
    });

    // Add ticket entry to the tickets endpoint
    fetch("http://localhost:3000/tickets", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            film_id: filmId,
            number_of_tickets: 1
        })
    });
}

// Delete a film 
function deleteFilm(filmId) {
    fetch(`http://localhost:3000/films/${filmId}`, {
        method: 'DELETE'
    })
    .then(() => {
        const filmItem = document.querySelector(`#film-${filmId}`);
        filmItem.remove();
    });
}

// Fetch and display details of a selected movie
function fetchMovieDetails(filmId) {
    fetch(`http://localhost:3000/films/${filmId}`)
        .then(response => response.json())
        .then(movie => renderMovieDetails(movie));
}
