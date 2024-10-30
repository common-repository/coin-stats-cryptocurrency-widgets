(function() {
  const config = { attributes: true };
  let globalCurrencies = {};

  function CoinCalculator() {
    this._createWidget = _createWidget;
    this._createFirstLine = _createFirstLine;
    this._createInvestNode = _createInvestNode;
    this._createFirstLineInput = _createFirstLineInput;
    this._createSecondLine = _createSecondLine;
    this._createThirdLine = _createThirdLine;
    this._createThirdLineInvested = _createThirdLineInvested;
    this._createFourthLine = _createFourthLine;
    this._createSearchInputNode = _createSearchInputNode;
    this._handleDropDownNavigation = _handleDropDownNavigation;
    this._handleSearchCoin = _handleSearchCoin;
    this._createSearchDropDownOptionContainer = _createSearchDropDownOptionContainer;
    this._renderDropdownOption = _renderDropdownOption;
    this.getCurrencies = getCurrencies;
    this.getPriceByCurrency = getPriceByCurrency;
    this.getCoinData = getCoinData;
    this.getInvested = getInvested;
    this.dispatchUpdatedData = dispatchUpdatedData;
    this.isEditable = true;
    this.investedDate = null;
    this.dateString = '';
    this.currencies = globalCurrencies;
    this.currency = {};
    this._iconMaker = _iconMaker;
    this._selectCoin = _selectCoin;
    this.selectedCoin = {};
    this.searchResult = [];
    this.secondLineContainer = null;
    this.thirdLineInvestedContainer = null;
    this.colors = {};
    this.proxy = null;
    this.total = 0;
    this.investTotal = 0;
    this.perTotal = 0;
    this.fourthLineContainer = null;
    this.sellCoinActive = -1;
    this.placeHolder = null;
    this.type = 'invest';
    this.createStyle = createStyle;

    function getCoinData(coinId, callback) {
      return fetch(`https://api.coin-stats.com/v2/coins/${coinId}`)
        .then(res => res.json())
        .then(res => callback(res));
    }

    function getInvested(amount, coinId, time, callback) {
      return fetch(
        `https://api.coin-stats.com/v2/calculator/invested/?coinId=${coinId}&time=${time}&amount=${amount}`
      )
        .then(res => res.json())
        .then(res => {
          callback(res.amount);
        });
    }

    function createStyle() {
      const style = document.createElement('style');
      style.setAttribute('type', 'text/css');
      const styleCss = document.createTextNode(`
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
      }
      input[type=number] {
          -moz-appearance:textfield;
      }
      .coin-stats-calculator-container > * {
        margin-bottom: 18px;
      }
      .coin-stats-calculator-container > *:last-child {
        margin-bottom: 0px;
      }
        .dropdown-option.active  > span {
          color: ${this.colors.selection};
        }
        .dropdown-option:hover {
          color: ${this.colors.selection};
          cursor: pointer;
        }
        .dropdown-container {
          display: none;
        }
        .dropdown-container.open {
          display: block;
        }
        div.coin-stats-invested-date {
          position: relative;
          cursor: pointer;
        }
        div.coin-stats-invested-date > input {
          position: absolute;
          opacity: 0;
          top: 10px;
        }
        div.coin-stats-invested-date > input::-webkit-calendar-picker-indicator {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
        }
        coin-stats-calculator-widget * {
          word-break: initial;
          word-wrap: initial;
          box-sizing: border-box;
        }
     `);

      style.appendChild(styleCss);

      return style;
    }

    function _createWidget(placeHolder) {
      const background = placeHolder.getAttribute('background');
      const textColor = placeHolder.getAttribute('text-color');
      const selectionColor = placeHolder.getAttribute('selection-color');
      const borderColor = placeHolder.getAttribute('border-color');
      const currency = placeHolder.getAttribute('currency');
      this.type = placeHolder.getAttribute('type');
      this.investTotal = placeHolder.getAttribute('invest-amount') || 0;
      this.perTotal = placeHolder.getAttribute('per-coin-price') || 0;
      this.dateString = placeHolder.getAttribute('date');
      const disableCredits = placeHolder.getAttribute('disable-credits');
      const font = placeHolder.getAttribute('font') || 'Roboto, Arial, Helvetica';
      this.investedDate = this.dateString
        ? new Date(this.dateString).getTime()
        : '';
      const coinId = placeHolder.getAttribute('coin-id');
      this.isEditable =
        placeHolder.getAttribute('is-editable') === 'true' ? true : false;
      this.currency = this.currencies[currency.toUpperCase()];

      const widgetContainer = document.createElement('div');
      const widgetBlock = document.createElement('div');
      this.colors = {
        background: background,
        text: textColor,
        selection: selectionColor,
        border: borderColor,
      };

      widgetBlock.style.cssText = `
        background: ${background};
        max-width: 327px;
        border-radius: 29px;
        border: solid 1px ${this.colors.border};
        padding: 20px;
        font-size: 24px;
        font-weight: 300;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        box-sizing: border-box;
        font-family: ${font}, sans-serif;
        color: ${textColor};
      `;

      placeHolder.innerHTML = '';
      this.placeHolder = placeHolder;
      if (coinId) {
        this.getCoinData(coinId, data => {
          this.selectedCoin = data;
          widgetBlock.appendChild(this._createInvestNode());
          placeHolder.appendChild(this.createStyle());
          widgetContainer.appendChild(widgetBlock);
          if (!disableCredits) {
            widgetContainer.appendChild(createCredits(this.colors.text, font));
          }
          placeHolder.appendChild(widgetContainer);
        });
      } else {
        widgetBlock.appendChild(this._createInvestNode());
        placeHolder.appendChild(this.createStyle());
        widgetContainer.appendChild(widgetBlock);
        if (!disableCredits) {
          widgetContainer.appendChild(createCredits(this.colors.text, font));
        }
        placeHolder.appendChild(widgetContainer);
      }
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

    function _createInvestNode() {
      const container = document.createElement('div');
      container.setAttribute('class', 'coin-stats-calculator-container');
      const textNode = document.createElement('p');
      textNode.style.cssText = `
         margin-bottom: 18px;
      `;
      const text = document.createTextNode('today and it goes to');
      this.secondLineContainer = document.createElement('div');
      this.fourthLineContainer = document.createElement('div');
      this.fourthLineContainer.appendChild(this._createFourthLine());
      this.secondLineContainer.appendChild(this._createSecondLine());
      textNode.appendChild(text);
      container.appendChild(this._createFirstLine(this.placeHolder));
      container.appendChild(this._createFirstLineInput());
      container.appendChild(this.secondLineContainer);
      if (this.type === 'invest') {
        container.appendChild(textNode);
        container.appendChild(this._createThirdLine());
      }
      if (this.type === 'invested') {
        this.thirdLineInvestedContainer = document.createElement('div');
        this.thirdLineInvestedContainer.appendChild(
          this._createThirdLineInvested()
        );
        container.appendChild(this.thirdLineInvestedContainer);
      }
      container.appendChild(this.fourthLineContainer);
      return container;
    }

    function _createThirdLineInvested() {
      const containerWrapper = document.createElement('div');
      const container = document.createElement('div');
      const text = document.createTextNode('on');
      container.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 18px;
      `;
      const dateInput = document.createElement('input');
      if (!this.isEditable) {
        dateInput.setAttribute('disabled', 'true');
      }
      dateInput.setAttribute('type', 'date');
      dateInput.addEventListener('change', e => {
        if (!this.isEditable) {
          return;
        }
        this.dateString = e.target.value;
        this.investedDate = e.target.valueAsNumber;
        this.thirdLineInvestedContainer.removeChild(
          this.thirdLineInvestedContainer.firstChild
        );
        this.thirdLineInvestedContainer.appendChild(
          this._createThirdLineInvested()
        );
        if (this.selectedCoin.i && this.investTotal) {
          this.getInvested(
            this.investTotal,
            this.selectedCoin.i,
            this.investedDate,
            amount => {
              this.total = amount;
              this.fourthLineContainer.removeChild(
                this.fourthLineContainer.firstChild
              );
              this.fourthLineContainer.appendChild(this._createFourthLine());
            }
          );
        }
        this.dispatchUpdatedData();
      });
      const dateString = document.createTextNode(
        this.dateString ? this.dateString : 'Date'
      );
      const spanDate = document.createElement('span');
      const dateButton = document.createElement('div');
      dateButton.setAttribute('class', 'coin-stats-invested-date');
      dateButton.style.cssText = `
      text-decoration: underline;
      color: ${this.colors.selection};
      cursor: pointer;
      `;
      const nextLineContainer = document.createElement('div');
      const wourthText = document.createTextNode('it would be worth');
      nextLineContainer.appendChild(wourthText);
      containerWrapper.appendChild(container);
      container.appendChild(text);
      dateButton.appendChild(dateInput);
      spanDate.style.cssText = `
        padding-left: 11px;
      `;
      spanDate.appendChild(dateString);
      dateButton.appendChild(spanDate);
      container.appendChild(dateButton);
      containerWrapper.appendChild(nextLineContainer);

      return containerWrapper;
    }

    function _createFirstLine(placeHolder) {
      const container = document.createElement('div');
      const simpleText = document.createTextNode('If I');
      const button = document.createElement('div');
      const buttonText = document.createTextNode(
        this.type === 'invest' ? 'invest' : 'invested'
      );
      container.style.cssText = `
        display: flex;
      `;
      button.style.cssText = `
        color: ${this.colors.selection};
        cursor: pointer;
        margin-left: 11px;
        text-decoration: underline;
      `;
      button.appendChild(buttonText);
      button.addEventListener('click', e => {
        if (!this.isEditable) {
          return;
        }
        if (this.type === 'invest') {
          this.type = 'invested';
          placeHolder.setAttribute('type', this.type);
        } else if (this.type === 'invested') {
          this.type = 'invest';
          placeHolder.setAttribute('type', this.type);
        }
        this.dispatchUpdatedData();
      });
      container.appendChild(simpleText);
      container.appendChild(button);
      return container;
    }

    function _createFirstLineInput() {
      const container = document.createElement('div');
      const currencyContainer = document.createElement('span');

      const priceInput = document.createElement('input');
      priceInput.setAttribute('type', 'number');
      if (!this.isEditable) {
        priceInput.setAttribute('disabled', 'true');
      }
      priceInput.setAttribute('value', this.investTotal);
      priceInput.addEventListener('keyup', e => {
        if (!this.isEditable) {
          return;
        }
        this.investTotal = e.target.value;
        if (this.selectedCoin.i && this.type === 'invest') {
          this.total =
            (e.target.value / this.getPriceByCurrency(this.selectedCoin.pu)) *
            this.perTotal;
          this.fourthLineContainer.removeChild(
            this.fourthLineContainer.firstChild
          );
          this.fourthLineContainer.appendChild(this._createFourthLine());
        } else if (
          this.selectedCoin.i &&
          this.dateString &&
          this.type === 'invested'
        ) {
          this.getInvested(
            this.investTotal,
            this.selectedCoin.i,
            this.investedDate,
            amount => {
              this.total = amount;
              this.fourthLineContainer.removeChild(
                this.fourthLineContainer.firstChild
              );
              this.fourthLineContainer.appendChild(this._createFourthLine());
            }
          );
        }
        this.dispatchUpdatedData();
      });

      container.style.cssText = `
        display: flex;
        align-items: center;

      `;

      priceInput.style.cssText = `
      background: transparent;
      border: none;
      outline: none;
      color: ${this.colors.selection};
      font-size: 24px;
      font-weight: 300;
      font-stretch: normal;
      font-style: normal;
      line-height: normal;
      letter-spacing: normal;
      text-decoration: underline;
      width: 100%;
      padding: 0;
    `;

      currencyContainer.style.cssText = `
      color: ${this.colors.selection};
      text-decoration: underline;
    `;

      currencyContainer.innerHTML = this.currency.symbol;

      const trackMount = new MutationObserver((mutationList, observer) => {
        const node = mutationList[0].addedNodes[0];
        const parentNode = node.parentNode;
        const currencyInput = document.createElement('input');
        currencyInput.style.cssText = `
          background: transparent;
          border: none;
          outline: none;
          color: ${this.colors.selection};
          font-size: 24px;
          font-weight: 300;
          font-stretch: normal;
          font-style: normal;
          line-height: normal;
          letter-spacing: normal;
          text-decoration: underline;
          padding-right: 0;
          width: ${node.offsetWidth}px;
        `;
        currencyInput.value = this.currency.symbol;
        currencyInput.disabled = true;

        parentNode.removeChild(node);
        parentNode.insertBefore(currencyInput, parentNode.firstChild);
        observer.disconnect();
      });
      trackMount.observe(container, { childList: true });

      container.appendChild(currencyContainer);
      container.appendChild(priceInput);
      return container;
    }

    function _createSecondLine() {
      const container = document.createElement('div');
      const text = document.createTextNode('in');
      const placeHolder = this.selectedCoin.i
        ? document.createTextNode(this.selectedCoin.n)
        : document.createTextNode('crypto name');
      const label = document.createElement('span');
      container.style.cssText = `
      display: flex;
      align-items: center;
      
    `;
      label.appendChild(placeHolder);
      label.style.cssText = `
      color: ${this.colors.selection};
      cursor: pointer;
      text-decoration: underline;
      margin-left: 11px;
    `;
      container.appendChild(text);
      container.appendChild(label);
      label.addEventListener('click', e => {
        if (!this.isEditable) {
          return;
        }
        this.selectedCoin = {};
        container.removeChild(container.lastChild);

        const searchInputNode = this._createSearchInputNode();
        container.appendChild(searchInputNode);
        searchInputNode.firstChild.focus();
      });
      return container;
    }

    function getPriceByCurrency(price) {
      return this.currency.rate * price;
    }

    function _createThirdLine() {
      const container = document.createElement('div');
      const currency = document.createTextNode(this.currency.symbol);
      const currencyContainer = document.createElement('span');
      const perCoinText = document.createTextNode('per coin');
      const perCoinContainer = document.createElement('span');
      perCoinContainer.appendChild(perCoinText);
      perCoinContainer.style.cssText = `
        white-space: pre;
      `;

      currencyContainer.style.cssText = `
        color: ${this.colors.selection};
        text-decoration: underline;
      `;

      const priceInput = document.createElement('input');
      priceInput.setAttribute('type', 'number');
      if (!this.isEditable) {
        priceInput.setAttribute('disabled', 'true');
      }
      priceInput.setAttribute('value', this.perTotal);
      container.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 18px;

      `;
      priceInput.style.cssText = `
        background: transparent;
        border: none;
        outline: none;
        color: ${this.colors.selection};
        font-size: 24px;
        font-weight: 300;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        text-decoration: underline;
        width: 50%;
        padding: 0;
      `;

      const trackMount = new MutationObserver((mutationList, observer) => {
        const node = mutationList[0].addedNodes[0];
        const parentNode = node.parentNode;
        const currencyInput = document.createElement('input');

        currencyInput.style.cssText = `
          background: transparent;
          border: none;
          outline: none;
          color: ${this.colors.selection};
          font-size: 24px;
          font-weight: 300;
          font-stretch: normal;
          font-style: normal;
          line-height: normal;
          letter-spacing: normal;
          text-decoration: underline;
          padding-right: 0;
          width: ${node.offsetWidth}px;
        `;
        currencyInput.value = this.currency.symbol;
        currencyInput.disabled = true;

        parentNode.removeChild(node);
        parentNode.insertBefore(currencyInput, parentNode.firstChild);
        observer.disconnect();
      });

      trackMount.observe(container, { childList: true });

      priceInput.addEventListener('keyup', e => {
        if (!this.isEditable) {
          return;
        }
        this.perTotal = e.target.value;
        if (this.selectedCoin.i) {
          this.total =
            e.target.value *
            (this.investTotal / this.getPriceByCurrency(this.selectedCoin.pu));
          this.fourthLineContainer.removeChild(
            this.fourthLineContainer.firstChild
          );
          this.fourthLineContainer.appendChild(this._createFourthLine());
        }
        this.dispatchUpdatedData();
      });
      currencyContainer.appendChild(currency);
      container.appendChild(currencyContainer);
      container.appendChild(priceInput);
      container.appendChild(perCoinContainer);
      const nextLineContainer = document.createElement('div');
      const text = document.createTextNode('it would be worth');
      nextLineContainer.appendChild(text);
      const containerWrapper = document.createElement('div');
      containerWrapper.appendChild(container);
      containerWrapper.appendChild(nextLineContainer);

      return containerWrapper;
    }

    function _createFourthLine() {
      const container = document.createElement('div');
      if (this.type === 'invest') {
        this.total =
          this.perTotal *
          (this.investTotal / this.getPriceByCurrency(this.selectedCoin.pu));
        this.total = isNaN(this.total) ? 0 : this.total;
        const total = document.createTextNode(
          `= ${this.currency.symbol}${this.total.toFixed(2)}`
        );
        container.appendChild(total);
        return container;
      } else {
        this.getInvested(
          this.investTotal,
          this.selectedCoin.i,
          this.investedDate,
          amount => {
            this.total = amount;
            this.total = isNaN(this.total) ? 0 : this.total;
            const total = document.createTextNode(
              `= ${this.currency.symbol}${this.total.toFixed(2)}`
            );

            container.appendChild(total);
          }
        );
        return container;
      }
    }

    function _createSearchInputNode() {
      const searchContainer = document.createElement('div');
      const searchInput = document.createElement('input');
      searchContainer.style.cssText = `
        position: relative;
        margin-left: 11px;
      `;
      searchInput.style.cssText = `
        background: transparent;
        height: 38px;
        background: transparent;
        border: none;
        outline: none;
        font-size: 24px;
        font-weight: 300;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        color: ${this.colors.text} !important;
      `;
      searchInput.setAttribute('type', 'text');
      searchInput.setAttribute('placeholder', 'crypto name');
      searchContainer.appendChild(searchInput);
      searchInput.addEventListener('keyup', e => {
        if (!this.isEditable) {
          return;
        }
        if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 13) {
          this._handleDropDownNavigation(e, searchContainer);
          return;
        }
        this._handleSearchCoin(e.target.value, searchContainer);
      });
      searchInput.autofocus = true;

      return searchContainer;
    }

    function _handleDropDownNavigation(e, container) {
      if (e.keyCode === 40) {
        if (this.sellCoinActive === 4) {
          this.sellCoinActive = -1;
        }
        removeClass(container.lastChild.children);
        ++this.sellCoinActive;
      }
      if (e.keyCode === 38) {
        if (this.sellCoinActive === 0) {
          this.sellCoinActive = 5;
        }
        removeClass(container.lastChild.children);
        --this.sellCoinActive;
      }

      const activeElement = document.querySelector('.active');

      if (e.keyCode === 13) {
        if (activeElement) {
          const index = activeElement.getAttribute('data-index');
          const coin = this.searchResult[Number(index)];
          this._selectCoin(coin);
          container.lastChild.classList.remove('open');
          this.secondLineContainer.removeChild(
            this.secondLineContainer.firstChild
          );
          if (this.selectedCoin.i) {
            this.total =
              (this.investTotal /
                this.getPriceByCurrency(this.selectedCoin.pu)) *
              this.perTotal;
            this.fourthLineContainer.removeChild(
              this.fourthLineContainer.firstChild
            );
            this.fourthLineContainer.appendChild(this._createFourthLine());
          } else if (
            this.selectedCoin.i &&
            this.investTotal &&
            this.dateString &&
            this.type === 'invested'
          ) {
            this.getInvested(
              this.investTotal,
              this.selectedCoin.i,
              this.investedDate,
              amount => {
                this.total = amount;
                this.fourthLineContainer.removeChild(
                  this.fourthLineContainer.firstChild
                );
                this.fourthLineContainer.appendChild(this._createFourthLine());
              }
            );
          }
          this.secondLineContainer.appendChild(this._createSecondLine());
        }
      }
      container.lastChild.children[this.sellCoinActive].classList.add('active');
    }

    function removeClass(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active');
      }
    }

    function _handleSearchCoin(keyword, searchContainer) {
      fetch(
        `https://api.coin-stats.com/v2/coins?keyword=${keyword}&limit=5`
      ).then(result =>
        result.json().then(result => {
          if (searchContainer.children.length > 1) {
            searchContainer.removeChild(searchContainer.children[1]);
          }
          this.searchResult = result.coins;
          const searchDropDownOptionContainer = this._createSearchDropDownOptionContainer(
            result.coins,
            keyword
          );
          searchContainer.appendChild(searchDropDownOptionContainer);
        })
      );
    }

    function _createSearchDropDownOptionContainer(coins, keyword) {
      const searchDropDownOptionContainer = document.createElement('div');
      searchDropDownOptionContainer.setAttribute('class', 'dropdown-container');
      if (keyword) {
        searchDropDownOptionContainer.classList.add('open');
      } else {
        searchDropDownOptionContainer.classList.remove('open');
      }
      searchDropDownOptionContainer.style.cssText = `
      position: absolute;
      z-index: 999;
      background: ${this.colors.background};
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
          this._renderDropdownOption(coins[i], i)
        );
      }
      return searchDropDownOptionContainer;
    }

    function _selectCoin(coin) {
      this.selectedCoin = coin;
      this.dispatchUpdatedData();
    }

    function _renderDropdownOption(coin, i) {
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
      option.appendChild(this._iconMaker(coin.ic));
      option.appendChild(coinName);
      option.addEventListener('click', e => {
        if (!this.isEditable) {
          return;
        }
        option.parentNode.classList.remove('open');
        this._selectCoin(coin);
        this.secondLineContainer.removeChild(
          this.secondLineContainer.firstChild
        );
        if (this.selectedCoin.i && this.type === 'invest') {
          this.total =
            (this.investTotal / this.getPriceByCurrency(this.selectedCoin.pu)) *
            this.perTotal;
          this.fourthLineContainer.removeChild(
            this.fourthLineContainer.firstChild
          );
          this.fourthLineContainer.appendChild(this._createFourthLine());
        } else if (
          this.selectedCoin.i &&
          this.investTotal &&
          this.dateString &&
          this.type === 'invested'
        ) {
          this.getInvested(
            this.investTotal,
            this.selectedCoin.i,
            this.investedDate,
            amount => {
              this.total = amount;
              this.fourthLineContainer.removeChild(
                this.fourthLineContainer.firstChild
              );
              this.fourthLineContainer.appendChild(this._createFourthLine());
            }
          );
        }
        this.secondLineContainer.appendChild(this._createSecondLine());
      });
      return option;
    }

    function dispatchUpdatedData() {
      if (window.dispatchCalculatorWidgetChange) {
        window.dispatchCalculatorWidgetChange({
          type: this.type,
          perCoinPrice: this.perTotal,
          dateString: this.dateString,
          investAmount: this.investTotal,
          selectedCoin: this.selectedCoin,
        });
      }
    }

    function _iconMaker(src) {
      const icon = document.createElement('img');
      let url = src;

      if (src && src.toLowerCase().indexOf('http') === -1) {
        url = `https://api.coin-stats.com/api/files/812fde17aea65fbb9f1fd8a478547bde/${src}`;
      }

      icon.setAttribute('src', url);
      icon.style.cssText = `
      width: 24px;
      height: 24px;
      margin-right: 14px;
    `;
      return icon;
    }
  }

  function getCurrencies(callback) {
    return fetch(`https://api.coin-stats.com/v3/currencies`)
      .then(resFiats => resFiats.json())
      .then(resFiats => {
        callback(resFiats);
      });
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
      'coin-stats-calculator-widget'
    );

    allPlaceHolders.forEach(node => {
      new CoinCalculator()._createWidget(node);
    });
  }

  function observeMutations() {
    const nodes = document.querySelectorAll('coin-stats-calculator-widget');

    const observer = new MutationObserver(callback);

    nodes.forEach(node => {
      const disable = node.getAttribute('disable-mutation-observer');

      if (!disable) {
        observer.observe(node, config);
      }
    });

    function callback(MutationRecord) {
      new CoinCalculator()._createWidget(MutationRecord[0].target);
    }
  }

  ready(function() {
    getCurrencies(function(res) {
      globalCurrencies = res;
      initAll();
      observeMutations();
    });
  });
})();
