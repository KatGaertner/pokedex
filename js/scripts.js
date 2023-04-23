'use strict';

const pokemonRepo = (function() {
    const pokemonList = [];
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=251';

    function parsePokemon(item) {
        let pokemon = {
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            detailsUrl: item.url
        };
        pokemonList.push(pokemon);
    }

    function parseDetails(data, pokemon) {
        pokemon.imageUrl = data.sprites.front_default;
        pokemon.imageUrlshiny = data.sprites.front_shiny;
        pokemon.height = data.height;
        pokemon.types = data.types.map((x) => x.type.name);
        pokemon.id = data.id;
    }

    function loadList() {
        showLoadingMessage();
        return fetch(apiUrl).then((response) => response.json())
            .then((data) => {
                data.results.forEach((item) => parsePokemon(item));
                hideLoadingMessage();
            })
            .catch((error) => {
                console.error(error);
                hideLoadingMessage();
            });
    }

    function loadDetails(pokemon) {
        showLoadingMessage();
        return fetch(pokemon.detailsUrl)
            .then((response) => response.json())
            .then((data) => {
                parseDetails(data, pokemon);
                hideLoadingMessage();
            })
            .catch((error) => {
                console.error(error);
                hideLoadingMessage();
            });
    }

    function getAll() {
        return pokemonList;
    }

    // keeping this because I want to use it later
    function search(key, value) {
        if (typeof value === 'string') {
            return pokemonList.filter((pokemon) => pokemon[key].includes(value));
        }
        return pokemonList.filter((pokemon) => pokemon[key] === value);
    }

    function addListItem(pokemon) {
        let ul = document.getElementById('pokemon-list');
        let li = document.createElement('li');
        let button = document.createElement('button');
        button.innerText = pokemon.name;
        button.classList.add('pokemon-list__item');
        li.appendChild(button);
        ul.appendChild(li);

        button.addEventListener('click', () => modalHandler.showDetails(pokemon));
    }

    function display(pokemons) {
        pokemons.forEach((pokemon) => addListItem(pokemon));
    }

    function hideLoadingMessage() {
        let elem = document.getElementById('loading-message');
        elem.classList.add('hidden');
    }

    function showLoadingMessage() {
        let elem = document.getElementById('loading-message');
        elem.classList.remove('hidden');
    }

    return {
        getAll,
        display,
        loadList,
        showLoadingMessage,
        hideLoadingMessage,
        loadDetails
    };
})();


const modalHandler = (function() {
    // list index (for pokemonRepo) of the pokemon that is currently shown in the modal
    let modalShownIndex = null;

    // load the container here because it is used so often
    const modalContainer = document.getElementById('modal-container');

    function showDetails(pokemon) {
        // lock the background from scrolling
        scrollLock();
        // if height is not there, the other details are not there, so load the details
        if (!pokemon.height) {
            pokemonRepo.loadDetails(pokemon)
                .then(() => showModal(pokemon));
        } else {
            showModal(pokemon);
        }
    }

    function loadImage(pokemon) {
        let imgurl = pokemon.imageUrl;
        let shinyChance = 4096;
        if (Math.random() * shinyChance < 1) {
            imgurl = pokemon.imageUrlshiny;
        }
        return imgurl;
    }

    function createModalContent(pokemon) {
        // list index for pokeRepo = actual pokemon ID - 1
        modalShownIndex = pokemon.id - 1;

        // create all elements for the modal

        let modal = document.createElement('div');
        modal.classList.add('modal');

        let closeButtonElement = document.createElement('button');
        closeButtonElement.classList.add('modal-close');
        closeButtonElement.innerText = 'X';
        closeButtonElement.addEventListener('click', closeModal);

        let titleElement = document.createElement('h2');
        titleElement.innerText = pokemon.name;

        let idElement = document.createElement('p');
        idElement.classList.add('modal-id');
        idElement.innerText = `#${pokemon.id}`;

        let flexElement = document.createElement('div');
        flexElement.classList.add('modal-flex');

        let contentElement = document.createElement('p');
        let types = pokemon.types.join(', ');
        contentElement.innerText = `Height: ${pokemon.height}
                                    Types: ${types}`;

        let imageElement = document.createElement('img');
        imageElement.src = loadImage(pokemon);

        // attach elements to modal and container
        modal.appendChild(closeButtonElement);
        modal.appendChild(titleElement);
        modal.appendChild(idElement);
        modal.appendChild(flexElement);
        flexElement.appendChild(contentElement);
        flexElement.appendChild(imageElement);
        modalContainer.appendChild(modal);
    }

    function showModal(pokemon) {
        pokemonRepo.showLoadingMessage();
        modalContainer.innerHTML = '';
        createModalContent(pokemon);
        modalContainer.classList.remove('hidden');
        pokemonRepo.hideLoadingMessage();
    }

    function closeModal() {
        modalContainer.classList.add('hidden');
        scrollAllow();
    }

    // swiping utility

    function swipeLeft() {
        let newIndex = modalShownIndex - 1;
        let pokemon = pokemonRepo.getAll()[newIndex];
        showDetails(pokemon);
    }

    function swipeRight() {
        let newIndex = modalShownIndex + 1;
        let pokemon = pokemonRepo.getAll()[newIndex];
        showDetails(pokemon);
    }

    // setting up the swiping gestures
    let startX = null;
    let endX = null;
    // thresholdDistance sets distance before swiping is activated
    // TODO: setting this as absolute might not be the best idea
    let thresholdDistance = 100;

    function gestureStart(e) {
        startX = e.clientX;
    }

    function gestureEnd(e) {
        endX = e.clientX;
        let deltaX = endX - startX;
        startX = null;
        endX = null;
        let target = e.target;

        if (!modalContainer.classList.contains('hidden')) {
            // if threshold is met, swipe
            // if threshold distance is not met and the modal container is the target, close modal
            if (deltaX > thresholdDistance) {
                swipeLeft();
            } else if (deltaX < -thresholdDistance) {
                swipeRight();
            } else if (target === modalContainer) {
                closeModal();
            }
        }
    }

    // locks the buttons in the background from being accessed when overlay is touched
    function lockBackground(e) {
        if (e.target === modalContainer) {
            e.preventDefault();
        }
    }

    // background scroll locking workaround from
    // https://www.jayfreestone.com/writing/locking-body-scroll-ios/

    let scrollTop = 0;

    function scrollLock() {
        if (modalContainer.classList.contains('hidden')) {
            // get the current scrolling position of the window
            scrollTop = window.scrollY;
        }
        // set the whole page to position: absolute and overflow: hidden
        let content = document.querySelector('.page-container');
        content.classList.add('fixed');
        // scroll the page to the correct position
        content.scroll(0, scrollTop);
    }

    function scrollAllow() {
        if (modalContainer.classList.contains('hidden')) {
            let content = document.querySelector('.page-container');
            // remove position: absolute and overflow: hidden
            content.classList.remove('fixed');
            // scroll the window to where it was before
            window.scroll(0, scrollTop);
        }
    }

    // event listeners

    function addInitialEventListeners() {
        // for swiping
        modalContainer.addEventListener('pointerdown', gestureStart);
        modalContainer.addEventListener('pointerup', gestureEnd);

        // for mobile, when touching the modal container lock the buttons in the background from being accessed
        // passive: false, because some browsers use true as default, which prevents use of e.preventDefault()
        modalContainer.addEventListener('touchstart', (e) => lockBackground(e), {passive: false});
        modalContainer.addEventListener('touchmove', (e) => lockBackground(e), {passive: false});

        // keyboard controls for modal
        window.addEventListener('keydown', (e) => {
            if (!modalContainer.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    closeModal();
                } else if (e.key === 'ArrowLeft') {
                    swipeLeft();
                } else if (e.key === 'ArrowRight') {
                    swipeRight();
                }
            }
        });
    }

    return {
        addInitialEventListeners,
        showDetails,
        scrollLock
    };
})();


pokemonRepo.loadList()
    .then(() => {
        modalHandler.addInitialEventListeners();
        pokemonRepo.display(pokemonRepo.getAll());
    });
