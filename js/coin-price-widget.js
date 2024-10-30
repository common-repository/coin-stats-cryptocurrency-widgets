(function() {
  let currencies = {};
  const config = { attributes: true };

  function getData(coinId, type, callback) {
    return fetch(
      `https://api.coin-stats.com/v2/widget/coin/${coinId}?type=${type}`
    )
      .then(res => res.json())
      .then(res => callback(res));
  }

  function getCurrencies(callback) {
    return fetch(`https://api.coin-stats.com/v3/currencies`)
      .then(resFiats => resFiats.json())
      .then(resFiats => {
        callback(resFiats);
      });
  }

  function createWidget(placeHolder) {
    const coinId = placeHolder.getAttribute('coin-id');
    const type = placeHolder.getAttribute('type');
    getData(coinId, type, function(data) {
      const localeAtt = placeHolder.getAttribute('locale');
      const currency = placeHolder.getAttribute('currency').toUpperCase();
      const rankBackground = placeHolder.getAttribute('rank-background');
      const background = placeHolder.getAttribute('background');
      const statusUp = placeHolder.getAttribute('status-up-color');
      const statusDown = placeHolder.getAttribute('status-down-color');
      const rankText = placeHolder.getAttribute('rank-text-color');
      const borderColor = placeHolder.getAttribute('border-color');
      const text = placeHolder.getAttribute('text-color');
      const width = placeHolder.getAttribute('width');
      const disableCredits = placeHolder.getAttribute('disable-credits');
      const font = placeHolder.getAttribute('font') || 'Roboto, Arial, Helvetica';

      const colors = {
        statusUp,
        statusDown,
        text,
        background,
        rankBackColor: rankBackground,
        rankColor: rankText,
        border: borderColor,
      };

      const tempContainer = document.createElement('div');
      const widgetContainer = document.createElement('div');
      const widgetTable = document.createElement('div');
      widgetTable.style.cssText = `
      background-color: ${colors.background};
      border-radius: 29px;
      border: solid 1px ${colors.border};
      padding: 24px 34px;
      color: ${colors.text};
      max-width: ${Number(width) > 320 ? width + 'px' : '320px'};
      cursor: pointer;
    `;

      widgetContainer.style.cssText = `
        max-width: ${Number(width) > 320 ? width + 'px' : '320px'};
        font-family: ${font}, sans-serif;
      `;

      widgetTable.appendChild(firstRowNode(data.ic, data.n, data.s));
      widgetTable.appendChild(secondRowNode(data, colors, localeAtt, currency));
      if (type === 'large') {
        widgetTable.appendChild(thirdRowNode(data, colors, localeAtt));
      }

      widgetTable.setAttribute(
        'onclick',
        `window.open('https://coinstats.app/en/coins/${coinId}');`
      );

      widgetContainer.appendChild(widgetTable);

      if (!disableCredits) {
        widgetContainer.appendChild(createCredits(colors.text));
      }

      tempContainer.appendChild(widgetContainer);
      placeHolder.innerHTML = tempContainer.innerHTML;
      resetStyles(placeHolder);
    });
  }

  function firstRowNode(iconSrc, name, symbol) {
    const tableRowNode = document.createElement('div');
    const logoNode = createLogoNode(iconSrc);
    const nameNode = createNameNode(name, symbol);

    tableRowNode.style.cssText = `
      display: flex;
      margin-bottom: 15px;
    `;

    tableRowNode.appendChild(logoNode);
    tableRowNode.appendChild(nameNode);

    return tableRowNode;
  }

  function secondRowNode(data, colors, localeAtt, currency) {
    const tableRowNode = document.createElement('div');
    const rankNode = createRankNode(data.r, colors);
    const priceTableDataNode = document.createElement('span');
    const priceTableDataTextNode = document.createTextNode(
      formatPrice(data.pu, localeAtt, currency)
    );
    const percentNode = createPercentNode(data.p24, true, colors);

    priceTableDataNode.appendChild(priceTableDataTextNode);
    priceTableDataNode.style.cssText = `
    font-size: 34px;
    font-weight: 300;    
  `;
    tableRowNode.style.cssText = `
    display: flex;
    align-items: center;
  `;

    tableRowNode.appendChild(rankNode);
    tableRowNode.appendChild(priceTableDataNode);
    tableRowNode.appendChild(percentNode);

    return tableRowNode;
  }

  function thirdRowNode(data, colors, localeAtt) {
    const tableRowNode = document.createElement('div');
    const tdFiller = document.createElement('div');
    const btcPrice = createBtcPriceNode(data.pb, localeAtt);
    const percentNode = createPercentNode(data.p24b, null, colors);

    tableRowNode.style.cssText = `
    display: flex;
  `;
    tdFiller.style.cssText = `
    width: 40px;
    margin-right: 20px;
  `;

    tableRowNode.appendChild(tdFiller);
    tableRowNode.appendChild(btcPrice);
    tableRowNode.appendChild(percentNode);

    return tableRowNode;
  }

  function createCredits(textColor, smallWidget) {
    const credits = document.createElement('div');
    const anchor = document.createElement('a');
    anchor.href = `http://coinstats.app`;
    anchor.target = '_blank';

    anchor.style.cssText = `
    font-size: 12px;
    font-weight: 300;
    text-decoration: none;
    color: ${textColor};
    vertical-align: unset; 
  `;

    let styles = 'padding-top: 10px; vertical-align: unset;';

    if (smallWidget) {
      styles += 'text-align: center;';
      anchor.innerHTML =
        'Powered by Coin<b style="vertical-align: unset;">Stats</b>';
    } else {
      anchor.innerHTML =
        'Powered by <span style="letter-spacing: 0.25px;font-size: 14px; vertical-align: unset;">Coin<b style="vertical-align: unset;">Stats</b></span>';
      styles += 'padding-left: 34px;';
    }

    credits.style.cssText = styles;
    credits.appendChild(anchor);

    return credits;
  }

  function createRankNode(rank, colors) {
    const rankNode = document.createElement('div');
    const rankBlockNode = document.createElement('span');

    rankBlockNode.innerHTML = `#${rank}`;
    rankBlockNode.style.cssText = `
    border-radius: 4px;
		background-color: ${colors.rankBackColor};
    font-size: 12px;
    letter-spacing: 1px;
		font-weight: bold;
		text-align: center;
    padding: 1px 4px;
    color: ${colors.rankColor};
  `;
    rankNode.style.cssText = `
    display: flex;
    flex-shrink: 0;
    width: 40px;
    justify-content: center;
    margin-right: 20px;
  `;

    rankNode.appendChild(rankBlockNode);

    return rankNode;
  }

  function createBtcPriceNode(price, localeAtt) {
    const tableData = document.createElement('div');
    let locale = localeAtt || 'en';

    if (!localeAtt && navigator) {
      locale = navigator.language;
    }

    const formatedBtc = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    }).format(price);
    const textNode = document.createTextNode('฿' + formatedBtc);

    tableData.appendChild(textNode);
    tableData.style.cssText = `
    font-size: 20px;
    font-weight: 300;
  `;
    return tableData;
  }

  function createArrowSvg(color, rotate) {
    const svgNode = document.createElement('div');

    svgNode.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" style="display: initial; max-width: initial;">
        <path fill="${color}" fill-rule="evenodd" d="M8.894 5.789l2.382 4.764A1 1 0 0 1 10.382 12H5.618a1 1 0 0 1-.894-1.447l2.382-4.764a1 1 0 0 1 1.788 0z"/>
      </svg>
    `;

    if (rotate) {
      svgNode.style.transform = 'rotate(0.5turn)';
    }

    return svgNode;
  }

  function createNameNode(name, symbol) {
    const tableDataNode = document.createElement('div');
    const nameNode = document.createElement('span');

    nameNode.innerHTML = `${name} (${symbol})`;
    tableDataNode.style.cssText = `
      font-size: 15px;
      font-weight: bold;
      opacity: 0.8;
      display: flex;
      align-items: center;
    `;
    tableDataNode.appendChild(nameNode);

    return tableDataNode;
  }

  function formatPrice(price, localeAtt, currency) {
    let maximumFractionDigits = 6;
    let locale = localeAtt || 'en';

    if (price > 1) {
      maximumFractionDigits = 2;
    }
    if (!localeAtt && navigator) {
      locale = navigator.language;
    }
    let priceCalculation = price * currencies[currency].rate;
    if (currency === 'BTC' || currency === 'ETH') {
      priceCalculation = price / currencies[currency].rate;
    }

    const formattedPrice = new Intl.NumberFormat(locale, {
      maximumFractionDigits,
    }).format(priceCalculation);

    return currencies[currency].symbol + formattedPrice;
  }

  function createPercentNode(percent, marginTop, colors) {
    const percentTableDataNode = document.createElement('div');
    const percentNode = document.createElement('span');
    const svgBlock = document.createElement('div');
    const percentBlock = document.createElement('div');
    const percentContainer = document.createElement('div');
    svgBlock.style.cssText = `
    display: flex;
    align-items: flex-end;
    margin-bottom: 8%;
  `;
    const status = percent < 0 ? 'statusDown' : 'statusUp';

    const svgNode = createArrowSvg(colors[status], status === 'statusDown');

    svgBlock.appendChild(svgNode);
    percentBlock.appendChild(percentNode);
    percentContainer.appendChild(svgBlock);
    percentContainer.appendChild(percentBlock);
    percentTableDataNode.appendChild(percentContainer);
    percentNode.style.cssText = `
		font-size: 20px;
		font-weight: 300;
		color: ${colors[status]};
  `;
    percentContainer.style.cssText = `
    display: flex;
    margin-left: 6px;
    ${marginTop ? 'margin-top: 11%;' : ''}
  `;
    svgBlock.style.marginTop = '3%';
    percentNode.innerHTML = `${Math.abs(percent).toFixed(2)}%`;

    return percentTableDataNode;
  }

  function iconMaker(icon) {
    if (icon && icon.toLowerCase().indexOf('http') >= 0) {
      return icon;
    }
    return `https://api.coin-stats.com/api/files/812fde17aea65fbb9f1fd8a478547bde/${icon}`;
  }

  function createLogoNode(src) {
    const tableDataNode = document.createElement('div');
    const logoNode = document.createElement('img');

    logoNode.setAttribute('src', iconMaker(src));
    logoNode.style.cssText = `
      height: 40px;
      width: 40px;
    `;
    tableDataNode.style.cssText = `
      display: flex;
      margin-right: 20px;
    `;

    tableDataNode.appendChild(logoNode);

    return tableDataNode;
  }

  function CoinPriceSmall() {
    this.init = init;
    function init(placeHolder) {
      const coinId = placeHolder.getAttribute('coin-id');
      getData(coinId, 'small', function(data) {
        const localeAtt = placeHolder.getAttribute('locale');
        const background = placeHolder.getAttribute('background');
        const text = placeHolder.getAttribute('text-color');
        const borderColor = placeHolder.getAttribute('border-color');
        const currency = placeHolder.getAttribute('currency');
        const width = placeHolder.getAttribute('width');
        const disableCredits = placeHolder.getAttribute('disable-credits');
        const font = placeHolder.getAttribute('font') || 'Roboto, Arial, Helvetica';
        const colors = {
          background: background,
          text,
        };

        const tempContainer = document.createElement('div');
        const widgetBlock = document.createElement('div');
        const widgetContainer = document.createElement('div');

        widgetBlock.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        background-color: ${colors.background};
        height: 160px;
        border-radius: 29px;
        border: solid 1px ${borderColor};
        cursor: pointer;
      `;
        widgetContainer.style.cssText = `
        font-family: ${font}, sans-serif;
        color: ${colors.text};
        width: ${Number(width) > 154 ? width + 'px' : '154px'};
      `;

        widgetBlock.appendChild(createLogoNode(data.ic));
        widgetBlock.appendChild(
          createPriceNode(data.pu, colors, localeAtt, currency)
        );
        widgetBlock.setAttribute(
          'onclick',
          `window.open('https://coinstats.app/en/coins/${coinId}');`
        );

        widgetContainer.appendChild(widgetBlock);

        if (!disableCredits) {
          widgetContainer.appendChild(createCredits(colors.text, true));
        }
        tempContainer.appendChild(widgetContainer);
        placeHolder.innerHTML = tempContainer.innerHTML;
        resetStyles(placeHolder);
      });
    }

    function createPriceNode(price, colors, localeAtt, currency) {
      const priceNode = document.createElement('div');
      const priceTextNode = document.createTextNode(
        formatPrice(price, localeAtt, currency)
      );

      priceNode.appendChild(priceTextNode);
      priceNode.style.cssText = `
      font-size: 34px;
      font-weight: 300;
      color: ${colors.text};
    `;

      return priceNode;
    }

    function createLogoNode(name) {
      const logoNode = document.createElement('img');

      logoNode.setAttribute(
        'src',
        `https://api.coin-stats.com/api/files/812fde17aea65fbb9f1fd8a478547bde/${name}`
      );
      logoNode.style.cssText = `
      height: 40px;
      width: 40px;
      margin-bottom: 10px;
    `;

      return logoNode;
    }
  }

  function resetStyles(placeHolder) {
    placeHolder.insertAdjacentHTML(
      'beforeend',
      `<style>
      coin-stats-ticker-widget * {
        word-break: initial;
        word-wrap: initial;
        box-sizing: border-box;
      }
    </style>`
    );
  }

  function init(node) {
    if (node.getAttribute('coin-id') === '' || !node.getAttribute('coin-id')) {
      return;
    }
    if (node.getAttribute('type') === 'small') {
      return new CoinPriceSmall().init(node);
    }

    createWidget(node);
  }

  function initAll() {
    const allPlaceHolders = document.querySelectorAll(
      'coin-stats-ticker-widget'
    );

    allPlaceHolders.forEach(node => {
      init(node);
    });
  }

  function observeMutations() {
    const nodes = document.querySelectorAll('coin-stats-ticker-widget');

    const observer = new MutationObserver(callback);

    nodes.forEach(node => {
      const disable = node.getAttribute('disable-mutation-observer');

      if (!disable) {
        observer.observe(node, config);
      }
    });

    function callback(MutationRecord) {
      init(MutationRecord[0].target);
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

  ready(function() {
    getCurrencies(function(res) {
      currencies = res;
      initAll();
      observeMutations();
    });
  });
})();
