var fs = require('fs'),
    readline = require('readline'),
    streamHandle = require('stream')
    csvrow = require('csvrow');

var gdpResult = {},
    gnpResult = {},
    addedGniGdp = {},
    gnpPerCapita = {},
    gdpPerCapita = {},
    addedPerCapita = {},
    indiaGdpGrowth = [],
    gdpPercapitaByContinent = {
      "AS" : new Array(56).join('0').split('').map(parseFloat),
      "EU" : new Array(56).join('0').split('').map(parseFloat),
      "AF" : new Array(56).join('0').split('').map(parseFloat),
      "OC" : new Array(56).join('0').split('').map(parseFloat),
      "NA" : new Array(56).join('0').split('').map(parseFloat),
      "SA" : new Array(56).join('0').split('').map(parseFloat),
    },
    countriesByContinent = {};

// map of country -> continent
var countryStream = fs.createReadStream('countries.csv');

var countryInterface = readline.createInterface({
  input : countryStream,
});

countryInterface.on('line', function(line){
  var elements = line.split(',');

  if(elements[0] == "S.NO") {
    return;
  }

  countriesByContinent[elements[4].trim()] = elements[6].trim();
});

var instream = fs.createReadStream('WDI_Data.csv');

var interface = readline.createInterface({
  input : instream
});

interface.on('line', function(line) {
  var elements = line.split(',');
  // var elements = csvrow.parse(line);

  if(elements[0] == "Country Name") {
    return;
  }

  if(elements[3] === "NY.GDP.MKTP.KD") {
    var countryData = [];

    for(i=4; i<60; i++) {
      countryData.push(elements[i]);
    }

    gdpResult[elements[1]] = countryData;
  } else if(elements[3] == "NY.GNP.MKTP.KD") {
    var countryData = [];

    for(i=4; i<60; i++) {
      countryData.push(elements[i]);
    }

    gnpResult[elements[1]] = countryData;
  } else if(elements[3] == "NY.GDP.PCAP.KD") {
    var countryData = [];

    for(i=4; i<60; i++) {
      countryData.push(elements[i]);
    }

    gdpPerCapita[elements[1]] = countryData;

    // ---- Find continent -----
    var continent = countriesByContinent[elements[1]];

    // ---- Aggregate Countries by continent -----
    var continentData = gdpPercapitaByContinent[continent];
    if(continent) {
      for(var i in gdpPerCapita[elements[1]]) {
        if(gdpPerCapita[elements[1]][i] !== "") {
          continentData[i] = parseFloat(continentData[i]) + parseFloat(gdpPerCapita[elements[1]][i]);
        }
      }
      gdpPercapitaByContinent[continent] = continentData;
    }

  } else if(elements[3] == "NY.GNP.PCAP.KD") {
    var countryData = [];

    for(i=4; i<60; i++) {
      countryData.push(elements[i]);
    }

    gnpPerCapita[elements[1]] = countryData;
  } else if(elements[3] == "NY.GDP.MKTP.KD.ZG") {
    var countryData = [];
    if(elements[1] == "IND") {
      for(i=4; i<60; i++) {
        countryData.push(elements[i]);
      }

      indiaGdpGrowth = countryData;
    }
  }
});

interface.on('close', function() {
  // console.log(JSON.stringify(gdpPercapitaByContinent, null, 2));

  // ----- get top 15 countries by 2005 data ------
  var gdpResultClone = gdpResult,
      top15GdpData = {},
      top15GniGdp = {},
      top15PerCapita = {};
  keys = Object.keys(gdpResultClone);
  for(var j=0; j < 15; j++) {
    var max = 0;
    for(var i in keys) {
      if(parseFloat(max) < parseFloat(gdpResultClone[keys[i]][45]) && countriesByContinent[keys[i]]){
        max = gdpResultClone[keys[i]][45];
        maxKey = i;
      }
    }
    // console.log(keys[maxKey]);
    // top15GdpData[keys[maxKey]] = gdpResultClone[keys[maxKey]];
    // ----- add GNI and GDP -------
    addedGniGdp[keys[maxKey]] = [];
    for(var i in gnpResult[keys[maxKey]]) {
      if(gnpResult[keys[maxKey]][i]) {
        addedGniGdp[keys[maxKey]][i] = parseFloat(gdpResult[keys[maxKey]][i]);
      } else if(gdpResult[keys[maxKey]][i]) {
        addedGniGdp[keys[maxKey]][i] = parseFloat(gnpResult[keys[maxKey]][i]);
      } else {
      addedGniGdp[keys[maxKey]][i] = parseFloat(gnpResult[keys[maxKey]][i]) + parseFloat(gdpResult[keys[maxKey]][i]);
      }
    }
    top15GniGdp[keys[maxKey]] = addedGniGdp[keys[maxKey]];

    // ----- add gnpPerCapita and gdpPerCapita -------
    addedPerCapita[keys[maxKey]] = [];
    for(var i in gnpPerCapita[keys[maxKey]]) {
      if(gnpPerCapita[keys[maxKey]][i]) {
        addedPerCapita[keys[maxKey]][i] = parseFloat(gdpPerCapita[keys[maxKey]][i]);
      } else if(gdpPerCapita[keys[maxKey]][i]) {
        addedPerCapita[keys[maxKey]][i] = parseFloat(gnpPerCapita[keys[maxKey]][i]);
      } else {
      addedPerCapita[keys[maxKey]][i] = parseFloat(gnpPerCapita[keys[maxKey]][i]) + parseFloat(gdpPerCapita[keys[maxKey]][i]);
      }
    }


    // console.log(Object.keys(top15GniGdp).length);
    top15PerCapita[keys[maxKey]] = addedPerCapita[keys[maxKey]];
    gdpResultClone[keys[maxKey]][45] = 0;
  }
  // console.log(Object.keys(top15ByGdp).length);
  fs.writeFile('top15GniGdp.json', JSON.stringify(top15GniGdp,null,2));
  fs.writeFile('top15PerCapita.json', JSON.stringify(top15PerCapita,null,2));
  fs.writeFile('indiaGdpGrowth.json', JSON.stringify(indiaGdpGrowth,null,2));
  fs.writeFile('gdpPercapitaByContinent.json', JSON.stringify(gdpPercapitaByContinent,null,2));
});
