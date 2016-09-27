Map { font-directory: url("./fonts"); }


#regions {
      	::case {
      	  line-width: 5;
      	  line-color: #fff;
    	}
    	::fill {
      	  line-width: 1;
      	  line-color: black;
    	}
  [zoom > 10] {
    text-face-name: 'Source Sans Pro Bold';
    text-name:'[name]';
    text-size: 12;
    text-placement:line;
    text-fill: black;
    text-halo-fill: white;
    text-halo-radius:2;
    text-min-distance:50;
    text-dy:-5;
    text-min-padding:1;
    text-max-char-angle-delta : 20;
  }
}

#regions_labels {
  text-face-name: 'Source Sans Pro Bold';
  text-name:'[name]';
  text-size: 12;
  text-halo-fill: white;
  text-halo-radius:2;
  text-placement: point;
  text-wrap-width:30;
  text-avoid-edges:false;
  text-min-distance:50;
}
