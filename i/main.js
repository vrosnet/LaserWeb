/*

    LaserWeb - A Web Based Marlin Laser cutter Controller
    Copyright (C) 2015 Andrew Hodel & Peter van der Walt

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

// Specific to your machine.  Also see same config in ui.js



$(document).ready(function() {

  $('.spinner .btn:first-of-type').on('click', function() {
    $('.spinner input').val( parseInt($('.spinner input').val(), 10) + 100);
  });
  $('.spinner .btn:last-of-type').on('click', function() {
    $('.spinner input').val( parseInt($('.spinner input').val(), 10) - 100);
  });

	var socket = io.connect(''); // socket.io init
	var gCodeToSend = null; // if uploaded file is gcode
	var localPresets = []; // locally stored presets
	var defaultSlicer = 'cura';
	var baseSlOpts;
	
	// Millcrum
	var ogcode = document.getElementById('fileInputGcode');
	var odxf = document.getElementById('fileInputDXF');
	var osvg = document.getElementById('fileInputSVG');
	var omc = document.getElementById('fileInputMILL');
	var millcrumCode = document.getElementById('millcrumCode');
	var toSaveGcode = '';
	var generate = document.getElementById('generate');
	var sgc = document.getElementById('saveGcode');
	/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
	var saveAs=saveAs||function(e){"use strict";if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var t=e.document,n=function(){return e.URL||e.webkitURL||e},o=t.createElementNS("http://www.w3.org/1999/xhtml","a"),r="download"in o,i=function(n){var o=t.createEvent("MouseEvents");o.initMouseEvent("click",!0,!1,e,0,0,0,0,0,!1,!1,!1,!1,0,null),n.dispatchEvent(o)},a=e.webkitRequestFileSystem,c=e.requestFileSystem||a||e.mozRequestFileSystem,u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},f="application/octet-stream",s=0,d=500,l=function(t){var o=function(){"string"==typeof t?n().revokeObjectURL(t):t.remove()};e.chrome?o():setTimeout(o,d)},v=function(e,t,n){t=[].concat(t);for(var o=t.length;o--;){var r=e["on"+t[o]];if("function"==typeof r)try{r.call(e,n||e)}catch(i){u(i)}}},p=function(e){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)?new Blob(["\ufeff",e],{type:e.type}):e},w=function(t,u){t=p(t);var d,w,y,m=this,S=t.type,h=!1,O=function(){v(m,"writestart progress write writeend".split(" "))},E=function(){if((h||!d)&&(d=n().createObjectURL(t)),w)w.location.href=d;else{var o=e.open(d,"_blank");void 0==o&&"undefined"!=typeof safari&&(e.location.href=d)}m.readyState=m.DONE,O(),l(d)},R=function(e){return function(){return m.readyState!==m.DONE?e.apply(this,arguments):void 0}},b={create:!0,exclusive:!1};return m.readyState=m.INIT,u||(u="download"),r?(d=n().createObjectURL(t),o.href=d,o.download=u,i(o),m.readyState=m.DONE,O(),void l(d)):(e.chrome&&S&&S!==f&&(y=t.slice||t.webkitSlice,t=y.call(t,0,t.size,f),h=!0),a&&"download"!==u&&(u+=".download"),(S===f||a)&&(w=e),c?(s+=t.size,void c(e.TEMPORARY,s,R(function(e){e.root.getDirectory("saved",b,R(function(e){var n=function(){e.getFile(u,b,R(function(e){e.createWriter(R(function(n){n.onwriteend=function(t){w.location.href=e.toURL(),m.readyState=m.DONE,v(m,"writeend",t),l(e)},n.onerror=function(){var e=n.error;e.code!==e.ABORT_ERR&&E()},"writestart progress write abort".split(" ").forEach(function(e){n["on"+e]=m["on"+e]}),n.write(t),m.abort=function(){n.abort(),m.readyState=m.DONE},m.readyState=m.WRITING}),E)}),E)};e.getFile(u,{create:!1},R(function(e){e.remove(),n()}),R(function(e){e.code===e.NOT_FOUND_ERR?n():E()}))}),E)}),E)):void E())},y=w.prototype,m=function(e,t){return new w(e,t)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(e,t){return navigator.msSaveOrOpenBlob(p(e),t)}:(y.abort=function(){var e=this;e.readyState=e.DONE,v(e,"abort")},y.readyState=y.INIT=0,y.WRITING=1,y.DONE=2,y.error=y.onwritestart=y.onprogress=y.onwrite=y.onabort=y.onerror=y.onwriteend=null,m)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);"undefined"!=typeof module&&module.exports?module.exports.saveAs=saveAs:"undefined"!=typeof define&&null!==define&&null!=define.amd&&define([],function(){return saveAs});
	var localMc = new Millcrum();
	
	socket.emit('firstLoad', 1);

	socket.on('serverError', function (data) {
		alert(data);
	});

	socket.on('ports', function (data) {
		//console.log('ports event',data);
		$('#choosePort').html('<option val="no">Select a serial port</option>');
		for (var i=0; i<data.length; i++) {
			$('#choosePort').append('<option value="'+i+'">'+data[i].comName+'</option>');
		}
		if (data.length == 1) {
			// select first and only
			$('#choosePort').val('0');
			$('#choosePort').change();
		}
	});

	// Enable the buttons once a port is selected
	$("#choosePort").change(function () {
        $('#openMachineControl').removeClass('disabled');
		$('#sendCommand').removeClass('disabled');	
    });

	// config options from server
	socket.on('config', function (data) {
		//console.log(data);
		laserxmax = data.xmax
		laserymax = data.ymax

		if (data.showWebCam == true) {
			// show the webcam and link
			var webroot = window.location.protocol+'//'+window.location.hostname;
			console.log(webroot);
			$('#wcImg').attr('src', webroot+':'+data.webcamPort+'/?action=stream');
			$('#wcLink').attr('href', webroot+':'+data.webcamPort+'/javascript_simple.html');
			$('#webcam').show();
		}
	
	});

	socket.on('qStatus', function (data) {
		var pct = 100-((data.currentLength/data.currentMax)*100);
		if (isNaN(pct)) { pct = 0; }
		$('#qStatus').html(Math.round(pct*100)/100+'%');
		var hWidth = Number($('#qStatusHolder').width());
		$('#qStatus').css('width',(pct*hWidth/100)+'px');
	});

	socket.on('serialRead', function (data) {
		if ($('#console p').length > 300) {
			// remove oldest if already at 300 lines
			$('#console p').first().remove();
		}
		var col = 'green';
		if (data.c == '1') {
			col = 'red';
		} else if (data.c == '2') {
			col = '#555';
		} else if (data.c == '3') {
			col = 'black';
		}
		$('#console').append('<p class="pf" style="color: '+col+';">'+data.l+'</p>');
		$('#console').scrollTop($("#console")[0].scrollHeight - $("#console").height());
	});

	
	$('#choosePort').on('change', function() {
		// select port
		socket.emit('usePort', $('#choosePort').val());
	});

	$('#sendCommand').on('click', function() {

		socket.emit('gcodeLine', { line: $('#command').val() });
		$('#command').val('');

	});

	// shift enter for send command
	$('#command').keydown(function (e) {
		if (e.shiftKey) {
			var keyCode = e.keyCode || e.which;
			if (keyCode == 13) {
				// we have shift + enter
				$('#sendCommand').click();
				// stop enter from creating a new line
				e.preventDefault();
			}
		}
	});

	
	$('#xM01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X-0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	
	$('#xM').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X-1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#xMTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X-10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#xMCen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X-100 F'+$('#jogSpeed').val()+'\nG90' });
	});
	
	$('#xP01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#xP').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#xPTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#xPCen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 X100 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yP01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});
	
	$('#yP').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yPTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yPCen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y100 F'+$('#jogSpeed').val()+'\nG90' });
	});
	
	$('#yM01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y-0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yM').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y-1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yMTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y-10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#yMCen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Y-100 F'+$('#jogSpeed').val()+'\nG90' });
	});

	
	$('#zP01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	
	$('#zP').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#zPTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#zM01').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z-0.1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#zM').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z-1 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#zMTen').on('click', function() {
		socket.emit('gcodeLine', { line: 'G91\nG0 Z-10 F'+$('#jogSpeed').val()+'\nG90' });
	});

	$('#homeX').on('click', function() {
		socket.emit('gcodeLine', { line: 'G28 X0' });
	});
	
	$('#homeY').on('click', function() {
		socket.emit('gcodeLine', { line: 'G28 Y0' });
	});

	$('#homeZ').on('click', function() {
		socket.emit('gcodeLine', { line: 'G28 Z0' });
	});

	$('#homeAll').on('click', function() {
		socket.emit('gcodeLine', { line: 'G28' });
	});

	$('#pause').on('click', function() {
		if ($('#pause').html() == 'Pause') {
			// pause queue on server
			socket.emit('pause', 1);
			$('#pause').html('Unpause');
			$('#clearQ').removeClass('disabled');
		} else {
			socket.emit('pause', 0);
			$('#pause').html('Pause');
			$('#clearQ').addClass('disabled');
		}
	});
	
	$('#mcC').on('click', function() {
		$('#mcA').addClass('active');
		$('#gcA').removeClass('active');
		$('#mPosition').show();
		$('#wPosition').hide();
	});

	$('#gcC').on('click', function() {
		$('#gcA').addClass('active');
		$('#mcA').removeClass('active');
		$('#wPosition').show();
		$('#mPosition').hide();
	});

	
	$('#openMachineControl').on('click', function() {
		$('#machineControl').modal('toggle');
	});

	$('#clearQ').on('click', function() {
		// if paused let user clear the command queue
		socket.emit('clearQ', 1);
		$('#sendToLaser').removeClass('disabled');
		// must clear queue first, then unpause (click) because unpause does a sendFirstQ on server
		$('#pause').click();
	});

	// Enable sendToLaser if we receive gcode in #gcodepreview
	$("#gcodepreview").change(function () {
		openGCodeFromText();
        $('#openMachineControl').removeClass('disabled');
		$('#sendCommand').removeClass('disabled');	
		$('#sendToLaser').removeClass('disabled');
    });
	
	$('#sendToLaser').on('click', function() {
		$('#sendToLaser').addClass('disabled');
		$('#mainStatus').html('Status: Printing');
		socket.emit('gcodeLine', { line: $('#gcodepreview').val() });  //Works with Gcode pasted in #gcodepreview too (:
		$('#gcodepreview').val('');
	});
	
	$('#sendCommand').on('click', function() {

		socket.emit('gcodeLine', { line: $('#command').val() });
		$('#command').val('');Work
	});

	$('#motorsOff').on('click', function() {
		socket.emit('gcodeLine', { line: 'M84' }); 
	});

	$('#fanOn').on('click', function() {
		socket.emit('gcodeLine', { line: 'M106' }); 
	});
	
	$('#fanOff').on('click', function() {
		socket.emit('gcodeLine', { line: 'M107' }); 
	});

	
	$('#command').keyup(function(event){
		if(event.keyCode == 13){
			$('#sendCommand').click();
		}
	});

	// handle generate click
	generate.addEventListener("click", function() {

		// remove any open pathInfo
		//pathInfo.style.display = 'none';

		// reset clickPaths
		clickPaths = [];

		// this gets the text (no html nodes so no formatting) of the millcrum code
		var mcCode = document.getElementById('millcrumCode').value

		try {
			eval(mcCode);
		} catch (e) {
			// log it to the alert window
			//console.log('Millcrum Code Error: '+mcCode);
			//console.log('Millcrum Code Error');
		}

		// set saveGcode to visible
		//sgc.style.display = 'inline';
		// Execute Gcode toSaveGcode -> inject to gcodepreview here

	});


	
		// save .gcode
		sgc.addEventListener('click', function() {
		console.log(toSaveGcode);
		var blob = new Blob([toSaveGcode]);
		saveAs(blob, 'output.gcode', true);
	});


	// open .gcode
	
	ogcode.addEventListener('change', function(e) {
		console.log("Open GCode")
		$('#sendToLaser').addClass('disabled');
		var fileInputGcode = document.getElementById('fileInputGcode');
		var r = new FileReader();
		r.readAsText(fileInputGcode.files[0]);
		r.onload = function(e) {
				scene.remove(object);
				scene.remove(cylinder);
				scene.remove(helper);
				scene.remove(axesgrp);
				// load gcode-viewer
				//openGCodeFromText(this.result);
				document.getElementById('millcrumCode').value = '';
				document.getElementById('gcodepreview').value = this.result;
				$('#gcC').click();
				openGCodeFromText();
				gCodeToSend = this.result;
				$('#fileStatus').html('File Loaded: '+fileInputGcode.value+' as GCODE');
				$('#mainStatus').html('Status: GCODE for '+fileInputGcode.value+' loaded and ready to cut...');
				$('#sendToLaser').removeClass('disabled');
				document.getElementById('fileInputGcode').value = '';
				document.getElementById('fileInputDXF').value = '';
				document.getElementById('fileInputSVG').value = '';
				document.getElementById('fileInputMILL').value = '';
			}
		});

	
	
	// open .dxf
	odxf.addEventListener('change', function(e) {
		$('#sendToLaser').addClass('disabled');
		var r = new FileReader();
		r.readAsText(odxf.files[0]);
		r.onload = function(e) {

		
			var fileName = document.getElementById('fileInputDXF');

			var dxf = new Dxf();

			dxf.parseDxf(r.result);

			var errStr = '';
			if (dxf.invalidEntities.length > 0) {
				for (var c=0; c<dxf.invalidEntities.length; c++) {
					errStr += 'Invalid Entity: '+dxf.invalidEntities[c] + '\n';
				}
				errStr += '\n';
			}

			if (dxf.alerts.length > 0) {
				for (var c=0; c<dxf.alerts.length; c++) {
					errStr += dxf.alerts[c] + '\n\n';
				}
			}

			if (errStr != '') {
				console.log('DXF Errors:'+errStr);
			}

			var s = 'var tool = {units:"mm",diameter:6.35,passDepth:4,step:1,rapid:2000,plunge:100,cut:600,zClearance:5,returnHome:true};\n\n';
			s += '// setup a new Millcrum object with that tool\nvar mc = new Millcrum(tool);\n\n';
			s += '// set the surface dimensions for the viewer\nmc.surface('+(dxf.width*1.1)+','+(dxf.height*1.1)+');\n\n\n';

			// convert polylines to millcrum
			for (var c=0; c<dxf.polylines.length; c++) {
				if (dxf.polylines[c].layer == '') {
					// name it polyline+c
					dxf.polylines[c].layer = 'polyline'+c;
				}
				s += '//LAYER '+dxf.polylines[c].layer+'\n';
				s += 'var polyline'+c+' = {type:\'polygon\',name:\''+dxf.polylines[c].layer+'\',points:[';
				for (var p=0; p<dxf.polylines[c].points.length; p++) {
					s += '['+dxf.polylines[c].points[p][0]+','+dxf.polylines[c].points[p][1]+'],';
				}

				s += ']};\nmc.cut(\'centerOnPath\', polyline'+c+', 4, [0,0]);\n\n';
			}

			// convert lines to millcrum
			for (var c=0; c<dxf.lines.length; c++) {
				s += 'var line'+c+' = {type:\'polygon\',name:\'line'+c+'\',points:[';
				s += '['+dxf.lines[c][0]+','+dxf.lines[c][1]+'],';
				s += '['+dxf.lines[c][3]+','+dxf.lines[c][4]+'],';

				s += ']};\nmc.cut(\'centerOnPath\', line'+c+', 4, [0,0]);\n\n';
			}

			s += '\nmc.get();\n';

			//console.log(s+'\n DXF Converted to Millcrum');
			// load the new millcrum code
			document.getElementById('millcrumCode').value = s;
				
			//millcrumCode.innerHTML = hljs.highlight('javascript',s).value;
			// convert the .millcrum to gcode
			document.getElementById('gcodepreview').value = '';
			generate.click();
			$('#mcC').click();
			openGCodeFromText();
			gCodeToSend = document.getElementById('gcodepreview').value;
			$('#fileStatus').html('File Loaded: '+fileName.value+' as DXF');
			$('#mainStatus').html('Status: GCODE for '+fileName.value+' loaded and ready to cut...');
			$('#sendToLaser').removeClass('disabled');
			document.getElementById('fileInputGcode').value = '';
			document.getElementById('fileInputDXF').value = '';
			document.getElementById('fileInputSVG').value = '';
			document.getElementById('fileInputMILL').value = '';
			
			
		}
	});

	// open .svg
	osvg.addEventListener('change', function(e) {
		$('#sendToLaser').addClass('disabled');
		var r = new FileReader();
		r.readAsText(osvg.files[0]);
		r.onload = function(e) {

			var fileName = document.getElementById('fileInputSVG');
			var svg = new Svg();
			svg.process(r.result);

			console.log('\n\nall paths',svg.paths);
			console.log('svg units '+svg.units);

			if (svg.alerts.length > 0) {
				var errStr = '';
				for (a in svg.alerts) {
					errStr += svg.alerts[a]+'\n\n';
				}
				doAlert(errStr, 'SVG Errors:');
			}

			// now that we have a proper path in absolute coordinates regardless of transforms, matrices or relative/absolute coordinates
			// we can write out the millcrum (clean) code

			// we need to flip all the y points because svg and cnc are reverse
			// this way, regardless, what people draw is what they get on the machine
			// that requires getting the actual min and max, moving everything into the positive
			// then flipping the y

			// millcrum code holder
			var s = 'var tool = {units:"mm",diameter:6.35,passDepth:4,step:1,rapid:2000,plunge:100,cut:600,zClearance:5,returnHome:true};\n\n';
			s += '// setup a new Millcrum object with that tool\nvar mc = new Millcrum(tool);\n\n';
			s += '// set the surface dimensions for the viewer, svg import specified '+svg.units+'\nmc.surface('+svg.width+','+svg.height+');\n\n\n';

			// now loop through the paths and write them to mc code
			for (var c=0; c<svg.paths.length; c++) {
				s += 'var polygon'+c+' = {type:\'polygon\',name:\'polygon'+c+'\',points:['
				for (var p=0; p<svg.paths[c].length; p++) {
					svg.paths[c][p][1] = svg.height-svg.paths[c][p][1];
					s += '['+svg.paths[c][p][0]+','+svg.paths[c][p][1]+'],';
				}
				s += ']};\n';
				s += 'mc.cut(\'centerOnPath\', polygon'+c+', 4, [0,0]);\n\n'
			}


			s += 'mc.get();\n\n';

						//console.log(s+'\n DXF Converted to Millcrum');
			// load the new millcrum code
			document.getElementById('millcrumCode').value = s;
				
			//millcrumCode.innerHTML = hljs.highlight('javascript',s).value;
			// convert the .millcrum to gcode
			document.getElementById('gcodepreview').value = '';
			generate.click();
			$('#mcC').click();
			openGCodeFromText();
			gCodeToSend = document.getElementById('gcodepreview').value;
			$('#fileStatus').html('File Loaded: '+fileName.value+' as DXF');
			$('#mainStatus').html('Status: GCODE for '+fileName.value+' loaded and ready to cut...');
			$('#sendToLaser').removeClass('disabled');
			document.getElementById('fileInputGcode').value = '';
			document.getElementById('fileInputDXF').value = '';
			document.getElementById('fileInputSVG').value = '';
			document.getElementById('fileInputMILL').value = '';
		}
	});

	// open .millcrum
	omc.addEventListener('change', function(e) {
		var r = new FileReader();
		r.readAsText(omc.files[0]);
		r.onload = function(e) {
			// load the file
			var fileName = document.getElementById('fileInputMILL');
			document.getElementById('gcodepreview').value = '';
			
			document.getElementById('millcrumCode').value = this.result;
			
			generate.click();
			$('#mcC').click();
			openGCodeFromText();
			gCodeToSend = document.getElementById('gcodepreview').value;
			$('#fileStatus').html('File Loaded: '+fileName.value+' as DXF');
			$('#mainStatus').html('Status: GCODE for '+fileName.value+' loaded and ready to cut...');
			$('#sendToLaser').removeClass('disabled');
			document.getElementById('fileInputGcode').value = '';
			document.getElementById('fileInputDXF').value = '';
			document.getElementById('fileInputSVG').value = '';
			document.getElementById('fileInputMILL').value = '';
		}
	});

	// Position
	// data =  X:100.00 Y:110.00 Z:10.00 E:0.00
	socket.on('posStatus', function(data) {
			data = data.replace(/:/g,' ');
			data = data.replace(/X/g,' ');
			data = data.replace(/Y/g,' ');
			data = data.replace(/Z/g,' ');
			data = data.replace(/E/g,' ');
			var posArray = data.split(/(\s+)/);
			//console.log(posArray);   
			//console.log('Xpos '+posArray[2]); 
			//console.log('Ypos '+posArray[4]); 
			//console.log('Zpos '+posArray[6]);  
			//console.log('Epos '+posArray[8]); 
			$('#mX').html('X: '+posArray[2]);
			$('#mY').html('Y: '+posArray[4]);
			$('#mZ').html('Z: '+posArray[6]);
			cylinder.position.x = (parseInt(posArray[2],10) - (laserxmax /2));
			cylinder.position.y = (parseInt(posArray[4],10) - (laserymax /2));
			cylinder.position.z = (parseInt(posArray[6],10) + 20);
			
			
			
	});
	
	
	// Endstop
	// data = echo:endstops hit:  Y:154.93
	socket.on('endstopAlarm', function(data) {
			console.log("Endstop Hit!");
			data = data.replace(/:/g,' ');
			var esArray = data.split(/(\s+)/);
			console.log(esArray);  // ["echo", " ", "endstops", " ", "hit", "   ", "X", " ", "71.61"]
			$('.bottom-left').notify({
				message: { text: 'WARNING: '+esArray[6]+' Axis Endstop Hit' },
				// settings
				type: 'danger'
			}).show(); // for the ones that aren't closable and don't fade out there is a .hide() function.
	});
	
	// Unknown Command
	//data = echo:Unknown command: "X26.0480 Y29.1405 R7.4125"   unknownGcode
	socket.on('unknownGcode', function(data) {
			//console.log("Unknown GCode");
			var gcArray = data.split(/:/);   
			console.log(gcArray);  // ["echo", "Unknown command", " "X11.4089 Y29.4258 R1.9810""]
			// NB MIGHT MAKE IT PAUSE WHEN THIS HAPPENS, A WRONG COMMAND MIGHT ANYWAY MEAN A RUINED JOB
			$('.bottom-left').notify({
				message: { text: 'Unknown GCODE: '+gcArray[2] },
				// settings
				type: 'warning'
			}).show(); // for the ones that aren't closable and don't fade out there is a .hide() function.
	});
	
	// temperature
	// data = T:24.31 /0 @:0 B:24.31 /0 @:0
	socket.on('tempStatus', function(data) {
		if (data.indexOf('ok') == 0) {
			// this is a normal temp status
			//  data is "x_min:L x_max:L y_min:L y_max:L z_min:L z_max:L"
			var fs = data.split(/[TB]/);
			var t = fs[1].split('/');
			var b = fs[2].split('/');
			t[0] = t[0].slice(1);
			b[0] = b[0].slice(1);
			for (var i=0; i<2; i++) {
				t[i] = t[i].trim();
				b[i] = b[i].trim();
			}
			// t[0] = extruder temp, t[1] = extruder set temp
			// b[0] = bed temp, b[1] = bed set temp
			$('#eTC').html(t[0]+'C');
			$('#eTS').html(t[1]+'C');
			$('#bTC').html(b[0]+'C');
			$('#bTS').html(b[1]+'C');

		} else {
			// this is a waiting temp status
			// get extruder temp
			var eT = data.split('T');
			eT = eT[1].split('E');
			eT = eT[0].slice(1);
			eT = eT.trim();
			$('#eTC').html(eT+'C');
		}
	});
});
