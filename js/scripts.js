'use strict';

const pokemonRepo = (function() {
    const pokemonList = [];
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=251';

    function parsePokemon(item) {
        let pokemon = {
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            detailsUrl: item.url
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

    function getAll() {
        return pokemonList;
    }

    function search(key, value) {
        if (typeof value === 'string') {
            return pokemonList.filter((pokemon) => pokemon[key].toLowerCase().includes(value));
        }
        return pokemonList.filter((pokemon) => pokemon[key] === value);
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
        showLoadingMessage,
        hideLoadingMessage,
        loadDetails,
        searchPokemon
    };
})();


const modalHandler = (function() {
    const modalContainer = document.getElementById('modal-container');
    let currentList = pokemonRepo.getAll();
    let listIndex = null;

    function updateDetails(pokemon) {
        removeData();
        document.getElementById('pkmn-name').innerText = pokemon.name;

        if (!pokemon.height) {
            pokemonRepo.loadDetails(pokemon)
                .then(() => updateModalContent(pokemon));
        } else {
            updateModalContent(pokemon);
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

    function createModalContent() {
        let modalDialog = `
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="row align-items-center">
            <div class="col-12 col-md-8 offset-md-1 order-md-2" id="pkmn-modal">
              <div class="modal-header">
                <div class="modal-title">
                  <div>
                    <h2 id="pkmn-name" class="pkmn-data"></h2>
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
                  <img src="" id="pkmn-img" title="Pokemon sprite">
                </div>
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
        listIndex = currentList.indexOf(pokemon);

        let types = pokemon.types.join(', ');
        let imgsrc = loadImage(pokemon);

        document.getElementById('pkmn-name').innerText = pokemon.name;
        document.getElementById('pkmn-id').innerText = `#${pokemon.id}`;
        document.getElementById('pkmn-height').innerText = `Height: ${pokemon.height}`;
        document.getElementById('pkmn-types').innerText = `Types: ${types}`;
        document.getElementById('pkmn-img').src = imgsrc;

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
        document.getElementById('pkmn-img').src = '';
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
        createModalContent,
        swipeLeft,
        swipeRight,
        setCurrentList
    };
})();


pokemonRepo.loadList()
    .then(() => {
        modalHandler.addInitialEventListeners();
        pokemonRepo.display(pokemonRepo.getAll());
        modalHandler.createModalContent();
    });
