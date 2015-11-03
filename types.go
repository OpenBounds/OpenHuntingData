package main

type DataSource struct {
	Attribution string   `json:"attribution"`
	Country     string   `json:"country"`
	Filetype    string   `json:"filetype"`
	Species     []string `json:"species"`
	State       string   `json:"state"`
	URL         string   `json:"url"`
}
