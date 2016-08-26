#!/bin/bash
RESULT_DIR=generated

echo "Generating geojson"
DOWNLOAD_CACHE=cache python ./Processing/process.py sources/ $RESULT_DIR 2>&1 

echo "Generating vector tiles"
for i in $RESULT_DIR/*/*/*.geojson; do
    MBTILES=`dirname $i`/`basename $i .geojson`.pbf.mbtiles
    if [ -e $MBTILES ] 
        then
            rm $MBTILES
    fi
    python ./Processing/vectorTiling.py --layer regions $MBTILES $i
done

echo "Uploading to s3"
s3cmd sync $RESULT_DIR s3://data.openbounds.org/USAHunting/
