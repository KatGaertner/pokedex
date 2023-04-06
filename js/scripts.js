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

    return {
        add: add,
        getAll: getAll
    };
})();


function checkHeight(pokemon) {
    if (pokemon.height > 1.0) {
        return ' - Wow, that\'s big!';
    } else {
        return '';
    }
}

function displayPokemon(pokemon) {
    let note = checkHeight(pokemon);
    document.write(pokemon.name + ', height: ' + pokemon.height + note + "<br>");
}

pokemonRepo.getAll().forEach(displayPokemon); 