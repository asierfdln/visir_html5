"use strict";

var visir = visir || {};

visir.Multimeter = function(id)
{
	this._id = id;
	this._mode = "off";
	this._resolution = "3.5";
	this._range = -1;
	this._autozero = 1;
	this._result = 0.0;
}

visir.Multimeter.prototype.SetMode = function(mode) { this._mode = mode; }
visir.Multimeter.prototype.GetMode = function() { return this._mode; }

visir.Multimeter.prototype.SetRange = function(range) { this._range = range; }
visir.Multimeter.prototype.GetRange = function() { return this._range; }

visir.Multimeter.prototype.SetResolution = function(res) { this._resolution = res; }
visir.Multimeter.prototype.GetResolution = function() { return this._resolution; }

visir.Multimeter.prototype.GetResult = function() { return this._result }

visir.Multimeter.prototype.ReadRequest = function(request) {
	var $xml = $(request);
	var $multimeter = $xml.find("multimeter[id=" + this._id + "]"); // el corchete ese ni debería estar ahí para que funcionara bien...
	if ($multimeter.length > 0) {
		var mode = $multimeter.find("dmm_function").attr("value");
		this.SetMode(mode);
		/*
		  345: "off", 15: "ac volts", 45: "dc volts", 75: "off", 105: "resistance", 135: "off", 165: "ac current", 195: "dc current"
		*/
		switch (mode) { // _elem no está en multimeter, magia de js??...
			case 'ac volts':
			  setRotation(this._elem.find(".top"), 15);
			  break;
			case 'dc volts':
			  setRotation(this._elem.find(".top"), 45);
			  break;
			case 'resistance':
			  setRotation(this._elem.find(".top"), 105);
			  break;
			case 'ac current':
			  setRotation(this._elem.find(".top"), 165);
			  break;
			case 'dc current':
			  setRotation(this._elem.find(".top"), 195);
			  break;
			default:
			  setRotation(this._elem.find(".top"), 345);
			  break;
		}
	}
}
	
visir.Multimeter.prototype.WriteRequest = function()
{
	if (this._mode == "off") return ""; //'<multimeter id="'+ this._id + '" />';
	
	var $xml = $('<multimeter />');
	$xml.attr("id", this._id);
	
	var values = {
		dmm_function: this._mode
		, dmm_resolution: this._resolution
		, dmm_range: this._range
		, dmm_autozero: this._autozero
	};
	
	for (var key in values) {
		AddXMLValue($xml, key, values[key]);
	}
	
	// XXX: trick to get a valid root doc
	return $("<root />").append($xml).html();
}

visir.Multimeter.prototype.ReadResponse = function(response) {
	var $xml = $(response);
	var $multimeter = $xml.find("multimeter[id=" + this._id + "]");
	if ($multimeter.length > 0) {
		var result = $multimeter.find("dmm_result").attr("value");
		if (!isNaN(result))	{
			this._result = parseFloat(result);
		} else {
			this._result = NaN;
		}
		this.SetMode("resistance");
	}
}
