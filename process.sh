#!/bin/bash
RESULT_DIR=generated

if [ ! -e tilelive ]; then
    git clone https://github.com/mapbox/tilelive.git
    cd tilelive
    npm install
    npm install mbtiles tilelive-merge tilelive-tmstyle
    cd ..
fi

echo "Generating geojson"
#DOWNLOAD_CACHE=cache python ./Processing/process.py sources/ $RESULT_DIR 2>&1 

VECTOR_MAXZOOM=13
VECTOR_MINZOOM=5

echo "Generating vector tiles"
for i in $RESULT_DIR/*/*/*.geojson; do
    if [[ $i == *AK* ]]; then
        echo "skipping " $i
        continue
    fi

    if [[ $i == *.labels.geojson* ]]; then
        echo "skipping " $i
        continue
    fi

    # Final vector output
    VECTOR_MBTILES=`pwd`/`dirname $i`/`basename $i .geojson`.pbf.mbtiles
    RASTER_MBTILES=`pwd`/`dirname $i`/`basename $i .geojson`.png.mbtiles

    #Dont process if output exists
    if [[ -f $RASTER_MBTILES && -f $VECTOR_MBTILES ]];then
        echo "skipping $i, result MBTiles exist"
        continue
    fi

    echo Processing $i

    WORK_DIR=`mktemp -d`
    echo Using work dir $WORK_DIR
    DATA_MBTILES=$WORK_DIR/data.mbtiles
    python ./Processing/vectorTiling.py --layer regions \
     --max_zoom=$VECTOR_MAXZOOM \
     --min_zoom=$VECTOR_MINZOOM \
     $DATA_MBTILES $i 

    LABELS_GEOJSON=`dirname $i`/`basename $i .geojson`.labels.geojson
    LABELS_MBTILES=$WORK_DIR/labels.mbtiles
    if  [ -e $LABELS_GEOJSON ]; then
        echo "Generating labels mbtiles"
        tippecanoe -o $LABELS_MBTILES $LABELS_GEOJSON \
         -B 8 \
         -b 128 \
         -l regions_labels \
         -Z $VECTOR_MINZOOM \
         -z 10

        echo "generating tile list"
        QUERY="SELECT zoom_level, tile_column, (1 << zoom_level) - 1 - tile_row from tiles"
        sqlite3 $DATA_MBTILES "$QUERY" | sed -e 's/|/\//g' > $WORK_DIR/data.tiles
        sqlite3 $LABELS_MBTILES "$QUERY" | sed -e 's/|/\//g' > $WORK_DIR/labels.tiles
        cat $WORK_DIR/data.tiles $WORK_DIR/labels.tiles | sort | uniq > $WORK_DIR/combined.tiles

        echo Merging data and label mbtiles `cat $WORK_DIR/combined.tiles | wc -l` tiles

        COMBINED_MBTILES=$WORK_DIR/combined.mbtiles 

        ./tilelive/bin/tilelive-copy \
         --concurrency=1 \
         --scheme=list \
         --list=$WORK_DIR/combined.tiles \
         "merge:\?source=mbtiles://$DATA_MBTILES&source=mbtiles://$LABELS_MBTILES" \
         "mbtiles://$COMBINED_MBTILES"
         #For some reason --concurrency=1 makes this run an order of magnitude faster than the default 
         #concurrency level

        #hack to make tilelive-copy copy over the metadata, because it doesnt do it in list mode
        ./tilelive/bin/tilelive-copy \
         --concurrency=1 \
         --scheme=pyramid \
         --minzoom=0 \
         --maxzoom=1 \
         "merge:\?source=mbtiles://$DATA_MBTILES&source=mbtiles://$LABELS_MBTILES" \
         "mbtiles://$COMBINED_MBTILES"
#        sqlite3 $COMBINED_MBTILES "select * from metadata"

        mv $COMBINED_MBTILES $VECTOR_MBTILES
    else
        echo "Label geojson not found"
        mv $DATA_MBTILES $VECTOR_MBTILES
    fi

    echo "Generating style from template"
    STYLE=$WORK_DIR/style.tmstyle/
    cp -r StyleTemplate.tm2 $STYLE
    cat StyleTemplate.tm2/project.yml | sed s/__SOURCE__/mbtiles:\\/\\/${VECTOR_MBTILES//\//\\/}/ > $STYLE/project.yml

    echo "Generating raster tiles"
    RASTER_MINZOOM=$VECTOR_MINZOOM
    RASTER_MAXZOOM=15

    BOUNDS=`sqlite3 $VECTOR_MBTILES "select value from metadata where name='bounds'"`
    echo zoom: $RASTER_MINZOOM-$RASTER_MAXZOOM bounds:$BOUNDS

    WORKING_RASTER_MBTILES=$WORK_DIR/`basename $i .geojson`.png.mbtiles
    ./tilelive/bin/tilelive-copy \
     --minzoom=$RASTER_MINZOOM \
     --maxzoom=$RASTER_MAXZOOM \
     --bounds=$BOUNDS \
     "tmstyle://$STYLE" \
     mbtiles://$WORKING_RASTER_MBTILES

    mv $WORKING_RASTER_MBTILES $RASTER_MBTILES

    python ./Processing/upload_mbtiles.py --extension ".png" \
     --threads 100 \
     $RASTER_MBTILES \
     s3://data.openbounds.org/USAHunting/raster/`dirname $i`/`basename $i .geojson`/

    rm -r $WORK_DIR
done

echo "Uploading to s3"
s3cmd sync $RESULT_DIR s3://data.openbounds.org/USAHunting/
