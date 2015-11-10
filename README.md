# OpenHuntingData

[![Build Status](https://travis-ci.org/OpenBounds/OpenHuntingData.svg?branch=master)](https://travis-ci.org/OpenBounds/OpenHuntingData)

## Summary
Python scripts to gather and normalize Hunting district data from many websites. The websites are often US State government agencies.

Scripts should read data in whatever format it is available, and output a GeoJson file, with properties normalized to a schema that will be shared by all data sets.

## Scope
The first phase of this project will be focued on the US.

### Interested in:
* Geometry, including holes
* State
* Area name
* Area number/identifier
* Huntable species

### Not interested in:
* Regulations
* Access Restrictions
* Species Occurrence
* Land ownership

### Possibly:
* URL for more info?
* Legal Descriptions

## Project Structure
The project root contains a directory, sources, that contains JSON files describing each dataset. Data is organized as /sources/:country:/:state_or_province:/:source_name:.json for example /sources/US/MT/deer-elk-lions.json

## Inspiration
This project is inspired by http://openaddresses.io/

## Future Work
* more state coverage
* add scripts to
    * transform the states data into vector tiles
    * scripts to merge/process GeoJson into master files

* style sheets to make nice looking raster maps of the data, nationwide
