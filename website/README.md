# Does the gender equity mismatch explain Korea's fertility collapse?

Public demo site for the QSS 20 final project. Static HTML, CSS and vanilla-JS SVG
charts. No build step and no dependencies.

```
index.html            the site
assets/site.css       tokens + layout
assets/data.js        every number that appears in a figure
assets/charts.js      the SVG chart code
```

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

**Vercel**, from this directory:

```sh
npx vercel --prod
```

Accept the defaults; the framework is "Other" and the output directory is `./`.

**GitHub Pages**: push this directory to a repo and enable Pages on the branch
root in Settings → Pages.

## Where the numbers come from

Every figure is generated from `assets/data.js`, which is transcribed from the three
notebooks. Fertility, labor-force and enrollment series come from the World Bank API;
men's unpaid work from the OECD Time Use Database and Statistics Korea (KOSIS);
births outside marriage from OECD Family Database table SF2.4; fathers' share of
parental leave from the Korean Ministry of Employment and Labor.
