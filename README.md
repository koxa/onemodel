# Channel Lineup

[Documentation: detailed description of CLU](https://chalk.charter.com/display/ECOM/CLU+and+VueJS)

## Project setup

Node version: 16.0.0  
NPM version: 7.10.0

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

Resi CLU - http://localhost:8080/cable-tv/channel-lineup  
Buyflow CLU (iframe) - http://localhost:8080/channel-lineup-iframe?nonBuyflow=true&addr1=925%20Munday%20Ct&apt=&zip=28270&existing=true&houseRef=12345&sp=&a=&scdf=0202001600530411&mso=TWC  
SMB CLU - http://localhost:8080/channel-lineup?zip=43018

\*\*You can change the query parameters for Buyflow and SMB to get different results for the lineup. Resi CLU just shows the national lineup so there aren't any needed parameters for that one.

### Compiles and minifies for production

```
npm run build
```

Files are built to the dist folder. Upload the files in the css folder to http://localhost:4502/assets.html/content/dam/spectrum/custom-experiences/common/clu/css and the files in the js folder to http://localhost:4502/assets.html/content/dam/spectrum/custom-experiences/common/clu/js.
The html file is not in the codebase, so download that from prod author and add it to the html folder that should be at the same level as the css and js folders.

Because of the way that the styles are tied to the markup, you will need to upload the css AND js files every time you make a change regardless of whether you changed just css, just js, or both. This goes for uploading to prod author and promoting to stage as well.
For details on the process for uploading to prod and promoting to stage, see this: https://chalk.charter.com/display/ECOM/CLU+Updates+-+Workflow

### Run your unit tests

```
npm run test:unit
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

### AEM Page Setup

The heading and serviceability component (SMB CLU needs the serviceability component, but Resi and Buyflow don't need it) go near the top of the page, separate from the CLU code.
The CLU VueJS code is included on the page through an Embed component pointing to the html file, since it would include links to the js and css files.
Any disclaimers can be added after the Embed component.

Resi - http://localhost:4502/editor.html/content/spectrum/residential/en/cable-tv/channel-lineup.html  
Buyflow - http://localhost:4502/editor.html/content/spectrum/residential/en/channel-lineup-iframe.html  
SMB - http://localhost:4502/editor.html/content/spectrum/business/en/channel-lineup.html

### File Structure Info

The base styles are in the src/assets/scss folder. These styles apply to any and all component that match the selectors.
For example: if you need to update the dropdown styles, you would need to update the src/assets/scss/components/\_treeselect.scss file. NOTE: This file affects the dropdowns on all CLU versions, so be sure the change you make looks good on all versions of CLU.

The component files in the src/components folder have their markup at the top, VueJs definition and any JS functionality next, and finally the styles near the bottom of the page. Since these styles are scoped, we have to upload js and css files for any and all changes.
The src/views/ChannelLineupBusiness.vue sets up the SMB CLU. The src/views/ChannelLineupComponent.vue sets up Resi and Buyflow CLU.
From these two files (ChannelLineupBusiness, ChannelLineupComponent) you should be able to drill down to find the component that you need for any updates.
