"use strict";

var visir = visir || {};

visir.FunctionGenerator = function(id)
{
	this._id = id;
	this._waveform = "sine";
	this._frequency = 1000.0;
	this._amplitude = 1.0;
	this._offset = 0.0;
}
	
visir.FunctionGenerator.prototype.WriteRequest = function()
{
	var $xml = $("<functiongenerator></functiongenerator>");
	$xml.attr("id", this._id);
	
	AddXMLValue($xml, "fg_waveform", this._waveform);
	AddXMLValue($xml, "fg_frequency", this._frequency);
	AddXMLValue($xml, "fg_amplitude", this._amplitude / 2.0);
	AddXMLValue($xml, "fg_offset", this._offset);
		
	// XXX: trick to get a valid root doc
	return $("<root />").append($xml).html();
},

visir.FunctionGenerator.prototype.ReadResponse = function(response) {}

// YO
visir.FunctionGenerator.prototype.ReadRequest = function(request)
{
	var $xml = $(request);
	var $functiongenerator = $xml.find("functiongenerator[id=" + this._id + "]");
	if ($functiongenerator.length > 0) {
		this.SetActiveValue("freq");
		var waveform = $functiongenerator.find("fg_waveform").attr("value");
		this.SetWaveform(waveform);
		var frequency = $functiongenerator.find("fg_frequency").attr("value");
		this._frequency = frequency;
		var amplitude = $functiongenerator.find("fg_amplitude").attr("value");
		this._amplitude = amplitude;
		var offset = $functiongenerator.find("fg_offset").attr("value");
		this._offset = offset;
		this._UpdateDisplay();
	}
}
// /YO

visir.FunctionGenerator.prototype.GetWaveform = function() { return this._waveform; }
visir.FunctionGenerator.prototype.SetWaveform = function(waveform) { this._waveform = waveform; }