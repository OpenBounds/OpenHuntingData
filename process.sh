#!/bin/bash
RESULT_DIR=generated

echo "Generating geojson"
DOWNLOAD_CACHE=cache python ./Processing/process.py sources/ $RESULT_DIR 2>&1 

echo "Generating vector tiles"
for i in $RESULT_DIR/*/*/*.geojson; do
python ./Processing/vectorTiling.py --layer regions `dirname $i`/`basename $i .geojson`.pbf.mbtiles $i
done

echo "Uploading to s3"
s3cmd sync $RESULT_DIR s3://data.openbounds.org/USAHunting/
