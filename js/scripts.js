const pokemonRepo = (function() {
    const pokemonList = [];
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=251';

    function parsePokemon(item) {
        let pokemon = {
            name: item.name,
            detailsUrl: item.url
        };
        add(pokemon);
    }

    function parseDetails(data, pokemon) {
        pokemon.imageUrl = data.sprites.front_default;
        pokemon.height = data.height;
        pokemon.types = Object.values(data.types).map((x) => x.type.name);
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
        } else {
            return pokemonList.filter((pokemon) => pokemon[key] === value);
        }
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
            .then(() => console.log(pokemon));
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
        add: add,
        getAll: getAll,
        search: search,
        addListItem:addListItem,
        display: display,
        showDetails: showDetails,
        loadList: loadList,
        loadDetails: loadDetails,
        hideLoadingMessage: hideLoadingMessage,
        showLoadingMessage: showLoadingMessage
    };
})();

pokemonRepo.loadList()
    .then(() => pokemonRepo.display(pokemonRepo.getAll()));
