"""
Shared helpers for the Korea fertility project.

Every notebook in code/ imports from here, so each function is defined once.
Paths are resolved relative to this file, so the notebooks work no matter
which directory Jupyter was launched from.
"""

from io import BytesIO, StringIO
from pathlib import Path

import numpy as np
import pandas as pd
import requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_RAW = PROJECT_ROOT / "data" / "raw"
DATA_PROCESSED = PROJECT_ROOT / "data" / "processed"
OUTPUT_DIR = PROJECT_ROOT / "output"

for _folder in (DATA_RAW, DATA_PROCESSED, OUTPUT_DIR):
    _folder.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
# The 38 OECD members, ISO3 code -> display name.
OECD_MEMBERS = {
    "AUS": "Australia", "AUT": "Austria", "BEL": "Belgium", "CAN": "Canada",
    "CHL": "Chile", "COL": "Colombia", "CRI": "Costa Rica", "CZE": "Czechia",
    "DNK": "Denmark", "EST": "Estonia", "FIN": "Finland", "FRA": "France",
    "DEU": "Germany", "GRC": "Greece", "HUN": "Hungary", "ISL": "Iceland",
    "IRL": "Ireland", "ISR": "Israel", "ITA": "Italy", "JPN": "Japan",
    "KOR": "Korea", "LVA": "Latvia", "LTU": "Lithuania", "LUX": "Luxembourg",
    "MEX": "Mexico", "NLD": "Netherlands", "NZL": "New Zealand", "NOR": "Norway",
    "POL": "Poland", "PRT": "Portugal", "SVK": "Slovakia", "SVN": "Slovenia",
    "ESP": "Spain", "SWE": "Sweden", "CHE": "Switzerland", "TUR": "Türkiye",
    "GBR": "United Kingdom", "USA": "United States",
}

# World Bank indicator codes used in the project.
WB_INDICATORS_KOREA = {
    "tfr": "SP.DYN.TFRT.IN",                  # total fertility rate
    "female_lfp": "SL.TLF.CACT.FE.ZS",        # female labour force participation, % of 15+
    "male_lfp": "SL.TLF.CACT.MA.ZS",          # male labour force participation, % of 15+
    "female_tertiary": "SE.TER.ENRR.FE",      # female gross tertiary enrolment, %
    "female_marriage_age": "SP.DYN.SMAM.FE",  # female mean age at first marriage
}
WB_INDICATORS_OECD = {
    "tfr": "SP.DYN.TFRT.IN",                # total fertility rate
    "lfp_ratio": "SL.TLF.CACT.FM.ZS",       # female/male labour force participation (100 = parity)
    "tertiary_gpi": "SE.ENR.TERT.FM.ZS",    # female/male gross tertiary enrolment (1.0 = parity)
    "gdp_pc": "NY.GDP.PCAP.PP.KD",          # GDP per capita, PPP, constant dollars
}

OECD_TIME_USE_URL = (
    "https://sdmx.oecd.org/public/rest/data/OECD.WISE.INE,DSD_TIME_USE@DF_TIME_USE,/all"
)
OECD_SF24_URL = (
    "https://webfs.oecd.org/els-com/Family_Database/SF_2_4_Share_births_outside_marriage.xlsx"
)

KOREA_CODE = "KOR"


# ---------------------------------------------------------------------------
# Data pulls
# ---------------------------------------------------------------------------
def get_world_bank_series(country_code, indicator_code):
    """Full annual series for one indicator in one country.

    Returns a DataFrame with columns 'year' and 'value', sorted by year, with
    missing years dropped. The World Bank JSON API needs no key.
    """
    url = f"https://api.worldbank.org/v2/country/{country_code}/indicator/{indicator_code}"
    response = requests.get(url, params={"format": "json", "per_page": 200}, timeout=60)
    response.raise_for_status()
    payload = response.json()
    records = payload[1] if len(payload) > 1 and payload[1] else []

    empty = pd.DataFrame({"year": pd.Series(dtype=int), "value": pd.Series(dtype=float)})
    if len(records) == 0:
        return empty
    result = pd.DataFrame(records)[["date", "value"]].rename(columns={"date": "year"})
    result = result.dropna(subset=["value"])
    if len(result) == 0:
        return empty
    result["year"] = result["year"].astype(int)
    result["value"] = result["value"].astype(float)
    return result.sort_values("year").reset_index(drop=True)


def pull_world_bank_panel(country_codes, indicators):
    """Pull several indicators for several countries into one long table.

    `indicators` maps a short name -> World Bank code. Returns columns
    code, indicator, year, value.
    """
    frames = []
    for code in country_codes:
        for name, wb_code in indicators.items():
            series = get_world_bank_series(code, wb_code)
            series["code"] = code
            series["indicator"] = name
            frames.append(series)
    panel = pd.concat(frames, ignore_index=True)
    return panel[["code", "indicator", "year", "value"]]


def pull_oecd_time_use():
    """Minutes per day of unpaid work by sex, one survey per OECD member.

    Comes through the OECD SDMX API (dataflow OECD.WISE.INE / DSD_TIME_USE,
    measure UPW). The dataflow does not carry the survey year, so the age of
    each country's snapshot is unknown. Returns code, men_unpaid_min,
    women_unpaid_min for OECD members that have both values.
    """
    response = requests.get(OECD_TIME_USE_URL, params={"format": "csvfilewithlabels"}, timeout=120)
    response.raise_for_status()
    raw = pd.read_csv(StringIO(response.text))

    unpaid = raw[(raw["MEASURE"] == "UPW") & (raw["REF_AREA"].isin(OECD_MEMBERS))]
    wide = (
        unpaid.pivot_table(index="REF_AREA", columns="SEX", values="OBS_VALUE", aggfunc="first")
        .rename(columns={"M": "men_unpaid_min", "F": "women_unpaid_min"})
        .dropna(subset=["men_unpaid_min", "women_unpaid_min"])
        .reset_index()
        .rename(columns={"REF_AREA": "code"})
    )
    wide.columns.name = None
    return wide[["code", "men_unpaid_min", "women_unpaid_min"]]


def pull_oecd_births_outside_marriage(save_raw_to=None):
    """Latest share of births outside marriage per OECD member (table SF2.4).

    The sheet has one row per country and one column per year. For each
    country the latest non-missing value is kept. Returns code,
    nonmarital_pct, nonmarital_year.
    """
    response = requests.get(OECD_SF24_URL, timeout=60)
    response.raise_for_status()
    if save_raw_to is not None:
        Path(save_raw_to).write_bytes(response.content)

    sheet = pd.read_excel(BytesIO(response.content), sheet_name="Births_outside_marriage", header=3)

    # The sheet uses a couple of older country names.
    name_to_code = {name: code for code, name in OECD_MEMBERS.items()}
    name_to_code["Czech Republic"] = "CZE"
    name_to_code["Slovak Republic"] = "SVK"

    year_columns = [c for c in sheet.columns if str(c).replace(".0", "").isdigit()]
    long = sheet[["Country"] + year_columns].melt(
        id_vars="Country", var_name="year", value_name="value"
    )
    long["year"] = long["year"].astype(float).astype(int)
    long["value"] = pd.to_numeric(long["value"], errors="coerce")   # ".." means missing
    long["code"] = long["Country"].map(name_to_code)
    long = long.dropna(subset=["code", "value"])

    latest = (
        long.sort_values("year")
        .groupby("code")
        .tail(1)
        .rename(columns={"value": "nonmarital_pct", "year": "nonmarital_year"})
    )
    return latest[["code", "nonmarital_pct", "nonmarital_year"]].reset_index(drop=True)


# ---------------------------------------------------------------------------
# Transformations
# ---------------------------------------------------------------------------
def latest_per_country(panel, max_year=None):
    """Latest non-missing value of every indicator per country, as a wide table.

    `panel` is the long table from pull_world_bank_panel. If `max_year` is
    given, only observations up to that year are considered, which freezes
    the snapshot so the notebooks keep reproducing the paper after the World
    Bank posts newer years. Returns one row per code with a value column and a
    <name>_year column for each indicator.
    """
    kept = panel if max_year is None else panel[panel["year"] <= max_year]
    latest = kept.sort_values("year").groupby(["code", "indicator"]).tail(1)
    values = latest.pivot(index="code", columns="indicator", values="value")
    years = latest.pivot(index="code", columns="indicator", values="year").add_suffix("_year")
    wide = values.join(years).reset_index()
    wide.columns.name = None
    return wide


def share_pct(part, other):
    """100 * part / (part + other), elementwise. Used for men's share of unpaid work."""
    return 100.0 * part / (part + other)


def zscore(series):
    """(value - mean) / standard deviation. Missing values stay missing."""
    spread = series.std()
    if spread == 0 or pd.isna(spread):
        return series * 0
    return (series - series.mean()) / spread


def consecutive_changes(frame, columns, step=1):
    """Period-to-period changes, keeping only differences that span exactly `step` years.

    `frame` must have a 'year' column. Rows with a missing value in any of
    `columns` are dropped first. Returns a DataFrame indexed by the year of
    the later observation with one column per requested column.
    """
    ordered = frame.dropna(subset=columns).sort_values("year").set_index("year")
    changes = ordered[columns].diff()
    spans_one_step = ordered.index.to_series().diff() == step
    return changes[spans_one_step]


def build_public_private_parity(frame):
    """Add tertiary_parity, public_parity, private_parity and mismatch to an OECD cross-section.

    Expects lfp_ratio, tertiary_gpi and men_share_unpaid_pct. Public parity
    averages the two public ratios (100 = parity); private parity is men's
    share of unpaid work divided by 50 (100 = parity); mismatch is public
    minus private.
    """
    out = frame.copy()
    out["tertiary_parity"] = out["tertiary_gpi"] * 100.0
    out["public_parity"] = (out["lfp_ratio"] + out["tertiary_parity"]) / 2.0
    out["private_parity"] = out["men_share_unpaid_pct"] / 50.0 * 100.0
    out["mismatch"] = out["public_parity"] - out["private_parity"]
    return out


# ---------------------------------------------------------------------------
# Diagnostics and output
# ---------------------------------------------------------------------------
def report_merge(left, right, merged, label, key):
    """Print row counts before and after a merge."""
    print(f"[{label}] left: {len(left)} rows, right: {len(right)} rows, "
          f"merged on '{key}': {len(merged)} rows")


def save_figure(fig, name):
    """Save a matplotlib figure to output/<name>.png and print the path."""
    path = OUTPUT_DIR / f"{name}.png"
    fig.savefig(path, dpi=150, bbox_inches="tight")
    print("Saved figure:", path.relative_to(PROJECT_ROOT))


def save_table(frame, name, folder=None, index=False):
    """Save a DataFrame to CSV (default folder: output/) and print the path."""
    folder = OUTPUT_DIR if folder is None else Path(folder)
    path = folder / f"{name}.csv"
    frame.to_csv(path, index=index)
    print("Saved table:", path.relative_to(PROJECT_ROOT))


# ---------------------------------------------------------------------------
# Plot helpers
# ---------------------------------------------------------------------------
def bar_chart(ax, frame, column, title, highlight_code=KOREA_CODE):
    """Horizontal sorted bar chart with one country highlighted."""
    ordered = frame.sort_values(column)
    colors = np.where(ordered["code"] == highlight_code, "crimson", "steelblue")
    ax.barh(ordered["country"], ordered[column], color=colors)
    ax.set_title(title)
    ax.tick_params(axis="y", labelsize=7)


def scatter_with_labels(ax, frame, x_column, y_column, x_label, title,
                        show_n=False, highlight_code=KOREA_CODE, label_size=8):
    """Scatter with ISO3 labels, the highlighted country in red, and r in the title."""
    ax.scatter(frame[x_column], frame[y_column], color="steelblue")
    for _, row in frame.iterrows():
        color = "crimson" if row["code"] == highlight_code else "black"
        ax.annotate(row["code"], (row[x_column], row[y_column]), fontsize=label_size, color=color)
    r = frame[x_column].corr(frame[y_column])
    suffix = f"   (r = {r:.2f}" + (f", n = {len(frame)})" if show_n else ")")
    ax.set_title(title + suffix)
    ax.set_xlabel(x_label)
    ax.set_ylabel("TFR")


def spaghetti(ax, panel, indicator, title, y_label, start_year=1980, transform=None,
              highlight_code=KOREA_CODE):
    """One line per country from a long World Bank panel; the highlighted country in red."""
    subset = panel[(panel["indicator"] == indicator) & (panel["year"] >= start_year)]
    for code, series in subset.groupby("code"):
        values = series["value"] if transform is None else transform(series["value"])
        if code == highlight_code:
            ax.plot(series["year"], values, color="crimson", linewidth=2.5,
                    label=OECD_MEMBERS.get(code, code), zorder=5)
        else:
            ax.plot(series["year"], values, color="grey", linewidth=0.8, alpha=0.5)
    ax.set_title(title)
    ax.set_ylabel(y_label)
