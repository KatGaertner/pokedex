'use strict';

const pokemonRepo = (function() {
    const pokemonList = [];
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=251';

    function parsePokemon(item) {
        let pokemon = {
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            detailsUrl: item.url,
            speciesUrl: item.url.split('pokemon').join('pokemon-species')
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

    function parseFlavorText(data, pokemon) {
        let data1 = data.flavor_text_entries.filter((x) => x.language.name === 'en');
        let data2 = data1.map((x) => x.flavor_text);
        pokemon.flavorText = data2.map((el) => el.replace(/\s/g, ' '));
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
        return fetch(pokemon.detailsUrl)
            .then((response) => response.json())
            .then((data) => {
                parseDetails(data, pokemon);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function loadFlavorText(pokemon) {
        return fetch(pokemon.speciesUrl)
            .then((response) => response.json())
            .then((data) => {
                parseFlavorText(data, pokemon);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function getAll() {
        return pokemonList;
    }

    function search(key, value) {
        let searchString = value.toLowerCase();
        return pokemonList.filter((pokemon) => pokemon[key].toLowerCase().includes(searchString));
    }

    function searchPokemon() {
        let searchBar = document.getElementById('searchbar');
        cleanDisplay();
        let val = searchBar.value;
        let list = search('name', val);
        display(list);
        modalHandler.setCurrentList(list);
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

        button.addEventListener('click', () => modalHandler.updateDetails(pokemon));
    }

    function display(pokemons) {
        pokemons.forEach((pokemon) => addListItem(pokemon));
    }

    function cleanDisplay() {
        let elems = document.querySelectorAll('#pokemon-list li');
        elems.forEach((el) => el.remove());
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
        getAll,
        display,
        loadList,
        loadDetails,
        searchPokemon,
        loadFlavorText
    };
})();


const modalHandler = (function() {
    const modalContainer = document.getElementById('modal-container');
    let currentList = pokemonRepo.getAll();
    let listIndex = null;

    function updateDetails(pokemon) {
        removeData();
        if (document.getElementById('pkmn-name')) {
            document.getElementById('pkmn-name').innerText = pokemon.name;
        }
        showLoadingMessage();
        if (!pokemon.height) {
            pokemonRepo.loadDetails(pokemon)
                .then(() => pokemonRepo.loadFlavorText(pokemon))
                .then(() => {
                    updateModalContent(pokemon);
                    hideLoadingMessage();
                });
        } else {
            updateModalContent(pokemon);
            hideLoadingMessage();
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

    function getFlavorNr(pokemon) {
        return Math.floor(Math.random() * pokemon.flavorText.length);
    }

    function updateModalContent(pokemon) {
        listIndex = currentList.indexOf(pokemon);

        let types = pokemon.types.join(', ');
        let imgsrc = loadImage(pokemon);
        let flavorNr = getFlavorNr(pokemon);

        const container = document.getElementById('modal-container');
        container.innerHTML = '';

        const template = document.getElementById('my-template');
        let modalClone = template.content.cloneNode(true);
        modalClone.getElementById('pkmn-name').textContent = pokemon.name;
        modalClone.getElementById('pkmn-id').textContent = `#${pokemon.id}`;
        modalClone.getElementById('pkmn-height').textContent = `Height: ${pokemon.height}`;
        modalClone.getElementById('pkmn-types').textContent = `Types: ${types}`;
        modalClone.getElementById('pkmn-img').src = imgsrc;
        modalClone.getElementById('pkmn-text').textContent = pokemon.flavorText[flavorNr];
        container.append(modalClone);
        makeColorBorder(pokemon);
    }

    const colormap = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD'
    };

    function makeColorBorder(pokemon) {
        let colors = pokemon.types.map((x) => colormap[x]);
        if (colors.length === 1) {
            colors[1] = colors[0];
        }
        let bg = '#eeeeee';
        let box = document.getElementById('pkmn-modal');
        box.style.background = `linear-gradient(${bg}, ${bg}) padding-box, linear-gradient(160deg, ${colors[0]}, ${colors[1]}) border-box`;
    }

    function closeModal() {
        $('#modal-container').modal('hide');
    }

    function removeData() {
        $('.pkmn-data').each((nr, el) => {
            el.innerText = '\u00a0';
        });
        if (document.getElementById('pkmn-img')) {
            document.getElementById('pkmn-img').src = 'img/empty.png';
        }
    }

    function swipeLeft() {
        let newIndex = listIndex - 1;
        let pokemon = currentList[newIndex];
        if (currentList[newIndex]) {
            updateDetails(pokemon);
        }
    }

    function swipeRight() {
        let newIndex = listIndex + 1;
        let pokemon = currentList[newIndex];
        if (currentList[newIndex]) {
            updateDetails(pokemon);
        }
    }

    function setCurrentList(list) {
        currentList = list;
    }

    function hideLoadingMessage() {
        let elem = document.getElementById('modal-loading-message');
        elem.classList.add('hidden');
    }

    function showLoadingMessage() {
        let elem = document.getElementById('modal-loading-message');
        if (elem) {
            elem.classList.remove('hidden');
        }
    }

    // event listeners

    function addInitialEventListeners() {
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
        updateDetails,
        swipeLeft,
        swipeRight,
        setCurrentList
    };
})();


pokemonRepo.loadList()
    .then(() => {
        modalHandler.addInitialEventListeners();
        pokemonRepo.display(pokemonRepo.getAll());
    });
