'use strict';

const pokemonRepo = (function() {
    const pokemonList = [];
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=5';

    function parsePokemon(item) {
        console.log('function parsePokemon');
        let pokemon = {
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            detailsUrl: item.url,
            speciesUrl: item.url.split('pokemon').join('pokemon-species')
        };
        console.log('function parsePokemon pushes', pokemon);
        pokemonList.push(pokemon);
    }

    function parseDetails(data, pokemon) {
        console.log('function parseDetails');
        pokemon.imageUrl = data.sprites.front_default;
        pokemon.imageUrlshiny = data.sprites.front_shiny;
        pokemon.height = data.height;
        pokemon.types = data.types.map((x) => x.type.name);
        pokemon.id = data.id;
    }

    function parseFlavorText(data, pokemon) {
        console.log('function parseFlavorText');
        let data1 = data.flavor_text_entries.filter((x) => x.language.name === 'en');
        let data2 = data1.map((x) => x.flavor_text);
        pokemon.flavorText = data2.map((el) => el.replace(/\s/g, ' '));
    }

    function loadList() {
        console.log('function loadList');
        showLoadingMessage();
        return fetch(apiUrl)
            .then((response) => {
                console.log('function loadList, 1');
                response.json();
            })
            .then((data) => {
                console.log('function loadList, 2');
                data.results.forEach((item) => parsePokemon(item));
                hideLoadingMessage();
            })
            .catch((error) => {
                console.error(error);
                hideLoadingMessage();
            });
    }

    function loadDetails(pokemon) {
        console.log('function loadDetails');
        return fetch(pokemon.detailsUrl)
            .then((response) => {
                console.log('function loadDetails, 1');
                response.json();
            })
            .then((data) => {
                console.log('function loadDetails, 2');
                parseDetails(data, pokemon);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function loadFlavorText(pokemon) {
        console.log('function loadFlavorText');
        return fetch(pokemon.speciesUrl)
            .then((response) => {
                console.log('function loadFlavorText, 1');
                response.json();
            })
            .then((data) => {
                console.log('function loadFlavorText, 2');
                parseFlavorText(data, pokemon);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function getAll() {
        console.log('function getAll, returns', pokemonList);
        return pokemonList;
    }

    function search(key, value) {
        console.log('function search');
        if (typeof value === 'string') {
            let searchString = value.toLowerCase();
            console.log('function search returns', pokemonList.filter((pokemon) => pokemon[key].toLowerCase().includes(searchString)));
            return pokemonList.filter((pokemon) => pokemon[key].toLowerCase().includes(searchString));
        }
        console.log('function search returns', pokemonList.filter((pokemon) => pokemon[key] === value));
        return pokemonList.filter((pokemon) => pokemon[key] === value);
    }

    function searchPokemon() {
        console.log('function searchPokemon');
        let searchBar = document.getElementById('searchbar');
        cleanDisplay();
        let val = searchBar.value;
        let list = search('name', val);
        display(list);
        modalHandler.setCurrentList(list);
    }

    function addListItem(pokemon) {
        console.log('function addListItem');
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
        console.log('function display');
        pokemons.forEach((pokemon) => addListItem(pokemon));
    }

    function cleanDisplay() {
        console.log('function cleanDisplay');
        let elems = document.querySelectorAll('#pokemon-list li');
        elems.forEach((el) => el.remove());
    }

    function hideLoadingMessage() {
        console.log('function hideLoadingMessage on repo');
        let elem = document.getElementById('loading-message');
        elem.classList.add('hidden');
    }

    function showLoadingMessage() {
        console.log('function showLoadingMessage on repo');
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
        console.log('function updateDetails');
        removeData();
        document.getElementById('pkmn-name').innerText = pokemon.name;
        showLoadingMessage();
        if (!pokemon.height) {
            console.log('function updateDetails, no height');
            pokemonRepo.loadDetails(pokemon)
                .then(() => pokemonRepo.loadFlavorText(pokemon))
                .then(() => {
                    updateModalContent(pokemon);
                    hideLoadingMessage();
                });
        } else {
            console.log('function updateDetails, else');
            updateModalContent(pokemon);
            hideLoadingMessage();
        }
    }

    function loadImage(pokemon) {
        console.log('function loadImage');
        let imgurl = pokemon.imageUrl;
        let shinyChance = 4096;
        if (Math.random() * shinyChance < 1) {
            imgurl = pokemon.imageUrlshiny;
        }
        console.log('function loadImage returns', imgurl);
        return imgurl;
    }

    function getFlavorNr(pokemon) {
        console.log('function getFlavorNr, returns', Math.floor(Math.random() * pokemon.flavorText.length));
        return Math.floor(Math.random() * pokemon.flavorText.length);
    }

    function createModalContent() {
        console.log('function createModalContent');
        let modalDialog = `
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="row align-items-center">
            <div class="col-12 col-md-8 offset-md-1 order-md-2" id="pkmn-modal">
              <div class="modal-header">
                <div class="modal-title">
                  <div>
                    <h2 id="pkmn-name" class="pkmn-data"></h2>
                    <div id="modal-loading-message" class="spinner-border ml-3" role="status">
                      <span class="sr-only">Loading...</span>
                    </div>
                    <p id="pkmn-id" class="modal-id pkmn-data"></p>
                  </div>
                </div>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="modal-flex">
                  <p>
                    <span id="pkmn-height" class="pkmn-data"></span><br>
                    <span id="pkmn-types" class="pkmn-data"></span>
                  </p>
                  <img src="img/empty.png" id="pkmn-img" title="Pokemon sprite">
                </div>
                <p id="pkmn-text" class="pkmn-data"></p>
              </div>
            </div>
            <button class="btn btn-light modalButton mt-2 col-3 col-md-1 order-md-1 pt-3 pb-3" type="button"
              onclick="modalHandler.swipeLeft()" aria-label="previous Pokemon">
              <span aria-hidden="true">
                <img src="img/chevron-right.svg" class="icon turn180">
              </span>
            </button>
            <button class="btn btn-light modalButton mt-2 col-3 col-md-1 order-md-3 offset-6 offset-md-1 pt-3 pb-3"
              type="button" onclick="modalHandler.swipeRight()" aria-label="next Pokemon">
              <span aria-hidden="true">
              <img src="img/chevron-right.svg" class="icon">
              </span>
            </button>
          </div>
        </div>
      </div>`;

        $('#modal-container').append(modalDialog);
    }

    function updateModalContent(pokemon) {
        console.log('function updateModalContent');
        listIndex = currentList.indexOf(pokemon);

        let types = pokemon.types.join(', ');
        let imgsrc = loadImage(pokemon);
        let flavorNr = getFlavorNr(pokemon);

        document.getElementById('pkmn-name').innerText = pokemon.name;
        document.getElementById('pkmn-id').innerText = `#${pokemon.id}`;
        document.getElementById('pkmn-height').innerText = `Height: ${pokemon.height}`;
        document.getElementById('pkmn-types').innerText = `Types: ${types}`;
        document.getElementById('pkmn-img').src = imgsrc;
        document.getElementById('pkmn-text').innerText = pokemon.flavorText[flavorNr];

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
        console.log('function makeColorBorder');
        let colors = pokemon.types.map((x) => colormap[x]);
        if (colors.length === 1) {
            colors[1] = colors[0];
        }
        let bg = '#eeeeee';
        let box = document.getElementById('pkmn-modal');
        box.style.background = `linear-gradient(${bg}, ${bg}) padding-box, linear-gradient(160deg, ${colors[0]}, ${colors[1]}) border-box`;
    }

    function closeModal() {
        console.log('function closeModal');
        $('#modal-container').modal('hide');
    }

    function removeData() {
        console.log('function removeData');
        $('.pkmn-data').each((nr, el) => {
            el.innerText = '\u00a0';
        });
        document.getElementById('pkmn-img').src = 'img/empty.png';
    }

    function swipeLeft() {
        console.log('function swipeLeft');
        let newIndex = listIndex - 1;
        let pokemon = currentList[newIndex];
        if (currentList[newIndex]) {
            updateDetails(pokemon);
        }
    }

    function swipeRight() {
        console.log('function swipeRight');
        let newIndex = listIndex + 1;
        let pokemon = currentList[newIndex];
        if (currentList[newIndex]) {
            updateDetails(pokemon);
        }
    }

    function setCurrentList(list) {
        console.log('function setCurrentList');
        currentList = list;
    }

    function hideLoadingMessage() {
        console.log('function hideLoadingMessage on modal');
        let elem = document.getElementById('modal-loading-message');
        elem.classList.add('hidden');
    }

    function showLoadingMessage() {
        console.log('function showLoadingMessage on modal');
        let elem = document.getElementById('modal-loading-message');
        elem.classList.remove('hidden');
    }

    // event listeners

    function addInitialEventListeners() {
        console.log('function addInitialEventListeners');
        window.addEventListener('keydown', (e) => {
            if (modalContainer.classList.contains('show')) {
                if (e.key === 'Escape') {
                    console.log('function addInitialEventListeners, esc');
                    closeModal();
                } else if (e.key === 'ArrowLeft') {
                    console.log('function addInitialEventListeners, left');
                    swipeLeft();
                } else if (e.key === 'ArrowRight') {
                    console.log('function addInitialEventListeners, right');
                    swipeRight();
                }
            }
        });
    }

    return {
        addInitialEventListeners,
        updateDetails,
        createModalContent,
        swipeLeft,
        swipeRight,
        setCurrentList
    };
})();

console.log('script loaded');
pokemonRepo.loadList()
    .then(() => {
        modalHandler.addInitialEventListeners();
        pokemonRepo.display(pokemonRepo.getAll());
        modalHandler.createModalContent();
        console.log('pokemon and content loaded');
    });
