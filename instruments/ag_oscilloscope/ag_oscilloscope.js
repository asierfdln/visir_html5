//"use strict";

var visir = visir || {};

visir.AgilentOscilloscope = function(id, elem)
{
	visir.AgilentOscilloscope.parent.constructor.apply(this, arguments)
	
	this._voltages = [5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001];
	this._voltIdx = [2,2];
	
	this._timedivs = [0.005, 0.002, 0.001, 0.0005, 0.0002, 0.0001, 0.00005, 0.00002, 0.00001, 0.000005, 0.000002, 0.000001, 0.0000005];
	this._timeIdx = 1;
	
	this._triggerModes = ["autolevel", "auto", "normal"];
	this._triggerModesDisplay = ["Auto Level", "Auto", "Normal"];
	this._triggerModesLight = ["Level", "Auto", "Trig'd"];
	this._triggerModeIdx = 0;
	
	var me = this;
	this._$elem = elem;
	
	this._channels[0].visible = true;
	this._channels[0].display_offset = 0.0;
	this._channels[1].visible = true;
	this._channels[1].display_offset = 0.0;
	
	this._activeMenu = ""; // the current menu displayed
	this._activeMenuHandler = null;
	
	this._activeIndicator = null;
	this._menuTitleTimer = null;
		
	var imgbase = "instruments/ag_oscilloscope/images";
		
	var tpl = '<div class="ag_osc">\
	<img src="%img%/osc.jpg" width="800" height="449" />\
	<div class="stepwheel small horz_offset"><img class="active top" src="%img%/osc_wheel_small_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_small_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel small offset_ch1"><img class="active top" src="%img%/osc_wheel_small_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_small_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel small offset_ch2"><img class="active top" src="%img%/osc_wheel_small_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_small_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel small offset_trg"><img class="active top" src="%img%/osc_wheel_small_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_small_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel large horz"><img class="active top" src="%img%/osc_wheel_big_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_big_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel large vert_ch1"><img class="active top" src="%img%/osc_wheel_big_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_big_2.png" alt="stepwheel" /></div>\
	<div class="stepwheel large vert_ch2"><img class="active top" src="%img%/osc_wheel_big_1.png" alt="stepwheel" /><img class="top" src="%img%/osc_wheel_big_2.png" alt="stepwheel" /></div>\
	<div class="display_buttons">\
		<div class="button display_button_1"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
		<div class="button display_button_2"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
		<div class="button display_button_3"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
		<div class="button display_button_4"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
		<div class="button display_button_5"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
		<div class="button display_button_6"><img class="up active" src="%img%/osc_button_display_1.png" alt="display button" /><img class="down" src="%img%/osc_button_display_2.png" alt="display button" /></div>\
	</div>\
	<div class="button modecoupling">\
		<img class="up active" src="%img%/osc_button_mode_coupling_up.png" alt="mode coupling" /><img class="down" src="%img%/osc_button_mode_coupling_down.png" alt="mode coupling" />\
	</div>\
	<div class="button multibutton channel_1">\
		<div class="state dark visible">\
			<img class="up active" src="%img%/osc_vert_off_up_enable_1.png" alt="display button" /><img class="down" src="%img%/osc_vert_off_down_enable_1.png" alt="display button" />\
		</div>\
		<div class="state light">\
			<img class="up active" src="%img%/osc_vert_on_up_enable_1.png" alt="display button" /><img class="down" src="%img%/osc_vert_on_down_enable_1.png" alt="display button" />\
		</div>\
	</div>\
	<div class="button multibutton channel_2">\
		<div class="state dark visible">\
			<img class="up active" src="%img%/osc_vert_off_up_enable_2.png" alt="display button" /><img class="down" src="%img%/osc_vert_off_down_enable_2.png" alt="display button" />\
		</div><div class="state light">\
			<img class="up active" src="%img%/osc_vert_on_up_enable_2.png" alt="display button" /><img class="down" src="%img%/osc_vert_on_down_enable_2.png" alt="display button" />\
		</div>\
	</div>\
	<div class="button multibutton edge">\
		<div class="state dark visible">\
			<img class="up active" src="%img%/osc_trig_off_up_edge.png" alt="edge button" /><img class="down" src="%img%/osc_trig_off_down_edge.png" alt="edge button" />\
		</div>\
		<div class="state light">\
			<img class="up active" src="%img%/osc_trig_on_up_edge.png" alt="edge button" /><img class="down" src="%img%/osc_trig_on_down_edge.png" alt="edge button" />\
		</div>\
	</div>\
	<div class="display">\
		<div class="background">\
			<div class="channel ch1"><span class="channelname">1</span><span class="lighttext voltage_ch1">1.00V/</span></div>\
			<div class="channel ch2"><span class="channelname">2</span><span class="lighttext voltage_ch2">1.00V/</span></div>\
			<div class="timedelay"><img class="arrow" src="%img%/delay_arrow.png" alt="delay arrow" /><span class="lighttext">0.00s</span></div>\
			<div class="timescale"><span class="lighttext timediv">500us</span></div>\
			<div class="trigtype"><span class="lighttext triggermode">Level</span></div>\
			<div class="triggerslope">\
				<img class="flank positive selected" src="%img%/osc_trig_edge_up_small.png" alt="trigger flank" /><img class="flank negative" src="%img%/osc_trig_edge_down_small.png" alt="trigger flank" />\
			</div>\
			<div class="triggersource">\
				<span class="channelname">1</span>\
			</div>\
			<div class="triglevel"><span class="lighttext">0.00V</span></div>\
			<div class="vertical">\
				<div class="group offset_group_ch1 visible">\
					<div class="ch_offset normal visible"><span class="offsetchannel">1</span><img class="offsetarrow" src="%img%/offset_arrow.png" alt="offset arrow" /></div>\
					<div class="ch_offset overflow_up"><span class="offsetchannel overflow_up">1</span><img class="offsetarrow" src="%img%/offset_arrow_up.png" alt="offset arrow" /></div>\
					<div class="ch_offset overflow_down"><span class="offsetchannel overflow_down">1</span><img class="offsetarrow" src="%img%/offset_arrow_down.png" alt="offset arrow" /></div>\
				</div>\
				<div class="group offset_group_ch2 visible">\
					<div class="ch_offset normal visible"><span class="offsetchannel">2</span><img class="offsetarrow" src="%img%/offset_arrow.png" alt="offset arrow" /></div>\
					<div class="ch_offset overflow_up"><span class="offsetchannel overflow_up">2</span><img class="offsetarrow" src="%img%/offset_arrow_up.png" alt="offset arrow" /></div>\
					<div class="ch_offset overflow_down"><span class="offsetchannel overflow_down">2</span><img class="offsetarrow" src="%img%/offset_arrow_down.png" alt="offset arrow" /></div>\
				</div>\
			</div>\
			<div class="graph">\
				<canvas class="grid" width="330" height="208"></canvas>\
				<canvas class="plot" width="330" height="208"></canvas>\
			</div>\
			<div class="menubar">\
				<div class="menutitle"><span class="titlebox">Channel 1 Menu</span></div>\
				\
				<!-- menu_channel_1 -->\
				<div class="menu menu_channel_1">\
					<div class="menubox">\
						<div class="menubox_icon arrowup" />\
						<span class="title"><img class="menuicon" src="%img%/menu_arrow_up.png" alt="arrow"/>Coupling</span>\
						<span class="value coupling">DC</span>\
					</div>\
					<div class="menu_selection sel_ch_1">\
						<div class="title">Coupling</div>\
						<hr />\
						<div class="selection sel_dc selected"><div class="checkmark_holder"><div class="checkmark" /></div><span>DC</span></div>\
						<div class="selection sel_ac"><div class="checkmark_holder"><div class="checkmark" /></div><span>AC</span></div>\
					</div>\
				</div>\
				\
				<!-- menu_channel_2 -->\
				<div class="menu menu_channel_2">\
					<div class="menubox">\
						<div class="menubox_icon arrowup" />\
						<span class="title"><img class="menuicon" src="%img%/menu_arrow_up.png" alt="arrow"/>Coupling</span>\
						<span class="value coupling">DC</span>\
					</div>\
					<div class="menu_selection sel_ch_2">\
						<div class="title">Coupling</div>\
						<hr />\
						<div class="selection sel_dc selected"><div class="checkmark_holder"><div class="checkmark" /></div><span>DC</span></div>\
						<div class="selection sel_ac"><div class="checkmark_holder"><div class="checkmark" /></div><span>AC</span></div>\
					</div>\
				</div>\
				\
				<!-- menu_edge -->\
				<div class="menu menu_edge">\
					<div class="menubox">\
						<div class="edgeselect selected positive"><img src="%img%/osc_trig_edge_up_large.png" alt="edge up" /><div class="checkmark_holder"><div class="checkmark" /></div></div>\
						<div class="edgeselect negative"><img src="%img%/osc_trig_edge_down_large.png" alt="edge up" /><div class="checkmark_holder"><div class="checkmark" /></div></div>\
					</div>\
					<div class="menubox">\
						<div class="title bigfont">1</div>\
						<div class="value"><div class="checkmark selected ch1"></div></div>\
					</div>\
					<div class="menubox">\
						<div class="title bigfont">2</div>\
						<div class="value"><div class="checkmark ch2"></div></div>\
					</div>\
				</div>\
				\
				<!-- mode coupling menu -->\
				<div class="menu menu_modecoupling">\
					<div class="menubox">\
						<div class="menubox_icon arrowup" />\
						<span class="title"><img class="menuicon" src="%img%/menu_arrow_up.png" alt="arrow"/>Mode</span>\
						<span class="value mode">Auto Level</span>\
					</div>\
					<div class="menubox">\
						<div class="menubox_icon arrowup" />\
						<span class="title"><img class="menuicon" src="%img%/menu_arrow_up.png" alt="arrow"/>Coupling</span>\
						<span class="value coupling">DC</span>\
					</div>\
					<div class="menu_selection sel_trigger_mode">\
						<div class="title">Mode</div>\
						<hr />\
						<div class="selection sel_autolevel selected"><div class="checkmark_holder"><div class="checkmark" /></div><span>Auto Level</span></div>\
						<div class="selection sel_auto"><div class="checkmark_holder"><div class="checkmark" /></div><span>Auto</span></div>\
						<div class="selection sel_normal"><div class="checkmark_holder"><div class="checkmark" /></div><span>Normal</span></div>\
					</div>\
					<div class="menu_selection pos2 sel_trigger_coupling">\
						<div class="title">Coupling</div>\
						<hr />\
						<div class="selection sel_dc selected"><div class="checkmark_holder"><div class="checkmark" /></div><span>DC</span></div>\
						<div class="selection sel_ac"><div class="checkmark_holder"><div class="checkmark" /></div><span>AC</span></div>\
					</div>\
				</div>\
				\
			</div>\
		</div>\
	</div>\
	</div>';
	
	tpl = tpl.replace(/%img%/g, imgbase);
		
	elem.append(tpl);

	var prev = 0;
	
	function newHandleFunc(up, down)
	{
		up = up || function() {};
		down = down || function() {};
		return function(elem, deg, newTouch) {
			if (newTouch) prev = deg;
			var diff = deg - prev;
			// fixup the wrapping
			if (diff > 180) diff = -360 + diff;
			else if (diff < -180) diff = 360 + diff;
		
			if (Math.abs(diff) > 360/10) {
				prev = deg;
				//trace("diff: " + diff + " " + elem.html());
				if (diff < 0) down();
				else if (diff > 0) up();
				elem.find("img").toggleClass("active");
			}
			// dont return, we want it undefined
		}
	}
		
	// abuses the turnable to get events, but not turning the component at all
	elem.find(".horz_offset").turnable({turn: newHandleFunc(function() { trace("up");}, function() {trace("down");}) });
	
	elem.find(".offset_ch1").turnable({turn: newHandleFunc(function() { me._StepDisplayOffset(0, true); }, function() { me._StepDisplayOffset(0, false); }) });
	elem.find(".offset_ch2").turnable({turn: newHandleFunc(function() { me._StepDisplayOffset(1, true); }, function() { me._StepDisplayOffset(1, false); }) });
	
	elem.find(".offset_trg").turnable({turn: newHandleFunc(function() { trace("up");}, function() {trace("down");}) });
	elem.find(".horz").turnable({turn: newHandleFunc(function() { me._SetTimedivIdx(me._timeIdx+1); }, function() { me._SetTimedivIdx(me._timeIdx-1); }) });
	elem.find(".vert_ch1").turnable({turn: newHandleFunc(function() { me._SetVoltIdx(0, me._voltIdx[0]+1); }, function() { me._SetVoltIdx(0, me._voltIdx[0]-1);}) });
	elem.find(".vert_ch2").turnable({turn: newHandleFunc(function() { me._SetVoltIdx(1, me._voltIdx[1]+1); }, function() { me._SetVoltIdx(1, me._voltIdx[1]-1);}) });

	elem.find(".button").updownButton();
	elem.find(".channel_1").click( function() {
		// XXX: only toggle if its the active selection.. but we have no menus right now
		me._ToggleChEnabled(0);
	});
	elem.find(".channel_2").click( function() {
		// XXX: only toggle if its the active selection.. but we have no menus right now
		me._ToggleChEnabled(1);
	});
	elem.find(".button.edge").click( function() {
		// light up the edge button
		me._$elem.find(".multibutton.edge .state").removeClass("visible");
		me._$elem.find(".multibutton.edge .state.light").addClass("visible");
	
		me._ShowMenu("menu_edge");
	});
	
	elem.find(".button.modecoupling").click( function() {
		me._ShowMenu("menu_modecoupling");
	});
	
	elem.find(".display_button_1").click( function() { me._DisplayButtonClicked(1); })
	elem.find(".display_button_2").click( function() { me._DisplayButtonClicked(2); })
	elem.find(".display_button_3").click( function() { me._DisplayButtonClicked(3); })
	elem.find(".display_button_4").click( function() { me._DisplayButtonClicked(4); })
	elem.find(".display_button_5").click( function() { me._DisplayButtonClicked(5); })
	elem.find(".display_button_6").click( function() { me._DisplayButtonClicked(6); })
	
	this._plotWidth = this._$elem.find(".plot").width();
	this._plotHeight = this._$elem.find(".plot").height();
	
	me._DrawGrid(elem.find(".grid"));
	me._DrawPlot(elem.find(".plot"));	
	me._UpdateChannelDisplay(0);
	me._UpdateChannelDisplay(1);
	me._UpdateDisplay();
	
	this._menuHandlers = {
		'menu_channel_1': CreateChannelMenu(this, 0, this._$elem.find(".menu_channel_1"))
		, 'menu_channel_2': CreateChannelMenu(this, 1, this._$elem.find(".menu_channel_2"))
		, 'menu_edge': CreateEdgeMenu(this, this._$elem.find(".menu_edge"))
		, 'menu_modecoupling': CreateTriggerModeCouplingMenu(this, this._$elem.find(".menu_modecoupling"))
	}
}

extend(visir.AgilentOscilloscope, visir.Oscilloscope)

visir.AgilentOscilloscope.prototype._DrawGrid = function($elem)
{
	var context = $elem[0].getContext('2d');
	
	//context.strokeStyle = "#004000";
	context.strokeStyle = "#00ff00";
	context.lineWidth		= 0.5;
	context.beginPath();
	
	var len = 3.5;
	var w = $elem.width();
	var h = $elem.height();
	var xspacing = w / 10;
	var yspacing = h / 8;
	
	for(var i=1;i<=9;i++) {
		var x = xspacing * i;
		x += 0.5;
		context.moveTo(x, 0);
		context.lineTo(x, h);
	}

	for(var i=1;i<=10*5 ;i++) {
		if (i % 5 == 0) continue;
		var x = (xspacing / 5) * i;
		x += 0.5;
		var h2 = (h / 2) + 0.5;
		context.moveTo(x, h2 - len);
		context.lineTo(x, h2 + len);
	}

	for(var i=1;i<=7;i++) {
		var y = yspacing * i;
		context.moveTo(0, y+0.5);
		context.lineTo(w, y+0.5);
	}
	
	for(var i=1;i<=7*5 ;i++) {
		if (i % 4 == 0) continue;
		var y = (yspacing / 4) * i;
		y += 0.5;
		var w2 = (w / 2);
		w2 = Math.floor(w2) + 0.5;
		context.moveTo(w2 - len, y);
		context.lineTo(w2 + len, y);
	}
	
	context.stroke();
}

visir.AgilentOscilloscope.prototype._DrawPlot = function($elem)
{
	var context = $elem[0].getContext('2d');
	context.strokeStyle = "#00ff00";
	context.lineWidth		= 1.2;
	
	var w = this._plotWidth; //$elem.width();
	var h = this._plotHeight; //$elem.height();
	context.clearRect(0,0, w, h);
	context.beginPath();

	var me = this;
	// local draw function
	function DrawChannel(chnr) {
		if (!me._channels[chnr].visible) return;
		var ch = me._channels[chnr];
		var graph = ch.graph;
		var len = graph.length;
		for(var i=0;i<len;i++) {
			var x = i*w / len;
			var y = -((graph[i] / ch.range) + ch.display_offset) * (h / 8.0) + h/2;
			y+=0.5;
			if (i==0) context.moveTo(x,y);
			else context.lineTo(x,y);
		}
	}
	
	DrawChannel(0);
	DrawChannel(1);

	context.stroke();
}

visir.AgilentOscilloscope.prototype._SetVoltIdx = function(ch, idx)
{
	if (idx < 0) idx = 0;
	if (idx > this._voltages.length - 1) idx = this._voltages.length - 1;
	this._voltIdx[ch] = idx;
	//trace("idx: " + ch + " " + idx);
	 // sets value for serialization
	this._channels[ch].range = this._voltages[idx];
	this._channels[ch].offset = this._voltages[idx] * -this._channels[ch].display_offset;
	
	var indicatorName = (ch == 0 ? ".voltage_ch1" : ".voltage_ch2");
	var $indicator = this._$elem.find(indicatorName);
	$indicator.text(this._FormatValue(this._voltages[this._voltIdx[ch]]) + "V");
	this._LightIndicator($indicator);
	this._UpdateDisplay();
}

visir.AgilentOscilloscope.prototype._SetTimedivIdx = function(idx)
{
	if (idx < 0) idx = 0;
	if (idx > this._timedivs.length - 1) idx = this._timedivs.length - 1;
	this._timeIdx = idx;
	//trace("timediv idx: " + idx);
	this._sampleRate = 1.0 / this._timedivs[this._timeIdx]; // sets value for serialization
	var $indicator = this._$elem.find(".timediv");
	$indicator.text(this._FormatValue(this._timedivs[this._timeIdx]) + "s");
	this._LightIndicator($indicator);
	this._UpdateDisplay();
}

visir.AgilentOscilloscope.prototype._StepDisplayOffset = function(ch, up)
{
	var stepsize = 0.05;
	var val = this._channels[ch].display_offset + (up ? stepsize : -stepsize);
	this._SetDisplayOffset(ch, val);
}

visir.AgilentOscilloscope.prototype._SetDisplayOffset = function(ch, offset)
{
	var stepsize = 0.05;
	offset = Math.round(offset / stepsize) * stepsize;
	this._channels[ch].display_offset = offset;
	//trace("offset: " + offset);
	
	// set values for serialization
	this._channels[ch].offset = this._voltages[this._voltIdx[ch]] * -this._channels[ch].display_offset;
	
	// move and update offset indicators
	var $group = this._$elem.find(".display .vertical " + (ch == 0 ? ".offset_group_ch1" : ".offset_group_ch2"));
	$group.find(".ch_offset").removeClass("visible");
	if (offset >= 4) { // show overflow indicator
		$group.find(".overflow_up").addClass("visible");
	} else if (offset <= -4) { // show underflow indicator
		$group.find(".overflow_down").addClass("visible");
	} else { // show normal indicator and move it into position
		var $indicator = $group.find(".normal");
		var h = this._plotHeight;
		var top = -offset * (h / 8.0) + h/2;
		$indicator.addClass("visible");
		$indicator.css("top", top + "px");
	}

	this._UpdateDisplay();
}

// XXX: maybe rename to ChButtonPressed or something..
visir.AgilentOscilloscope.prototype._ToggleChEnabled = function(ch)
{
	var showMenu = "menu_channel_" + (ch+1);
	var visibile = this._activeMenu != showMenu || !this._channels[ch].visible;
	this._ShowMenu(showMenu);
	//this._SetChEnabled(ch, !this._channels[ch].visible);
	this._SetChEnabled(ch, visibile);
}

visir.AgilentOscilloscope.prototype._ToggleChCoupling = function(ch)
{
	this._channels[ch].coupling = (this._channels[ch].coupling == "dc") ? "ac" : "dc";
}

visir.AgilentOscilloscope.prototype._SetChEnabled = function(ch, enabled)
{
	this._channels[ch].visible = enabled;
	this._UpdateChannelDisplay(ch);
	this._UpdateDisplay();
}

visir.AgilentOscilloscope.prototype._SetTriggerSlope = function(slope)
{
	this._trigger.slope = slope;
	this._$elem.find(".display .triggerslope .flank.selected").removeClass("selected");
	this._$elem.find(".display .triggerslope .flank." +slope).addClass("selected");
}

visir.AgilentOscilloscope.prototype._SetTriggerSource = function(ch)
{
	this._trigger.source = ch;
	this._$elem.find(".display .triggersource .channelname").text(ch);
}

visir.AgilentOscilloscope.prototype._SetTriggerMode = function(modeIdx)
{
	if (modeIdx < 0 || modeIdx >= this._triggerModes.length) throw "invalid trigger mode index";
	this._triggerModeIdx = modeIdx;
	this._trigger.mode = this._triggerModes[modeIdx];
	
	this._$elem.find(".lighttext.triggermode").text(this._triggerModesLight[modeIdx]);
}

visir.AgilentOscilloscope.prototype._ShowMenu = function(menuname)
{
	var $menu = this._$elem.find(".menu." + menuname);
	if ($menu.length == 0) throw "unable to find menu: " + menuname;
	this._$elem.find(".display .menubar .menu").removeClass("visible");
	$menu.addClass("visible");
	
	this._activeMenu = menuname;
	this._activeMenuHandler = this._menuHandlers[menuname];
	var name = this._activeMenuHandler.GetName();
	this._$elem.find(".display .menubar .menutitle .titlebox").text(name);
	this._$elem.find(".display .menubar .menutitle").addClass("visible");

	if (this._menuTitleTimer) clearInterval(this._menuTitleTimer);
	var me = this;
	this._menuTitleTimer = setTimeout( function() { me._$elem.find(".display .menubar .menutitle").removeClass("visible"); this._menuTitleTimer = null; }, 1000)
}

visir.AgilentOscilloscope.prototype._DisplayButtonClicked = function(button)
{
	if (this._activeMenuHandler && this._activeMenuHandler.ButtonPressed) {
		this._activeMenuHandler.ButtonPressed(button);
	}
}

visir.AgilentOscilloscope.prototype._GetUnit = function(val)
{
	var units = [
		, ["M", 6 ]
		, ["K", 3 ]
		, ["", 0]
		, ["m", -3]
		, ["u", -6]
		, ["n", -9]
		];
	val = Math.abs(val);
	var unit = "";
	var div = 0;
	if (val == 0) return { unit: unit, pow: div };
	
	for (var key in units) {
		var unit = units[key];
		if (val >= Math.pow(10, unit[1])) {
			return {unit: unit[0], pow: unit[1] };
		}
	}
	
	var last = units[units.length - 1];
	return {unit: last[0], pow: last[1] };
}

visir.AgilentOscilloscope.prototype._LightIndicator = function($elem)
{
	if (this._activeIndicator && this._activeIndicator.Destroy) {
		this._activeIndicator.Destroy();
		this._activeIndicator = null;
	}
	
	var me = this;
	$elem.addClass("light");
	var timer = setTimeout(function() {
		me._activeIndicator.Destroy();
		me._activeIndicator = null;
	}, 2000);
	
	this._activeIndicator = {
		Destroy: function() { $elem.removeClass("light"); clearInterval(timer); }
	}
}

visir.AgilentOscilloscope.prototype._FormatValue = function(val)
{
	var unit = this._GetUnit(val);
	val /= Math.pow(10,unit.pow);
	return val.toPrecision(3) + unit.unit;
}

// this should be called when the channel properties have changed
// currently: visible is tracked
visir.AgilentOscilloscope.prototype._UpdateChannelDisplay = function(ch)
{
		var css_ch_name = ".channel." + (ch==0 ? "ch1" : "ch2");
		var css_group_name = ".display .vertical .offset_group_" + (ch==0 ? "ch1" : "ch2");
		var css_button_name = ".multibutton.channel_" + (ch+1);
		if (this._channels[ch].visible) {
			this._$elem.find(css_ch_name).addClass("visible");
			this._$elem.find(css_group_name).addClass("visible");
			this._$elem.find(css_button_name).find(".state").removeClass("visible");
			this._$elem.find(css_button_name).find(".light").addClass("visible");
		} else {
			this._$elem.find(css_ch_name).removeClass("visible");
			this._$elem.find(css_group_name).removeClass("visible");
			this._$elem.find(css_button_name).find(".state").removeClass("visible");
			this._$elem.find(css_button_name).find(".dark").addClass("visible");
		}
}

visir.AgilentOscilloscope.prototype._UpdateDisplay = function()
{
		this._$elem.find(".voltage_ch1").text(this._FormatValue(this._voltages[this._voltIdx[0]]) + "V");
		this._$elem.find(".voltage_ch2").text(this._FormatValue(this._voltages[this._voltIdx[1]]) + "V");
		this._$elem.find(".timediv").text(this._FormatValue(this._timedivs[this._timeIdx]) + "s");
						
		this._DrawPlot(this._$elem.find(".plot"));
}

visir.AgilentOscilloscope.prototype.ReadResponse = function(response) {
	visir.AgilentOscilloscope.parent.ReadResponse.apply(this, arguments)
	this._DrawPlot(this._$elem.find(".plot"));
}

function CreateChannelMenu(osc, ch, $menu)
{
	var me = osc;
	var timer = null;
	return {
		GetName: function() { return "Channel " + (ch+1) + " Menu"; },
		ButtonPressed: function(nr) {
			switch(nr) {
				case 1:
					$menu.find(".menu_selection.sel_ch_" + (ch+1)).addClass("visible");
					var menu = this;
					if (!timer) {
						timer = setTimeout(function() { timer=null; menu.HideMenu(); }, 1000);
						return;
					} else {
						clearInterval(timer);
						timer = setTimeout(function() { timer=null; menu.HideMenu(); }, 1000);
					}
					osc._ToggleChCoupling(ch);
					this.Redraw();
				break;
			}
			
		},
		Redraw: function() {
			var coupling = osc._channels[ch].coupling;
			$menu.find(".value.coupling").text(coupling.toUpperCase());
			$menu.find(".selection").removeClass("selected");
			$menu.find(".selection.sel_" + coupling).addClass("selected");
		},
		HideMenu: function() {
			$menu.find(".menu_selection.sel_ch_" + (ch+1)).removeClass("visible");
		}
	}
}

function CreateEdgeMenu(osc, $menu)
{
	var me = osc;
	var timer = null;
	return {
		GetName: function() { return "Edge Menu"; },
		ButtonPressed: function(nr) {
			switch(nr) {
				case 1:
					// move this to function, we need to update other stuff
					osc._SetTriggerSlope((osc._trigger.slope == "positive") ? "negative" : "positive");
				break;
				case 2:
					osc._SetTriggerSource(1);
				break;
				case 3:
					osc._SetTriggerSource(2);
				break;
			}
			this.Redraw();
		},
		Redraw: function() {
			$menu.find(".edgeselect.selected").removeClass("selected");
			$menu.find(".edgeselect." + osc._trigger.slope).addClass("selected");
			$menu.find(".menubox .value .checkmark").removeClass("selected");
			$menu.find(".menubox .value .checkmark.ch"+ osc._trigger.source).addClass("selected");
		}
	}
}

function CreateTriggerModeCouplingMenu(osc, $menu)
{
	var me = osc;
	var timer = null;
	return {
		GetName: function() { return "Mode / Coupling Menu"; this.Redraw(); },
		ButtonPressed: function(nr) {
			switch(nr) {
				case 1:
					if (!this.ShowMenu("sel_trigger_mode")) return;
					var tmp = osc._triggerModeIdx + 1;
					if (tmp >= osc._triggerModes.length) tmp = 0;
					osc._SetTriggerMode(tmp);
				break;
				case 2:
					if (!this.ShowMenu("sel_trigger_coupling")) return;
					osc._trigger.coupling = (osc._trigger.coupling == "dc") ? "ac" : "dc";
				break;
			}
			this.Redraw();
		},
		Redraw: function() {
			$menu.find(".selection").removeClass("selected");
			$menu.find(".sel_trigger_mode .sel_" + osc._triggerModes[osc._triggerModeIdx]).addClass("selected");
			$menu.find(".sel_trigger_coupling .sel_" + osc._trigger.coupling).addClass("selected");
			$menu.find(".value.coupling").text(osc._trigger.coupling.toUpperCase());
			$menu.find(".value.mode").text(osc._triggerModesDisplay[osc._triggerModeIdx]);
		},
		ShowMenu: function(name) {
			this.HideMenu();
			$menu.find(".menu_selection." + name).addClass("visible");
			var menu = this;
			if (!timer) {
				timer = setTimeout(function() { timer=null; menu.HideMenu(); }, 1000);
				return false;
			} else {
				clearInterval(timer);
				timer = setTimeout(function() { timer=null; menu.HideMenu(); }, 1000);
				return true;
			}
		},
		HideMenu: function() {
			$menu.find(".menu_selection").removeClass("visible");
		}
	}
}
