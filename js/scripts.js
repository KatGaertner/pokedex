const pokemonList = [];
const noteText = ' - Wow, that\'s big!'


pokemonList[0] = {
    'name': 'Bulbasaur',
    'height': 0.7,
    'types': ['grass', 'poison']
};

pokemonList[1] = {
    'name': 'Ivysaur',
    'height': 1.0,
    'types': ['grass', 'poison']
};

pokemonList[2] = {
    'name': 'Venusaur',
    'height': 2.0,
    'types': ['grass', 'poison']
};


for (let i = 0; i < pokemonList.length; i++) {
    let note = '';
    if (pokemonList[i].height > 1.0) {
        note = noteText;
    }
    document.write(pokemonList[i].name + ', height: ' + pokemonList[i].height + note + "<br>");
};