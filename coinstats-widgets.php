<?php
/**
 * Plugin Name:   Coin Stats Cryptocurrency Widgets
 * Plugin URI:    https://coinstats.app/widgets
 * Description:   You don’t want to be left behind as the world moves towards cryptocurrency markets. CoinStats is a crypto portfolio tracker platform that provides live prices for Bitcoin & more than 6000 altcoins. This is a great plugin for those who want a way to monitor that valuable information real time. If you are really into crypto, this plugin is a great supplement to your site.
 * Version:       1.5
 * Author:        CoinStats
 * Author URI:    https://coinstats.app
 */
class CoinStatsCoinPriceWidget extends WP_Widget
{
  // Set up the widget name and description.
  public function __construct()
  {
    $widget_options = array(
      'classname' => 'coinstats-coin-price-widget',
      'description' => 'A widget of a specific coin price.'
    );
    parent::__construct(
      'coinstats-coin-price-widget',
      'Coin Price Widget',
      $widget_options
    );
  }

  // Create the widget output.
  public function widget($args, $instance)
  {
    $config = $instance['config']; ?>
        <coin-stats-ticker-widget
          <?php
          echo !empty($config)
            ? $config
            : 'coin-id="bitcoin" locale="en" currency="USD" rank-background="#FFA959" background="#1C1B1B" status-up-color="#74D492" status-down-color="#FE4747" rank-text-color="#1C1B1B" text-color="#FFFFFF" border-color="rgba(255,255,255,0.15)" type="large" width="350"';
          echo 'disable-mutation-observer="true"';
          echo 'disable-credits="true"';
          ?>
        ></coin-stats-ticker-widget>
        <script><?php echo include_once __DIR__ .
          '/js/coin-price-widget.min.js'; ?></script>
        <?php
  }

  // Create the admin area widget settings form.
  public function form($instance)
  {
    $config = '';
    $configUrl = 'https://coinstats.app/widget/coin-price?wordpress=true';

    if (!empty($instance['config'])) {
      $config = $instance['config'];
      $configUrl =
        $configUrl .
        "&config=?" .
        urlencode(str_replace(" ", "&", str_replace('"', "", $config)));
    }
    ?>
    <div>
      <p>For configuration code please proceed to the <a href=<?php echo $configUrl; ?> target="_blank" rel="noopener">our website.</a></p>
      <label for="<?php echo $this->get_field_id(
        'config'
      ); ?>">Configuration Code:</label>
      <input id="<?php echo $this->get_field_id(
        'config'
      ); ?>" name="<?php echo $this->get_field_name('config'); ?>" value="<?php echo esc_attr($config); ?>"/>
    </div><?php
  }

  // Apply settings to the widget instance.
  public function update($new_instance, $old_instance)
  {
    return $new_instance;
  }
}

class CoinStatsCoinListWidget extends WP_Widget
{
  // Set up the widget name and description.
  public function __construct()
  {
    $widget_options = array(
      'classname' => 'coinstats-coin-list-widget',
      'description' => 'A widget that displays a chosen list of coin prices.'
    );
    parent::__construct(
      'coinstats-coin-list-widget',
      'Coin List Widget',
      $widget_options
    );
  }
  // Create the widget output.
  public function widget($args, $instance)
  {
    ?>
    <coin-stats-list-widget
    <?php
    $config = !empty($instance['config'])
      ? $instance['config']
      : 'coin-ids="bitcoin,ethereum,litecoin" locale="en" currency="USD" bg-color="#1C1B1B" status-up-color="#74D492" status-down-color="#FE4747" text-color="#FFFFFF" border-color="rgba(255,255,255,0.15)" width="600"';
    echo $config;
    echo 'disable-mutation-observer="true"';
    echo 'disable-credits="true"';
    ?>
    ></coin-stats-list-widget>
    <script><?php echo include_once __DIR__ .
      '/js/coin-list-widget.min.js'; ?></script>
    <?php
  }

  // Create the admin area widget settings form.
  public function form($instance)
  {
    $config = '';
    $configUrl = 'https://coinstats.app/widget/coin-list?wordpress=true';

    if (!empty($instance['config'])) {
      $config = $instance['config'];
      $configUrl =
        $configUrl .
        "&config=?" .
        urlencode(str_replace(" ", "&", str_replace('"', "", $config)));
    }
    ?>
    <div>
      <p>For configuration code please proceed to the <a href=<?php echo $configUrl; ?> target="_blank" rel="noopener">our website.</a></p>
      <label for="<?php echo $this->get_field_id(
        'config'
      ); ?>">Configuration Code:</label>
      <input id="<?php echo $this->get_field_id(
        'config'
      ); ?>" name="<?php echo $this->get_field_name('config'); ?>" value="<?php echo esc_attr($config); ?>"/>
    </div><?php
  }

  // Apply settings to the widget instance.
  public function update($new_instance, $old_instance)
  {
    return $new_instance;
  }
}

class CoinStatsCoinChartWidget extends WP_Widget
{
  // Set up the widget name and description.
  public function __construct()
  {
    $widget_options = array(
      'classname' => 'coinstats-coin-chart-widget',
      'description' => 'A widget of the chart of a specific coin.'
    );
    parent::__construct(
      'coinstats-coin-chart-widget',
      'Coin Price Chart Widget',
      $widget_options
    );
  }
  // Create the widget output.
  public function widget($args, $instance)
  {
    ?>
    <coin-stats-chart-widget
      <?php
      $config = !empty($instance['config'])
        ? $instance['config']
        : 'type="large" coin-id="bitcoin" width="650" chart-height="300" currency="USD" locale="en" bg-color="#1C1B1B" status-up-color="#74D492" status-down-color="#FE4747" text-color="#FFFFFF" buttons-color="#1C1B1B" chart-color="#FFA959" chart-gradient-from="rgba(255,255,255,0.07)" chart-gradient-to="rgba(0,0,0,0)" border-color="rgba(255,255,255,0.15)" btc-color="#6DD400" eth-color="#67B5FF" chart-label-background="#000000" candle-grids-color="rgba(255,255,255,0.1)"';
      echo $config;
      echo 'disable-mutation-observer="true"';
      echo 'disable-credits="true"';
      ?>
    ></coin-stats-chart-widget>
    <script><?php echo include_once __DIR__ .
      '/js/coin-chart-widget.min.js'; ?></script>
    <?php
  }

  // Create the admin area widget settings form.
  public function form($instance)
  {
    $config = '';
    $configUrl = 'https://coinstats.app/widget/coin-price-chart?wordpress=true';

    if (!empty($instance['config'])) {
      $config = $instance['config'];
      $configUrl =
        $configUrl .
        "&config=?" .
        urlencode(str_replace(" ", "&", str_replace('"', "", $config)));
    }
    ?>
    <div>
      <p>For configuration code please proceed to the <a href=<?php echo $configUrl; ?> target="_blank" rel="noopener">our website.</a></p>    
      <label for="<?php echo $this->get_field_id(
        'config'
      ); ?>">Configuration Code:</label>
      <input id="<?php echo $this->get_field_id(
        'config'
      ); ?>" name="<?php echo $this->get_field_name('config'); ?>" value="<?php echo esc_attr($config); ?>"/>
    </div><?php
  }

  // Apply settings to the widget instance.
  public function update($new_instance, $old_instance)
  {
    return $new_instance;
  }
}

class CoinStatsInsightWidget extends WP_Widget
{
  // Set up the widget name and description.
  public function __construct()
  {
    $widget_options = array(
      'classname' => 'coinstats-insight-widget',
      'description' =>
        'This widget shows aggregated statistics of portfolios and coins tracked by users using CoinStats app.'
    );
    parent::__construct(
      'coinstats-insight-widget',
      'Insights Widget',
      $widget_options
    );
  }
  // Create the widget output.
  public function widget($args, $instance)
  {
    ?>
    <coin-stats-insight-widget
      <?php
      $config = !empty($instance['config'])
        ? $instance['config']
        : 'type="howManyUsersHold" bg-color="#1C1B1B" text-color="#FFFFFF" chart-primary-color="#FFA959" chart-secondary-color="#E9BC48" button-color="#FFA959" border-color="rgba(255,255,255,0.15)" coin-id="bitcoin"';
      echo $config;
      echo 'disable-mutation-observer="true"';
      echo 'disable-credits="true"';
      ?>
    ></coin-stats-insight-widget>
    <script><?php echo include_once __DIR__ .
      '/js/insights-widget.min.js'; ?></script>
    <?php
  }

  // Create the admin area widget settings form.
  public function form($instance)
  {
    $config = '';
    $configUrl = 'https://coinstats.app/widget/insight?wordpress=true';

    if (!empty($instance['config'])) {
      $config = $instance['config'];
      $configUrl =
        $configUrl .
        "&config=?" .
        urlencode(str_replace(" ", "&", str_replace('"', "", $config)));
    }
    ?>
    <div>
      <p>For configuration code please proceed to the <a href=<?php echo $configUrl; ?> target="_blank" rel="noopener">our website.</a></p>
      <label for="<?php echo $this->get_field_id(
        'config'
      ); ?>">Configuration Code:</label>
      <input id="<?php echo $this->get_field_id(
        'config'
      ); ?>" name="<?php echo $this->get_field_name('config'); ?>" value="<?php echo esc_attr($config); ?>"/>
    </div><?php
  }

  // Apply settings to the widget instance.
  public function update($new_instance, $old_instance)
  {
    return $new_instance;
  }
}

class CoinStatsConverterWidget extends WP_Widget
{
  // Set up the widget name and description.
  public function __construct()
  {
    $widget_options = array(
      'classname' => 'coinstats-converter-widget',
      'description' => 'Allows to convert coins into different currencies.'
    );
    parent::__construct(
      'coinstats-converter-widget',
      'Converter Widget',
      $widget_options
    );
  }
  // Create the widget output.
  public function widget($args, $instance)
  {
    ?>
    <coin-stats-converter-widget
      <?php
      $config = !empty($instance['config'])
        ? $instance['config']
        : 'sell-coin-id="bitcoin" buy-coin-id="ethereum" locale="en" background="#1C1B1B" text-color="#FFFFFF" border-color="rgba(255,255,255,0.15)" rotate-button-color="rgba(255, 255, 255, 0.35)" type="large" width="400"';
      echo $config;
      echo 'disable-mutation-observer="true"';
      echo 'disable-credits="true"';
      ?>
    ></coin-stats-converter-widget>
    <script><?php echo include_once __DIR__ .
      '/js/coin-converter-widget.min.js'; ?></script>
    <?php
  }

  // Create the admin area widget settings form.
  public function form($instance)
  {
    $config = '';
    $configUrl = 'https://coinstats.app/widget/converter?wordpress=true';

    if (!empty($instance['config'])) {
      $config = $instance['config'];
      $configUrl =
        $configUrl .
        "&config=?" .
        urlencode(str_replace(" ", "&", str_replace('"', "", $config)));
    }
    ?>
    <div>
      <p>For configuration code please proceed to the <a href=<?php echo $configUrl; ?> target="_blank" rel="noopener">our website.</a></p>
      <label for="<?php echo $this->get_field_id(
        'config'
      ); ?>">Configuration Code:</label>
      <input id="<?php echo $this->get_field_id(
        'config'
      ); ?>" name="<?php echo $this->get_field_name('config'); ?>" value="<?php echo esc_attr($config); ?>"/>
    </div><?php
  }

  // Apply settings to the widget instance.
  public function update($new_instance, $old_instance)
  {
    return $new_instance;
  }
}

class CoinStatsCoinCalculatorWidget extends WP_Widget
{
  // Set up the widget name and description.
  public function __construct()
  {
    $widget_options = array(
      'classname' => 'coinststas-calculator-widget',
      'description' =>
        'With this widget can be calculated how much profit you can make.'
    );
    parent::__construct(
      'coinststas-calculator-widget',
      'Coin Calculator Widget',
      $widget_options
    );
  }
  // Create the widget output.
  public function widget($args, $instance)
  {
    ?>
    <coin-stats-calculator-widget
      <?php
      $config = !empty($instance['config'])
        ? $instance['config']
        : 'type="invest" locale="en" currency="USD" is-editable="true" text-color="#FFFFFF" selection-color="#FFA959" background="#1C1B1B" border-color="rgba(255,255,255,0.15)"';
      echo $config;
      echo 'disable-mutation-observer="true"';
      echo 'disable-credits="true"';
      ?>
    ></coin-stats-calculator-widget>
    <script><?php echo include_once __DIR__ .
      '/js/coin-calculator-widget.min.js'; ?></script>
    <?php
  }

  // Create the admin area widget settings form.
  public function form($instance)
  {
    $config = '';
    $configUrl = 'https://coinstats.app/widget/coin-calc?wordpress=true';

    if (!empty($instance['config'])) {
      $config = $instance['config'];
      $configUrl =
        $configUrl .
        "&config=?" .
        urlencode(str_replace(" ", "&", str_replace('"', "", $config)));
    }
    ?>
    <div>
      <p>For configuration code please proceed to the <a href=<?php echo $configUrl; ?> target="_blank" rel="noopener">our website.</a></p>
      <label for="<?php echo $this->get_field_id(
        'config'
      ); ?>">Configuration Code:</label>
      <input id="<?php echo $this->get_field_id(
        'config'
      ); ?>" name="<?php echo $this->get_field_name('config'); ?>" value="<?php echo esc_attr($config); ?>"/>
    </div><?php
  }

  // Apply settings to the widget instance.
  public function update($new_instance, $old_instance)
  {
    return $new_instance;
  }
}

class CoinStatsCoinPriceMarqueeWidget extends WP_Widget
{
  // Set up the widget name and description.
  public function __construct()
  {
    $widget_options = array(
      'classname' => 'coinstats-coin-price-marquee-widget',
      'description' =>
        'A widget that displays a list of top coin prices marquee.'
    );
    parent::__construct(
      'coinstats-coin-price-marquee-widget',
      'Coin Price Marquee Widget',
      $widget_options
    );
  }
  // Create the widget output.
  public function widget($args, $instance)
  {
    ?>
    <coin-stats-marquee-widget
    <?php
    $config = !empty($instance['config'])
      ? $instance['config']
      : 'locale="en" currency="USD" background="#1C1B1B" status-up-color="#74D492" status-down-color="#FE4747" text-color="#FFFFFF" buttons-color="#FFFFFF" border-color="rgba(255,255,255,0.15)" position="static" width="500px" coins-count="20"';
    echo $config;
    echo 'disable-mutation-observer="true"';
    echo 'disable-credits="true"';
    ?>
    ></coin-stats-marquee-widget>
    <script><?php echo include_once __DIR__ .
      '/js/coin-price-marquee-widget.min.js'; ?></script>
    <?php
  }

  // Create the admin area widget settings form.
  public function form($instance)
  {
    $config = '';
    $configUrl = 'https://coinstats.app/widget/price-marquee?wordpress=true';

    if (!empty($instance['config'])) {
      $config = $instance['config'];
      $configUrl =
        $configUrl .
        "&config=?" .
        urlencode(str_replace(" ", "&", str_replace('"', "", $config)));
    }
    ?>
    <div>
      <p>For configuration code please proceed to the <a href=<?php echo $configUrl; ?> target="_blank" rel="noopener">our website.</a></p>
      <label for="<?php echo $this->get_field_id(
        'config'
      ); ?>">Configuration Code:</label>
      <input id="<?php echo $this->get_field_id(
        'config'
      ); ?>" name="<?php echo $this->get_field_name('config'); ?>" value="<?php echo esc_attr($config); ?>"/>
    </div><?php
  }

  // Apply settings to the widget instance.
  public function update($new_instance, $old_instance)
  {
    return $new_instance;
  }
}

// Register the widgets.
function register_all_coinstats_widgets()
{
  register_widget('CoinStatsCoinPriceWidget');
  register_widget('CoinStatsCoinListWidget');
  register_widget('CoinStatsCoinChartWidget');
  register_widget('CoinStatsInsightWidget');
  register_widget('CoinStatsConverterWidget');
  register_widget('CoinStatsCoinCalculatorWidget');
  register_widget('CoinStatsCoinPriceMarqueeWidget');
}
add_action('widgets_init', 'register_all_coinstats_widgets');
?>
