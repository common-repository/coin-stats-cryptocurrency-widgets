(function() {
  const APP_URL = 'https://api.coin-stats.com';

  class Marquee {
    constructor(widgetPlaceHolder, currencies) {
      this.widgetPlaceHolder = widgetPlaceHolder;
      this.currencies = currencies;
      this.colors = {
        background: widgetPlaceHolder.getAttribute('background'),
        statusUp: widgetPlaceHolder.getAttribute('status-up-color'),
        statusDown: widgetPlaceHolder.getAttribute('status-down-color'),
        text: widgetPlaceHolder.getAttribute('text-color'),
        buttons: widgetPlaceHolder.getAttribute('buttons-color'),
        border: widgetPlaceHolder.getAttribute('border-color'),
      };
      this.disableCredits = widgetPlaceHolder.getAttribute('disable-credits');
      this.locale = widgetPlaceHolder.getAttribute('locale');
      this.currency = widgetPlaceHolder.getAttribute('currency');
      this.position = widgetPlaceHolder.getAttribute('position');
      this.width = widgetPlaceHolder.getAttribute('width');
      this.coinsCount = widgetPlaceHolder.getAttribute('coins-count');
      this.font = widgetPlaceHolder.getAttribute('font') || 'Roboto, Arial, Helvetica';
      this.leftButtonMargin = 0;
      this.showRightButton = true;
    }

    init() {
      this.getData().then(res => {
        this.coinsData = res.coins;
        this.clearWidgetPlaceHolder();
        this.createRootContainer();
        this.resetStyles();
      });
    }

    getData() {
      return fetch(`${APP_URL}/v2/coins?&limit=${this.coinsCount}`).then(res =>
        res.json()
      );
    }

    clearWidgetPlaceHolder() {
      this.widgetPlaceHolder.childNodes.forEach(node => {
        this.widgetPlaceHolder.removeChild(node);
      });
    }

    createRootContainer() {
      const rootContainer = document.createElement('div');

      let rootStyles = `
        z-index: 1000;
        color: ${this.colors.text};
        font-family: ${this.font}, sans-serif;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none; 
        user-select: none;
        ${this.position === 'static' ? `max-width: ${this.width};` : ''}
      `;

      const splitedPosition = this.position.split('-');

      if (splitedPosition[0] === 'fixed') {
        rootStyles += `
          position: fixed;
          width: 100%;
          left: 0;
          ${splitedPosition[1]}: 0;
        `;
      } else if (this.position === 'static') {
        rootStyles += `
          position: static;
        `;
      }
      rootContainer.style.cssText = rootStyles;

      rootContainer.appendChild(
        this.createContentContainer(splitedPosition[0] === 'fixed')
      );
      this.widgetPlaceHolder.appendChild(rootContainer);
    }

    resetStyles() {
      this.widgetPlaceHolder.insertAdjacentHTML(
        'beforeend',
        `<style>
        coin-stats-marquee-widget * {
          word-break: initial;
          word-wrap: initial;
          box-sizing: border-box;
        }
      </style>`
      );
    }

    createContentContainer(isFixed) {
      const contentContainer = document.createElement('div');

      contentContainer.style.cssText = `
        width: 100%;
        ${isFixed ? '' : 'border-radius: 29px;'}
        ${isFixed ? '' : `border: solid 1px ${this.colors.border};`}
        background: ${this.colors.background};
        padding: 20px;
        display: flex;
        font-size: 16px;
        font-weight: 300;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
      `;

      contentContainer.appendChild(this.createCoinsListSection());
      contentContainer.appendChild(this.createNavigationSection());

      return contentContainer;
    }

    createCoinsListSection() {
      const coinsListBlock = document.createElement('div');
      const coinsUnorderedList = document.createElement('ul');

      coinsListBlock.style.cssText = `
        overflow: hidden;
        width: 100%;
      `;
      coinsUnorderedList.style.cssText = `
        display: flex;
        transition: margin 0.3s;
        padding: 0;
        margin: 0;
        list-style-type: none;
      `;
      coinsUnorderedList.className = 'cs-coins-unordered-list';
      this.coinsData.forEach(coin => {
        coinsUnorderedList.appendChild(this.createCoinList(coin));
      });

      !this.disableCredits &&
        coinsUnorderedList.appendChild(this.createCredits());

      coinsListBlock.appendChild(coinsUnorderedList);

      return coinsListBlock;
    }

    createCredits() {
      const creditsContainer = document.createElement('li');
      const creditsTopBlock = document.createElement('div');
      const creditsBotBlock = document.createElement('div');

      creditsContainer.addEventListener('click', () => {
        window.open('http://coinstats.app');
      });
      creditsTopBlock.innerHTML = 'Powered by';
      creditsBotBlock.innerHTML = 'Coin<b>Stats</b>';

      creditsTopBlock.style = 'white-space: nowrap;';

      creditsContainer.style.cssText = `
        align-items: center;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    `;

      creditsContainer.appendChild(creditsTopBlock);
      creditsContainer.appendChild(creditsBotBlock);

      return creditsContainer;
    }

    createCoinList(coin) {
      const coinsList = document.createElement('li');

      coinsList.style.cssText = `
        display: flex;
        margin-right: 42px;
        align-items: center;
        cursor: pointer;
      `;

      coinsList.addEventListener('click', () => {
        window.open(`https://coinstats.app/en/coins/${coin.i}`);
      });

      coinsList.appendChild(this.createCoinListFistColumn(coin));
      coinsList.appendChild(this.createCoinListSecondColumn(coin));

      return coinsList;
    }

    createCoinListFistColumn(coin) {
      const firstColumnBlock = document.createElement('div');

      firstColumnBlock.style.cssText = `
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      `;

      firstColumnBlock.appendChild(this.createCoinLogo(coin.ic));
      firstColumnBlock.appendChild(this.createPercentArrow(coin.p24));

      return firstColumnBlock;
    }

    createCoinLogo(src) {
      const logoBlock = document.createElement('div');
      const logo = document.createElement('img');

      logo.style.width = '23px';
      logo.src = this.iconSrcMaker(src);
      logoBlock.appendChild(logo);

      return logoBlock;
    }

    createPercentArrow(p24) {
      const percentArrowBlock = document.createElement('div');

      percentArrowBlock.style.cssText = `
        width: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      `;

      percentArrowBlock.innerHTML = `
        <svg style="${`width: 16px; height: 16px; margin-top: 3px; 
        ${p24 < 0 ? ' transform: rotate(180deg);' : ''}
        `}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path fill="${
            p24 < 0 ? this.colors.statusDown : this.colors.statusUp
          }" fill-rule="evenodd" d="M8.894 5.789l2.382 4.764A1 1 0 0 1 10.382 12H5.618a1 1 0 0 1-.894-1.447l2.382-4.764a1 1 0 0 1 1.788 0z"/>
        </svg>
      `;

      return percentArrowBlock;
    }

    iconSrcMaker(icon) {
      if (!icon) {
        return '';
      }
      if (icon.toLowerCase().includes('http')) {
        return icon;
      }
      return `${APP_URL}/api/files/812fde17aea65fbb9f1fd8a478547bde/${icon}`;
    }

    createCoinListSecondColumn(coin) {
      const secondColumnBlock = document.createElement('div');
      const nameBlock = document.createElement('span');
      const priceContainer = document.createElement('div');
      const percantageBlock = document.createElement('span');
      const priceValueBlock = document.createElement('span');

      secondColumnBlock.style.cssText = `
        margin-left: 11px;
        height: 100%;
        padding-top: 3px;
        display: flex;
        justify-content: space-between;
        flex-direction: column;
      `;

      nameBlock.style.cssText = `
        white-space: nowrap;
        text-align: left;
      `;
      priceContainer.style.cssText = `
        display: flex;
        flex-direction: row;
        margin-top: 5px;
      `;
      percantageBlock.style.color =
        coin.p24 < 0 ? this.colors.statusDown : this.colors.statusUp;

      nameBlock.innerHTML = coin.n;
      secondColumnBlock.appendChild(nameBlock);

      percantageBlock.style.paddingRight = '8px';
      percantageBlock.innerHTML = Math.abs(coin.p24) + '%';
      priceValueBlock.innerHTML = this.formatPrice(coin.pu);
      priceContainer.appendChild(percantageBlock);
      priceContainer.appendChild(priceValueBlock);
      secondColumnBlock.appendChild(priceContainer);

      return secondColumnBlock;
    }

    formatPrice(price) {
      let maximumFractionDigits = 6;
      let locale = this.locale;

      if (price > 1) {
        maximumFractionDigits = 2;
      }
      if (!this.locale && navigator) {
        locale = navigator.language;
      }

      let calculatedPrice;

      if (this.currency !== 'USD') {
        calculatedPrice = price * this.currencies[this.currency].rate;
      }

      const formattedPrice = new Intl.NumberFormat(locale, {
        maximumFractionDigits,
      }).format(calculatedPrice || price);

      return this.currencies[this.currency].symbol + formattedPrice;
    }

    createNavigationSection() {
      const navigationContainer = document.createElement('div');

      navigationContainer.style.cssText = `
        display: flex;
        align-items: center;
        padding-left: 10px;
      `;

      navigationContainer.appendChild(this.createNavigationButton('left'));
      navigationContainer.appendChild(this.createNavigationButton('right'));

      return navigationContainer;
    }

    createNavigationButton(side) {
      const buttonBlock = document.createElement('div');
      let data;
      let style = '';

      if (side === 'right') {
        data = this.showRightButton;
        buttonBlock.addEventListener('click', () =>
          this.handleRightButtonClick(this.widgetPlaceHolder)
        );
      } else {
        style = 'style="transform: rotate(180deg)"';
        data = this.leftButtonMargin;
        buttonBlock.addEventListener('click', () =>
          this.handleLeftButtonClick(this.widgetPlaceHolder)
        );
      }

      buttonBlock.innerHTML = `
        <svg
          width="8"
          height="14"
          view-box="0 0 8 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          ${style}
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.0005 7.0005C8.0005 6.7455 7.9025 6.4895 7.7075 6.2945L1.7055 0.2925C1.3155 -0.0975 0.6835 -0.0975 0.2925 0.2925C-0.0975 0.6835 -0.0975 1.3145 0.2925 1.7055L5.5895 7.0005L0.2925 12.2965C-0.0975 12.6865 -0.0975 13.3175 0.2925 13.7085C0.6835 14.0985 1.3155 14.0985 1.7055 13.7085L7.7075 7.7065C7.9025 7.5115 8.0005 7.2555 8.0005 7.0005Z"
            transform="translate(-0.000488281 -0.000488281)"
            fill="${this.colors.buttons}"
            fill-opacity=${data ? '0.5' : '0.18'}
            class="cs-${side}-nav-button"
          />
        </svg>
      `;

      buttonBlock.style.cssText = `
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
      `;

      return buttonBlock;
    }

    handleLeftButtonClick(widgetPlaceHolder) {
      if (this.leftButtonMargin === 0) {
        return;
      }

      const unorderedListBlock = widgetPlaceHolder.querySelector(
        '.cs-coins-unordered-list'
      );
      const containerVisibleWidth =
        unorderedListBlock.offsetWidth + this.leftButtonMargin;
      const position = this.leftButtonMargin + containerVisibleWidth;

      if (position > 0) {
        this.leftButtonMargin = 0;
        this.showRightButton = true;
      } else {
        this.leftButtonMargin += containerVisibleWidth;
        this.showRightButton = true;
      }

      unorderedListBlock.style.marginLeft = this.leftButtonMargin + 'px';
      widgetPlaceHolder.querySelector(
        '.cs-left-nav-button'
      ).style = `fill-opacity: ${this.leftButtonMargin ? '0.5' : '0.18'};`;
      widgetPlaceHolder.querySelector(
        '.cs-right-nav-button'
      ).style = `fill-opacity: ${this.showRightButton ? '0.5' : '0.18'};`;
    }

    handleRightButtonClick(widgetPlaceHolder) {
      const unorderedListBlock = widgetPlaceHolder.querySelector(
        '.cs-coins-unordered-list'
      );

      const containerVisibleWidth =
        unorderedListBlock.offsetWidth + this.leftButtonMargin;
      const containerHiddenWidth =
        containerVisibleWidth - unorderedListBlock.scrollWidth;
      const childNodes = unorderedListBlock.childNodes;
      let i = 0;
      let wi = 0;
      let position = 0;

      while (position === 0 && i <= childNodes.length) {
        if (wi + childNodes[i].offsetWidth > containerVisibleWidth) {
          position = this.leftButtonMargin - wi;
        }
        wi += childNodes[i].offsetWidth + 40;
        ++i;
      }
      if (position < containerHiddenWidth) {
        this.leftButtonMargin = containerHiddenWidth;
        this.showRightButton = false;

        widgetPlaceHolder.querySelector(
          '.cs-right-nav-button'
        ).style = `fill-opacity: ${this.showRightButton ? '0.5' : '0.18'};`;
      } else {
        this.leftButtonMargin = position;
      }

      unorderedListBlock.style.marginLeft = this.leftButtonMargin + 'px';
      widgetPlaceHolder.querySelector(
        '.cs-left-nav-button'
      ).style = `fill-opacity: ${this.leftButtonMargin ? '0.5' : '0.18'};`;
    }
  }

  function observeMutations(nodes, currencies) {
    const observer = new MutationObserver(callback);

    nodes.forEach(node => {
      const disable = node.getAttribute('disable-mutation-observer');

      if (!disable) {
        observer.observe(node, { attributes: true });
      }
    });

    function callback(MutationRecord) {
      new Marquee(MutationRecord[0].target, currencies).init();
    }
  }

  function getCurrencies() {
    return fetch(`${APP_URL}/v3/currencies`).then(resFiats => resFiats.json());
  }

  const allPlaceHolders = document.querySelectorAll(
    'coin-stats-marquee-widget'
  );

  getCurrencies().then(currencies => {
    allPlaceHolders.forEach(node => {
      observeMutations(allPlaceHolders, currencies);
      new Marquee(node, currencies).init();
    });
  });
})();
