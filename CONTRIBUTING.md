# Contribute to the Code or Data
You can contribute to the code if you are a developer, and you can help with the data if you have background with GIS tools and systems.

## Improve the Code
Send pull requests to improve the data processing tools. Please fork the repo and do a PR, and you'll get prompt feedback or a merge.

## Improve to Data

### Use a Form to Submit New Data

The easiest way to improve the data is to use the form at [openbounds.github.io/OpenHuntingData/](https://openbounds.github.io/OpenHuntingData/).

When you fill out the form, it will validate the data, generate a JSON metadata file, and create a pull request to add that metadata file to the repo.

### Improve the Data Manually

You can also manually create JSON metadata files manually, and manually submit a pull request with the file. The file should be similar to what you see under the [sources/US directory](https://github.com/OpenBounds/OpenHuntingData/tree/master/sources/US).

## Information needed for adding a data source
To add a new data file, you need to prescribe these pieces of info:

* URL for data
* Species the data applies to. Common names only.
* Attribution - What is the source of this data.
* What field in the source data contains the name of each area.
* What field in the source data contains the ID of each area.

Determining the last 2 items will require downloading the data, and opening in a desktop GIS program ([such as QGIS](http://www.qgis.org/en/site/)).

## Guidelines for Data Submission
* Data must be authoritative.
* Commercial use must be allowed.
* Redistribution must be allowed, though redistribution in original form does not need to be allowed.

If data cannot be directly downloaded because its behind some a click-through form, then include directions for how to download the data in the pull request, and project maintainers will download the data and upload to a location where it can be automatically downloaded during the build process.