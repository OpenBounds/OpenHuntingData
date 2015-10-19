# OpenHuntingData

## Summary

Python scripts to gather property data from many websites. The websites are often US State government agencies.

## **Project Structure**

For each US state added, create a new directory for that state like “CO” for Colorado.

## **Starting Data**

### Montana

* script to gather files from here: http://fwp.mt.gov/doingBusiness/reference/gisData/dataDownload.html
* only collect rows that start with “Hunting Districts - (2014 and 2015 Seasons)”
* add README.md in the MT directory with any pertinent docs
    * how to execute scripts
    * any manual instructions

### Colorado

* script to gather files from here: https://gisftp02.state.co.us/ (FYI, found via [searching here](http://www.arcgis.com/home/search.html?q=colorado%20parks%20and%20wildlife&t=groups&focus=groups))
    * collect cStateLevelAgenices/DNR/CPW/From/2015/GISData/AdministrativeData
* add README.md in the CO directory with any pertinent docs
    * how to execute scripts
    * any manual instructions

## Future Work

* more state coverage

* add scripts to
    * transform the states data into vector tiles or geojson
    * scripts to merge/process GeoJson into master files

* style sheets to make nice looking raster maps of the data, nationwide




