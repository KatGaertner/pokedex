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

    return {
        add: add,
        getAll: getAll,
        search: search
    };
})();

function displayPokemon(pokemon) {
    document.write(`${pokemon.name}, height: ${pokemon.height}, type: ${pokemon.types} <br>`);
}

document.write('<i> In Pokedex: </i> <br>');
pokemonRepo.getAll().forEach(displayPokemon); 
document.write('<br> <i> Adding a new pokemon in wrong format... </i> <br>');
pokemonRepo.add('apple');
pokemonRepo.add({name:'Pokaymon', height:1});
pokemonRepo.add({name:'Pokaymon', height:1, typos:['normal']});
pokemonRepo.add({name:'Pokaymon', height:1, types:['normal'], attacks:['bite']});
document.write('<i> In Pokedex: </i> <br>');
pokemonRepo.getAll().forEach(displayPokemon);
document.write('<br> <i> Adding a new pokemon in right format... </i> <br>');
pokemonRepo.add({name:'Pokaymon', height:1, types:'normal'});
document.write('<i> In Pokedex: </i> <br>');
pokemonRepo.getAll().forEach(displayPokemon);
document.write('<br> <i> Search for name "saur" </i> <br>');
pokemonRepo.search('name', 'saur').forEach(displayPokemon);
document.write('<br> <i> Search for type "normal" </i> <br>');
pokemonRepo.search('types', 'normal').forEach(displayPokemon);
document.write('<br> <i> Search for height 2 </i> <br>');
pokemonRepo.search('height', 2).forEach(displayPokemon);