# Does the gender equity mismatch explain Korea's fertility collapse?

Code, data and figures for *Does the gender equity mismatch explain Korea's fertility
collapse? Evidence from Korea and the OECD* (Isaac Saxonov, QSS 20, Dartmouth College).

Korea's total fertility rate fell to 0.72 in 2023, the lowest ever recorded for a country.
The most cited explanation is the gender equity mismatch: women gained near equal access
to education and jobs while housework and childcare stayed traditional, and the gap
between the two spheres is what suppresses fertility. This project puts that explanation
to the test in three steps.

1. **Korea's own history, 1980–2024.** Fertility, women's labor force participation,
   tertiary enrollment, men's share of unpaid work and fathers' share of parental leave
   all trend steadily over the same decades. Correlating levels gives near-perfect
   relationships; correlating year-to-year changes gives nothing. A single country's
   time series cannot tell the mismatch apart from any other explanation.
2. **Thirty OECD countries.** An absolute mismatch index, built from public-sphere
   parity (labor force and tertiary enrollment) minus private-sphere parity (men's share
   of unpaid work), relates to fertility in the predicted direction but weakly
   (r = −0.25), and half of that comes from Korea alone.
3. **How marriage comes into play.** The share of births outside marriage predicts fertility far
   better than the mismatch. Once it enters the regression the mismatch coefficient drops
   to zero, and the interaction the theory predicts is estimated at exactly zero. Even
   then, Korea sits 0.36 births below what the model predicts.

## Repository layout

```
code/            notebooks (run in numbered order) and utils.py
data/raw/        every raw input, written by 00_pull_data.ipynb
data/processed/  merged analysis tables, written by 01–03
output/          figures (png) and tables (csv) used in the paper
transcripts/     Claude sessions used for the analysis and website
```

All data is small and included in the repo, so no external download link is needed.
Everything except two hand-entered Korean series comes from public APIs with no key.
To reproduce the project from scratch, run the four notebooks in order.

## Notebooks

| Notebook | Takes in | Does | Outputs |
|---|---|---|---|
| [`00_pull_data.ipynb`](code/00_pull_data.ipynb) | World Bank API<br>OECD SDMX API<br>OECD Family Database SF2.4<br>Two hand-entered Korean series (KOSIS, MOEL), typed into the notebook with sources | Pulls every raw dataset the project uses and saves each one unchanged to `data/raw/`. No analysis happens here. Korea gets one row per year 1980–2025; the OECD panel is long format (country × indicator × year) for all 38 members; time use is one survey per member; births outside marriage keeps the latest non-missing year per country, with the original workbook saved alongside. Prints coverage diagnostics for every pull. | `data/raw/korea_worldbank.csv`<br>`korea_timeuse_kosis.csv`<br>`korea_parental_leave_moel.csv`<br>`oecd_worldbank_annual.csv`<br>`oecd_time_use.csv`<br>`oecd_births_outside_marriage.csv`<br>`SF_2_4_Share_births_outside_marriage.xlsx` |
| [`01_korea_timeseries.ipynb`](code/01_korea_timeseries.ipynb) | `data/raw/korea_worldbank.csv`<br>`korea_timeuse_kosis.csv`<br>`korea_parental_leave_moel.csv` | Korea alone, 1980–2024 (paper Step 1). Computes men's share of unpaid work and fathers' share of leave takers from the raw counts, then left-joins both onto the World Bank table on year, with row counts printed before and after each merge. Plots the raw series and the same series as z-scores. Correlates TFR with each equity measure in levels and in year-to-year changes (five-year changes for the time use survey), scans lags of 0–4 years for the two annual public-sphere series, and builds a standardized within-Korea mismatch score. Produces Fig. 1 and Table 3. | `data/processed/korea_combined.csv`<br>`output/fig01_korea_raw_series.png`<br>`output/fig01_korea_zscores.png`<br>`output/fig01_korea_composite_mismatch.png`<br>`output/table_korea_correlations.csv` |
| [`02_oecd_mismatch.ipynb`](code/02_oecd_mismatch.ipynb) | `data/raw/oecd_worldbank_annual.csv`<br>`data/raw/oecd_time_use.csv` | The cross-country test (paper Step 2). Collapses the annual panel to each country's latest value at or before 2024, then inner-joins with the time use table on ISO3 code (38 → 30 countries; the eight dropped are named). Builds public parity (mean of the F/M labor force and tertiary ratios), private parity (men's unpaid share ÷ 50) and the mismatch (public − private). Tests the mismatch against TFR by correlation, by terciles, after removing log GDP per capita from both variables, and after dropping Korea, Mexico and Türkiye. Also draws bar charts of each component and OECD-wide time plots with Korea highlighted. Produces Table 2 and Figs. 2–3. | `data/processed/oecd_mismatch.csv`<br>`output/fig02_oecd_components_bars.png`<br>`output/fig02_oecd_series_over_time.png`<br>`output/fig02_oecd_tfr_indexed_2000.png`<br>`output/fig02_oecd_components_vs_tfr.png`<br>`output/fig02_oecd_mismatch_vs_tfr.png`<br>`output/table_oecd_sample.csv` |
| [`03_marriage_regression.ipynb`](code/03_marriage_regression.ipynb) | `data/processed/oecd_mismatch.csv`<br>`data/raw/oecd_births_outside_marriage.csv` | Where marriage comes in (paper Step 3). Inner-joins the latest share of births outside marriage onto the 30-country table on ISO3 code (30 → 30). Checks the new variable on its own, splits the sample at its median and compares the mismatch correlation in each half, then fits four OLS models that add one term each: mismatch; + births outside marriage; + their interaction (both mean-centered); + log GDP per capita. Reruns the models without Korea, reports Cook's distance to find influential countries, and plots actual against predicted TFR. Produces Table 4 and Fig. 4; the actual-vs-predicted plot is an extra output not in the paper. | `data/processed/oecd_mismatch_marriage.csv`<br>`output/fig03_births_outside_marriage.png`<br>`output/fig03_actual_vs_predicted.png`<br>`output/table_regressions.csv` |

`code/utils.py` holds every function shared across notebooks: the World Bank, OECD
time use and OECD SF2.4 pulls, the parity/mismatch construction, period-change
helper, merge diagnostics, and the bar/scatter/spaghetti plot helpers. Each notebook
imports what it needs from there rather than redefining it.

## Data sources

| Measure | Source | Coverage |
|---|---|---|
| Total fertility rate | World Bank WDI `SP.DYN.TFRT.IN` | Korea 1980–2024; OECD latest ≤ 2024 |
| Female / male labor force participation | World Bank / ILO `SL.TLF.CACT.FE.ZS`, `SL.TLF.CACT.MA.ZS`, `SL.TLF.CACT.FM.ZS` | Korea 1990–2025; OECD latest ≤ 2024 |
| Female tertiary enrollment and F/M parity index | World Bank / UNESCO `SE.TER.ENRR.FE`, `SE.ENR.TERT.FM.ZS` | Korea 2000–2024; OECD latest 2019–2024 |
| Female mean age at first marriage | World Bank `SP.DYN.SMAM.FE` | Korea, every five years to 2015 |
| GDP per capita, PPP, constant $ | World Bank `NY.GDP.PCAP.PP.KD` | OECD latest ≤ 2024 |
| Men's and women's unpaid work, minutes/day | OECD Time Use Database (`OECD.WISE.INE`, `DSD_TIME_USE`, measure `UPW`) | 30 OECD members, one survey each (year not returned by the API) |
| Men's and women's unpaid work, Korea | Statistics Korea Time Use Survey via KOSIS and press releases (hand entered) | 1999–2024, every five years |
| Parental leave recipients by sex, Korea | Ministry of Employment and Labor press release, Feb 2025 (hand entered) | 2010–2024 |
| Share of births outside marriage | OECD Family Database table SF2.4 | Latest, mostly 2023; Ireland 2019, Belgium 2018, Denmark 2021 |