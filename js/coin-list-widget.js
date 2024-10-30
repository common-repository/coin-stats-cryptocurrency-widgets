(function() {
  let currencies = {};

  const config = { attributes: true };

  function getData(coinIds, topCoin, callback) {
    if (coinIds) {
      return fetch(`https://api.coin-stats.com/v2/coins/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ average: coinIds }),
      })
        .then(res => res.json())
        .then(res => callback(res.prices.average));
    } else {
      return fetch(
        `https://api.coin-stats.com/v2/coins?skip=0&limit=${topCoin}`
      )
        .then(res => res.json())
        .then(res => callback(res.coins));
    }
  }

  function getCurrencies(callback) {
    return fetch(`https://api.coin-stats.com/v3/currencies`)
      .then(resFiats => resFiats.json())
      .then(resFiats => {
        callback(resFiats);
      });
  }

  function createWidget(placeHolder) {
    let coinIds = placeHolder.getAttribute('coin-ids');
    let topCoin = placeHolder.getAttribute('top-coin');
    if (coinIds && !topCoin) {
      coinIds = coinIds.split(',');
    }
    getData(coinIds, topCoin, function(data) {
      const localAtt = placeHolder.getAttribute('locale');
      let width = placeHolder.getAttribute('width');
      const statusUpColor = placeHolder.getAttribute('status-up-color');
      const statusDownColor = placeHolder.getAttribute('status-down-color');
      const textColor = placeHolder.getAttribute('text-color');
      const backgroundColor = placeHolder.getAttribute('bg-color');
      const borderColor = placeHolder.getAttribute('border-color');
      const currency = placeHolder.getAttribute('currency').toUpperCase();
      const disableCredits = placeHolder.getAttribute('disable-credits');
      const font = placeHolder.getAttribute('font') || 'Roboto, Arial, Helvetica';
      const colors = {
        statusUp: statusUpColor,
        statusDown: statusDownColor,
        text: textColor,
        background: backgroundColor,
        border: borderColor,
      };
      let size = 'large';
      if (Number(width) < 240) {
        size = 'small';
        width = 240;
      }
      if (Number(width) < 362) {
        size = 'small';
      }
      if (Number(width) >= 362) {
        size = 'medium';
      }
      if (Number(width) >= 486) {
        size = 'large';
      }

      const widgetContainer = document.createElement('div');
      const widgetTable = createTable(data, colors, size, localAtt, currency);

      widgetContainer.style.cssText = `
      max-width: ${width}px;
      font-family: ${font}, sans-serif;
      color: ${colors.text};
    `;

      widgetContainer.appendChild(widgetTable);
      if (!disableCredits) {
        widgetContainer.appendChild(createCredits(colors.text));
      }
      const container = document.createElement('div');
      container.appendChild(widgetContainer);
      placeHolder.innerHTML = container.innerHTML;
      resetStyles(placeHolder);
    });
  }

  function resetStyles(placeHolder) {
    placeHolder.insertAdjacentHTML(
      'beforeend',
      `<style>
      coin-stats-list-widget * {
        word-break: initial;
        word-wrap: initial;
        box-sizing: border-box;
      }
    </style>`
    );
  }

  function createCredits(textColor) {
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
    `;

    credits.style.cssText = `
      padding-top: 10px;
      padding-left: 34px;
      vertical-align: unset;
    `;

    credits.appendChild(anchor);

    return credits;
  }

  function createTable(data, colors, size, localAtt, currency) {
    const table = document.createElement('table');
    table.style.cssText = `
    width: 100%;
    overflow: hidden;
    border-radius: 20px;
    border-collapse: separate;
    border-spacing: 0;
    border: none;
  `;
    const contentLength = data.length;
    data.forEach((el, i) => {
      const isFirstEl = i === 0;
      const isLastEl = contentLength - 1 === i;
      const tableRow = createTableRow(
        el,
        colors,
        size,
        localAtt,
        currency,
        isFirstEl,
        isLastEl
      );

      table.appendChild(tableRow);
    });

    return table;
  }

  function createTableRow(
    data,
    colors,
    size,
    localAtt,
    currency,
    isFirstEl,
    isLastEl
  ) {
    const tableRow = document.createElement('tr');
    const rankTableData = document.createElement('td');
    const logoTableData = createLogoNode(data.ic, colors, isLastEl);
    const name = createName(data.n, data.s, colors, size, isLastEl);
    const percent = createPercentNode(
      data.p24,
      colors,
      size,
      isFirstEl,
      isLastEl
    );
    tableRow.style.cssText = `
    height: 51px;
    cursor: pointer;
  `;
    rankTableData.innerHTML = data.r;

    let rankTableDataStyles = `
    font-size: 16px;
    font-weight: 300;
    padding-left: 28px;
    vertical-align: middle;
    background-color: ${colors.background};
    border: none;
    border-top: solid 1px ${colors.border};
    border-left: solid 1px ${colors.border};
  `;
    if (isFirstEl) {
      rankTableDataStyles += 'border-top-left-radius: 29px;';
    }
    if (isLastEl) {
      rankTableDataStyles += `
      border-bottom-left-radius: 29px; 
      border-bottom: solid 1px ${colors.border};`;
    }
    rankTableData.style.cssText = rankTableDataStyles;

    tableRow.setAttribute(
      'onclick',
      `window.open('https://coinstats.app/en/coins/${data.i}');`
    );

    tableRow.appendChild(rankTableData);
    tableRow.appendChild(logoTableData);
    tableRow.appendChild(name);
    tableRow.appendChild(percent);

    if (size === 'large') {
      const price = createPrice(
        data.pu,
        colors,
        localAtt,
        currency,
        isFirstEl,
        isLastEl
      );

      tableRow.appendChild(price);
    }

    return tableRow;
  }

  function createPercentNode(percent, colors, size, isFirstEl, isLastEl) {
    const tableData = document.createElement('td');
    const percentNodeBlock = document.createElement('div');
    const status = percent < 0 ? 'statusDown' : 'statusUp';

    let tableDataStyles = `
      color: ${colors[status]};
      font-size: 16px;
      font-weight: 300;
      text-align: right;
      vertical-align: middle;
      ${size !== 'large' ? 'padding-right: 28px;' : ''}
      border: none;
      background-color: ${colors.background};
      border-top: solid 1px ${colors.border};
    `;

    if (isLastEl) {
      tableDataStyles += `border-bottom: solid 1px ${colors.border};`;
    }

    if (size !== 'large') {
      tableDataStyles += `border-right: solid 1px ${colors.border};`;

      if (isLastEl) {
        tableDataStyles += `border-bottom-right-radius: 29px;`;
      }
      if (isFirstEl) {
        tableDataStyles += `border-top-right-radius: 29px;`;
      }
    }

    tableData.style.cssText = tableDataStyles;
    percentNodeBlock.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    percentNodeBlock.insertAdjacentHTML(
      'afterbegin',
      createArrowSvg(colors[status], status === 'statusDown')
    );
    percentNodeBlock.insertAdjacentHTML(
      'beforeend',
      `<span>${Math.abs(percent).toFixed(2)}%</span>`
    );

    tableData.appendChild(percentNodeBlock);

    return tableData;
  }

  function createArrowSvg(color, rotate) {
    return `
    <svg style="display: unset;${
      rotate ? ' transform: rotate(0.5turn);' : ''
    }displa" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <path fill="${color}" fill-rule="evenodd" d="M8.894 5.789l2.382 4.764A1 1 0 0 1 10.382 12H5.618a1 1 0 0 1-.894-1.447l2.382-4.764a1 1 0 0 1 1.788 0z"/>
    </svg>
  `;
  }

  function createName(name, symbol, colors, size, isLastEl) {
    const tableData = document.createElement('td');
    const nameNode = document.createElement('span');

    if (size === 'small') {
      nameNode.innerHTML = symbol;
    } else {
      nameNode.innerHTML = `${name} (${symbol})`;
    }

    nameNode.style.cssText = `
    font-size: 16px;
    font-weight: 300;
  `;

    let tableDataStyles = `
      vertical-align: middle;
      border: none;
      background-color: ${colors.background};
      border-top: solid 1px ${colors.border};
    `;

    if (isLastEl) {
      tableDataStyles += `border-bottom: solid 1px ${colors.border};`;
    }

    tableData.style.cssText = tableDataStyles;
    tableData.appendChild(nameNode);

    return tableData;
  }

  function createPrice(price, colors, localAtt, currency, isFirstEl, isLastEl) {
    const tableData = document.createElement('td');
    let maximumFractionDigits = 6;
    let locale = localAtt || 'en';

    if (price > 1) {
      maximumFractionDigits = 2;
    }
    if (!localAtt && navigator) {
      locale = navigator.language;
    }

    let priceCalculation = price * currencies[currency].rate;
    if (currency === 'BTC' || currency === 'ETH') {
      priceCalculation = price / currencies[currency].rate;
    }

    const formattedPrice = new Intl.NumberFormat(locale, {
      maximumFractionDigits,
    }).format(priceCalculation);

    tableData.innerHTML = currencies[currency].symbol + formattedPrice;

    let tableDataStyles = `
      font-size: 16px;
      font-weight: 300;
      text-align: right;
      vertical-align: middle;
      padding-right: 28px;
      background-color: ${colors.background};
      border: none;
      border-top: solid 1px ${colors.border};
      border-right: solid 1px ${colors.border};
    `;

    if (isLastEl) {
      tableDataStyles += `border-bottom-right-radius: 29px; border-bottom: solid 1px ${colors.border}; `;
    }

    if (isFirstEl) {
      tableDataStyles += 'border-top-right-radius: 29px;';
    }

    tableData.style.cssText = tableDataStyles;

    return tableData;
  }

  function iconMaker(icon) {
    if (icon && icon.toLowerCase().indexOf('http') >= 0) {
      return icon;
    }
    return `https://api.coin-stats.com/api/files/812fde17aea65fbb9f1fd8a478547bde/${icon}`;
  }

  function createLogoNode(src, colors, isLastEl) {
    const tableData = document.createElement('td');
    const logoNode = document.createElement('img');

    logoNode.setAttribute('src', iconMaker(src));
    logoNode.style.cssText = `
    height: 23px;
    width: 23px;
    max-width: none;
  `;

    let tableDataStyles = `
      vertical-align: middle;
      background-color: ${colors.background};
      border: none;
      border-top: solid 1px ${colors.border};
    `;

    if (isLastEl) {
      tableDataStyles += `border-bottom: solid 1px ${colors.border};`;
    }

    tableData.style.cssText = tableDataStyles;
    tableData.appendChild(logoNode);

    return tableData;
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
    const allPlaceHolders = document.querySelectorAll('coin-stats-list-widget');

    allPlaceHolders.forEach(node => {
      createWidget(node);
    });
  }

  function observeMutations() {
    const nodes = document.querySelectorAll('coin-stats-list-widget');

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
    getCurrencies(function(res) {
      currencies = res;
      initAll();
      observeMutations();
    });
  });
})();
