package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"
)

var DataSourceFilePath = flag.String("f", "", "relative path to data source file")
var Verbose = flag.Bool("v", false, "enable verbose output")
var ProgramName string

func usage() {
	fmt.Fprintf(os.Stderr, "usage: %s [-f] [-p PORT] [ENV1] [ENV2]...\n", ProgramName)
	flag.PrintDefaults()
	os.Exit(2)
}

func init() {
	flag.Parse()
	if *DataSourceFilePath == "" {
		log.Fatal("No data source file specified")
	}

	ProgramName = os.Args[0]
	// seed for utils.go
	rand.Seed(time.Now().UnixNano())
}

func main() {
	dataProcessor, ok := DataProcessors[*DataSourceFilePath]
	if !ok {
		log.Fatal("No processor found for data source file: ", *DataSourceFilePath)
	}

	f, err := os.Open(*DataSourceFilePath)
	if err != nil {
		log.Fatal("Could not open data source file: ", err)
	}
	defer f.Close()

	ds := DataSource{}
	err = json.NewDecoder(f).Decode(&ds)
	if err != nil {
		log.Fatal("Could not decode data source file: ", err)
	}

	geoCol, err := dataProcessor(ds)
	if err != nil {
		log.Fatal("Error processing data: ", err)
	}

	if *Verbose {
		out, err := json.MarshalIndent(geoCol, "", "  ")
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Geometry Collection:\n%s\n", out)
	}
}
