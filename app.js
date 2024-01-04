let backdropPath = "https://image.tmdb.org/t/p/original/";
let input = document.querySelector("input");
let showsContainer = document.querySelector("#showsContainer");
let pagesBtnsContainer = document.querySelector("#pagesBtnsContainer");
let filmButton = document.querySelector("#film");
let seriesButton = document.querySelector("#series");
const key = "c7ca0c067bf41d0d9bce03506467357";

let showType = {
    film: "movie",
    series: "tv"
}
let type = showType.film;
let showName = "";

filmButton.addEventListener("click", function () {
    type = showType.film;
    selectActiveButton(this, seriesButton);

    if (showName) getShowsPerPage(showName, true);
});

seriesButton.addEventListener("click", function () {
    type = showType.series;
    selectActiveButton(this, filmButton);

    if (showName) getShowsPerPage(showName, true);
});

const selectActiveButton = function (activeButton, deactiveButton) {
    activeButton.classList.add("active");
    deactiveButton.classList.remove("active");
}

input.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        showName = input.value;
        input.value = "";

        getShowsPerPage(showName, true);
    }
})

const getShowsPerPage = async function (showName, firstRequest = false, page = 1) {
    showsContainer.innerHTML = "";
    let response = await fetch(`https://api.themoviedb.org/3/search/${type}?api_key=${key}d&query=${showName}&adult=true&page=${page}`);
    let data = await response.json();
    let shows = data.results;

    shows.forEach(show => {
        let { poster_path: posterPath, id } = show;
        let title = show.title ? show.title : show.name;

        if (!posterPath) return;

        posterPath = backdropPath + posterPath;
        displayShowPreview(title, posterPath, id);
    });

    if (firstRequest) {
        let totalPages = data.total_pages > 100 ? 100 : data.total_pages;
        displayPagesButtons(totalPages);
    }
}

function displayShowPreview(title, posterPath, id) {
    let showHTML = `
        <div class="show" data-id="${id}">
            <div>
                <img src="${posterPath}" class="previewImg"></img>
            </div>
            <p>${title}</p>
        </div>
        `;
    showsContainer.insertAdjacentHTML("beforeend", showHTML);
}

function displayPagesButtons(totalPages) {
    pagesBtnsContainer.innerHTML = "";

    for (let i = 0; i < totalPages; i++) {
        let buttonHTML = `<button data-page="${i + 1}" class="${i == 0 ? "activeButton" : ""}">${i + 1}</button>`;
        pagesBtnsContainer.insertAdjacentHTML("beforeend", buttonHTML);
    }
}

const setActiveButton = function (button) {
    let buttons = document.querySelectorAll("button");
    buttons.forEach(button => button.classList.remove("activeButton"));

    button.classList.add("activeButton");
}

pagesBtnsContainer.addEventListener("click", (e) => {
    let button = e.target;
    if (e.target.nodeName != "BUTTON") return;

    let goToPage = button.dataset.page;

    setActiveButton(button);
    getShowsPerPage(showName, false, goToPage);
})

showsContainer.addEventListener("click", (e) => {
    let show = e.target.closest(".show");
    if (!show) return;
    if (document.querySelector("#showDetails")) return;

    let showID = show.dataset.id;
    getShowDetails(showID);
})

const getShowDetails = async function (showID) {
    let data = await fetch(`https://api.themoviedb.org/3/${type}/${showID}?api_key=c7ca0c067bf41d0d9bce03506467357d`);
    let showDetails = await data.json();
    let { poster_path, genres, homepage, overview, release_date, title, vote_average, revenue, vote_count } = showDetails;

    let html = `
    <div id="showDetails">
        <div>
            <img src="https://image.tmdb.org/t/p/original/${poster_path}">
        </div>
        <div class="infos">
            <h2>${title}</h2>
            <div class="container">
                <h3>Generes</h3>
                <p>${genres.map(genre => genre.name).join(" - ")}</p>
            </div>
            <div class="container">
                <h3>Homepage</h3>
                <p>${homepage ? homepage : "Not available"}</p>
            </div>
            <div class="container">
                <h3>Overview</h3>
                <p>${overview ? overview : "Not available"}</p>
            </div>
            <div class="inline container">
                <div>
                    <h3>Vote count</h3>
                    <p>${vote_count ? vote_count : "Not available"}</p>
                </div>
                <div>
                    <h3>Vote average</h3>
                    <h3 class="${vote_average >= 6 ? "positive" : "negative"}">${vote_average.toFixed(1)}</h3>
                </div>
            </div>
            <div class="inline container">
                <div>
                    <h3>Release date</h3>
                    <p>${release_date.trim()}</p>
                </div>
                <div>
                    <h3>Revenue</h3>
                    <p>${String(revenue).trim()}$</p>
                </div>
            </div>
        </div>
        <img src="./cross.png" class="cross">
    </div>
    `;

    showsContainer.insertAdjacentHTML("afterend", html);
}

document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("cross")) return;

    document.querySelector("#showDetails").remove();
})