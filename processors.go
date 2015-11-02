package main

import (
	"archive/zip"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"

	"github.com/jonas-p/go-shp"
	"github.com/kpawlik/geojson"
)

var DataProcessors = map[string]func(DataSource) (*geojson.GeometryCollection, error){
	// @todo make lookups more flexible by allowing for global/relative paths
	"sources/US/MT/turkey.json": MTTurkeyProcessor,
}

// @todo genericize this processor to be a general-purpose *.shp processor
// and make it archive format-agnostic
func MTTurkeyProcessor(ds DataSource) (geoCol *geojson.GeometryCollection, err error) {
	// download the source archive
	fmt.Printf("Downloading %s...", ds.URL)
	resp, err := http.Get(ds.URL)
	if err != nil {
		return nil, err
	}

	tmpZip, err := ioutil.TempFile(os.TempDir(), ds.Attribution+"_zip")
	if err != nil {
		return nil, err
	}

	n, err := io.Copy(tmpZip, resp.Body)
	if err != nil {
		return nil, err
	}
	resp.Body.Close()
	tmpZip.Close()
	fmt.Printf("done! (%d bytes)\n", n)

	// search the zip file
	fmt.Printf("Searching archive for %s files:\n", ds.Filetype)
	r, err := zip.OpenReader(tmpZip.Name())
	if err != nil {
		return nil, err
	}
	defer r.Close()

	shpMatcher := regexp.MustCompile(".*[.]shp$")
	matched := false
	// iterate through the files in the archive and process any .shp files
	geoCol = geojson.NewGeometryCollection(nil)
	for _, f := range r.File {
		if !shpMatcher.MatchString(f.Name) {
			continue
		}
		matched = true

		fmt.Printf(">> Extracting %s...", f.Name)
		shpData, err := f.Open()
		if err != nil {
			return nil, err
		}

		tmpSHP, err := ioutil.TempFile(os.TempDir(), ds.Attribution+"_shp")
		if err != nil {
			return nil, err
		}

		n, err = io.Copy(tmpSHP, shpData)
		if err != nil {
			return nil, err
		}
		shpData.Close()
		tmpSHP.Close()
		fmt.Printf("done! (%d bytes)\n", n)

		// @todo remove this hack when the library authors remove theirs
		// the shp library currently replaces the last three filename
		// characters with "shp" for some reason...
		err = os.Rename(tmpSHP.Name(), tmpSHP.Name()[0:len(tmpSHP.Name())-3]+"shp")
		if err != nil {
			return nil, err
		}

		fmt.Printf(">> Processing %s...", f.Name)
		shape, err := shp.Open(tmpSHP.Name())
		if err != nil {
			return nil, err
		}
		defer shape.Close()

		shapeCnt := 0
		for shape.Next() {
			_, p := shape.Shape()
			bb := p.BBox()
			//fmt.Printf("Adding %s: %s", reflect.TypeOf(p).Elem(), bb)

			minX, maxX, minY, maxY := geojson.CoordType(bb.MinX), geojson.CoordType(bb.MaxX),
				geojson.CoordType(bb.MinY), geojson.CoordType(bb.MaxY)
			// @todo more correct and complete conversion from shp to geojson
			// right now we're just deriving a square polygon from the bounding box
			coords := []geojson.Coordinates{
				// left line
				{
					{minX, minY},
					{minX, maxY},
				},
				// top line
				{
					{minX, maxY},
					{maxX, maxY},
				},
				// right line
				{
					{maxX, maxY},
					{maxX, minY},
				},
				// bottom line
				{
					{maxX, minY},
					{minX, minY},
				},
			}
			poly := geojson.NewPolygon(coords)
			geoCol.AddGeometry(*poly)
			shapeCnt++
		}
		fmt.Printf("done! (loaded %d shapes)\n", shapeCnt)
	}
	if !matched {
		return nil, fmt.Errorf("Could not find any %s files", ds.Filetype)
	}

	return geoCol, nil
}
