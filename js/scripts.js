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
        cleanDisplay,
        loadList,
        showLoadingMessage,
        hideLoadingMessage,
        loadDetails,
        search
    };
})();


const modalHandler = (function() {
    // list index (for pokemonRepo) of the pokemon that is currently shown in the modal
    let modalShownIndex = null;

    const modalContainer = document.getElementById('modal-container');

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
            <div class="modal-dialog modal-dialog-centered" role="document">
              <div class="modal-content">
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
            </div>`;

        $('#modal-container').append(modalDialog);
    }

    function updateModalContent(pokemon) {
        // list index for pokeRepo = actual pokemon ID - 1
        modalShownIndex = pokemon.id - 1;

        let types = pokemon.types.join(', ');
        let imgsrc = loadImage(pokemon);

        document.getElementById('pkmn-name').innerText = pokemon.name;
        document.getElementById('pkmn-id').innerText = `#${pokemon.id}`;
        document.getElementById('pkmn-height').innerText = `Height: ${pokemon.height}`;
        document.getElementById('pkmn-types').innerText = `Types: ${types}`;
        document.getElementById('pkmn-img').src = imgsrc;

        makeColorBorder(pokemon);
    }

    function makeColorBorder(pokemon) {
        let box = document.getElementsByClassName('modal-content');

        if (pokemon === null) {
            box[0].style.background = 'linear-gradient(white, white) padding-box, linear-gradient(160deg, white, white) border-box';
            return;
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

        let colors = pokemon.types.map((x) => colormap[x]);
        let bg = '#eeeeee';
        if (colors.length === 1) {
            box[0].style.background = `linear-gradient(${bg}, ${bg}) padding-box, linear-gradient(160deg, ${colors[0]}, ${colors[0]}) border-box`;
        } else if (colors.length === 2) {
            box[0].style.background = `linear-gradient(${bg}, ${bg}) padding-box, linear-gradient(160deg, ${colors[0]}, ${colors[1]}) border-box`;
        }
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
        let newIndex = modalShownIndex - 1;
        let pokemon = pokemonRepo.getAll()[newIndex];
        if (pokemonRepo.getAll()[newIndex]) {
            updateDetails(pokemon);
        }
    }

    function swipeRight() {
        let newIndex = modalShownIndex + 1;
        let pokemon = pokemonRepo.getAll()[newIndex];
        if (pokemonRepo.getAll()[newIndex]) {
            updateDetails(pokemon);
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

        let searchBar = document.getElementById('searchbar');
        searchBar.addEventListener('input', (e) => {
            pokemonRepo.cleanDisplay();
            let val = e.target.value;
            let list = pokemonRepo.search('name', val);
            pokemonRepo.display(list);
        });
    }

    return {
        addInitialEventListeners,
        updateDetails,
        createModalContent
    };
})();


pokemonRepo.loadList()
    .then(() => {
        modalHandler.addInitialEventListeners();
        pokemonRepo.display(pokemonRepo.getAll());
        modalHandler.createModalContent();
    });
