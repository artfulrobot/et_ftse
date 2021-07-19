<template>
  <svg class="et_ftse-gpg-chart"
      :width="$parent.chartWidth"
    v-if="gpgRows"
      :height="gpgRows.length * (gpgBarHeight + $parent.barSpacing + isMobile*gpgTextHeight)" >
      <g
    v-for="(company, i) in gpgRows"
      :key="company.subCo"
      :transform="'translate(0, ' + (($parent.barSpacing + (gpgBarHeight + isMobile*gpgTextHeight)) * i) + ')'"
      >

      <!-- company name -->
      <text
    dy="14"
    x="0"
    y="0"
      ><tspan fill="#b70000">{{company.gpgSalaryFormatted}}% </tspan>
    {{company.subCo}}</text>

      <!-- background bar -->
      <rect
      :x="gpgTextWidth * (1-isMobile)"
      :y="gpgTextHeight*isMobile"
      :width="gpgBarWidth"
      :height="gpgBarHeight"
    fill="white"
    stroke="none"
      />
      <!-- month dividers -->
      <path :d="gpgBarMonthDividers" class="et_ftse-gpg-month-lines" />
      <!-- coloured data bar -->
      <rect
      :x="gpgTextWidth * (1-isMobile) + gpg[i].x"
      :y="gpgTextHeight*isMobile"
      :width="gpgBarWidth - gpg[i].x"
      :height="gpgBarHeight"
    fill="#b70000"
    stroke="none"
      />
      <text
    text-anchor="end"
      :x="gpgTextWidth * (1-isMobile) + gpg[i].x - 8"
      :y="gpgTextHeight*isMobile"
    class="et_ftse__gpg-date"
    dy="14"
      >{{ gpg[i].date }}</text>
      <!-- outline on top -->
      <rect
      :x="gpgTextWidth * (1-isMobile) + 0.5"
      :y="gpgTextHeight*isMobile + 0.5"
      :width="gpgBarWidth"
      :height="gpgBarHeight"
    fill="none"
    stroke-width="1"
    opacity="0.2"
    stroke="black"
      />
      </g>
      </svg>
</template>
<script>

export default {
  data() {
    return {
      gpgBarHeight: 18,
      gpgTextHeight: 18,
      gpgTextWidth: 300,
    };
  },
  props: ['chartAnimFraction', 'gpgRows', 'isMobile'],
  computed: {
    gpgBarMonthDividers() {
      var top, d = '', left;
      if (this.isMobile) {
        top = this.gpgTextHeight;
        d = `M0,${top}`;
        left = 0.5;
      }
      else {
        top = 0;
        left = (this.gpgTextWidth + 0.5);
      }

      var dayOfYear = 0;
      var daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      for (var i=0; i<11; i++) {
        dayOfYear += daysInMonths[i];
        d += `M${Math.floor(dayOfYear/365*this.gpgBarWidth) + left},${this.gpgBarHeight+top} l0,-5m0,${-this.gpgBarHeight+10} l0,-5`;
      }
      return d;
    },
    gpgBarWidth() {
      if (this.isMobile) {
        return this.$parent.chartWidth;
      }
      else {
        return this.$parent.chartWidth - this.gpgTextWidth;
      }
    },
    gpg() {
      if (!this.gpgRows) return [];
      const gpg = [];
      var currentPayGap;
      var i = 0;
      for (var row of this.gpgRows) {
        var imbalance = this.gpgRows[i].gpgSalary;
        if (imbalance < 0) {
          // Men. We have: r = (1 - w/m) * 100
          // We need       R = (1 - m/w) * 100
          // w/m = 1-r
          // m/w = 1/(1-r)
          // 1- m/w = 1 - (1/(1-r))
          //        = -r / (1-r)
          // So if r = 20 (women paid 20% less than men, e.g. women: 80, men: 100)
          //       R = -0.2/0.8 = -25% (men paid 25% more, e.g. 80 * 1.25 = 100)
          imbalance = 100 * (- imbalance / (100 - imbalance));
        }

        currentPayGap = this.chartAnimFraction*this.chartAnimFraction*imbalance/100;
        var noPayDay = new Date((new Date('2019-12-31')).setDate(31 - 365*currentPayGap));
        // Calculate date.
        gpg.push({
          x: (1 - currentPayGap) * (this.gpgBarWidth),
          date: noPayDay.getDate() + ' ' +
          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][noPayDay.getMonth()]
        });
        i++;
      }
      return gpg;
    },
  }
};
</script>
