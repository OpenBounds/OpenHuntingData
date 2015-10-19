# OpenHuntingData

## Summary

Python scripts to gather Hunting district data from many websites. The websites are often US State government agencies.

Scripts should read data in whatever format it is available, and output a GeoJson file, with properties normalized to a schema that will be shared by all data sets.

## Inspiration

This project is inspired by http://OpenAddress.io

## Project Structure

The project root contains a directory, sources, that contains JSON files describing each dataset. Data is organized as /sources/:country:/:state_or_province:/:source_name:.json for example /sources/US/MT/deer-elk-lions.json

## Future Work

* more state coverage

* add scripts to
    * transform the states data into vector tiles
    * scripts to merge/process GeoJson into master files

* style sheets to make nice looking raster maps of the data, nationwide
