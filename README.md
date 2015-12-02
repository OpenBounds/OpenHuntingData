# OpenHuntingData

[![Build Status](https://travis-ci.org/OpenBounds/OpenHuntingData.svg?branch=master)](https://travis-ci.org/OpenBounds/OpenHuntingData)

## Summary
Python scripts to gather and normalize Hunting district data from many websites. The websites are often US State government agencies.

Scripts should read data in whatever format it is available, and output a GeoJson file, with properties normalized to a schema that will be shared by all data sets.

## Scope
The goal is to collect boundaries for geographic areas that are used to define hunting regulations. In some states these are called "Hunting Districts", in others they are called "Game Management Units"(GMUs), there are probably additional names in other states.

At this time only data for the USA is within the scope of this project.

### Types of data that are outside the scope of this project:
* Species Occurrence
* Land ownership
* Trails
* Roads
* Motor Vehichle use restrictions
* Wildlife management districts that only apply to non-game species. This includes cricital habitat designations.
* In most states areas known as "Wildlife Management Areas" are not applicable, because this is actually a designation of land ownership and management priorities, and not of hunting regulations.

### Attributes within scope of this project:
* Geometry, including holes
* State
* Area name
* Area number/identifier
* Huntable species

### Attributes outside the scope of this project:
* Regulations
* Access Restrictions

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
