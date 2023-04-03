const pokemonList = [
    {
        'name': 'Bulbasaur',
        'height': 0.7,
        'types': ['grass', 'poison']
    },
    {
        'name': 'Ivysaur',
        'height': 1.0,
        'types': ['grass', 'poison']
    },
    {
        'name': 'Venusaur',
        'height': 2.0,
        'types': ['grass', 'poison']
    }
];

const noteText = ' - Wow, that\'s big!'

for (let i = 0; i < pokemonList.length; i++) {
    let note = '';
    if (pokemonList[i].height > 1.0) {
        note = noteText;
    }
    document.write(pokemonList[i].name + ', height: ' + pokemonList[i].height + note + "<br>");
};