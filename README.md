[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/zeit/next.js/tree/master/examples/custom-server)

# Root static files example

## How to use

Install NodeJS, recommended version 10 or 11. You will also need Git. You can optionally install a Git GUI tool such as Tortoise Git.

Then clone the repository and run `npm install && npm run dev`:

    git clone https://github.com/iaincollins/nextjs-starter.git
    npm install
    npm run dev

Note: If you are running on Windows run install --noptional flag (i.e. `npm install --no-optional`) which will skip installing fsevents.

## Building and deploying in production

If you wanted to run this site in production, you should install modules then build the site with `npm run build` and run it with `npm start`:

    npm install
    npm run build
    npm start

You should run `npm run build` again any time you make changes to the site.

Note: If you are already running a webserver on port 80 (e.g. Macs usually have the Apache webserver running on port 80) you can still start the example in production mode by passing a different port as an Environment Variable when starting (e.g. `PORT=3000 npm start`).

## Configuring

If you configure a .env file (just copy [.env.default](https://github.com/iaincollins/nextjs-starter/blob/master/.env.default) over to '.env' and fill in the options) you can configure a range of options.

See the [AUTHENTICATION.md](https://github.com/iaincollins/nextjs-starter/blob/master/AUTHENTICATION.md) for how to set up oAuth if you want to do that. It suggested you start with Twitter as it's the easiest to get working.

## Deploying to the cloud with now.sh

To deploy on [Zeit's](https://zeit.co) cloud platform `now` just install it, clone this repository and run `now` in the working directory:

    npm install -g now
    now

If you configure a .env file `now` will include it when deploying if you use the -E option to deploy:

    now -E

If you want to have your local `.env` file contain variables for local development and have a different sent of varaibles you use in production or staging, you can create additional .env files and tell `now` to use a specific
file when deploying.

For example:

    now -E production.env

## Running tests

Style formatting is enforced with the JavaScript style linter [xo](https://github.com/sindresorhus/xo) which is invoked when running `npm test`.

Reflecting how most examples of Next.js are written, in `package.json` we have configured 'xo' to tell it this project uses spaces (not tabs) in both JavaScript and JSX and to not use semicolons.

xo needs to be installed globally:

    install -g xo

You can check linting by running `xo` or by running `npm test`.

Note: There are currently no application specific tests, beyond style checking.

## TODO

1. Express hot module replacement (BE and UI together) (https://hackernoon.com/hot-reload-all-the-things-ec0fed8ab0)

    1. I feel like I posted in the NextJS Spectrum about this...check my emails)

2. Sheet-splitting: you should be able to have multiple splits.

3. Toggle view between the following; the buttons to toggle should have the text in the dark red Halfaker color; Ariel; size 11; bold; all views should default to this month’s results; all graphs should have text set to size 16

    2. trend of all months
       X axis is the month
       Y axis is the value of the response
       This is a line graph, with 2 lines represented  
       1 set of data points are the averages for a given supervisor across the months
       this line is a happy blue color?
       1 set of data points are the averages for all supervisors across the months
       The line should be colored the dark gray color

4. Throw validation errors to GUI. eg uploading wrong file type is currently uninformative.
5. Upload arbitrary css, js, and html, which gets included in downloaded report. And make default report hideable. CSS already done. HTML use case: analyst release notes (eg this time we changed question 5)

    1. in principle this would make for a fully generic report template capability

6. after upload data, pick chart type by question. at least bar, line, pie
7. color picker on relevant fields ie under advanced options https://casesandberg.github.io/react-color/
8. create UI edit input fields under advanced options. also those should prob me made dynamically from 'themeable state' function which can be used within fHandleDownloadThemeClick
9. TODO scraper within files, integrated priority convention and perhaps other task detail convention; LOE, etc. you could also maybe build an information architecture scraping ref:

    1. Average Response is for this graph (this subsheet, this period, this response)
    2. You might want to average across periods
    3. across subsheets (eg other people asked same question this period)
    4. or both (all people asked this question over all time)

10. Support this.props.bUseGradientBackground
11. Export Report Setup input values
12. reduce duplicate blocks within controller-report.js and index.js's filtering logic
13. provide more default graph data after importing a sheet; eg default axis names & response count
