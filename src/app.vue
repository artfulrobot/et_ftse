<template>
      <div class="et_ftse-container">
        <form>
          <div>
            <label for="et_ftse-company">Company</label>
            <v-select id="et_ftse-company" name="company"
              v-model="selectedCompany"
              :options="companyNames"
              ></v-select>
          </div>
        </form>

        <div><!-- report -->
          <div class="et_ftse-row et_ftse-union-living" >
						<div class="et_ftse__company-name" ><h2>{{selectedCompany}}</h2></div>
						<div class="et_ftse__company-icons" >
							<div class="et_ftse-union">
								<span v-if="selectedCompanyData && selectedCompanyData.union" class="good">✔ Recognises unions</span>
								<span v-else-if="selectedCompanyData && !selectedCompanyData.union" class="bad">✖ No evidence of union recognition</span>
								<span v-else class="meh">? Union recognition</span>
							</div>
							<div class="et_ftse-livingwage">
								<span v-if="selectedCompanyData && selectedCompanyData.livingWage" class="good">✔ Living Wage employer</span>
								<span v-else-if="selectedCompanyData && !selectedCompanyData.livingWage" class="bad">✖ Not a Living Wage employer</span>
								<span v-else class="meh">? Living Wage employer</span>
							</div>
						</div>
					</div>

          <div class="et_ftse-row">
            <div class="et_ftse-ceo-chart" ref="ceochart">
              <svg id="salaries-chart" :width="chartWidth" :height="chartHeight" >

                <rect x=0 y=0 :width="chartWidth" :height="chartHeight"
                  class="salaries-chart__border" style="stroke:none;fill:none;"
                />

                <!--- axis ticks -->
                <g :transform="'translate(' + chartBarX + ', 20)'" >
                  <g v-for="tick in chartData.xTicks" class="et_ftse-axis-ticks" >
                    <path v-if="tick.path" :d="tick.path" />
                    <text
                      text-anchor="middle"
                      dy="-8"
                      :x="tick.x"
                      >{{tick.text}}</text>
                  </g>
                </g>

                <!--- bars -->
                <g v-for="(row, i) in chartData.bars"
                  :key="row.name"
                  :transform="'translate(0, ' + (i*(barYOffset + barHeight + barSpacing) + 30) + ')'"
                >
                  <text
                    :text-anchor="chartTextAnchor"
                    dominant-baseline="middle"
                    :x="chartTextX"
                    :dy="barHeight/2" style="fill:black;" >{{row.name}}</text>

                  <rect
                    v-if="row.width"
                    :x="chartBarX"
                    :y="barYOffset"
                    :width="row.width"
                    :fill="row.fill"
                    :height="barHeight"
                    />

                  <text
                    v-if="row.width"
                    :y="barYOffset"
                    :x="chartBarX + row.width + 8"
                    :dy="barHeight/2"
                    dominant-baseline="middle"
                    class="salary-text"
                    >£{{ Math.floor(row.hourly * 7 * 260).toLocaleString() }}/year</text>
                </g>
              </svg>
            </div>
            <div class="et_ftse-ceo-clock" ref="ceoclock">
              <div class="et_ftse-ceo-clock__clock-container">
                <svg id="salaries-clock" :width="clockSize" :height="clockSize" >
                  <circle :cy="clockSize/2" :cx="clockSize/2" :r="clockSize/2 -2" />
                  <line
                    :transform="clockData.hourHand"
                    :x2="-clockSize/5"
                    x1=0 y1=0 y2=0
                    style="stroke:#009ec6;stroke-width:8px;stroke-linecap:round;stroke-linejoin:miter"
                    />
                  <line
                    :transform="clockData.minHand"
                    :y2="-clockSize*2/6"
                    x1=0 y1=0 x2=0
                    style="stroke:#009ec6;stroke-width:8px;stroke-linecap:round;stroke-linejoin:miter"
                    />
                </svg>
              </div>
              <div class="et_ftse-ceo-clock__text-container" v-show="selectedCompany">
                By {{bonusClockTime}}
                <strong>each day</strong> the CEO has been paid the same as
                <span v-html="hoursToYearsUnit" ></span>.
              </div>
              <div class="et_ftse-ceo-clock__ratio-text"
                v-if="selectedCompanyData && selectedCompanyData.ratioToMedianFormatted">
                There is a <span>1:{{selectedCompanyData.ratioToMedianFormatted}}</span> ratio within the company of median employee pay:CEO pay.
              </div>
            </div>
          </div><!-- /.et_ftse-row for CEO chart -->

          <div class="et_ftse-row et_ftse__gpg-row" >
						<div class="et_ftse__gpg-main">
							<h3>Gender pay gap <span v-if="selectedCompanyData">at <span v-if="(selectedCompanyData.gpg.length + selectedCompanyData.gpgMen.length) > 1">subsidiaries owned by</span> {{selectedCompany}}</span></h3>
              <div v-if="selectedCompany">

                <div v-if="selectedCompanyData.gpg.length>0">
                   <p>The chart shows the date in the year where a
                   <strong>woman</strong> effectively begins working without
                   pay. The red at the right of the bar represents the amount
                   of the year that a woman is effectively working for free as
                   compared with a male colleague.</p>
                  <pay-gap-chart
                    v-if="selectedCompanyData.gpg.length > 0"
                    :gpg-rows="selectedCompanyData.gpg"
                    :chart-anim-fraction="chartAnimFraction"
                    :is-mobile="isMobile || selectedCompanyData.longSubsidiaryNames"
                    />
                </div>

                <div v-if="selectedCompanyData.gpgMen.length>0">
                   <p>The chart shows the date in the year where a
                   <strong>man</strong> effectively begins working without
                   pay. The red at the right of the bar represents the amount
                   of the year that a man is effectively working for free as
                   compared with a female colleague. </p>
                  <pay-gap-chart
                    v-if="selectedCompany && selectedCompanyData.gpgMen.length > 0"
                    :gpg-rows="selectedCompanyData.gpgMen"
                    :chart-anim-fraction="chartAnimFraction"
                    :is-mobile="isMobile || selectedCompanyData.longSubsidiaryNames"
                    />
                </div>

                <div v-if="(selectedCompanyData.gpg.length + selectedCompanyData.gpgMen.length) == 0">
                  <p>Sorry, we don't have any gender pay gap data for {{selectedCompany}}.</p>
                </div>
              </div>
						</div>
						<div class="et_ftse__gpg-bonus"
              v-if="!selectedCompany || (selectedCompany && selectedCompanyData.worstBonusGap)"
            >
							<svg :width="gpgBonusRadius*2" :height="gpgBonusRadius*2"
								xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
								>
								<clipPath id="et_ftse__bonusPie-clip">
									<path :d="chartData.bonusPie" fill="red" />
								</clipPath>
								<circle
										:cx="gpgBonusRadius"
										:cy="gpgBonusRadius"
										:r="gpgBonusRadius - 2"
										fill="white"
										/>
								<g :transform="'translate(' + gpgBonusRadius + ' ' + gpgBonusRadius + '), rotate(-90)'" clip-path="url(#et_ftse__bonusPie-clip)">
									<image href="${srcPath}/pound.png" :width="gpgBonusRadius*2" :height="gpgBonusRadius*2"
										:x="-gpgBonusRadius"
										:y="-gpgBonusRadius"
									/>
								</g>
							</svg>
							<p v-if="selectedCompanyData && selectedCompanyData.worstBonusGap" >Women's average bonus at <strong>{{selectedCompanyData.worstBonusGap.Company}}</strong> (a subsidiary of <strong>{{selectedCompany}}</strong>)
							is {{selectedCompanyData.worstBonusGap.meanBonus}}% less than men's.</p>
						</div>

          </div><!-- /gpg data -->
        </div><!-- /report -->
      </div><!-- /et_ftse-container -->
</template>

<script>
import companyData from './companies.csv';
import gpgData from './gpg.csv';
import 'vue-select/dist/vue-select.css';
import vSelect from 'vue-select';
import PayGapChart from './PayGapChart.vue';

export default {
  components: {PayGapChart, vSelect},
  props: { srcPath: String },
  data() {
    return {
      // The order of these is important (index 0 referred to in code for min wage)
      national: [
        { name: 'Minimum wage', hourly: 8.21 },        // 14942÷52÷35
        { name: 'Lower Quartile wage', hourly: 8.51 }, // 15480÷52÷35
        { name: 'Median wage', hourly: 13.68 },        // 24897÷52÷35
        { name: 'Mean wage', hourly: 16.83 },          // 30629÷52÷35
        { name: 'Upper Quartile wage', hourly: 20.72 },// 37715÷52÷35
      ],
      companyData: this.parseData(companyData, gpgData),
      selectedCompany: null,
      selectedCompanyData: null,
      chartPadding: 12,
      chartWidth: 600,
      chartHeight: 340,
      barMaxWidth: 250,
      chartBarX: 200,
      chartTextX: 16,
      chartTextAnchor: 'start',
      chartTextWidth: 200,
      barHeight: 30,
      barYOffset: 0,
      barSpacing: 4,

      chartAnimStart: 0,
      chartAnimFraction: 0,

      clockSize: 150,
      hoursToYears: 0,
      hoursToYearsUnit: 'someone on minimum wage',
      minsRotationMax: 0,

      colours: {
        grey: '#46444e',
        blue: '#009ec6',
        green: '#00945',
        red: '#b70000',
      },

      availableWidth: 600,

      gpgBonusRadius: 100,
    };
  },
  computed: {
    isMobile() {
      return (this.availableWidth < 768) ? 1 : 0;
    },
    bonusClockTime() {
      var hours = 9 + Math.floor(this.hoursToYears),
        mins  = (Math.ceil(this.hoursToYears*60) % 60),
        ampm  = 'am';
      if (hours >= 12) {
        ampm = 'pm';
      }
      if (hours > 12) {
        hours -= 12;
      }
      if (mins < 10) {
        mins = '0' + mins.toString();
      }
      return hours + ':' + mins + ' ' + ampm;
    },
    companyNames() {
      var a = Object.keys(this.companyData);
      a.sort();
      return a;
    },
    chartData() {

      const {grey, blue, red} = this.colours;
      var d = [];
      var max = 0;
      if (this.selectedCompany) {

        var ceoPay = this.selectedCompanyData.hourlyCEOPay * Math.pow(this.chartAnimFraction,5);

        d.push({
          name: 'CEO pay',
          hourly: ceoPay,
          fill: '#caa256'
        });

        if (this.selectedCompanyData.ratioToMedian) {
          d.push({
            name: 'Average employee pay',
            hourly: ceoPay / this.selectedCompanyData.ratioToMedian,
            fill: blue
          });
        }
      }
      else {
        d.push({
          name: '(Select a company)',
          hourly: 0,
          fill: 'none'
        });
      }
      for (var row of this.national) {
        d.push({name: row.name, hourly: row.hourly, fill: (row.name === 'Median wage' ? blue : grey)});
      }

      var max=Math.max(... d.map(r => r.hourly * 7 * 260));
      var scale = this.barMaxWidth/max;
      for (row of d) {
        row.width = scale * row.hourly * 7 * 260;
      }

      // Create ticks.
      var amountPerTick = 5000;
      while (max/amountPerTick > 5) {
        amountPerTick *=2;
      }
      const xTicks = [];
      for (var i=0; i<=Math.ceil(max/amountPerTick); i++) {
        xTicks.push({
          text: (i*amountPerTick).toLocaleString(),
          x: i*amountPerTick*scale,
          path: 'M ' + (i*amountPerTick*scale) + ',-6 l0,6 l' + (amountPerTick*scale) + ',0 l0,-6'
        });
      }
      if (i>0) {
        xTicks[i-1].path = null;
      }

      var bonusPie = '';
      var bonusGap = 0.00001;

      // GPG Bonus data.
      if (this.selectedCompanyData && this.selectedCompanyData.worstBonusGap) {
        bonusGap = this.chartAnimFraction*this.chartAnimFraction * this.selectedCompanyData.worstBonusGap.meanBonus/100;
      }
      const r = this.gpgBonusRadius;
      const largeArcFlag = (bonusGap > 0.5) ? 0 : 1;
      const x1 = r*Math.cos(2*Math.PI * bonusGap/2);
      const y1 = r*Math.sin(2*Math.PI * bonusGap/2);
      const x2 = r*Math.cos(-2*Math.PI * bonusGap/2);
      const y2 = r*Math.sin(-2*Math.PI * bonusGap/2);
      bonusPie = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} L 0 0`;

      return {bars: d, xTicks, scale, bonusPie};
    },
    clockData() {
      // calculate minutes and hours.
      const tr = 'translate(' + (this.clockSize/2) + ',' + (this.clockSize/2) + ')';
      return {
        hourHand: tr + ', rotate(' + (this.hoursToYears * this.chartAnimFraction/12*360) + ')',
        minHand: tr + ', rotate('
        + (this.chartAnimFraction * this.minsRotationMax*360)
        + ')'
      };
    }
  },
  created() {
    this.recalculateNewCompany(this.selectedCompany);
  },
  watch: {
    selectedCompany(newVal, oldVal) {
      this.recalculateNewCompany(newVal);
    }
  },
  mounted() {
    this.recalculateAvailableWidth();
    window.addEventListener('resize', e => this.recalculateAvailableWidth());
  },
  methods: {
    recalculateAvailableWidth() {

      this.availableWidth = this.$el.offsetWidth;

      this.chartWidth = this.$refs.ceochart.offsetWidth - 32;
      const salaryTextWidthAllowance = 80;

      if (this.chartWidth < 500 ) {
        this.chartBarX = this.chartPadding;
        this.chartTextX = this.chartPadding;
        this.chartTextAnchor = 'start';
        this.barMaxWidth = this.chartWidth - this.chartPadding*2 - salaryTextWidthAllowance;
        this.barYOffset = 20;
        this.barHeight = 20;
      }
      else {
        this.chartTextAnchor = 'end';
        this.chartTextX = this.chartTextWidth -8;
        this.chartBarX = this.chartTextWidth;
        this.barMaxWidth = this.chartWidth - this.chartPadding*2 - this.chartTextWidth - salaryTextWidthAllowance;
        this.barYOffset = 0;
        this.barHeight = 30;
      }

    },

    parseData(companyData, gpgData) {
      var d = {};
      var row, mainCo;

      for (row of companyData) {
        if (row.company) {
          if ((typeof row.hourly) === 'string') {
            row.hourly = parseFloat(row.hourly.replace(',',''));
          }
          const rtcmType = typeof row['ratio to company median'];

          //console.log({row, typeof: typeof row['ratio to company median']});

          d[row.company] = {
            hourlyCEOPay: row.annual / 260 / 7,
            ratioToMedian: rtcmType === 'number' ? row['ratio to company median'] : null,
            ratioToMedianFormatted: rtcmType === 'number' ? Math.round(row['ratio to company median']*10)/10 : null,
            union: row.union ? true : false,
            livingWage: (row.livingwage === 'Y') ? true : false,
            gpg: [],
            gpgMen: [],
            longSubsidiaryNames: false,
            worstBonusGap: null,
          };
        }
      }
      for (row of gpgData) {

        if (row.meanSalary === null) {
          // Ignore this row, there's no data.
          continue;
        }
        if (row['Parent Company'] && d[row['Parent Company']]) {
          // Found match.
          mainCo = d[row['Parent Company']];

          // Tidy up case on subco
          if (typeof row.Company === 'string') {
            row.Company = row.Company.replace(/\w\w\w\w+/g, name => (name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase())).replace("'S" , "'s");
            mainCo.longSubsidiaryNames |= row.Company.length > 20;
          }

          if (row.meanSalary >= 0) {
            // Women are less well paid (or equally)
            mainCo.gpg.push({
              subCo: row.Company,
              gpgSalary: row.meanSalary,
              gpgSalaryFormatted: row.meanSalary ? Math.round(row.meanSalary*10)/10 : ''
            });
          }
          else if (row.meanSalary < 0) {
            // Men less well paid
            mainCo.gpgMen.push({
              subCo: row.Company,
              gpgSalary: row.meanSalary,
              gpgSalaryFormatted: row.meanSalary ? Math.round(-row.meanSalary*10)/10 : ''
            });
          }
          if (row.meanBonus > 0) {
            if (mainCo.worstBonusGap === null || mainCo.worstBonusGap.meanBonus < row.meanBonus) {
              mainCo.worstBonusGap = row;
            }
          }
        }
        else {
          console.log("Error parsing gpg data row, likely Parent Company not matching: ", row);
        }
      }


      return d;
    },
    percentToXY(percent) {
      return [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];
    },
    recalculateNewCompany(newVal) {

      this.selectedCompanyAnim = null;
      this.chartAnimStart = null;
      console.log({selectedCompany: this.selectedCompany, data: this.companyData[this.selectedCompany]});

      if (this.selectedCompany) {

        // Figure out hours before they have earnt the minimum wage.
        this.selectedCompanyData = this.companyData[this.selectedCompany];
        var cfRate = this.national[0].hourly;
        this.hoursToYears = cfRate * 7 * 261/12 / this.selectedCompanyData.hourlyCEOPay;
        this.hoursToYearsUnit = 'someone on minimum wage earns in a <strong>month</strong>';
        this.minsRotationMax = (this.hoursToYears * 60 % 60)/60;
        if (this.hoursToYears <= 5) {
          this.minsRotationMax = (this.hoursToYears * 60)/60;
        }
        else {
          // More than 5 hours, don't animate the minute hand round more than 5 times.
          this.minsRotationMax = (this.hoursToYears * 60 % 60)/60 + 5;
        }

        // Begin animation
        requestAnimationFrame(this.chartAnimFrame.bind(this));
      }
      else {
        this.hoursToYears = 0;
        this.selectedCompanyData = null;
      }
    },
    chartAnimFrame(t) {
      if (!this.chartAnimStart) {
        this.chartAnimStart = t;
      }
      this.chartAnimFraction = (t - this.chartAnimStart)/4000; // 2s animation duration

      if (this.chartAnimFraction<1) {
        requestAnimationFrame(this.chartAnimFrame.bind(this));
      }
      else {
        this.chartAnimFraction = 1;
      }
    }
  },
};

</script>
