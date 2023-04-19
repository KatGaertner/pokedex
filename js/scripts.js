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

        button.addEventListener('click', () => showDetails(pokemon));
    }

    function display(pokemons) {
        pokemons.forEach((pokemon) => addListItem(pokemon));
    }

    function showDetails(pokemon) {
        loadDetails(pokemon)
            .then(() => showModal(pokemon));
    }

    function hideLoadingMessage() {
        let elem = document.getElementById('loading-message');
        elem.classList.add('hidden');
    }

    function showLoadingMessage() {
        let elem = document.getElementById('loading-message');
        elem.classList.remove('hidden');
    }

    function createModalContent(pokemon) {
        let modalContainer = document.getElementById('modal-container');

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

        let imageElement = document.createElement('img');
        imageElement.src = pokemon.imageUrl;

        let contentElement = document.createElement('p');
        let types = pokemon.types.join(', ');
        contentElement.innerText = `Height: ${pokemon.height}
                                    Types: ${types}`;

        modal.appendChild(closeButtonElement);
        modal.appendChild(titleElement);
        modal.appendChild(idElement);
        modal.appendChild(flexElement);
        flexElement.appendChild(contentElement);
        flexElement.appendChild(imageElement);
        modalContainer.appendChild(modal);
    }

    function showModal(pokemon) {
        let modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = '';

        createModalContent(pokemon);

        modalContainer.classList.remove('hidden');

        // event for closing modal on pressing outside the modal:
        modalContainer.addEventListener('click', (e) => {
            let target = e.target;
            if (target === modalContainer) {
                closeModal();
            }
        });
    }

    function closeModal() {
        let modalContainer = document.getElementById('modal-container');
        modalContainer.classList.add('hidden');
    }

    // event for closing modal on escape keypress - added to whole window:
    window.addEventListener('keydown', (e) => {
        let modalContainer = document.querySelector('#modal-container');
        if (e.key === 'Escape' && !modalContainer.classList.contains('hidden')) {
            closeModal();
        }
    });

    return {
        add: add,
        getAll: getAll,
        search: search,
        addListItem: addListItem,
        display: display,
        showDetails: showDetails,
        loadList: loadList,
        loadDetails: loadDetails,
        hideLoadingMessage: hideLoadingMessage,
        showLoadingMessage: showLoadingMessage,
        showModal: showModal,
        closeModal: closeModal
    };
})();

pokemonRepo.loadList()
    .then(() => pokemonRepo.display(pokemonRepo.getAll()));
