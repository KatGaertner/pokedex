const pokemonRepo = (function() {
    const pokemonList = [];
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=251';

    function parsePokemon(item) {
        let pokemon = {
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            detailsUrl: item.url
        };
        add(pokemon);
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

    function add(pokemon) {
        pokemonList.push(pokemon);
        console.log('added pokemon');
    }

    function getAll() {
        return pokemonList;
    }

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

        // use pointerup so it doesn't interfere with the modal...
        button.addEventListener('pointerup', () => showDetails(pokemon));
    }

    function display(pokemons) {
        pokemons.forEach((pokemon) => addListItem(pokemon));
    }

    function showDetails(pokemon) {
        if (!pokemon.height) { // if height is not there, others are not there
            loadDetails(pokemon)
                .then(() => showModal(pokemon));
        } else {
            showModal(pokemon);
        }
    }

    function hideLoadingMessage() {
        let elem = document.getElementById('loading-message');
        elem.classList.add('hidden');
    }

    function showLoadingMessage() {
        let elem = document.getElementById('loading-message');
        elem.classList.remove('hidden');
    }

    // modal utility

    let modalShownIndex = null;

    function loadImage(pokemon) {
        let imgurl = pokemon.imageUrl;
        let shinyChance = 4096;
        if (Math.random() * shinyChance < 1) {
            imgurl = pokemon.imageUrlshiny;
        }
        return imgurl;
    }

    function createModalContent(pokemon) {
        let modalContainer = document.getElementById('modal-container');
        modalShownIndex = pokemon.id - 1; // as of now, pokemon ID = list index + 1

        let modal = document.createElement('div');
        modal.classList.add('modal');

        let closeButtonElement = document.createElement('button');
        closeButtonElement.classList.add('modal-close');
        closeButtonElement.innerText = 'X';
        // event for closing modal close button - added to the button:
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

        modal.appendChild(closeButtonElement);
        modal.appendChild(titleElement);
        modal.appendChild(idElement);
        modal.appendChild(flexElement);
        flexElement.appendChild(contentElement);
        flexElement.appendChild(imageElement);
        modalContainer.appendChild(modal);
    }

    function showModal(pokemon) {
        showLoadingMessage();
        let modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = '';
        createModalContent(pokemon);
        modalContainer.classList.remove('hidden');
        hideLoadingMessage();
    }

    function closeModal() {
        let modalContainer = document.getElementById('modal-container');
        modalContainer.classList.add('hidden');
    }

    // swiping utility

    let start = {};
    let end = {};
    let thresholdDistance = 100;

    function swipeLeft() {
        let newIndex = modalShownIndex - 1;
        let pokemon = pokemonList[newIndex];
        showDetails(pokemon);
    }

    function swipeRight() {
        let newIndex = modalShownIndex + 1;
        let pokemon = pokemonList[newIndex];
        showDetails(pokemon);
    }

    function gestureStart(e) {
        start.x = e.clientX;
        start.y = e.clientY;
    }

    function gestureEnd(e) {
        end.x = e.clientX;
        end.y = e.clientY;
        let deltaX = end.x - start.x;
        start = {};
        end = {};
        let modalContainer = document.querySelector('#modal-container');
        let target = e.target;

        if (!modalContainer.classList.contains('hidden')) {
            if (deltaX > thresholdDistance) {
                swipeLeft();
            } else if (deltaX < -thresholdDistance) {
                swipeRight();
            } else if (target === modalContainer) {
                closeModal();
            }
        }
    }

    function addInitialEventListeners() {
        let modalContainer = document.querySelector('#modal-container');
        modalContainer.addEventListener('pointerdown', gestureStart, false);
        modalContainer.addEventListener('pointerup', gestureEnd, false);

        // event for closing modal on escape keypress - added to whole window:
        window.addEventListener('keydown', (e) => {
            let modalContainer = document.querySelector('#modal-container');
            if (e.key === 'Escape' && !modalContainer.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    return {
        getAll: getAll,
        display: display,
        loadList: loadList,
        addInitialEventListeners:addInitialEventListeners
    };
})();

pokemonRepo.loadList()
    .then(() => {
        pokemonRepo.addInitialEventListeners();
        pokemonRepo.display(pokemonRepo.getAll());
    });
