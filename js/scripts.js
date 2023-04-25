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
        button.classList.add('list-group-item');
        button.classList.add('btn');
        button.classList.add('btn-light');
        button.classList.add('btn-block');
        button.setAttribute('data-toggle', 'modal');
        button.setAttribute('data-target', '#modal-container');
        li.appendChild(button);
        ul.appendChild(li);

        button.addEventListener('click', () => modalHandler.showDetails(pokemon));
    }

    function display(pokemons) {
        pokemons.forEach((pokemon) => addListItem(pokemon));
    }

    function hideLoadingMessage() {
        let elem = document.getElementById('loading-message');
        elem.classList.add('hidden-message');
    }

    function showLoadingMessage() {
        let elem = document.getElementById('loading-message');
        elem.classList.remove('hidden-message');
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

    const modalContainer = document.getElementById('modal-container');

    function showDetails(pokemon) {
        modalContainer.innerHTML = '';
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

        let modalDialog = document.createElement('div');
        modalDialog.classList.add('modal-dialog');
        modalDialog.setAttribute('role', 'dialog');

        let modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');
        modalDialog.appendChild(modalContent);

        let modalHeader = document.createElement('div');
        modalHeader.classList.add('modal-header');
        modalContent.appendChild(modalHeader);

        let modalTitle = document.createElement('div');
        modalTitle.classList.add('modal-title');
        modalHeader.appendChild(modalTitle);

        let titleElement = document.createElement('h2');
        titleElement.innerText = pokemon.name;
        modalTitle.appendChild(titleElement);

        let idElement = document.createElement('p');
        idElement.classList.add('modal-id');
        idElement.innerText = `#${pokemon.id}`;
        modalTitle.appendChild(idElement);

        let closeButtonElement = document.createElement('button');
        closeButtonElement.classList.add('modal-close');
        closeButtonElement.classList.add('close');
        modalDialog.setAttribute('data-dismiss', 'modal');
        modalDialog.setAttribute('aria-label', 'Close');
        closeButtonElement.innerText = 'x';
        closeButtonElement.addEventListener('click', closeModal);
        modalHeader.appendChild(closeButtonElement);

        let modalBody = document.createElement('div');
        modalBody.classList.add('modal-body');
        modalContent.append(modalBody);

        let flexElement = document.createElement('div');
        flexElement.classList.add('modal-flex');
        modalBody.appendChild(flexElement);

        let contentElement = document.createElement('p');
        let types = pokemon.types.join(', ');
        contentElement.innerText = `Height: ${pokemon.height}
                                    Types: ${types}`;
        flexElement.appendChild(contentElement);

        let imageElement = document.createElement('img');
        imageElement.src = loadImage(pokemon);
        flexElement.appendChild(imageElement);

        modalContainer.appendChild(modalDialog);
    }

    function showModal(pokemon) {
        pokemonRepo.showLoadingMessage();
        modalContainer.innerHTML = '';
        createModalContent(pokemon);
        pokemonRepo.hideLoadingMessage();
    }

    function closeModal() {
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

    // event listeners

    function addInitialEventListeners() {
        // keyboard controls for modal
        window.addEventListener('keydown', (e) => {
            if (modalContainer.classList.contains('show')) {
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
        showDetails
    };
})();


pokemonRepo.loadList()
    .then(() => {
        modalHandler.addInitialEventListeners();
        pokemonRepo.display(pokemonRepo.getAll());
    });
