const pokemonRepo = (function () {
    const pokemonList = [];
    const apiUrl= 'https://pokeapi.co/api/v2/pokemon/?limit=9'

    function loadList() {
        return fetch(apiUrl).then((response) => response.json())
            .then((data) => {
                data.results.forEach((item) => {
                    let pokemon = {
                        name: item.name,
                        detailsUrl: item.url
                    }
                    pokemonList.push(pokemon); // instead of add, because I can't validate when initializing
                })
            })
            .catch((error) => console.error(error))
    }

    function loadDetails(pokemon) {
        return fetch(pokemon.detailsUrl)
            .then((response) => response.json())
            .then((data) => {
                pokemon.imageUrl = data.sprites.front_default;
                pokemon.height = data.height;
                pokemon.types = data.types;
            })
            .catch((error) => console.error(error))
    }

    function add(pokemon) {
        if (validatePokemon(pokemon)) {
            pokemonList.push(pokemon);
            console.log('added pokemon')
        }
    };

    function validatePokemon(pokemon) {
        let pokemonKeys = Object.keys(pokemonList[0]);
        if (
            (Object.keys(pokemon).length === pokemonKeys.length) &&
            (Object.keys(pokemon).every((key) => pokemonKeys.includes(key)))
        ) {
            return true
        }
        else {
            console.error('wrong data format')
            return false
        };
    }

    function getAll() {
        return pokemonList;
    };

    function search(key, value) {
        if (typeof value === 'string') {
            return pokemonList.filter( pokemon => pokemon[key].includes(value) );
        } else {
            return pokemonList.filter( pokemon => pokemon[key] == value );
        }
    };

    function addListItem(pokemon) {
        let ul = document.getElementById('pokemon-list');
        let li = document.createElement('li');
        let button = document.createElement('button');
        button.innerText = pokemon.name;
        button.classList.add('pokemon-list__item');
        li.appendChild(button);
        ul.appendChild(li);

        button.addEventListener('click', () => showDetails(pokemon));
    };

    function showDetails(pokemon) {
        loadDetails(pokemon)
            .then(() => console.log(pokemon));
    }

    return {
        add: add,
        getAll: getAll,
        search: search,
        addListItem:addListItem,
        showDetails: showDetails,
        loadList: loadList,
        loadDetails: loadDetails
    };
})();

function display(array) {
    
    array.forEach( function(pokemon) {
        pokemonRepo.addListItem(pokemon)
        }
    );
}

pokemonRepo.loadList()
    .then(() => display(pokemonRepo.getAll()));