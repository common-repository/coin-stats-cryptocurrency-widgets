(function() {
  let colors = {};
  const config = { attributes: true };

  function getData(coinId, callback) {
    fetch(`https://api.coin-stats.com/v2/insights/${coinId}`)
      .then(res => res.json())
      .then(res => callback(res));
  }

  function createWidget(placeHolder) {
    const coinId = placeHolder.getAttribute('coin-id');
    getData(coinId, function(data) {
      const insightType = placeHolder.getAttribute('type');
      const textColor = placeHolder.getAttribute('text-color');
      const backgroundColor = placeHolder.getAttribute('bg-color');
      const chartPrimaryColor = placeHolder.getAttribute('chart-primary-color');
      const buttonColor = placeHolder.getAttribute('button-color');
      const disableCredits = placeHolder.getAttribute('disable-credits');
      const font = placeHolder.getAttribute('font') || 'Roboto, Arial, Helvetica';
      const chartSecondaryColor = placeHolder.getAttribute(
        'chart-secondary-color'
      );
      const borderColor = placeHolder.getAttribute('border-color');

      colors = {
        text: textColor,
        background: backgroundColor,
        chartPrimary: chartPrimaryColor,
        chartSecondary: chartSecondaryColor,
        button: buttonColor,
        border: borderColor,
      };

      const widgetContainer = document.createElement('div');

      widgetContainer.style.cssText = `
          background-color: ${colors.background};
          border-radius: 29px;
          border: solid 1px ${borderColor};
        `;

      let inisghtData = null;
      let i = 0;
      for (; i < data.length; i++) {
        if (data[i].type === insightType) {
          inisghtData = data[i];
          break;
        }
      }

      const id = Math.random().toString(7);
      widgetContainer.appendChild(createTitle(inisghtData.title));
      const dataContainer = createDataContainer();
      dataContainer.appendChild(createPieChartContainer(id));
      const showChartContainer = createShowChartContainer(inisghtData.percents);
      const showChartButton = createAnchorTag(inisghtData.coinId, i);
      showChartContainer.appendChild(showChartButton);
      dataContainer.appendChild(showChartContainer);
      widgetContainer.appendChild(dataContainer);
      const tempContainer = document.createElement('div');
      const containerWrapper = document.createElement('div');
      containerWrapper.style.cssText = `
            max-width: 332px;
            color: ${colors.text};
            font-family: ${font}, sans-serif;
          `;

      containerWrapper.appendChild(widgetContainer);
      if (!disableCredits) {
        containerWrapper.appendChild(createCredits(colors.text));
      }
      tempContainer.appendChild(containerWrapper);
      placeHolder.innerHTML = tempContainer.innerHTML;
      createPieChart(id, colors, inisghtData.percent || inisghtData.percents);
    });
  }

  function createTitle(text) {
    const h1 = document.createElement('h1');
    h1.style.cssText = `
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: normal;
      text-align: center;
      padding: 20px 30px;
      margin: 0;
    `;
    const title = document.createTextNode(text);
    h1.appendChild(title);
    return h1;
  }

  function createPieChartScript(callback) {
    if (
      document.querySelector(
        "script[src = 'https://static.coinstats.app/widgets/chart.js']"
      )
    ) {
      callback();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://static.coinstats.app/widgets/chart.js';
    if (document.getElementsByTagName('head').length) {
      document.getElementsByTagName('head')[0].appendChild(script);
    }

    script.onload = function() {
      callback();
    };
  }

  function createPieChartContainer(id) {
    const chartContainer = document.createElement('div');
    chartContainer.setAttribute('id', id);
    return chartContainer;
  }

  function createDataContainer() {
    const dataContainer = document.createElement('div');
    dataContainer.style.cssText = `
      display: flex;
      align-items: center;
    `;
    return dataContainer;
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

  function createShowChartContainer(data) {
    const showChartContainer = document.createElement('div');
    showChartContainer.style.cssText = `
    align-items: center;
    display: flex;
    flex-direction: column;
    `;
    if (data) {
      const ul = document.createElement('ul');
      ul.style.cssText = `
      padding-left: 0px;
      padding-bottom: 24px;
      margin: 0px;
      list-style: none; 
      `;

      data.forEach((element, index) => {
        const li = document.createElement('li');
        const point = document.createElement('div');
        li.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 5px;
          font-size: 14px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
        `;
        point.style.cssText = `
          width: 10px;
          height: 10px;
          background-color: ${
            index === 0 ? colors.chartPrimary : colors.chartSecondary
          }; 
          border-radius: 100%;
          margin-right: 10px;
        `;
        const span = document.createElement('span');
        span.appendChild(
          document.createTextNode(element.percent.toFixed(1) + '%')
        );

        span.style.cssText = `
        font-size: 14px;
        font-weight: bold;
        font-style: normal;
        font-stretch: normal;
        line-height: normal;
        letter-spacing: -0.34px;`;

        const div = document.createElement('div');
        div.style.cssText = `
          display: flex;
          align-items: center;
          padding-right: 20px;
        `;
        div.appendChild(point);
        div.appendChild(document.createTextNode(element.text));
        li.appendChild(div);
        li.appendChild(span);
        ul.appendChild(li);
      });
      showChartContainer.appendChild(ul);
    }

    return showChartContainer;
  }

  const createAnchorTag = (coinId, index) => {
    const anchor = document.createElement('a');
    anchor.href = `https://coinstats.app/en/coins/${coinId}?showInsight=${index}`;
    anchor.target = '_blank';
    anchor.innerText = 'Show Chart';
    anchor.style.cssText = `
    font-size: 14px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: 0.54px;
    text-align: center;
    color: ${colors.button};
    text-decoration: none;
    `;
    return anchor;
  };

  function createPieChart(id, colors, insights) {
    let seriesData = [];
    let title = '';
    if (typeof insights !== 'object') {
      title = insights.toFixed(1);
      seriesData.push(
        {
          y: insights,
          color: colors.chartPrimary,
        },
        {
          color: colors.chartSecondary,
          y: 100 - insights,
        }
      );
    } else {
      title = insights[0].percent.toFixed(1);
      seriesData.push(
        {
          y: insights[0].percent,
          color: colors.chartPrimary,
        },
        {
          color: colors.chartSecondary,
          y: insights[1].percent,
        }
      );
    }
    window.Highcharts.chart(id, {
      chart: {
        height: 160,
        width: 160,
        animation: true,
        backgroundColor: 'transparent',
        type: 'pie',
      },
      plotOptions: {
        series: {
          dataLabels: {
            enabled: false,
          },
        },
        pie: {
          borderWidth: 3,
          borderColor: colors.background,
        },
      },

      title: {
        text: `${title}%`,
        align: 'center',
        verticalAlign: 'middle',
        y: 17,
        style: { color: colors.text, fontSize: '20px', fontWeight: 'bold' },
      },
      tooltip: {
        headerFormat: '',
        pointFormat: '<b>{point.percentage:.1f}%</b>',
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          innerSize: '60%',
          data: seriesData,
        },
      ],
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
      'coin-stats-insight-widget'
    );

    allPlaceHolders.forEach(node => {
      createWidget(node);
    });
  }

  function observeMutations() {
    const nodes = document.querySelectorAll('coin-stats-insight-widget');

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
    createPieChartScript(initAll);
    observeMutations();
  });
})();
