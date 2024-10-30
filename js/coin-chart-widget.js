(function() {
  const config = { attributes: true };

  let currencies = {};

  function createWidget(placeHolder) {
    let globalCoinId;
    let globalTimeInterval = '24h';
    let globalData = [];
    let candleChartData = [];
    let candleChartMax;
    let candleChartMin;
    let globalCurrency = 'USD';
    let globalColors = {};
    let isLineChart = true;
    let diffPercent;
    (function() {
      const coinId = placeHolder.getAttribute('coin-id');
      const width = placeHolder.getAttribute('width');
      const height = placeHolder.getAttribute('chart-height');
      const localeAtt = placeHolder.getAttribute('locale');
      const type = placeHolder.getAttribute('type');
      const currency = placeHolder.getAttribute('currency');
      const backgroundColor = placeHolder.getAttribute('bg-color');
      const statusUpColor = placeHolder.getAttribute('status-up-color');
      const statusDownColor = placeHolder.getAttribute('status-down-color');
      const textColor = placeHolder.getAttribute('text-color');
      const buttonsColor = placeHolder.getAttribute('buttons-color');
      const chartGradientFrom = placeHolder.getAttribute('chart-gradient-from');
      const chartGradientTo = placeHolder.getAttribute('chart-gradient-to');
      const chartColor = placeHolder.getAttribute('chart-color');
      const btcColor = placeHolder.getAttribute('btc-color');
      const ethColor = placeHolder.getAttribute('eth-color');
      const gridsColor = placeHolder.getAttribute('candle-grids-color');
      const chartLabelBackground = placeHolder.getAttribute(
        'chart-label-background'
      );
      const borderColor = placeHolder.getAttribute('border-color');
      const disableCredits = placeHolder.getAttribute('disable-credits');
      const font = placeHolder.getAttribute('font') || 'Roboto, Arial, Helvetica';

      globalCurrency = currency;
      globalCoinId = coinId;

      const colors = {
        background: backgroundColor,
        statusDown: statusDownColor,
        statusUp: statusUpColor,
        buttons: buttonsColor,
        text: textColor,
        chartLabelBackground,
        chartBg: 'transparent',
        chartTextColor: '#fff',
        pointsColor: '#fea856',
        areaColorFrom: chartGradientFrom,
        areaColorTo: chartGradientTo,
        chartColor,
        gridsColor,
        themeI: 'rgb(255,255,255)',
        theme: 'rgb(28,27,27)',
        btc: btcColor,
        eth: ethColor,
        border: borderColor,
      };

      globalColors = colors;

      const widgetContainer = document.createElement('div');
      setLoader(widgetContainer);
      const chartId = Math.random().toString(7);

      widgetContainer.style.cssText = `
      box-sizing: border-box;
      background-color: ${colors.background};
      border: solid 1px ${colors.border};
      max-width: ${width}px;
      border-radius: 20px;
      font-family: ${font}, sans-serif;
    `;
      widgetContainer.appendChild(createStyle(colors));
      getPriceData(coinId, function(coinData) {
        getData(coinId, function(data) {
          widgetContainer.appendChild(createFirstRow(coinData, colors, type));
          widgetContainer.appendChild(createChartContainer(chartId, colors));
          removeLoader(widgetContainer);
          globalData = data;
          const checkboxesSection = createCheckboxesSection(
            localeAtt,
            height,
            chartId,
            type
          );
          const footerBlock = document.createElement('div');

          footerBlock.style.cssText = `
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          margin: 0 30px 20px 30px;
        `;

          footerBlock.appendChild(
            createButtonsSection(
              checkboxesSection,
              height,
              coinId,
              localeAtt,
              chartId,
              type
            )
          );
          if (type === 'large' && isLineChart) {
            footerBlock.appendChild(checkboxesSection);
          }

          widgetContainer.appendChild(footerBlock);

          if (placeHolder.children.length === 1) {
            placeHolder.removeChild(placeHolder.lastChild);
          }
          const container = document.createElement('div');

          container.appendChild(widgetContainer);
          if (!disableCredits) {
            container.appendChild(createCredits(colors.text, font));
          }
          placeHolder.appendChild(container);
          createChart(checkboxesSection, height, '24h', chartId, type);
        });
      });
    })();

    function commarize(price) {
      if (price >= 1e3) {
        var units = ['k', 'M', 'B', 'T'];
        let unit = Math.floor((price.toFixed(0).length - 1) / 3) * 3;
        var num = (price / ('1e' + unit)).toFixed(2);
        var unitname = units[Math.floor(unit / 3) - 1];
        return num + unitname;
      }
      return price.toLocaleString();
    }

    function calculateDiff(x, y) {
      const result = ((y - x) / ((y + x) / 2)) * 100;

      return result;
    }

    function getData(coinId, callback, type = '24h') {
      return fetch(
        `https://api.coin-stats.com/v2/coinchart/${coinId}?type=${type}`
      )
        .then(res => res.json())
        .then(res => {
          const length = res.data.length - 1;

          diffPercent = calculateDiff(res.data[0][1], res.data[length][1]);
          updatePercentBlock();
          callback(res.data);
        });
    }

    function getCandleChartData(id, callback, type = '24h', currency = 'USD') {
      candleChartMax = -Infinity;
      candleChartMin = Infinity;
      return fetch(
        `https://api.coin-stats.com/v2/coinchart/${id}/candle?type=${type}&currency=${currency}`
      )
        .then(res => res.json())
        .then(res => {
          const reorderIndexes = [0, 1, 3, 4, 2, 5];
          const parsedData = res.candleChart.map(el => {
            const result = reorderIndexes.map(i => el[i]);

            result[0] *= 1000;

            if (globalCurrency !== 'USD' && currency === 'USD') {
              const rate = currencies[globalCurrency].rate;

              result[1] *= rate;
              result[2] *= rate;
              result[3] *= rate;
              result[4] *= rate;
            }

            if (result[2] > candleChartMax) {
              candleChartMax = result[2];
            }

            if (result[3] < candleChartMin) {
              candleChartMin = result[3];
            }

            return result;
          });

          const length = res.candleChart.length - 1;

          diffPercent = calculateDiff(
            res.candleChart[0][1],
            res.candleChart[length][1]
          );
          updatePercentBlock();
          candleChartData = parsedData;
          callback();
        });
    }

    function getPriceData(coinId, callback) {
      return fetch(`https://api.coin-stats.com/v2/coins/${coinId}`)
        .then(res => res.json())
        .then(res => callback(res));
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
      font-family: ${font}, sans-serif;
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

    function createStyle(colors) {
      const style = document.createElement('style');
      style.setAttribute('type', 'text/css');
      const styleCss = document.createTextNode(`
    coin-stats-chart-widget {
      word-break: initial;
      word-wrap: initial;
      box-sizing: border-box;
    }
    .cs-chart-round-buttons-block {
      display: flex;
      justify-content: space-between;
    }
    .cs-chart-round-button:not(:first-child) {
      margin-left: 10px;
    }
    
    .cs-chart-round-button {
      border-radius: 20px;
      background-color: ${colors.buttons};
      text-transform: uppercase;
      text-align: center;
      font-size: 15px;
      opacity: 0.8;
      font-weight: bold;
      cursor: pointer;
      color: ${colors.text};
    }
    .type-switcher {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .cs-circular-loader-block .cs-circular-loader-svg {
      animation: rotate 2s linear infinite;
      height: 50px;
      width: 50px;
      transform-origin: center center;
      margin: auto;
    }
    .cs-circular-loader-block .cs-circular-loader-circle {
      stroke-dasharray: 89, 500;
      stroke-dashoffset: 0;
      stroke: ${colors.chartColor};
      animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
      stroke-linecap: round;
    }
    .cs-circular-loader-block {
      text-align: center;
      display: block;
      color: ${colors.chartColor};
      width: 100%;
      margin-top: 14px;
      animation: color 6s ease-in-out infinite;
      font-size: 16px;
    }
    @keyframes dash-result {
      100% {
        stroke-dasharray: 200, 500;
        stroke-dashoffset: 0;
      }
    }
    @keyframes rotate {
      100% {
        transform: rotate(360deg);
      }
    }
    @keyframes dash {
      0% {
        stroke-dasharray: 1, 500;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 89, 500;
        stroke-dashoffset: -35;
      }
      100% {
        stroke-dasharray: 89, 500;
        stroke-dashoffset: -124;
      }
    }
    @keyframes color {
      100%,
      0% {
        stroke: ${colors.chartColor};
      }
      40% {
        stroke: ${colors.chartColor};
      }
      66% {
        stroke: ${colors.chartColor};
      }
      80%,
      90% {
        stroke: ${colors.chartColor};
      }
    }
    .coin-chart-price {
      font-size: 16px;
      font-weight: 300;
    }
    .highcharts-tooltip text {
      color: ${colors.text} !important;
      fill: ${colors.text} !important;
    }
    .highcharts-tooltip .highcharts-label-box {
      fill: ${colors.chartLabelBackground};
      stroke: ${colors.chartLabelBackground};
    }
    .pure-material-checkbox span {
      font-size: 16px;
      font-weight: 300;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      color: ${colors.text};
      opacity: 0.8;
    }
    
    .pure-material-checkbox {
      position: relative;
      display: flex;
      align-items: flex-end;
    }

    .pure-material-checkbox > input {
      appearance: none;
      -moz-appearance: none;
      -webkit-appearance: none;
      z-index: -1;
      position: absolute;
      left: -10px;
      top: -8px;
      display: block;
      margin: 0;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      box-shadow: none;
      outline: none;
      opacity: 0;
      transform: scale(1);
      pointer-events: none;
      transition: opacity 0.3s, transform 0.2s;
    }
    
    .pure-material-checkbox > span {
      cursor: pointer;
    }
    
    .pure-material-checkbox > span::before {
      content: '';
      display: inline-block;
      box-sizing: border-box;
      margin: 0 11px 3px 1px;
      border: solid 2px; /* Safari */
      border-radius: 2px;
      width: 16px;
      height: 16px;
      vertical-align: top;
      transition: border-color 0.2s, background-color 0.2s;
    }
    
    .pure-material-checkbox > span::after {
      content: "";
      display: block;
      position: absolute;
      bottom: 13px;
      left: 1px;
      width: 8px;
      height: 3px;
      border: solid 2px transparent;
      border-right: none;
      border-top: none;
      transform: translate(3px, 4px) rotate(-45deg);
    }
    
    .pure-material-checkbox > input:indeterminate + span::after {
      border-left: none;
      transform: translate(4px, 3px);
    }
    
    .pure-material-checkbox:hover > input {
      opacity: 0.04;
    }
    
    .pure-material-checkbox > input:focus {
      opacity: 0.12;
    }
    
    .pure-material-checkbox:hover > input:focus {
      opacity: 0.16;
    }
    
    .pure-material-checkbox > input:active {
      opacity: 1;
      transform: scale(0);
      transition: transform 0s, opacity 0s;
    }
    
    .pure-material-checkbox > input:checked:active + span::before {
      border-color: transparent;
    }
    
    /* Disabled */
    .pure-material-checkbox > input:disabled {
      opacity: 0;
    }
    
    .pure-material-checkbox > input:disabled + span {
      color: grey;
      cursor: initial;
    }
    .chart-checkbox-usd > span::before {
      border-color: ${colors.chartColor};
    }
    .chart-checkbox-usd > input:checked,
    .chart-checkbox-usd > input:indeterminate {
      background-color: ${colors.chartColor};
    }
    .chart-checkbox-usd > input:checked + span::after,
    .chart-checkbox-usd > input:indeterminate + span::after {
      border-color: ${colors.chartColor};
    }
    .chart-checkbox-usd > input:checked:active + span::before {
      border-color: transparent;
    }
    .chart-checkbox-btc {
      margin-left: 40px;
    }
    .chart-checkbox-btc > span::before {
      border-color: ${colors.btc};
    }
    .chart-checkbox-btc > input:checked,
    .chart-checkbox-btc > input:indeterminate {
      background-color: ${colors.btc};
    }
    .chart-checkbox-btc > input:checked + span::after,
    .chart-checkbox-btc > input:indeterminate + span::after {
      border-color: ${colors.btc};
    }
    .chart-checkbox-btc > input:checked:active + span::before {
      border-color: transparent;
    }

    .chart-checkbox-eth {
      margin-left: 40px;
    }
    .chart-checkbox-eth > span::before {
      border-color: ${colors.eth};
    }
    .chart-checkbox-eth > input:checked,
    .chart-checkbox-eth > input:indeterminate {
      background-color: ${colors.eth};
    }
    .chart-checkbox-eth > input:checked + span::after,
    .chart-checkbox-eth > input:indeterminate + span::after {
      border-color: ${colors.eth};
    }
    .chart-checkbox-eth > input:checked:active + span::before {
      border-color: transparent;
    }
    .checkbox-container {
      display: flex;
      margin-top: 20px;
    }
    .checkbox-placeholder {
      width: 202.067px;
      height: 21px;
    }
    .cs-chart-selected-button {
      color: ${colors.chartColor};
    }
    coin-stats-chart-widget *, coin-stats-chart-widget *:after, coin-stats-chart-widget *:before {
      box-sizing: unset;
    }
  `);

      style.appendChild(styleCss);

      return style;
    }

    function createTypeSwitcher(
      buttonsBlock,
      container,
      height,
      coinId,
      localeAtt,
      chartId,
      type
    ) {
      const typeSwitcherBlock = document.createElement('div');

      const candleChartIcon = `
        <svg width="22px" height="17px" viewBox="0 0 22 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="Buttons/candle-Copy-2" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Buttons/candle" transform="translate(4.000000, 2.000000)" fill="#FFA959">
                    <path d="M3.04705882,9.75 L3.29411765,9.75 C3.74894038,9.75 4.11764706,9.38623136 4.11764706,8.9375 L4.11764706,3.25 C4.11764706,2.80126864 3.74894038,2.4375 3.29411765,2.4375 L3.04705882,2.4375 L2.55294118,2.4375 L2.47058824,2.4375 C2.0157655,2.4375 1.64705882,2.80126864 1.64705882,3.25 L1.64705882,8.9375 C1.64705882,9.38623136 2.0157655,9.75 2.47058824,9.75 L2.55294118,9.75 L3.04705882,9.75 Z M3.45882353,11.0438429 L3.45882353,12.5882353 C3.45882353,12.8156467 3.27447019,13 3.04705882,13 L2.55294118,13 C2.32552981,13 2.14117647,12.8156467 2.14117647,12.5882353 L2.14117647,11.0251543 C1.11502915,10.8688277 0.329411765,9.99368048 0.329411765,8.9375 L0.329411765,3.25 C0.329411765,2.19381952 1.11502915,1.31867234 2.14117647,1.16234566 L2.14117647,0.411764706 C2.14117647,0.184353338 2.32552981,4.17747905e-17 2.55294118,0 L3.04705882,5.55111512e-17 C3.27447019,1.37363607e-17 3.45882353,0.184353338 3.45882353,0.411764706 L3.45882353,1.14365707 C4.56440315,1.22663361 5.43529412,2.13797516 5.43529412,3.25 L5.43529412,8.9375 C5.43529412,10.0495248 4.56440315,10.9608664 3.45882353,11.0438429 Z M11.2823529,10.5625 L11.5294118,10.5625 C11.9842345,10.5625 12.3529412,10.1987314 12.3529412,9.75 L12.3529412,6.5 C12.3529412,6.05126864 11.9842345,5.6875 11.5294118,5.6875 L11.2823529,5.6875 L10.7882353,5.6875 L10.7058824,5.6875 C10.2510596,5.6875 9.88235294,6.05126864 9.88235294,6.5 L9.88235294,9.75 C9.88235294,10.1987314 10.2510596,10.5625 10.7058824,10.5625 L10.7882353,10.5625 L11.2823529,10.5625 Z M11.6941176,11.8563429 L11.6941176,12.5882353 C11.6941176,12.8156467 11.5097643,13 11.2823529,13 L10.7882353,13 C10.5608239,13 10.3764706,12.8156467 10.3764706,12.5882353 L10.3764706,11.8376543 C9.35032327,11.6813277 8.56470588,10.8061805 8.56470588,9.75 L8.56470588,6.5 C8.56470588,5.44381952 9.35032327,4.56867234 10.3764706,4.41234566 L10.3764706,0.411764706 C10.3764706,0.184353338 10.5608239,-6.9247512e-17 10.7882353,-1.11022302e-16 L11.2823529,0 C11.5097643,-4.17747905e-17 11.6941176,0.184353338 11.6941176,0.411764706 L11.6941176,4.39365707 C12.7996973,4.47663361 13.6705882,5.38797516 13.6705882,6.5 L13.6705882,9.75 C13.6705882,10.8620248 12.7996973,11.7733664 11.6941176,11.8563429 Z" id="Combined-Shape"></path>
                </g>
            </g>
        </svg>
      `;
      const lineChartIcon = `
        <svg width="22px" height="17px" viewBox="0 0 22 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="Buttons/candle-Copy-3" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <path d="M7.70050351,5.79604014 L4.16952066,11.2059216 C3.98478747,11.4889546 3.5946617,11.5754497 3.29815036,11.3991138 C3.00163903,11.2227779 2.91102494,10.8503859 3.09575814,10.5673529 L7.19650871,4.28452012 C7.45184643,3.89331267 8.05371248,3.90843945 8.28712934,4.31193084 L10.5930695,8.2980482 L13.1307307,8.2980482 C13.3401517,8.2980482 13.5359982,8.39698618 13.6537736,8.56227976 L15.4947497,11.1460233 L17.7861098,6.05576125 C17.924027,5.74937778 18.2960317,5.60772671 18.6170054,5.73937472 C18.9379792,5.87102274 19.0863759,6.22611742 18.9484586,6.53250089 L16.2016659,12.6345078 C16.0045045,13.0725022 15.3783139,13.1298911 15.0974485,12.7357067 L12.7959587,9.50564876 L10.2197774,9.50564876 C9.98947233,9.50564876 9.77736619,9.38616737 9.66603802,9.19372215 L7.70050351,5.79604014 Z" id="Stroke-1" fill="#FFA959"></path>
            </g>
        </svg>
      `;

      typeSwitcherBlock.setAttribute(
        'class',
        'cs-chart-round-button type-switcher'
      );
      typeSwitcherBlock.innerHTML = isLineChart
        ? candleChartIcon
        : lineChartIcon;

      const handleClick = () => {
        isLineChart = !isLineChart;
        typeSwitcherBlock.innerHTML = isLineChart
          ? candleChartIcon
          : lineChartIcon;

        if (isLineChart) {
          createChart(container, height, localeAtt, chartId, type);
        } else {
          Array.from(container.children).forEach((el, i) => {
            if (i) {
              el.firstChild.checked = false;
            } else {
              el.firstChild.checked = true;
            }
          });

          getCandleChartData(
            coinId,
            () => {
              createCandleChart(height, chartId);
            },
            globalTimeInterval
          );
        }
      };

      typeSwitcherBlock.addEventListener('click', handleClick);

      buttonsBlock.appendChild(typeSwitcherBlock);
    }

    function createButtonsSection(
      container,
      height,
      coinId,
      localeAtt,
      chartId,
      type
    ) {
      const buttonsBlock = document.createElement('div');
      const timeIntervals = ['24h', '1w', '1m', '3m', '6m', '1y', 'all'];
      buttonsBlock.style.cssText = `
        margin-top: 10px;
        width: 100%
      `;

      createTypeSwitcher(buttonsBlock, ...arguments);

      timeIntervals.forEach(timeInterval => {
        const buttonBlock = document.createElement('div');

        if (timeInterval === '24h') {
          buttonBlock.setAttribute(
            'class',
            'cs-chart-round-button cs-chart-selected-button'
          );
        } else {
          buttonBlock.setAttribute('class', 'cs-chart-round-button');
        }
        buttonBlock.addEventListener('click', function(event) {
          globalTimeInterval = timeInterval;

          if (isLineChart) {
            getData(
              coinId,
              function(data) {
                globalData = data;
                chartIntervalClick(event, timeInterval);
                createChart(container, height, localeAtt, chartId, type);
              },
              timeInterval
            );
          } else {
            const currency = getCheckedBoxName(container);
            let showCurrency = currency;
            if (currency === 'USD' && globalCurrency !== 'USD') {
              showCurrency = globalCurrency;
            }
            getCandleChartData(
              coinId,
              () => {
                chartIntervalClick(event, timeInterval);
                createCandleChart(height, chartId, showCurrency);
              },
              timeInterval,
              currency
            );
          }
        });
        buttonBlock.innerHTML = timeInterval;
        buttonsBlock.appendChild(buttonBlock);
      });

      buttonsBlock.setAttribute('class', 'cs-chart-round-buttons-block');

      return buttonsBlock;
    }

    function chartIntervalClick(event) {
      const buttonsBlock = event.target.parentElement;

      for (let i = 0; i < buttonsBlock.children.length; i++) {
        const button = buttonsBlock.children[i];

        button.classList.remove('cs-chart-selected-button');
      }

      event.target.classList.add('cs-chart-selected-button');
    }

    function setLoader(container) {
      const svgBlock = document.createElement('div');
      const svgNode = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      const circleNode = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      );

      svgBlock.setAttribute('class', 'cs-circular-loader-block');

      svgNode.setAttribute('class', 'cs-circular-loader-svg');
      svgNode.setAttribute('viewBox', '25 25 50 50');

      circleNode.setAttribute('class', 'cs-circular-loader-circle');
      circleNode.setAttribute('cx', '50');
      circleNode.setAttribute('cy', '50');
      circleNode.setAttribute('r', '20');
      circleNode.setAttribute('fill', 'none');
      circleNode.setAttribute('stroke-width', '2');
      circleNode.setAttribute('stroke-miterlimit', '10');
      circleNode.setAttribute('stroke-dasharray', '200, 200');
      circleNode.setAttribute('stroke-dashoffset', '0');

      svgNode.appendChild(circleNode);
      svgBlock.appendChild(svgNode);
      container.appendChild(svgBlock);
    }

    function removeLoader(container) {
      for (let i = 0; i < container.children.length; i++) {
        const el = container.children[i];

        if (el.classList.value === 'cs-circular-loader-block') {
          container.removeChild(el);
        }
      }
    }

    function createCheckboxesSection(localeAtt, height, chartId, type) {
      const checkboxesBlock = document.createElement('div');
      const symbols = ['USD', 'BTC', 'ETH'];

      symbols.forEach((symbol, index) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        const span = document.createElement('span');

        label.setAttribute(
          'class',
          'pure-material-checkbox' +
            ' ' +
            'chart-checkbox-' +
            symbol.toLowerCase()
        );
        input.setAttribute('type', 'checkbox');
        input.setAttribute('class', 'currency-checkbox');
        input.setAttribute('name', symbol);

        if (!index) {
          input.setAttribute('checked', '');
        }
        let showSymbol = symbol;

        if (globalCurrency !== 'USD' && !index) {
          showSymbol = globalCurrency;
        }

        span.innerHTML = showSymbol;

        label.appendChild(input);
        label.appendChild(span);
        checkboxesBlock.appendChild(label);

        input.addEventListener('click', function(event) {
          handleCheckBoxChange(
            checkboxesBlock,
            height,
            localeAtt,
            chartId,
            type,
            event
          );
        });
      });

      checkboxesBlock.setAttribute('class', 'checkbox-container');

      return checkboxesBlock;
    }

    function getCheckedBoxName(container) {
      const checkBoxes = container.children;
      let checkedUSD =
        checkBoxes[0].firstChild.checked && checkBoxes[0].firstChild.name;
      let checkedBTC = checkBoxes[1].firstChild.checked && 'BTC';
      let checkedETH = checkBoxes[2].firstChild.checked && 'ETH';

      return checkedUSD || checkedBTC || checkedETH;
    }

    function handleCheckBoxChange(
      container,
      height,
      localeAtt,
      chartId,
      type,
      event
    ) {
      const checkedBoxes = Array.from(container.children).filter(
        element => element.firstChild.checked
      );

      if (checkedBoxes.length === 0) {
        event.target.checked = true;
        event.stopPropagation();
      } else if (checkedBoxes.length === 1 || isLineChart) {
        createChart(container, height, localeAtt, chartId, type);
      } else {
        checkedBoxes.forEach(el => {
          if (el.firstChild.name !== event.target.name) {
            el.firstChild.checked = false;
          }
        });
        let showCurrency = event.target.name;

        if (showCurrency === 'USD' && globalCurrency !== 'USD') {
          showCurrency = globalCurrency;
        }

        getCandleChartData(
          globalCoinId,
          () => {
            createCandleChart(height, chartId, showCurrency);
          },
          globalTimeInterval,
          event.target.name
        );
      }
    }

    function createFirstRow(coinData, colors, type) {
      const firstRowContainer = document.createElement('div');
      const coinNameContainer = document.createElement('div');
      firstRowContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 30px;
      margin-bottom: 0px;
    `;
      coinNameContainer.style.cssText = `
      display: flex;
      align-items: center;
      cursor: pointer;
    `;
      const logoNode = createLogoNode(coinData.ic);
      const coinName = createTitle(coinData.n, coinData.s);

      coinNameContainer.addEventListener('click', function() {
        window.open(`https://coinstats.app/en/coins/${coinData.i}`);
      });

      coinNameContainer.appendChild(logoNode);
      coinNameContainer.appendChild(coinName);
      firstRowContainer.appendChild(coinNameContainer);
      if (type === 'large') {
        firstRowContainer.appendChild(createPercentNode(colors));
      }
      return firstRowContainer;
    }

    function createChartContainer(id, colors) {
      const chartContainer = document.createElement('div');

      chartContainer.setAttribute('id', id);
      chartContainer.style.cssText = `
        padding: 20px 30px;
        border-bottom: solid 1px ${colors.border};
      `;
      return chartContainer;
    }

    function createPercentNode(colors) {
      const percentBlock = document.createElement('div');
      const percnetNode = document.createElement('span');
      const status = diffPercent < 0 ? 'statusDown' : 'statusUp';

      const arrowSvg = `
        <svg ${
          status === 'statusDown' ? 'style="transform: rotate(0.5turn);"' : ''
        } xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
          <path fill="${
            colors[status]
          }" fill-rule="evenodd" d="M8.894 5.789l2.382 4.764A1 1 0 0 1 10.382 12H5.618a1 1 0 0 1-.894-1.447l2.382-4.764a1 1 0 0 1 1.788 0z"/>
        </svg>
      `;

      percentBlock.style.cssText = `
        font-size: 16px;
        font-weight: 300;
        color: ${colors.text};
      `;
      percnetNode.style.cssText = `
        display: flex;
        align-items: center;
      `;

      percentBlock.className = 'cs-percent-block';
      percnetNode.innerHTML =
        `<span style="margin-right: 10px; opacity: 0.8;">${globalTimeInterval.toUpperCase()} Change</span>` +
        arrowSvg +
        `<span style="color: ${colors[status]};">${Math.abs(
          diffPercent
        ).toFixed(2) + '%'}</span>`;

      percentBlock.appendChild(percnetNode);

      return percentBlock;
    }

    function updatePercentBlock() {
      const percentBlock = placeHolder.querySelector('.cs-percent-block');

      if (percentBlock) {
        const parent = percentBlock.parentElement;

        parent.removeChild(percentBlock);
        parent.appendChild(createPercentNode(globalColors));
      }
    }

    function createTitle(coinName, symbol) {
      const title = document.createElement('span');
      title.style.cssText = `
      font-size: 15px;
      font-weight: 300;
      opacity: 0.8;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
      color: ${globalColors.text};
      margin-left: 20px;
    `;
      title.appendChild(document.createTextNode(`${coinName} (${symbol})`));
      return title;
    }

    function iconMaker(icon) {
      if (icon && icon.toLowerCase().indexOf('http') >= 0) {
        return icon;
      }
      return `https://api.coin-stats.com/api/files/812fde17aea65fbb9f1fd8a478547bde/${icon}`;
    }

    function createLogoNode(src) {
      const logoNode = document.createElement('img');

      logoNode.setAttribute('src', iconMaker(src));

      logoNode.style.cssText = `
    height: 40px;
    width: 40px;
  `;

      return logoNode;
    }

    function createCandleChart(height, chartId, currency) {
      function formatTooltip(tooltip, x = this.x, points = this.points) {
        let currencySymbol;

        if (currency) {
          currencySymbol = currencies[currency].symbol;
        } else {
          currencySymbol = currencies[globalCurrency].symbol;
        }
        const point = points[0].point;
        const result = `
      <b>${formateDate(x)}</b>
      <br/>Open: ${currencySymbol}${formatePrice(point.open, globalCurrency)}
      <br/>High: ${currencySymbol}${formatePrice(
          point.high,
          globalCurrency
        )}<br/>Low: ${currencySymbol}${formatePrice(
          point.low,
          globalCurrency
        )}<br/>Close: ${currencySymbol}${formatePrice(
          point.close,
          globalCurrency
        )}<br/>`;

        return result;
      }

      const config = {
        navigator: {
          enabled: false,
        },
        scrollbar: {
          enabled: false,
        },
        chart: {
          backgroundColor: globalColors.chartBg,
          height: height,
        },
        rangeSelector: {
          enabled: false,
        },
        plotOptions: {
          candlestick: {
            color: globalColors.statusDown,
            upColor: globalColors.statusUp,
          },
        },
        credits: {
          enabled: false,
        },
        tooltip: {
          formatter: formatTooltip,
          shared: true,
        },
        xAxis: [
          {
            lineColor: globalColors.gridsColor,
            tickColor: globalColors.gridsColor,
            gridLineWidth: 1,
            gridLineColor: globalColors.gridsColor,
            crosshair: {
              color: globalColors.text,
            },
            labels: {
              formatter() {
                return formateDate(this.value, true);
              },
              style: {
                color: globalColors.text,
              },
            },
          },
        ],
        yAxis: [
          {
            title: '',
            labels: {
              formatter() {
                return `<span>
              ${formatePrice(this.value, globalCurrency)}
                </span>`;
              },
              style: {
                color: globalColors.text,
              },
              x: 0,
              y: 0,
            },
            gridLineColor: globalColors.gridsColor,
            min: candleChartMin,
            max: candleChartMax,
            startOnTick: false,
            crosshair: {
              color: globalColors.text,
            },
            opposite: false,
          },
        ],
        series: [
          {
            name: '',
            type: 'candlestick',
            data: candleChartData,
            upLineColor: globalColors.statusUp,
            lineColor: globalColors.statusDown,
          },
        ],
      };

      Highcharts.stockChart(chartId, config);
    }

    function formateDate(inputDate, withBreaks) {
      const timeInterval = globalTimeInterval;
      const date = new Date(inputDate);
      const hour = date.getHours();
      const minute = date.getMinutes();
      let time = `${hour < 10 ? `0${hour}` : hour}:${
        minute < 10 ? `0${minute}` : minute
      }`;

      var monthName = [
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MAY',
        'JUNE',
        'JULY',
        'AUG',
        'SEPT',
        'OCT',
        'NOV',
        'DEC',
      ];

      if (timeInterval !== '24h') {
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        if (withBreaks) {
          time = `${day} ${monthName[month]}<br/>${year}`;
        } else if (timeInterval !== '1w') {
          time = `${day} ${monthName[month]} ${year}`;
        } else {
          time = `${day} ${monthName[month]} ${year} ${time}`;
        }
      }
      return time;
    }

    function formatePrice(price, symbol) {
      var locale = 'en';
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

      if (navigator) {
        locale = navigator.language;
      }

      const formattedPrice = new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits: minimumFractionDigits,
      }).format(price);

      return commarize(formattedPrice);
    }

    function createChart(container, height, locale, chartId, type) {
      const coinChartInfoDates = [];
      const coinChartInfoUSD = [];
      const coinChartInfoBTC = [];
      const coinChartInfoETH = [];
      const coinChartInfoETHConvert = [];

      const checkBoxes = container.children;

      globalData.forEach(value => {
        coinChartInfoDates.push(value[0] * 1000);
        coinChartInfoUSD.push(value[1]);
        coinChartInfoBTC.push(value[2]);
        coinChartInfoETH.push(value[3]);
        coinChartInfoETHConvert.push(value[3] / 0.24986247573117534);
      });
      const currency = globalCurrency;
      let coinChartInfoMainPair = coinChartInfoUSD;
      const isUsdBtcEth =
        currency === 'USD' || currency === 'BTC' || currency === 'ETH';
      if (!isUsdBtcEth) {
        coinChartInfoMainPair = coinChartInfoUSD.map(
          el => el * currencies[currency].rate
        );
      }

      const dates = coinChartInfoDates;
      let chartBg = 'rgba(255, 255, 255,0)';
      let chartTextColor = globalColors.text;
      const pointsColor = '#fea856';
      const areaColorFrom = globalColors.areaColorFrom;
      const areaColorTo = globalColors.areaColorTo;

      const config = {
        title: '',
        chart: {
          backgroundColor: chartBg,
          height,
        },
        plotOptions: {
          series: {
            marker: {
              fillColor: 'transparent',
            },
          },
          area: {
            fillColor: {
              linearGradient: {
                y0: 0,
                y1: 1,
                x0: 0,
                x1: 1,
              },
              stops: [
                [0, areaColorTo],
                [1, areaColorFrom],
              ],
            },
            threshold: null,
            color: pointsColor,
          },
        },
        xAxis: {
          visible: false,
          gridLineColor: 'transparent',
        },
        yAxis: [],
        series: [],
        credits: {
          enabled: false,
        },
        tooltip: {
          formatter() {
            return this.points.reduce((s, point) => {
              return `${s} 
          <br/><span class="chart-tooltlip"style="font-size:14px; color:${
            point.series.color
          }">${point.series.name}
           </span>:
          <span style="font-size:14px;">${formatePrice(point.y, 'USD')}</span>`;
            }, `<span>${formateDate(dates[this.x])}</span>`);
          },
          crosshairs: false,
          shared: true,
        },
      };

      let maxMainPair = coinChartInfoMainPair[0];
      let minMainPair = coinChartInfoMainPair[0];
      let maxBTC = coinChartInfoBTC[0];
      let minBTC = coinChartInfoBTC[0];
      let maxETH = coinChartInfoETH[0];
      let minETH = coinChartInfoETH[0];
      let checkedUSD = checkBoxes[0].firstChild.checked;
      let checkedBTC = checkBoxes[1].firstChild.checked;
      let checkedETH = checkBoxes[2].firstChild.checked;
      if (checkedBTC) {
        coinChartInfoBTC.map(value => {
          if (minBTC > value) {
            minBTC = value;
          }
          if (maxBTC < value) {
            maxBTC = value;
          }
          return '';
        });
        let opposite = true;
        let type;
        if (!checkedUSD && checkedETH) {
          opposite = false;
        }
        if (!checkedUSD && !checkedETH) {
          opposite = false;
          type = 'area';
        }

        config.yAxis.push({
          gridLineColor: 'transparent',
          title: '',
          max: maxBTC,
          min: minBTC,
          opposite,
          labels: {
            formatter() {
              return `<span class="coin-chart-price">
        ฿${formatePrice(this.value, 'BTC', locale)}
          </span>`;
            },
            style: {
              color: chartTextColor,
              opacity: 0.8,
            },
          },
        });
        config.series.push({
          name: 'BTC',
          type,
          states: {
            hover: {
              lineWidth: 2,
            },
          },
          showInLegend: false,
          data: coinChartInfoBTC,
          color: globalColors.btc,
        });
      }
      if (checkedETH) {
        let yAxis;
        let type;
        if (!checkedUSD && checkedBTC) {
          yAxis = 1;
        }
        if (checkedUSD && checkedBTC) {
          yAxis = 1;
        }
        let opposite = true;
        if (!checkedUSD && !checkedBTC) {
          opposite = false;
          type = 'area';
        }
        coinChartInfoETH.map(value => {
          if (minETH > value) {
            minETH = value;
          }
          if (maxETH < value) {
            maxETH = value;
          }
          return '';
        });
        config.yAxis.push({
          gridLineColor: 'transparent',
          title: '',
          opposite,
          labels: {
            formatter() {
              return `<span class="coin-chart-price">
          Ξ${formatePrice(this.value, 'ETH', locale)}
            </span>`;
            },
            style: {
              color: chartTextColor,
              opacity: 0.8,
            },
          },
        });

        config.series.push({
          name: 'ETH',
          type,
          states: {
            hover: {
              lineWidth: 2,
            },
          },
          showInLegend: false,
          yAxis,
          data: coinChartInfoETH,
          color: globalColors.eth,
        });
      }
      if (checkedUSD) {
        let yAxis;
        let type;
        if (config.yAxis.length > 0) {
          yAxis = 1;
        }
        if (checkedBTC && checkedETH) {
          yAxis = 2;
        }
        if (!checkedBTC && !checkedETH) {
          type = 'area';
        }
        coinChartInfoMainPair.map(value => {
          if (minMainPair > value) {
            minMainPair = value;
          }
          if (maxMainPair < value) {
            maxMainPair = value;
          }
          return '';
        });

        config.yAxis.push({
          gridLineColor: 'transparent',
          title: '',
          max: maxMainPair,
          min: minMainPair,
          lineWidth: 0,
          labels: {
            formatter() {
              return `<span class="coin-chart-price">
        ${
          isUsdBtcEth ? '$' : currencies[currency].name
        }${new Intl.NumberFormat().format(this.value)}
          </span> `;
            },
            style: {
              color: chartTextColor,
              opacity: 0.8,
            },
          },
        });

        config.series.push({
          name: isUsdBtcEth ? 'USD' : currencies[currency].name,
          type,
          yAxis,
          showInLegend: false,
          states: {
            hover: {
              lineWidth: 2,
            },
          },
          data: coinChartInfoMainPair,
          color: globalColors.chartColor,
        });
      }

      Highcharts.chart(chartId, config);
    }
  }

  function getCurrencies(callback) {
    return fetch(`https://api.coin-stats.com/v3/currencies`)
      .then(resFiats => resFiats.json())
      .then(resFiats => {
        callback(resFiats);
      });
  }

  function createChartScript(callback) {
    const chartUrl = 'https://static.coinstats.app/widgets/chart.js';

    if (document.querySelector(`script[src = "${chartUrl}"]`)) {
      callback();
      return;
    }

    const script = document.createElement('script');

    script.src = chartUrl;

    if (document.getElementsByTagName('head').length) {
      document.getElementsByTagName('head')[0].appendChild(script);
    }

    script.onload = function() {
      callback();
    };
  }

  function initAll() {
    const allPlaceHolders = document.querySelectorAll(
      'coin-stats-chart-widget'
    );

    allPlaceHolders.forEach(node => {
      createWidget(node);
    });
  }

  function observeMutations() {
    const nodes = document.querySelectorAll('coin-stats-chart-widget');

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
      createChartScript(initAll);
      observeMutations();
    });
  });
})();
