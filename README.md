# Does the gender equity mismatch explain Korea's fertility collapse?

Code, data and figures for the paper *Does the gender equity mismatch explain Korea's
fertility collapse? Evidence from Korea and the OECD* (Isaac Saxonov, QSS 20, Dartmouth
College). The paper tests the gender equity mismatch hypothesis within Korea's
1980–2024 time series and across 30 OECD countries, then adds the share of births
outside marriage.

## Repository layout

```
code/      notebooks (run in numbered order) and utils.py
data/raw/        every raw input, written by 00_pull_data.ipynb
data/processed/  merged analysis tables, written by 01–03
output/          figures (png) and tables (csv) used in the paper
```

All data is small and included in the repo, so no external download link is needed.
Everything except two hand-entered Korean series comes from public APIs with no key.


## Notebooks

| Notebook | Takes in | Does | Outputs |
|---|---|---|---|
| [`code/00_pull_data.ipynb`](code/00_pull_data.ipynb) | Nothing (World Bank API, OECD SDMX API, OECD Family Database URL; two hand-entered Korean series typed into the notebook with their sources) | Pulls every raw dataset and saves each one unchanged | `data/raw/korea_worldbank.csv`, `korea_timeuse_kosis.csv`, `korea_parental_leave_moel.csv`, `oecd_worldbank_annual.csv`, `oecd_time_use.csv`, `oecd_births_outside_marriage.csv`, `SF_2_4_Share_births_outside_marriage.xlsx` |
| [`code/01_korea_timeseries.ipynb`](code/01_korea_timeseries.ipynb) | `data/raw/korea_*.csv` | Korea 1980–2024: left-joins the series on year, plots them, correlates TFR with each equity measure in levels and in year-to-year changes, scans lags, builds a within-Korea standardized mismatch score (paper Step 1, Fig. 1, Table 3) | `data/processed/korea_combined.csv`; `output/fig01_*.png`; `output/table_korea_correlations.csv` |
| [`code/02_oecd_mismatch.ipynb`](code/02_oecd_mismatch.ipynb) | `data/raw/oecd_worldbank_annual.csv`, `data/raw/oecd_time_use.csv` | Takes the latest value per country (capped at 2024), inner-joins World Bank and time-use data (38 → 30 countries), builds public parity, private parity and the mismatch, tests it by correlation, terciles, income control and dropping countries (paper Step 2, Table 2, Figs. 2–3) | `data/processed/oecd_mismatch.csv`; `output/fig02_*.png`; `output/table_oecd_sample.csv` |
| [`code/03_marriage_regression.ipynb`](code/03_marriage_regression.ipynb) | `data/processed/oecd_mismatch.csv`, `data/raw/oecd_births_outside_marriage.csv` | Inner-joins the share of births outside marriage (30 → 30), split-sample check, four OLS models with and without Korea, Cook's distance, actual vs predicted fertility (paper Step 3, Table 4, Fig. 4 and the residual plot) | `data/processed/oecd_mismatch_marriage.csv`; `output/fig03_*.png`; `output/table_regressions.csv` |

`code/utils.py` holds every function shared across notebooks: the World Bank, OECD
time use and OECD SF2.4 pulls, the parity/mismatch construction, period-change
helper, merge diagnostics, and the bar/scatter/spaghetti plot helpers. Each notebook
imports what it needs from there rather than redefining it.

## Data sources

| Measure | Source | Coverage |
|---|---|---|
| Total fertility rate | World Bank WDI `SP.DYN.TFRT.IN` | Korea 1980–2024; OECD latest ≤ 2024 |
| Female / male labour force participation | World Bank / ILO `SL.TLF.CACT.FE.ZS`, `SL.TLF.CACT.MA.ZS`, `SL.TLF.CACT.FM.ZS` | Korea 1990–2025; OECD latest ≤ 2024 |
| Female tertiary enrolment and F/M parity index | World Bank / UNESCO `SE.TER.ENRR.FE`, `SE.ENR.TERT.FM.ZS` | Korea 2000–2024; OECD latest 2019–2024 |
| Female mean age at first marriage | World Bank `SP.DYN.SMAM.FE` | Korea, every five years to 2015 |
| GDP per capita, PPP, constant $ | World Bank `NY.GDP.PCAP.PP.KD` | OECD latest ≤ 2024 |
| Men's and women's unpaid work, minutes/day | OECD Time Use Database (`OECD.WISE.INE`, `DSD_TIME_USE`, measure `UPW`) | 30 OECD members, one survey each (year not returned by the API) |
| Men's and women's unpaid work, Korea | Statistics Korea Time Use Survey via KOSIS and press releases (hand entered) | 1999–2024, every five years |
| Parental leave recipients by sex, Korea | Ministry of Employment and Labor press release, Feb 2025 (hand entered) | 2010–2024 |
| Share of births outside marriage | OECD Family Database table SF2.4 | Latest, mostly 2023 |

