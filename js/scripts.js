const pokemonRepo = (function() {
    const pokemonList = [];
    const apiUrl = 'https://pokeapi.co/api/v2/pokemon/?limit=251';

    function parsePokemon(item) {
        let pokemon = {
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            detailsUrl: item.url
        };
        add(pokemon);
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

    function add(pokemon) {
        pokemonList.push(pokemon);
    }

    function getAll() {
        return pokemonList;
    }

    function search(key, value) {
        if (typeof value === 'string') {
            return pokemonList.filter((pokemon) => pokemon[key].includes(value));
        }
        return pokemonList.filter((pokemon) => pokemon[key] === value);
    }

    function addListItem(pokemon) {
        let ul = document.getElementById('pokemon-list');
        let li = document.createElement('li');
        let button = document.createElement('button');
        button.innerText = pokemon.name;
        button.classList.add('pokemon-list__item');
        li.appendChild(button);
        ul.appendChild(li);

        button.addEventListener('click', () => modalHandler.showDetails(pokemon));
    }

    function display(pokemons) {
        pokemons.forEach((pokemon) => addListItem(pokemon));
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
        loadDetails
    };
})();


const modalHandler = (function() {
    // modal utility
    let modalShownIndex = null;

    function showDetails(pokemon) {
        scrollLock();
        if (!pokemon.height) { // if height is not there, others are not there
            pokemonRepo.loadDetails(pokemon)
                .then(() => showModal(pokemon));
        } else {
            showModal(pokemon);
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

    function createModalContent(pokemon) {
        let modalContainer = document.getElementById('modal-container');
        modalShownIndex = pokemon.id - 1; // as of now, pokemon ID = list index + 1

        let modal = document.createElement('div');
        modal.classList.add('modal');

        let closeButtonElement = document.createElement('button');
        closeButtonElement.classList.add('modal-close');
        closeButtonElement.innerText = 'X';
        // event for closing modal close button - added to the button:
        closeButtonElement.addEventListener('click', closeModal);

        let titleElement = document.createElement('h2');
        titleElement.innerText = pokemon.name;

        let idElement = document.createElement('p');
        idElement.classList.add('modal-id');
        idElement.innerText = `#${pokemon.id}`;

        let flexElement = document.createElement('div');
        flexElement.classList.add('modal-flex');

        let contentElement = document.createElement('p');
        let types = pokemon.types.join(', ');
        contentElement.innerText = `Height: ${pokemon.height}
                                    Types: ${types}`;

        let imageElement = document.createElement('img');
        imageElement.src = loadImage(pokemon);

        modal.appendChild(closeButtonElement);
        modal.appendChild(titleElement);
        modal.appendChild(idElement);
        modal.appendChild(flexElement);
        flexElement.appendChild(contentElement);
        flexElement.appendChild(imageElement);
        modalContainer.appendChild(modal);
    }

    function showModal(pokemon) {
        pokemonRepo.showLoadingMessage();
        let modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = '';
        createModalContent(pokemon);
        modalContainer.classList.remove('hidden');
        pokemonRepo.hideLoadingMessage();
    }

    function closeModal() {
        let modalContainer = document.getElementById('modal-container');
        modalContainer.classList.add('hidden');
        scrollAllow();
    }

    // swiping utility

    function swipeLeft() {
        let newIndex = modalShownIndex - 1;
        let pokemon = pokemonRepo.getAll()[newIndex];
        showDetails(pokemon);
    }

    function swipeRight() {
        let newIndex = modalShownIndex + 1;
        let pokemon = pokemonRepo.getAll()[newIndex];
        showDetails(pokemon);
    }

    let startX = 0;
    let endX = 0;
    let thresholdDistance = 100;

    function gestureStart(e) {
        console.log('gestureStart');
        startX = e.clientX;
    }

    function gestureEnd(e) {
        console.log('gestureEnd');
        endX = e.clientX;
        let deltaX = endX - startX;
        startX = 0;
        endX = 0;
        let modalContainer = document.querySelector('#modal-container');
        let target = e.target;

        if (!modalContainer.classList.contains('hidden')) {
            if (deltaX > thresholdDistance) {
                swipeLeft();
            } else if (deltaX < -thresholdDistance) {
                swipeRight();
            } else if (target === modalContainer) {
                closeModal();
            }
        }
    }

    function lockBackground(e) {
        if (e.target === e.currentTarget) {
            e.preventDefault();
        }
    }

    // background scroll locking workaround from
    // https://www.jayfreestone.com/writing/locking-body-scroll-ios/

    let scrollTop = 0;

    function scrollLock() {
        let modalContainer = document.querySelector('#modal-container');
        if (modalContainer.classList.contains('hidden')) {
            scrollTop = window.scrollY;
            console.log('scrollLock', scrollTop);
        }
        let content = document.querySelector('.page-container');
        content.classList.add('fixed');
        modalContainer.classList.add('modal--open');
        content.scroll(0, scrollTop);
    }

    function scrollAllow() {
        let modalContainer = document.querySelector('#modal-container');
        if (modalContainer.classList.contains('hidden')) {
            let content = document.querySelector('.page-container');
            content.classList.remove('fixed');
            modalContainer.classList.remove('modal--open');
            window.scroll(0, scrollTop);
        }
    }

    function addInitialEventListeners() {
        let modalContainer = document.querySelector('#modal-container');
        modalContainer.addEventListener('pointerdown', gestureStart);
        modalContainer.addEventListener('pointerup', gestureEnd);
        modalContainer.addEventListener('touchstart', (e) => lockBackground(e), {passive: false});
        modalContainer.addEventListener('touchmove', (e) => lockBackground(e), {passive: false});

        window.addEventListener('keydown', (e) => {
            if (!modalContainer.classList.contains('hidden')) {
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
        showDetails
    };
})();


pokemonRepo.loadList()
    .then(() => {
        modalHandler.addInitialEventListeners();
        pokemonRepo.display(pokemonRepo.getAll());
    });
