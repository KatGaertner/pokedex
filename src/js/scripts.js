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
        pokemon.types = data.types.map(function(x) {
            return x.type.name;
        });
        pokemon.id = data.id;
    }

    function parseFlavorText(data, pokemon) {
        let data1 = data.flavor_text_entries.filter(function(x) {
            return x.language.name === 'en';
        });
        let data2 = data1.map(function(x) {
            return x.flavor_text;
        });
        pokemon.flavorText = data2.map(function(el) {
            // remove all whitespace characters
            return el.replace(/\s/g, ' ');
        });
    }

    function loadList() {
        showLoadingMessage();
        return fetch(apiUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                data.results.forEach(function(item) {
                    parsePokemon(item);
                });
                hideLoadingMessage();
            })
            .catch(function(error) {
                console.error(error);
                hideLoadingMessage();
            });
    }

    function loadDetails(pokemon) {
        return fetch(pokemon.detailsUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                parseDetails(data, pokemon);
            })
            .catch(function(error) {
                console.error(error);
            });
    }

    function loadFlavorText(pokemon) {
        return fetch(pokemon.speciesUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                parseFlavorText(data, pokemon);
            })
            .catch(function(error) {
                console.error(error);
            });
    }

    function getAll() {
        return pokemonList;
    }

    function search(key, value) {
        let searchString = value.toLowerCase();
        return pokemonList.filter(function(pokemon) {
            return pokemon[key].toLowerCase().indexOf(searchString) !== -1;
        });
    }

    function searchPokemon() {
        let searchBar = document.getElementById('searchbar');
        let val = searchBar.value;
        let list = search('name', val);
        if (list) {
            cleanDisplay();
            display(list);
            modalHandler.setCurrentList(list);
        }
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

        button.addEventListener('click', function() {
            modalHandler.updateDetails(pokemon);
        });
    }

    function display(pokemons) {
        pokemons.forEach(function(pokemon) {
            addListItem(pokemon);
        });
    }

    function cleanDisplay() {
        let list = document.getElementById('pokemon-list');
        let elems = document.querySelectorAll('#pokemon-list li');
        for (let i = 0; i < elems.length; i++) {
            list.removeChild(elems[i]);
        }
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
        getAll: getAll,
        display: display,
        loadList: loadList,
        loadDetails: loadDetails,
        searchPokemon: searchPokemon,
        loadFlavorText: loadFlavorText
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
        // if there is no pokemon.height, all details needs to be fetched
        if (!pokemon.height) {
            pokemonRepo.loadDetails(pokemon).then(function() {
                return pokemonRepo.loadFlavorText(pokemon);
            }).then(function() {
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

    // this is needed only for very old browsers
    function createModalContent() {
        let modalDialog = '<div class="modal-dialog modal-dialog-centered modal-lg" role="document"><div class="modal-content"><div class="row align-items-center"><div class="col-12 col-md-8 offset-md-1 order-md-2" id="pkmn-modal"><div class="modal-header"><div class="modal-title"><div><h2 id="pkmn-name" class="pkmn-data"></h2><div id="modal-loading-message" class="spinner-border ml-3" role="status"><span class="sr-only">Loading...</span></div><p id="pkmn-id" class="modal-id pkmn-data"></p></div></div><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><div class="modal-flex"><p><span id="pkmn-height" class="pkmn-data"></span><br><span id="pkmn-types" class="pkmn-data"></span></p><img src="dist/img/empty.png" id="pkmn-img" title="Pokemon sprite"></div><p id="pkmn-text" class="pkmn-data"></p></div></div><button class="btn btn-light modalButton mt-2 col-3 col-md-1 order-md-1 pt-3 pb-3" type="button" onclick="modalHandler.swipeLeft()" aria-label="previous Pokemon"><span aria-hidden="true"><img src="img/chevron-right.svg" class="icon turn180"></span></button><button class="btn btn-light modalButton mt-2 col-3 col-md-1 order-md-3 offset-6 offset-md-1 pt-3 pb-3" type="button" onclick="modalHandler.swipeRight()" aria-label="next Pokemon"><span aria-hidden="true"><img src="img/chevron-right.svg" class="icon"></span></button></div></div></div>';
        $('#modal-container').append(modalDialog);
    }

    function updateModalContentFields(src, pokemon) {
        let types = pokemon.types.join(', ');
        let imgsrc = loadImage(pokemon);
        let flavorNr = getFlavorNr(pokemon);
        src.getElementById('pkmn-name').innerText = pokemon.name;
        src.getElementById('pkmn-id').innerText = ['#', pokemon.id].join('');
        src.getElementById('pkmn-height').innerText = ['Height: ', pokemon.height].join('');
        src.getElementById('pkmn-types').innerText = ['Types: ', types].join('');
        src.getElementById('pkmn-img').src = imgsrc;
        src.getElementById('pkmn-text').innerText = pokemon.flavorText[flavorNr];
    }

    function updateModalContent(pokemon) {
        listIndex = currentList.indexOf(pokemon);
        modalContainer.innerHTML = '';
        if ('content' in document.createElement('template')) {
            const template = document.getElementById('my-template');
            let modalClone = template.content.cloneNode(true);
            updateModalContentFields(modalClone, pokemon);
            modalContainer.append(modalClone);
        } else { // fallback for old Browsers
            createModalContent();
            updateModalContentFields(document, pokemon);
        }
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
        let colors = pokemon.types.map(function(x) {
            return colormap[x];
        });
        // for pokemon with only 1 type:
        if (colors.length === 1) {
            colors[1] = colors[0];
        }
        let bg = '#eeeeee';
        let box = document.getElementById('pkmn-modal');
        box.style.background = ['linear-gradient(', bg, ', ', bg, ') padding-box, linear-gradient(160deg, ', colors[0], ', ', colors[1], ') border-box'].join('');
    }

    function closeModal() {
        $('#modal-container').modal('hide');
    }

    function removeData() {
        $('.pkmn-data').each(function(nr, el) {
            el.innerText = '\u00a0'; // non-breaking whitespace
        });
        if (document.getElementById('pkmn-img')) {
            document.getElementById('pkmn-img').src = 'dist/img/empty.png';
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

    function addInitialEventListeners() {
        document.addEventListener('keydown', function(e) {
            if (modalContainer.classList.contains('show')) {
                if (e.key === 'Escape') {
                    closeModal();
                } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
                    swipeLeft();
                } else if (e.key === 'ArrowRight' || e.key === 'Right') {
                    swipeRight();
                }
            }
        });
    }

    return {
        addInitialEventListeners: addInitialEventListeners,
        updateDetails: updateDetails,
        createModalContent: createModalContent,
        swipeLeft: swipeLeft,
        swipeRight: swipeRight,
        setCurrentList: setCurrentList
    };
})();


pokemonRepo.loadList()
    .then(function() {
        modalHandler.addInitialEventListeners();
        pokemonRepo.display(pokemonRepo.getAll());
    });
