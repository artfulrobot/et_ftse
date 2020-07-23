# FTSE 100 interactive stats

## Building

Run `npm run watch` or `npm run build`

## Data

The data is pulled from two csv files, `companies.csv` and `gpg.csv`.

### Companies CSV

The top line column headers should be: company,hourly,union,livingwage

- `company` should be the company name
- `annual` should be the annual pay of the CEO in GBP. It is then assumed
  that their hourly pay is `annual ÷ 260 ÷ 7`. **This should NOT
  have a curency symbol**
- `ratio to company median` if present and numeric this is the ratio of CEO pay
  to the median employee at that company.
- `union` string of recognised union names, e.g. "Unite, BFAWU". It is not
  parsed.
- `livingwage` string Y or N

### Gender Pay Gap CSV

The headers should be: Parent Company,Company,meanSalary,meanBonus

- `Parent Company` This *must* match a row in the companies.csv's
  `company` field. If it does not, an error is emitted in the browser
  console on page load to highlight this fact.

- `Company` This is the sub-company whose data is presented. The name is
  cleaned up a bit in terms of capitalisation but it's a fairly crude
  algorithm, it would be better if it could be cleaned up manually.
- `meanSalary`

   The percentage less (-more) that women are paid compared to men. So 20 would
   mean a woman is paid £80 when a man is paid £100.

   ```
   r[women] = (1 - w/m) × 100
   ```

   If this is missing the row is not imported.

   For cases when this is negative (i.e. men paid less) the ratio is inverted
   using this formula:

   ```
   r[men] = -r[women] × 100 / (100-r[women])
   ```

   Which gives us the equivalent expression, i.e.

   ```
   r[men] = (1 - m/w) × 100
   ```

- `meanBonus` Is the same sort of data as `meanSalary`

### Hard-coded values

The national wages are hard coded as follows:

```
  { name: 'Minimum wage', hourly: 7.83 },        // 14250/52/12
  { name: 'Lower Quartile wage', hourly: 8.51 }, // 15480÷52÷35
  { name: 'Median wage', hourly: 13.68 },        // 24897÷52÷35
  { name: 'Mean wage', hourly: 16.83 },          // 30629÷52÷35
  { name: 'Upper Quartile wage', hourly: 20.72 },// 37715÷52÷35
```

## Presentation

The date in the year that one gender ceases to get paid compared with the other
is calculated as: `r × 365 ÷ 100` days before `31 December`.

The worse `meanBonus` is selected.


