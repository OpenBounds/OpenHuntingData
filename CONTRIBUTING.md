# How to contribute
Contributions are welcome to data sources, or to the data processing tools.
Contributions are handled through github pull requests.

## Contributing data
New data sources can be added in 2 ways, by creating a data source file and opening a pull request, or by using the form at [https://openbounds.github.io/OpenHuntingData/](https://openbounds.github.io/OpenHuntingData/) which will automatically fork this repository, create a branch and open a pull request.

### Guidelines for data being acceptable:
* Data must be authoritative.
* Commercial use must be allowed.
* Redistribution must be allowed, though redistribution in original form does not need to be allowed.

If data cannot be directly downloaded because its behind some sort of click-through form, then include directions for how to download the data in the pull request, and project maintainers will download the data and upload to a location where it can be automatically downloaded during the build process.

### Information needed for adding a data source
* URL for data
* Species the data applies to. Common names only.
* Attribution - What is the source of this data.
* What field in the source data contains the name of each area.
* What field in the source data contains the ID of each area.

Determining the last 2 items will require downloading the data, and opening in a desktop GIS program.
