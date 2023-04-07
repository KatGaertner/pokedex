const pokemonRepo = (function () {
    const pokemonList = [
        {
            name: 'Bulbasaur',
            height: 0.7,
            types: ['grass', 'poison']
        },
        {
            name: 'Ivysaur',
            height: 1.0,
            types: ['grass', 'poison']
        },
        {
            name: 'Venusaur',
            height: 2.0,
            types: ['grass', 'poison']
        },
        {
            name: 'Charmander',
            height: 0.6,
            types: ['fire']
        },
        {
            name: 'Charmeleon',
            height: 1.1,
            types: ['fire']
        },
        {
            name: 'Charizard',
            height: 1.7,
            types: ['fire','flying']
        },
        {
            name: 'Squirtle',
            height: 0.5,
            types: ['water']
        }
    ];

    let pokemonKeys = Object.keys(pokemonList[0]);

    function add(pokemon) {
        if (
            (Object.keys(pokemon).length === pokemonKeys.length) &&
            (Object.keys(pokemon).every((key) => pokemonKeys.includes(key)))
        ) {
            pokemonList.push(pokemon);
            console.log('added pokemon')
        }
        else {
            console.log('wrong data format')
        };
    };

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
        console.log(pokemon.name, pokemon.height, pokemon.types);
    }

    return {
        add: add,
        getAll: getAll,
        search: search,
        addListItem:addListItem,
        showDetails: showDetails
    };
})();

function display(array) {
    
    array.forEach( function(pokemon) {
        pokemonRepo.addListItem(pokemon)
        }
    );
}

display(pokemonRepo.getAll()); 