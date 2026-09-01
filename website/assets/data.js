// Data behind every figure on this page.
// Fertility, labor force and enrollment series: World Bank API (WDI).
// Men's unpaid work: Statistics Korea Time Use Survey via KOSIS; OECD Time Use Database.
// Fathers' share of leave takers: Korea Ministry of Employment and Labor.
// Births outside marriage: OECD Family Database, table SF2.4.

export const koreaTfr = [
  [1980, 2.82], [1981, 2.57], [1982, 2.39], [1983, 2.06], [1984, 1.74],
  [1985, 1.66], [1986, 1.58], [1987, 1.53], [1988, 1.55], [1989, 1.56],
  [1990, 1.57], [1991, 1.71], [1992, 1.76], [1993, 1.654], [1994, 1.656],
  [1995, 1.634], [1996, 1.574], [1997, 1.537], [1998, 1.464], [1999, 1.425],
  [2000, 1.48], [2001, 1.309], [2002, 1.178], [2003, 1.191], [2004, 1.164],
  [2005, 1.085], [2006, 1.132], [2007, 1.259], [2008, 1.192], [2009, 1.149],
  [2010, 1.226], [2011, 1.244], [2012, 1.297], [2013, 1.187], [2014, 1.205],
  [2015, 1.239], [2016, 1.172], [2017, 1.052], [2018, 0.977], [2019, 0.918],
  [2020, 0.837], [2021, 0.808], [2022, 0.778], [2023, 0.721], [2024, 0.748]
];

export const koreaFemaleLfp = [
  [1990, 47.2], [1991, 47.2], [1992, 47.2], [1993, 47.2], [1994, 47.9],
  [1995, 48.4], [1996, 48.9], [1997, 49.8], [1998, 47.1], [1999, 47.7],
  [2000, 49.4], [2001, 50.0], [2002, 50.4], [2003, 49.5], [2004, 50.6],
  [2005, 50.7], [2006, 50.8], [2007, 50.6], [2008, 50.4], [2009, 49.6],
  [2010, 49.8], [2011, 50.0], [2012, 50.3], [2013, 50.8], [2014, 51.8],
  [2015, 52.4], [2016, 52.6], [2017, 53.1], [2018, 53.2], [2019, 53.8],
  [2020, 53.1], [2021, 53.6], [2022, 55.0], [2023, 56.0], [2024, 56.8]
];

export const koreaFemaleTertiary = [
  [2000, 54.8], [2001, 57.5], [2002, 60.8], [2003, 64.1], [2004, 69.0],
  [2005, 74.1], [2006, 78.9], [2007, 82.7], [2008, 84.2], [2009, 84.7],
  [2010, 85.2], [2011, 85.3], [2012, 83.9], [2013, 82.8], [2014, 81.7],
  [2015, 81.9], [2016, 82.1], [2017, 82.7], [2018, 83.1], [2019, 84.6],
  [2020, 87.7], [2021, 91.6], [2022, 94.5], [2023, 99.2], [2024, 105.2]
];

// Men's share of unpaid work, married people living with spouse, all-days average.
export const koreaMenUnpaid = [
  [1999, 10.6], [2004, 12.3], [2009, 14.1], [2014, 16.2], [2019, 19.7], [2024, 22.4]
];

// Fathers as a share of first-time parental-leave benefit recipients.
export const koreaFatherLeave = [
  [2010, 2.7], [2015, 5.6], [2017, 13.4], [2018, 17.8], [2019, 21.2],
  [2020, 24.5], [2021, 26.3], [2022, 28.9], [2023, 28.0], [2024, 31.6]
];

// Step 1: correlation with TFR in levels vs. in year-to-year changes.
export const koreaCorrelations = [
  { label: "Women's labor force participation", levels: -0.914, changes: 0.068, nLevels: 35, nChanges: 34 },
  { label: "Women's tertiary enrollment",         levels: -0.725, changes: 0.012, nLevels: 25, nChanges: 24 },
  { label: "Fathers' share of leave takers",     levels: -0.989, changes: 0.012, nLevels: 10, nChanges: 7 },
  { label: "Labor force participation gap",     levels:  0.951, changes: 0.119, nLevels: 35, nChanges: 34 }
];

// The 30 OECD members with a time-use survey in the OECD database.
// tfr: 2024 (World Bank). public = equality in school and work, private = equality at
// home; 100 means men and women equal. mismatch = public - private.
// nonmarital = % of births outside marriage.
export const oecd = [
  { code: "PRT", name: "Portugal",       tfr: 1.410, public: 102.8, menUnpaid: 22.7, private: 45.4, mismatch: 57.5, nonmarital: 59.5 },
  { code: "JPN", name: "Japan",          tfr: 1.150, public:  87.8, menUnpaid: 18.4, private: 36.9, mismatch: 51.0, nonmarital:  2.4 },
  { code: "KOR", name: "Korea",          tfr: 0.748, public:  84.0, menUnpaid: 18.6, private: 37.1, mismatch: 46.9, nonmarital:  4.7 },
  { code: "NZL", name: "New Zealand",    tfr: 1.570, public: 113.3, menUnpaid: 34.8, private: 69.6, mismatch: 43.7, nonmarital: 48.4 },
  { code: "TUR", name: "Türkiye",        tfr: 1.480, public:  79.5, menUnpaid: 18.1, private: 36.3, mismatch: 43.2, nonmarital:  3.1 },
  { code: "IRL", name: "Ireland",        tfr: 1.470, public: 101.9, menUnpaid: 30.3, private: 60.5, mismatch: 41.4, nonmarital: 38.4 },
  { code: "LVA", name: "Latvia",         tfr: 1.240, public: 107.6, menUnpaid: 33.9, private: 67.7, mismatch: 39.8, nonmarital: 37.3 },
  { code: "ITA", name: "Italy",          tfr: 1.180, public:  99.6, menUnpaid: 29.9, private: 59.8, mismatch: 39.7, nonmarital: 40.5 },
  { code: "LTU", name: "Lithuania",      tfr: 1.110, public: 107.4, menUnpaid: 34.2, private: 68.4, mismatch: 39.1, nonmarital: 27.3 },
  { code: "AUS", name: "Australia",      tfr: 1.481, public: 109.7, menUnpaid: 35.6, private: 71.1, mismatch: 38.6, nonmarital: 39.9 },
  { code: "ESP", name: "Spain",          tfr: 1.100, public: 104.0, menUnpaid: 33.5, private: 67.1, mismatch: 36.9, nonmarital: 50.0 },
  { code: "GRC", name: "Greece",         tfr: 1.240, public:  90.7, menUnpaid: 27.2, private: 54.3, mismatch: 36.3, nonmarital:  9.7 },
  { code: "GBR", name: "United Kingdom", tfr: 1.551, public: 107.4, menUnpaid: 36.0, private: 72.1, mismatch: 35.3, nonmarital: 47.6 },
  { code: "SVN", name: "Slovenia",       tfr: 1.520, public: 108.8, menUnpaid: 36.8, private: 73.5, mismatch: 35.2, nonmarital: 56.5 },
  { code: "LUX", name: "Luxembourg",     tfr: 1.250, public: 101.8, menUnpaid: 33.6, private: 67.1, mismatch: 34.7, nonmarital: 39.0 },
  { code: "EST", name: "Estonia",        tfr: 1.180, public: 110.7, menUnpaid: 39.9, private: 79.9, mismatch: 30.8, nonmarital: 53.8 },
  { code: "FRA", name: "France",         tfr: 1.610, public: 105.6, menUnpaid: 37.6, private: 75.2, mismatch: 30.5, nonmarital: 58.5 },
  { code: "BEL", name: "Belgium",        tfr: 1.440, public: 105.9, menUnpaid: 37.8, private: 75.6, mismatch: 30.3, nonmarital: 52.4 },
  { code: "AUT", name: "Austria",        tfr: 1.310, public: 103.8, menUnpaid: 36.8, private: 73.6, mismatch: 30.2, nonmarital: 40.0 },
  { code: "HUN", name: "Hungary",        tfr: 1.410, public: 100.8, menUnpaid: 35.6, private: 71.2, mismatch: 29.6, nonmarital: 24.4 },
  { code: "MEX", name: "Mexico",         tfr: 1.892, public:  88.8, menUnpaid: 29.7, private: 59.4, mismatch: 29.3, nonmarital: 73.7 },
  { code: "POL", name: "Poland",         tfr: 1.140, public: 107.6, menUnpaid: 39.3, private: 78.6, mismatch: 29.0, nonmarital: 28.7 },
  { code: "SWE", name: "Sweden",         tfr: 1.430, public: 115.5, menUnpaid: 43.7, private: 87.4, mismatch: 28.1, nonmarital: 57.4 },
  { code: "CAN", name: "Canada",         tfr: 1.250, public: 107.1, menUnpaid: 39.9, private: 79.7, mismatch: 27.4, nonmarital: 29.0 },
  { code: "USA", name: "United States",  tfr: 1.627, public: 108.0, menUnpaid: 40.4, private: 80.8, mismatch: 27.2, nonmarital: 40.0 },
  { code: "NOR", name: "Norway",         tfr: 1.450, public: 111.8, menUnpaid: 43.0, private: 86.0, mismatch: 25.8, nonmarital: 61.2 },
  { code: "NLD", name: "Netherlands",    tfr: 1.430, public: 101.8, menUnpaid: 39.3, private: 78.5, mismatch: 23.3, nonmarital: 42.1 },
  { code: "DNK", name: "Denmark",        tfr: 1.470, public: 108.7, menUnpaid: 43.4, private: 86.8, mismatch: 21.9, nonmarital: 54.7 },
  { code: "FIN", name: "Finland",        tfr: 1.250, public: 107.2, menUnpaid: 43.7, private: 87.4, mismatch: 19.8, nonmarital: 48.4 },
  { code: "DEU", name: "Germany",        tfr: 1.360, public:  96.8, menUnpaid: 39.5, private: 78.9, mismatch: 17.9, nonmarital: 33.1 }
];

// OLS of TFR on mean-centered predictors, 30 countries. 95% confidence intervals.
export const regression = {
  models: [
    { id: 1, formula: "mismatch", adjR2: 0.029 },
    { id: 2, formula: "+ births outside marriage", adjR2: 0.283 },
    { id: 3, formula: "+ interaction", adjR2: 0.256 },
    { id: 4, formula: "+ log GDP per capita", adjR2: 0.242 }
  ],
  terms: [
    {
      term: "Mismatch",
      note: "per point of mismatch",
      rows: [
        { model: 1, coef: -0.0059, lo: -0.0147, hi: 0.0029, p: 0.181 },
        { model: 2, coef: -0.0015, lo: -0.0096, hi: 0.0065, p: 0.697 },
        { model: 3, coef: -0.0015, lo: -0.0098, hi: 0.0068, p: 0.711 },
        { model: 4, coef: -0.0021, lo: -0.0107, hi: 0.0064, p: 0.613 }
      ]
    },
    {
      term: "Births outside marriage",
      note: "per percentage point",
      rows: [
        { model: 2, coef: 0.0066, lo: 0.0025, hi: 0.0107, p: 0.003 },
        { model: 3, coef: 0.0067, lo: 0.0020, hi: 0.0114, p: 0.007 },
        { model: 4, coef: 0.0067, lo: 0.0019, hi: 0.0114, p: 0.008 }
      ]
    },
    {
      term: "Mismatch × marriage",
      note: "the effect the theory predicts",
      rows: [
        { model: 3, coef: -0.00001, lo: -0.0005, hi: 0.0004, p: 0.900 },
        { model: 4, coef: -0.00001, lo: -0.0005, hi: 0.0004, p: 0.922 }
      ]
    }
  ]
};
