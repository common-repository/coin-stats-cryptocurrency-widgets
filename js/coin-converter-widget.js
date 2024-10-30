(function() {
  const config = { attributes: true };

  function createWidget(placeHolder) {
    let converterRows = [];

    let sellRow = null;
    let buyRow = null;
    let divider = null;
    let widgetTable = null;
    let sellCoin = {};
    let buyCoin = {};
    let sellCount = 1;
    let buyCount = 0;
    let buyInput = null;
    let sellInput = null;
    let sellCoinActive = -1;
    let searchResult = [];
    let sellRowPostion = 0;
    let buyRowPosition = 2;
    let globalType = 'large';
    let colors = {};

    function getData(firstCoinId, secondCoinId, callback) {
      return fetch(`https://api.coin-stats.com/v2/coins/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ average: [firstCoinId, secondCoinId] }),
      })
        .then(res => res.json())
        .then(res => callback(res.prices.average));
    }

    function createStyle() {
      const style = document.createElement('style');
      style.setAttribute('type', 'text/css');
      const styleCss = document.createTextNode(`
    .dropdown-option.active  > span {
      color: #ffa959;
    }
    .dropdown-option:hover {
      color: #ffa959;

    }
    .dropdown-container {
      display: none;
    }
    .dropdown-container.open {
      display: block;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type=number] {
        -moz-appearance:textfield;
    }
    coin-stats-converter-widget * {
      word-break: initial;
      word-wrap: initial;
      box-sizing: border-box;
    }
  `);

      style.appendChild(styleCss);

      return style;
    }

    (function() {
      const sellCoinId = placeHolder.getAttribute('sell-coin-id');
      const buyCoinId = placeHolder.getAttribute('buy-coin-id');
      if (!sellCoinId || !buyCoinId) {
        return;
      }
      getData(sellCoinId, buyCoinId, function(data) {
        const background = placeHolder.getAttribute('background');
        const text = placeHolder.getAttribute('text-color');
        const borderColor = placeHolder.getAttribute('border-color');
        const rotateButtonColor = placeHolder.getAttribute(
          'rotate-button-color'
        );
        const disableCredits = placeHolder.getAttribute('disable-credits');
        const type = placeHolder.getAttribute('type') || 'large';
        globalType = type;
        const width = placeHolder.getAttribute('width') || 310;
        const font = placeHolder.getAttribute('font') || 'Roboto, Arial, Helvetica';
        for (let i = 0; i < data.length; i++) {
          if (data[i].i === sellCoinId) {
            sellCoin = data[i];
          }
          if (data[i].i === buyCoinId) {
            buyCoin = data[i];
          }
        }

        buyCount = formatePrice(sellCoin.pu / buyCoin.pu, buyCoin.s);

        colors = {
          text: text,
          background: background,
          border: borderColor,
          rotateButton: rotateButtonColor,
        };

        const widgetContainer = document.createElement('div');
        widgetContainer.appendChild(createStyle());
        widgetTable = document.createElement('div');
        widgetTable.style.cssText = `
          padding: 10.5px 0;
          background-color: ${colors.background};
          border-radius: 29px;
          border: solid 1px ${colors.border};
          color: ${colors.text};
          max-width: ${Number(width) > 310 ? width + 'px' : '310px'};
          box-sizing: border-box;
          font-family: ${font}, sans-serif;
        `;

        sellRow = sellRowNode(sellCoin.ic, sellCoin.n, sellCoin.s);

        divider = createDivider();

        buyRow = buyRowNode(buyCoin.ic, buyCoin.n, buyCoin.s);

        converterRows[0] = sellRow;
        converterRows[1] = divider;
        converterRows[2] = buyRow;
        if (placeHolder.children.length === 1) {
          placeHolder.removeChild(placeHolder.lastChild);
        }
        for (let i = 0; i < converterRows.length; i++) {
          widgetTable.appendChild(converterRows[i]);
        }

        widgetContainer.appendChild(widgetTable);
        if (!disableCredits) {
          widgetContainer.appendChild(createCredits(colors.text, font));
        }
        placeHolder.appendChild(widgetContainer);
      });
    })();

    function createSearchDropDownOptionContainer(coins, keyword, field) {
      const searchDropDownOptionContainer = document.createElement('div');
      searchDropDownOptionContainer.setAttribute('class', 'dropdown-container');
      if (keyword) {
        searchDropDownOptionContainer.classList.add('open');
      } else {
        searchDropDownOptionContainer.classList.remove('open');
      }
      searchDropDownOptionContainer.style.cssText = `
        position: absolute;
        width: 100%;
        z-index: 999;
        background: ${colors.background};
        border-radius: 26px;
        padding: 8px 0;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
      `;

      const noResult = document.createElement('p');
      noResult.style.cssText = `
        text-align: center;
        opacity: 0.5;
        font-size: 10px;
        font-weight: 500;
      `;
      noResult.appendChild(document.createTextNode('NO RESULTS'));
      if (!coins.length) {
        searchDropDownOptionContainer.appendChild(noResult);
      }
      for (let i = 0; i < coins.length; i++) {
        searchDropDownOptionContainer.appendChild(
          renderDropdownOption(coins[i], i, field)
        );
      }
      return searchDropDownOptionContainer;
    }

    function createSellSearchInputNode() {
      const searchContainer = document.createElement('div');
      const searchInput = document.createElement('input');
      searchContainer.style.cssText = `
        position: relative;
      `;
      searchInput.style.cssText = `
        background: transparent;
        height: 38px;
        background: transparent;
        border: none;
        outline: none;
        font-size: 16px;
        font-weight: 300;
        font-style: normal;
        font-stretch: normal;
        line-height: normal;
        letter-spacing: normal;
        color: ${colors.text} !important;
      `;
      searchInput.setAttribute('type', 'text');
      searchInput.setAttribute('placeholder', 'Search...');
      searchContainer.appendChild(searchInput);
      searchInput.addEventListener('keyup', function(e) {
        if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 13) {
          handleDropDownNavigation(e, searchContainer, 'sell');
          return;
        }
        handleSearchCoin(e.target.value, searchContainer, 'sell');
      });
      return searchContainer;
    }

    function createBuySearchInputNode() {
      const searchContainer = document.createElement('div');
      const searchInput = document.createElement('input');
      searchContainer.style.cssText = `
        position: relative;
      `;
      searchInput.style.cssText = `
        background: transparent;
        height: 38px;
        background: transparent;
        border: none;
        outline: none;
        font-size: 16px;
        font-weight: 300;
        font-style: normal;
        font-stretch: normal;
        line-height: normal;
        letter-spacing: normal;
        color: ${colors.text} !important;
      `;
      searchInput.setAttribute('type', 'text');
      searchInput.setAttribute('placeholder', 'Search...');
      searchContainer.appendChild(searchInput);
      searchInput.addEventListener('keyup', function(e) {
        if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 13) {
          handleDropDownNavigation(e, searchContainer, 'buy');
          return;
        }
        handleSearchCoin(e.target.value, searchContainer, 'buy');
      });
      return searchContainer;
    }

    function handleDropDownNavigation(e, container, field) {
      if (e.keyCode === 40) {
        if (sellCoinActive === 4) {
          sellCoinActive = -1;
        }
        removeClass(container.lastChild.children);
        ++sellCoinActive;
      }
      if (e.keyCode === 38) {
        if (sellCoinActive === 0) {
          sellCoinActive = 5;
        }
        removeClass(container.lastChild.children);
        --sellCoinActive;
      }
      if (e.keyCode === 13) {
        const activeElement = container.getElementsByClassName('active')[0];
        const index = activeElement.getAttribute('data-index');
        const coin = searchResult[Number(index)];

        selectCoin(field, coin);
        widgetTable.innerHTML = '';
        if (field === 'sell') {
          if (sellRowPostion === 0) {
            buyCount = formatePrice(sellCoin.pu / buyCoin.pu, buyCoin.s);
          } else {
            sellCount = formatePrice(buyCoin.pu / sellCoin.pu, sellCoin.s);
          }

          sellRow = sellRowNode(coin.ic, coin.n, coin.s);
          converterRows[sellRowPostion] = sellRow;
        } else {
          if (sellRowPostion === 2) {
            sellCount = formatePrice(buyCoin.pu / sellCoin.pu, sellCoin.s);
          } else {
            buyCount = formatePrice(sellCoin.pu / buyCoin.pu, buyCoin.s);
          }

          buyRow = buyRowNode(coin.ic, coin.n, coin.s);
          converterRows[buyRowPosition] = buyRow;
        }

        sellInput = sellRow.lastChild;
        buyInput = buyRow.lastChild;

        for (let i = 0; i < converterRows.length; i++) {
          widgetTable.appendChild(converterRows[i]);
        }

        if (field === 'sell' && sellRowPostion === 0) {
          sellInput.lastChild.focus();
          sellInput.lastChild.select();
          buyInput.lastChild.value = buyCount;
        } else if (field === 'buy' && sellRowPostion === 2) {
          buyInput.lastChild.focus();
          buyInput.lastChild.select();
          sellInput.lastChild.value = sellCount;
        }
      }
      container.lastChild.children[sellCoinActive].classList.add('active');
    }

    function removeClass(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active');
      }
    }

    function handleSearchCoin(keyword, searchContainer, field) {
      fetch(
        `https://api.coin-stats.com/v4/coins?keyword=${keyword}&limit=5`
      ).then(result =>
        result.json().then(result => {
          sellCoinActive = -1;
          if (searchContainer.children.length > 1) {
            searchContainer.removeChild(searchContainer.children[1]);
          }
          searchResult = result.coins;
          const searchDropDownOptionContainer = createSearchDropDownOptionContainer(
            result.coins,
            keyword,
            field
          );
          searchContainer.appendChild(searchDropDownOptionContainer);
        })
      );
    }

    function renderDropdownOption(coin, i, field) {
      const option = document.createElement('div');
      option.setAttribute('class', 'dropdown-option');
      option.style.cssText = `
        width: 100%;
        box-sizing: border-box;
        transition: 300ms color;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 300;
      `;
      const coinName = document.createElement('span');
      option.setAttribute('data-index', i);
      coinName.appendChild(document.createTextNode(`${coin.n} (${coin.s})`));
      option.appendChild(createLogo(coin.ic));
      option.appendChild(coinName);
      option.addEventListener('click', function(e) {
        selectCoin(field, coin);
        option.parentNode.classList.remove('open');
        widgetTable.innerHTML = '';
        if (field === 'sell') {
          if (sellRowPostion === 0) {
            buyCount = formatePrice(sellCoin.pu / buyCoin.pu, buyCoin.s);
          } else {
            sellCount = formatePrice(buyCoin.pu / sellCoin.pu, sellCoin.s);
          }
          sellRow = sellRowNode(coin.ic, coin.n, coin.s);
          converterRows[sellRowPostion] = sellRow;
        } else {
          if (sellRowPostion === 2) {
            sellCount = formatePrice(buyCoin.pu / sellCoin.pu, sellCoin.s);
          } else {
            buyCount = formatePrice(sellCoin.pu / buyCoin.pu, buyCoin.s);
          }
          buyRow = buyRowNode(coin.ic, coin.n, coin.s);
          converterRows[buyRowPosition] = buyRow;
        }
        sellInput = sellRow.lastChild;
        buyInput = buyRow.lastChild;

        for (let i = 0; i < converterRows.length; i++) {
          widgetTable.appendChild(converterRows[i]);
        }

        if (field === 'sell' && sellRowPostion === 0) {
          sellInput.lastChild.focus();
          sellInput.lastChild.select();
          buyInput.lastChild.value = buyCount;
        } else if (field === 'buy' && sellRowPostion === 2) {
          buyInput.lastChild.focus();
          buyInput.lastChild.select();
          sellInput.lastChild.value = sellCount;
        }
      });
      return option;
    }

    function selectCoin(field, coin) {
      if (field === 'buy') {
        buyCoin = coin;
      } else {
        sellCoin = coin;
      }
    }

    function formatePrice(price, symbol) {
      var minimumFractionDigits = 2;

      if (price % 1 === 0) {
        minimumFractionDigits = 0;
      } else if (symbol === 'BTC') {
        minimumFractionDigits = 8;
      } else if (symbol === 'ETH' && price < 1 && price > -1) {
        minimumFractionDigits = 8;
      } else if (price < 1 && price > -1) {
        minimumFractionDigits = 6;
      } else {
        minimumFractionDigits = 2;
      }

      return Number(price.toFixed(minimumFractionDigits));
    }

    function iconMaker(icon) {
      if (icon && icon.toLowerCase().indexOf('http') >= 0) {
        return icon;
      }
      return `https://api.coin-stats.com/api/files/812fde17aea65fbb9f1fd8a478547bde/${icon}`;
    }

    function createLogo(src) {
      const icon = document.createElement('img');
      icon.setAttribute('src', iconMaker(src));
      icon.style.cssText = `
    width: 24px;
    height: 24px;
    margin-right: 14px;
  `;
      return icon;
    }

    function createSellInput() {
      const priceInputContainer = document.createElement('div');
      const priceInput = document.createElement('input');
      priceInput.style.cssText = `
    width: 76%;
    margin-left: 17px;
    height: 38px;
    background: transparent;
    border: none;
    outline: none;
    font-size: 16px;
    font-weight: 300;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: ${colors.text} !important;
    padding: 0;
  `;
      priceInput.setAttribute('type', 'number');
      priceInput.setAttribute('placeholder', 'Count');
      priceInput.addEventListener('keyup', handleSellPriceChange);
      priceInput.value = sellCount;

      priceInputContainer.appendChild(priceInput);
      return priceInputContainer;
    }

    function createBuyInput() {
      const priceInputContainer = document.createElement('div');
      const priceInput = document.createElement('input');
      priceInput.style.cssText = `
    width: 76%;
    margin-left: 17px;
    height: 38px;
    background: transparent;
    border: none;
    outline: none;
    font-size: 16px;
    font-weight: 300;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: ${colors.text} !important;
    padding: 0;
  `;
      priceInput.setAttribute('type', 'number');
      priceInput.setAttribute('placeholder', 'Count');
      priceInput.addEventListener('keyup', handleBuyPriceChange);
      priceInput.value = buyCount;
      priceInputContainer.appendChild(priceInput);
      return priceInputContainer;
    }

    function handleSellPriceChange(e) {
      sellCount = e.target.value;
      buyCount = formatePrice(
        (sellCount * sellCoin.pu) / buyCoin.pu,
        buyCoin.s
      );
      buyInput.firstChild.value = buyCount;
    }

    function handleBuyPriceChange(e) {
      sellCount = formatePrice(
        (e.target.value * buyCoin.pu) / sellCoin.pu,
        sellCoin.s
      );
      buyCount = e.target.value;
      sellInput.firstChild.value = sellCount;
    }

    function createDivider() {
      const dividerContainer = document.createElement('div');
      const divider = document.createElement('div');
      const rotateButton = document.createElement('div');
      if (globalType === 'large' || globalType === 'small') {
        divider.style.cssText = `
          width: 100%;
          height: 1px;
          background: ${colors.border};
        `;
        dividerContainer.style.cssText = `
          display: flex;
          align-items: center;
        `;
        rotateButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="22" viewBox="0 0 24 22">
            <path fill="${colors.rotateButton}" fill-rule="evenodd" d="M2.2 10.9c0-2.367.777-4.459 2.146-6.163l-2.06.976a.9.9 0 1 1-.772-1.626l3.8-1.8a.901.901 0 0 1 1.203.436l1.8 3.9a.9.9 0 0 1-1.635.755L5.9 5.682C4.688 7.106 4 8.865 4 10.9c0 4.503 3.597 8.1 8.1 8.1.773 0 1.47-.17 2.281-.373a.9.9 0 1 1 .437 1.746l-.035.009c-.78.195-1.672.418-2.683.418a9.862 9.862 0 0 1-9.9-9.9m7.618-7.727C10.63 2.97 11.326 2.8 12.1 2.8c4.503 0 8.1 3.597 8.1 8.1 0 1.943-.627 3.634-1.74 5.023l-.163-2.287a.9.9 0 1 0-1.795.128l.3 4.2a.9.9 0 0 0 .981.832l4.3-.4a.9.9 0 0 0-.167-1.792l-1.84.171C21.307 15.125 22 13.136 22 10.9 22 5.403 17.597 1 12.1 1c-1.01 0-1.902.223-2.683.418l-.035.009a.9.9 0 1 0 .436 1.746"/>
          </svg>
        `;
        rotateButton.style.cssText = `
          margin: 0 20px;
          width: 24px;
          height: 22px;
          cursor: pointer;
        `;
      }

      if (globalType === 'medium') {
        divider.style.cssText = `
          width: 100%;
          height: 1px;
          background: rgba(255, 255, 255, 0.07);
        `;
        dividerContainer.style.cssText = `
          display: flex;
          align-items: center;
          padding: 22px 0px;
          position: relative;
        `;
        rotateButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="22" viewBox="0 0 24 22">
              <path fill="${colors.rotateButton}" fill-rule="evenodd" d="M2.2 10.9c0-2.367.777-4.459 2.146-6.163l-2.06.976a.9.9 0 1 1-.772-1.626l3.8-1.8a.901.901 0 0 1 1.203.436l1.8 3.9a.9.9 0 0 1-1.635.755L5.9 5.682C4.688 7.106 4 8.865 4 10.9c0 4.503 3.597 8.1 8.1 8.1.773 0 1.47-.17 2.281-.373a.9.9 0 1 1 .437 1.746l-.035.009c-.78.195-1.672.418-2.683.418a9.862 9.862 0 0 1-9.9-9.9m7.618-7.727C10.63 2.97 11.326 2.8 12.1 2.8c4.503 0 8.1 3.597 8.1 8.1 0 1.943-.627 3.634-1.74 5.023l-.163-2.287a.9.9 0 1 0-1.795.128l.3 4.2a.9.9 0 0 0 .981.832l4.3-.4a.9.9 0 0 0-.167-1.792l-1.84.171C21.307 15.125 22 13.136 22 10.9 22 5.403 17.597 1 12.1 1c-1.01 0-1.902.223-2.683.418l-.035.009a.9.9 0 1 0 .436 1.746"/>
          </svg>
        `;
        rotateButton.style.cssText = `
          width: 24px;
          height: 22px;
          cursor: pointer;
          position: absolute;
          background: ${colors.background};
          padding: 0 11px;
          box-sizing: content-box;
          left: calc(50% - 24px);
        `;
      }

      rotateButton.addEventListener('click', rotate);

      dividerContainer.appendChild(divider);
      dividerContainer.appendChild(rotateButton);
      return dividerContainer;
    }

    function rotate() {
      if (converterRows[0] === sellRow) {
        buyRowPosition = 0;
        sellRowPostion = 2;
        converterRows[0] = buyRow;
        converterRows[2] = sellRow;
      } else {
        buyRowPosition = 2;
        sellRowPostion = 0;
        converterRows[2] = buyRow;
        converterRows[0] = sellRow;
      }
      const buyCountHolder = buyCount;

      buyCount = sellCount;
      sellCount = buyCountHolder;

      for (let i = 0; i < converterRows.length; i++) {
        widgetTable.appendChild(converterRows[i]);
      }
    }

    function sellRowNode(iconSrc, name, symbol) {
      const tableRowNode = document.createElement('div');
      const coinContainer = document.createElement('div');
      const logoNode = createLogoNode(iconSrc);
      const nameNode = createNameNode(name, symbol);
      if (globalType === 'large' || globalType === 'small') {
        coinContainer.style.cssText = `
          display: flex;
          align-items: center;
          cursor: pointer;
          width: 50%;
        `;
        tableRowNode.style.cssText = `
          display: flex;
          align-items: center;
          margin: 0 30px;
        `;
        sellInput = createSellInput();
        sellInput.style.cssText = `
          width: 50%;
        `;
      }
      if (globalType === 'medium') {
        coinContainer.style.cssText = `
          display: flex;
          align-items: center;
          cursor: pointer;
          width: 100%;
        `;
        tableRowNode.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 30px;
        `;
        sellInput = createSellInput();
        sellInput.style.cssText = `
          width: 100%;
          margin-left: 35px;
          margin-top: 7px;
        `;
      }

      coinContainer.appendChild(logoNode);
      coinContainer.appendChild(nameNode);
      coinContainer.addEventListener('click', function() {
        changeSellViewInput(coinContainer);
      });
      tableRowNode.appendChild(coinContainer);
      tableRowNode.appendChild(sellInput);
      return tableRowNode;
    }

    function changeSellViewInput(container) {
      if (container.children.length === 1) {
        return;
      }
      container.innerHTML = '';
      sellCoin = {};

      const sellSearchInputNode = createSellSearchInputNode();

      container.appendChild(sellSearchInputNode);
      sellSearchInputNode.firstChild.focus();
    }

    function changeBuyViewInput(container) {
      if (container.children.length === 1) {
        return;
      }
      container.innerHTML = '';
      buyCoin = {};

      const buySearchInputNode = createBuySearchInputNode();

      container.appendChild(buySearchInputNode);

      buySearchInputNode.firstChild.focus();
    }

    function buyRowNode(iconSrc, name, symbol) {
      const tableRowNode = document.createElement('div');
      const coinContainer = document.createElement('div');
      const logoNode = createLogoNode(iconSrc);
      const nameNode = createNameNode(name, symbol);
      if (globalType === 'large' || globalType === 'small') {
        coinContainer.style.cssText = `
          display: flex;
          align-items: center;
          cursor: pointer;
          width: 50%;
        `;
        tableRowNode.style.cssText = `
          display: flex;
          align-items: center;
          margin: 0 30px;
        `;
        buyInput = createBuyInput();
        buyInput.style.cssText = `
          width: 50%;
        `;
      }
      if (globalType === 'medium') {
        coinContainer.style.cssText = `
          display: flex;
          align-items: center;
          cursor: pointer;
          width: 100%;
        `;
        tableRowNode.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 30px;
        `;
        buyInput = createBuyInput();
        buyInput.style.cssText = `
          width: 100%;
          margin-left: 35px;
          margin-top: 7px;
        `;
      }

      coinContainer.appendChild(logoNode);
      coinContainer.appendChild(nameNode);
      coinContainer.addEventListener('click', function() {
        changeBuyViewInput(coinContainer);
      });
      tableRowNode.appendChild(coinContainer);
      tableRowNode.appendChild(buyInput);
      return tableRowNode;
    }

    function createCredits(textColor, font) {
      const credits = document.createElement('div');
      const anchor = document.createElement('a');

      anchor.href = `http://coinstats.app`;
      anchor.target = '_blank';
      anchor.innerHTML =
        'Powered by <span style="letter-spacing: 0.25px;font-size: 14px; vertical-align: unset;">Coin<b style="vertical-align: unset;">Stats</b></span>';
      anchor.style.cssText = `
      font-size: 12px;
      font-weight: 300;
      text-decoration: none;
      color: ${textColor};
      vertical-align: unset;
      font-family: ${font}, sans-serif;
    `;

      credits.style.cssText = `
      padding-top: 10px;
      padding-left: 34px;
      vertical-align: unset;
    `;

      credits.appendChild(anchor);

      return credits;
    }

    function createNameNode(name, symbol) {
      const tableDataNode = document.createElement('div');
      const nameNode = document.createElement('span');

      if (globalType === 'small') {
        nameNode.innerHTML = symbol;
      } else {
        nameNode.innerHTML = `${name} (${symbol})`;
      }

      nameNode.style.cssText = `
        font-size: 16px;
        font-weight: 300;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
      `;
      tableDataNode.appendChild(nameNode);
      tableDataNode.style.display = 'flex';
      return tableDataNode;
    }

    function createLogoNode(src) {
      const tableDataNode = document.createElement('div');
      const logoNode = document.createElement('img');

      logoNode.setAttribute('src', iconMaker(src));
      logoNode.style.cssText = `
    height: 25px;
    width: 25px;
  `;
      tableDataNode.style.cssText = `
    text-align: center;
    display: flex;
    margin-right: 15px;
  `;

      tableDataNode.appendChild(logoNode);

      return tableDataNode;
    }
  }

  function ready(callbackFunc) {
    if (document.readyState !== 'loading') {
      callbackFunc();
    } else if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', callbackFunc);
    } else {
      document.attachEvent('onreadystatechange', function() {
        if (document.readyState === 'complete') {
          callbackFunc();
        }
      });
    }
  }

  function initAll() {
    const allPlaceHolders = document.querySelectorAll(
      'coin-stats-converter-widget'
    );

    allPlaceHolders.forEach(node => {
      createWidget(node);
    });
  }

  function observeMutations() {
    const nodes = document.querySelectorAll('coin-stats-converter-widget');

    const observer = new MutationObserver(callback);

    nodes.forEach(node => {
      const disable = node.getAttribute('disable-mutation-observer');

      if (!disable) {
        observer.observe(node, config);
      }
    });

    function callback(MutationRecord) {
      createWidget(MutationRecord[0].target);
    }
  }

  ready(function() {
    initAll();
    observeMutations();
  });
})();
