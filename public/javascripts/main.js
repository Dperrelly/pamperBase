$('#wrapper').hide();
function main(){
	var ss = gapi.client.sheets.spreadsheets;
	var appointmentsId = "1g_RV4hpbn-dJ5GsfyHHOZ6a3FxHecevTmts84kN2jp8";
	var peopleId = "1LRsyBbR57X9Gc2z1CLeUnHXkEpCiIwacnm2Hj4DbWSI";
	var servuctsId = '1S0rzD4T5ougGfzZGqp6H8bm-QP8Zy29oPJeQpDiUYQ0';
	var inventoryId = '18y6mvDC7vVcNISpyU7_Xuq_NSxVUcv8ZMhyz-xkHaLU';
	var currentServuctName = "";
	var currentPersonId = 'iql3hgup';
	var updateAppt = false;
	var currentAppointmentId = null;
	var currentServuctId = null;
	var currentServuctType = null;
	var people = [];
	var appointments = [];
	var servucts = [];
	var inventory = [];
	var newAppt = false;
	var selectedServuct;
	var apptKey = {};
	var parseTimeRegex1 = /^(\d+)/;
	var parseTimeRegex2 = /:(\d+)/;
	var parseTimeRegex3 = /\s(.*)$/;

	$('#time').timepicker({
	    timeFormat: 'h:mm p',
	    dropdown: false,
	});

	function Number(str){
		if(typeof str === "string"){
			var numberNoCommas = str.replace(/,/g, '');
    		return parseFloat(numberNoCommas);
		} else 
		if(typeof str === "number") return str;
	}

	function parseTime(time){
		if(!time) time = "12:00 PM";
		var hours = Number(time.match(parseTimeRegex1)[1]);
		var minutes = Number(time.match(parseTimeRegex2)[1]);
		var AMPM = time.match(parseTimeRegex3)[1];
		if(AMPM == "PM" && hours<12) hours = hours+12;
		if(!time) time = "12:00 PM";
		if(AMPM == "AM" && hours==12) hours = hours-12;
		var sHours = hours.toString();
		var sMinutes = minutes.toString();
		if(hours<10) sHours = "0" + sHours;
		if(minutes<10) sMinutes = "0" + sMinutes;
		return sHours + ":" + sMinutes + ":00";
	}

	function twoNumberDecimal(number) {
		if(number === "") return 0;
	    return parseFloat(number).toFixed(2);
	}

	function selectServuct(event){
		var selected = $(this);
		$(".select-servuct").css("background-color", '#DBE8DC');
		selected.css("background-color", '#e6ffe6');
		selectedServuct = [
		];
		selected.children().each(function(){
			selectedServuct.push($(this).text());
		});
		console.log(selectedServuct);
	}

	var calendarSetup = function(){
		var events = [];
		appointments.forEach(function(appointment){
			var first, last;
			people.forEach(function(person){
				if(person[0] === appointment[1]){
					first = person[1];
					last = person[2];
				}
			});

			var now = new Date(), past;
		  	now = now.getFullYear() + "-" + 
		  	("0" + (now.getMonth() + 1)).slice(-2) + "-" + 
		  	("0" + now.getDate()).slice(-2);
			past = appointment[7] < now;

			events.push({
				id: appointment[0],
				clientId: appointment[1],
				start: appointment[7] + "T" + parseTime(appointment[6]),
				title: last,
				past: past
			});
		});
		$('#calendar').fullCalendar({
            events: events,
            height: 800,
            contentHeight: 800,
            eventClick: function(event) {
            	currentPersonId = event.clientId;
            	loadPerson(currentPersonId);
            	$('#clientLink').trigger('click');
		    },
		    eventRender: function(event, element) {
		      if (event.past)
		        element.addClass("past");
		    }
	    });
	    $('#cat').hide();
		$('#wrapper').fadeTo(400, 1.0);
	    $('#calendar').fullCalendar('render');
	};

	function calculateGrandTotal(){
		var total = 0;
		var tax = $('#tax').val();
		var tip = $('#tip').val();
		var discount = $('#discount').html().substr(1);
		discount = Number(discount);
		var cost = 0;
		var taxTotal = 0;
		servucts.forEach(function(servuct){
			if(servuct[1] === currentAppointmentId) {
				cost = Number(servuct[4]);
				if(servuct[3] === "Service") total += cost;
				else {
					total += (cost * (tax / 100 + 1));
					taxTotal += cost * (tax / 100);
				}
			}
		});
		total += (tip - discount);
		total = Math.round(total * 100) / 100;
		total = total.toFixed(2);
		taxTotal = taxTotal.toFixed(2);
		var due = twoNumberDecimal(total - (Number($('#cash').val()) + Number($('#card').val())));
		$('#due').text(due);
		$('#grandtotal').html(total);
		$('#taxtotal').html(taxTotal);
	}

	var setCurrentAppointmentId = function(event){
		newAppt = false;
		if(event) {
			// $('#apptModal').show();
			// if(event.target.nodeName === "A" || $(event.target).attr('id') === "printArea") return;
			currentAppointmentId = event.currentTarget.attributes.apptId.nodeValue;
			appointments.forEach(function(appointment){
				if(appointment[0] === currentAppointmentId){
					$('#tax').val(appointment[2]);
					$('#tip').val(twoNumberDecimal(appointment[3]));
					$('#grandtotal').val(twoNumberDecimal(appointment[5]));
					$('#time').val(appointment[6]);
					$('#servicedate').val(appointment[7]);
					$('#notes').val(appointment[8]);
					$('#cash').val(twoNumberDecimal(appointment[9]));
					$('#card').val(twoNumberDecimal(appointment[10]));
				}
			});
		}

		$('#serviceBody').empty();
		$('#productBody').empty();

		var numServices = 0, numProducts = 0, subtotal = 0, discount = 0, proTotal = 0, servTotal = 0;

		servucts.forEach(function(servuct){
			if(servuct[1] === currentAppointmentId){
				subtotal += Number(servuct[4]);
				discount += Number(servuct[5]);
				var newNode;
				if(servuct[3] === "Service"){
					newNode = $('<tr class="highlight clearboth" data-toggle="modal" href="#editServuctModal" servuctId="' + servuct[0] + '"><td class="col200">'+ servuct[2] +'</td><td class="col100">$'+ servuct[4] +'</td></tr>');
					$('#serviceBody').append(newNode);
					newNode.click(loadService);
					numServices++;
					servTotal += Number(servuct[4]);
				} else if(servuct[3] === "Product"){
					newNode = $('<tr class="highlight clearboth" data-toggle="modal" href="#editServuctModal" servuctId="' + servuct[0] + '"><td class="col200">'+ servuct[2] +'</td><td class="col100">$'+ servuct[4] +'</td></tr>');
					$('#productBody').append(newNode);
					newNode.click(loadProduct);
					numProducts++;
					proTotal += Number(servuct[4]);
				}
			}
		});
		$('#servicesCost').html('$' + twoNumberDecimal(servTotal));
		$('#productsCost').html('$' + twoNumberDecimal(proTotal));
		$('#numServices').html(numServices + ' Services:');
		$('#numProducts').html(numProducts + ' Products:');
		$('#discount').html("$" + discount.toFixed(2));
		$('#subtotal').html("$" + subtotal.toFixed(2));
		calculateGrandTotal();
	};

	function loadService(event){
		currentServuctType = "Service";
		currentServuctId = event.currentTarget.attributes.servuctId.nodeValue;
		console.log(currentServuctId);
		$('#servuctHeader').html('Edit Service');
		$('#servuctLabel').html('Service Name:');
		servucts.forEach(function(servuct){
			if(servuct[0] === currentServuctId){
				$('#editservname').val(servuct[2]);
				$('#editservprice').val(servuct[4]);
				$('#editservdiscount').val(servuct[5]);
			}
		});
	}

	function loadProduct(event){
		currentServuctType = "Product";
		currentServuctId = event.currentTarget.attributes.servuctId.nodeValue;
		console.log(currentServuctId);
		$('#servuctHeader').html('Edit Product');
		$('#servuctLabel').html('Product Name:');
		servucts.forEach(function(servuct){
			if(servuct[0] === currentServuctId){
				currentServuctName = servuct[2];
				$('#editservname').val(servuct[2]);
				$('#editservprice').val(servuct[4]);
				$('#editservdiscount').val(servuct[5]);
			}
		});
	}

	function reloadStylesheets() {
	    var queryString = '?reload=' + new Date().getTime();
	    $('link[rel="stylesheet"]').each(function () {
	        this.href = this.href.replace(/\?.*|$/, queryString);
	    });
	}

	function loadPeople(){
		ss.values.get({
			spreadsheetId: peopleId,
			range: 'A2:G'
		}).then(function(res){
			people = [];
			if(res.result.values && res.result.values.length){
				res.result.values.forEach(function(value){
					if(value.length) people.push(value);
				});
			}
			loadAppointments();

		}, function(e){
			console.log('load people error');
			console.log(e);
		});
	}

	function loadAppointments(){
		ss.values.get({
			spreadsheetId: appointmentsId,
			range: 'A2:K'
		}).then(function(res){
			appointments = [];
			if(res.result.values && res.result.values.length){
				res.result.values.forEach(function(value){
					if(value.length) appointments.push(value);
				});
			}
			appointments.sort(function(a, b){
				var datetime1 = a[7] + "T" + parseTime(a[6]);
				var datetime2 = b[7] + "T" + parseTime(b[6]);
				if(datetime1 > datetime2) return -1;
				if(datetime1 < datetime2) return 1;
				if(datetime1 === datetime2) return 0;
			});
			calendarSetup();
			createList();
			loadServucts();
		}, function(e){
			console.log('load appointments error');
			console.log(e);
		});
	}

	var loadPerson = function(id){
		ss.values.get({
		    spreadsheetId: peopleId,
		    range: 'A2:G',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (response.result.values[i][0] === id) row = i;
		  		}
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
				$('#fname').val(response.result.values[row][1]);
		  		$('#lname').val(response.result.values[row][2]);
				$('#address').val(response.result.values[row][3]);
				$('#phone').val(response.result.values[row][4]);
				$('#eMail').val(response.result.values[row][5]);
				$('#bday').val(response.result.values[row][6]);

				$('#appointments').empty();

				appointments.forEach(function(appointment){
					if(appointment[1] === currentPersonId){
						var date = appointment[7] ? appointment[7] : "";
						//var service = appointment[2] ? appointment[2] : "";
						//var total = appointment[7] ? "$" + appointment[7] : "";
						var service;
						var numServs = 0;
						servucts.forEach(function(servuct){
							if(servuct[3] === "Service" && servuct[1] === appointment[0]){
								if(!service) service = servuct[2];
								else numServs++;
							}
						});
						if(!service) service = "";
						else if(numServs) service += " + " + numServs + " others";
						var total = twoNumberDecimal(Number(appointment[5]) + Number(appointment[3]));
						var due = twoNumberDecimal(total - (Number(appointment[9]) + Number(appointment[10])));
						var notes = appointment[8] ? appointment[8] : "";
						var newNode = $('<tr apptId="' + appointment[0]+ '"class="highlight" data-toggle="modal" data-target="#apptModal"><td class="col100">'+ date +
										'</td><td class="col200">'+ service +'</td><td class="col100">$'+ total +'</td><td class="col100">$' + due + '</td><td class="col200">'+ notes +
										'</td><td id="printArea" class="col100 center print"><a id="print" class="icon icon-print"></a></td></tr>');
						$('#appointments').append(newNode);
						newNode.children(".print").click(function(event){
							var ID = newNode.attr('apptId');
							window.open("/print/" + ID, '_blank');
						});
						newNode.click(setCurrentAppointmentId);
					}
				});
			}, function(e) {
			  	console.log(e);
			    console.log('edit person error');
		  });
	};

	function getName(id){
		var name;
		people.forEach(function(person){
				if(person[0] === id){
					name =  (person[2] + ', ' + person[1]);
					}
				});
		return name;
	}

	function goToAppt(event){
		//$('#clientLink').trigger('click');
		// window.setTimeout(function(){
			console.log('opening');
		$('#apptModal').modal('show');
		setCurrentAppointmentId(event);		
		// }, 1500);
	}

	function loadServucts(){
		ss.values.get({
			spreadsheetId: servuctsId,
			range: 'A2:F'
		}).then(function(res){
			servucts = [];
			if(res.result.values && res.result.values.length){
				res.result.values.forEach(function(value){
					if(value.length) servucts.push(value);
				});
			}
			var servTotal = 0, proTotal = 0, taxTotal = 0, discTotal = 0, dueTotal = 0, tax;
			// 11 = service total, 12 = product total, 13 = tax, 4 = discount, 5 = total, 5 - (9 + 10) = due
			appointments.forEach(function(appointment){
				apptKey[appointment[0]] = appointment;
				apptKey[appointment[0]][11] = 0;
				apptKey[appointment[0]][12] = 0;
				apptKey[appointment[0]][13] = 0;
				apptKey[appointment[0]][14] = (Number(appointment[5]) - (Number(appointment[9]) + Number(appointment[10])) - Number(appointment[3]));
				dueTotal += apptKey[appointment[0]][14];
			});
			servucts.forEach(function(servuct){
				discTotal += Number(servuct[5]);
				if(servuct[3] === "Service"){
					servTotal += Number(servuct[4]);
					apptKey[servuct[1]][11] += Number(servuct[4]);
				} else if(servuct[3] === "Product"){
					proTotal += Number(servuct[4]);
					apptKey[servuct[1]][12] += Number(servuct[4]);
					tax = Number(apptKey[servuct[1]][2]) / 100;
					apptKey[servuct[1]][13] += servuct[4] * tax;
					taxTotal += servuct[4] * tax;
				}
			});
			var monthMap = {
				1: 'jan',
				2: 'feb',
				3: 'mar',
				4: 'apr',
				5: 'may',
				6: 'jun',
				7: 'jul',
				8: 'aug',
				9: 'sep',
				10: 'oct',
				11: 'nov',
				12: 'dec',
			};
			for(var i in apptKey){
				var appt = apptKey[i];
				var totalNoTip = Number(appt[5]) - Number(appt[3]);
				var lastFirst = getName(appt[1]);

				var monthNum = parseInt(appt[7].substr(5,2));
				var month = monthMap[monthNum];
				var made = Number(appt[9]) + Number(appt[10]) - Number(appt[3]);
				var apptNode = $('<tr apptId="' + appt[0]+ '" class="highlight"><td class="' + month + 'Name colFixedL">' + lastFirst + '</td><td class="' + month + 'Serv colFixedB">' + twoNumberDecimal(appt[11]) + '</td><td class="' + month + 'Pro colFixedB">' + twoNumberDecimal(appt[12]) + '</td><td class="' + month + 'Tax colFixedS">' + twoNumberDecimal(appt[13]) + '</td><td class="' + month + 'Disc colFixedB">' + twoNumberDecimal(appt[4]) + '</td><td class="' + month + 'Due col250 center">' + twoNumberDecimal(Number(totalNoTip) - made) + '</td><td class="' + month + 'AppTotal col250 center">' + twoNumberDecimal(made) + '</td></tr>');
				var mommaNode = $('#' + month + 'Apps');
				appt[16] = lastFirst;
				apptNode.click(goToAppt);
				mommaNode.append(apptNode);
			}
			$('#servTotal').html("Service Total: $" + twoNumberDecimal(servTotal));
			$('#proTotal').html("Product Total: $" + twoNumberDecimal(proTotal));
			$('#taxTotal').html("Tax Total: $" + twoNumberDecimal(taxTotal));
			$('#discTotal').html("Discount Total: $" + twoNumberDecimal(discTotal));
			$('#totalDue').html("Amount Due: $" + twoNumberDecimal(dueTotal));
			$('#yearlyTotal').html(
				"Yearly Total: $" + twoNumberDecimal(taxTotal + proTotal + servTotal - discTotal - dueTotal));
			loadPerson(currentPersonId);
			loadInventory();
			setCurrentAppointmentId();
		}, function(e){
			console.log('load servucts error');
			console.log(e);
		});
	}

	function loadInventory(){
		ss.values.get({
			spreadsheetId: inventoryId,
			range: 'A2:C'
		}).then(function(res){
			inventory = [];
			if(res.result.values && res.result.values.length){
				res.result.values.forEach(function(value){
					if(value.length) inventory.push(value);
				});
			}

			$('#services').empty();
			$('#products').empty();

			inventory.forEach(function(item){
				var newNode;
				if(item[1] === "Service"){
					newNode = $('<tr class="highlight" data-toggle="modal" data-target="#editInventorySModal"><td class="colServuct">' + item[0] + '</td><td class="col200">$' + twoNumberDecimal(item[2]) + '</td></tr>');
					$('#services').append(newNode);
				}else{
					newNode = $('<tr class="highlight" data-toggle="modal" data-target="#editInventoryPModal"><td class="colServuct">' + item[0] + '</td><td class="col200">$' + twoNumberDecimal(item[2]) + '</td><td class="col200">' + item[1] + '</td></tr>');
					$('#products').append(newNode);
				}
			});
			if(updateAppt){
				updateAppt = false;
				saveCurrentAppt();
			}
		}, function(e){
			console.log('load inventory error');
			console.log(e);
		});
	}

	loadPeople();	

	function updateSS(id, range, array){
		return ss.values.update({valueInputOption: 'USER_ENTERED', majorDimension: 'ROWS', spreadsheetId: id, range: range, values: array}).then(function(response){
		}, function(e){
			console.log('update error');
			console.log(e);
		});
	}

	function createReport(){
		var yearlyReportId = '1WMw-xVQ3zRZx4lVcMUDwbJsdQlb6puhWGQooec1VDUg';
		var array = [[],[],[],[],[],[],[],[],[],[],[],[]];
		var data = [];
		var monthMap = {
			1: "January",
			2: "February",
			3: "March",
			4: "April",
			5: "May",
			6: "June",
			7: "July",
			8: "August",
			9: "September",
			10: "October",
			11: "November",
			12: "December"
		};
		for(var i in apptKey){
			apptKey[i][15] = Number(apptKey[i][10]) + Number(apptKey[i][9]) - Number(apptKey[i][3]);
			var appt = [
			apptKey[i][7],
			apptKey[i][16],
			apptKey[i][11],
			apptKey[i][12],
			apptKey[i][2],
			apptKey[i][13],
			apptKey[i][4],
			apptKey[i][3],
			apptKey[i][5],
			apptKey[i][9],
			apptKey[i][10],
			apptKey[i][15],
			apptKey[i][14]
			];
			if(apptKey[i][7])array[parseInt(apptKey[i][7].substr(5,2)) - 1].push(appt);
		}
		array.forEach(function(month, index){
			data.push({
				majorDimension: 'ROWS',
				range: "" + monthMap[index + 1] + '!A2:P' + (month.length + 1),
				values: month
			});
		});
		return ss.values.batchUpdate({valueInputOption: 'USER_ENTERED', spreadsheetId: yearlyReportId, data: data}).then(function(response){
		}, function(e){
			console.log('update error');
			console.log(e);
		});
	}

	function deletePerson(id){
		ss.values.get({
		    spreadsheetId: peopleId,
		    range: 'A1:G',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (response.result.values[i][0] === id) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
		  		var range = 'A' + row + ":G" + row;
		  		var array = [["", "", "", "", "", "", ""]];
				console.log('delete person success');
			  	updateSS(peopleId, range, array).then(function(response){
				appointments.forEach(function(appointment){
					if(appointment[1] === id) deleteAppointment(appointment[0]);
				});

				window.location.reload();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('delete person error');
		  });
	}


	function addPerson(){
		ss.values.get({
		    spreadsheetId: peopleId,
		    range: 'A1:G',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (!response.result.values[i].length) row = i + 1;
		  		}
		  		if(!row) row = response.result.values.length + 1;
		  		var range = 'A' + row + ":G" + row;
		  		var now = Date.now().toString(36);
		  		var array = [[now, "", "", "", "", "", ""]];
			  	updateSS(peopleId, range, array).then(function(response){
			  	currentPersonId = now;
				console.log('add person success');
				loadPeople();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('add person error');
		  });
	}

	function editPerson(id, array){
		ss.values.get({
		    spreadsheetId: peopleId,
		    range: 'A2:G',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (response.result.values[i][0] === id) row = i + 2;
		  		}
			  	var range = 'A' + row + ":G" + row;
		  		
		  		if(!row) {
		  			console.log('id not found, adding person');
			  		for(i = response.result.values.length - 1 ; i > 0 ; i--){		
			  			if (!response.result.values[i].length) row = i + 2;
			  		}
			  		if(!row) row = response.result.values.length + 2;
			  		range = 'A' + row + ":G" + row;
			  		var now = Date.now().toString(36);
			  		array[0][0] = now;
				  	updateSS(peopleId, range, array).then(function(response){
					  	currentPersonId = now;
						console.log('add person success');
						loadPeople();
						window.setTimeout(function(){
							$("#save-client").html('Save Changes');
						},2000);
					});
		  			return;
		  		}
			  	updateSS(peopleId, range, array).then(function(response){
				console.log('edit person success');
				$("#save-client").html('Saved!');
				window.setTimeout(function(){
					$("#save-client").html('Save Changes');
				},2000);
				loadPeople();
			});
		  }, function(e) {
		  	$('#save-client').val('Error :(');
			window.setTimeout(function(){
				$('#save-client').val('Save Changes');
			},2000);
		  	console.log(e);
		    console.log('edit person error');
		  });
	}

	function addAppointment(appt){
		ss.values.get({
		    spreadsheetId: appointmentsId,
		    range: 'A1:K',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (!response.result.values[i].length) row = i + 1;
		  		}
		  		if(!row) row = response.result.values.length + 1;
		  		var range = 'A' + row + ":K" + row;
		  		var array = [[
		  		currentAppointmentId,
		  		appt.id,
		  		appt.tax,
		  		appt.tip,
		  		appt.discount,
		  		appt.total,
		  		appt.time,
		  		appt.date,
		  		appt.notes,
		  		appt.cash,
		  		appt.credit
		  		]];
			  	console.log(array);
			  	updateSS(appointmentsId, range, array).then(function(response){
				console.log('add appointment success');
				loadPeople();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('add appointment error');
		  });
	}


	function deleteAppointment(id){
		ss.values.get({
		    spreadsheetId: appointmentsId,
		    range: 'A1:K',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (response.result.values[i][0] === id) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
		  		var range = 'A' + row + ":K" + row;
		  		var array = [["", "", "", "", "", "", "", "", "", "", ""]];
			  	updateSS(appointmentsId, range, array).then(function(response){
				console.log('delete appointment success');
				servucts.forEach(function(servuct){
					if(servuct[1] === id) deleteServuct(servuct[0]);
				});
				loadPeople();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('delete appointment error');
		  });
	}

	function editAppointment(id, array){
		ss.values.get({
		    spreadsheetId: appointmentsId,
		    range: 'A1:K',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){
		  			if (response.result.values[i][0] === id) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
		  		var range = 'B' + row + ":K" + row;
			  	updateSS(appointmentsId, range, array).then(function(response){
				console.log('edit appointment success', range, array);
				loadPeople();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('edit appointment error');
		  });
	}

	function addServuct(servuct){
		ss.values.get({
		    spreadsheetId: servuctsId,
		    range: 'A1:F',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (!response.result.values[i].length) row = i + 1;
		  		}
		  		if(!row) row = response.result.values.length + 1;
		  		console.log("here:", row, response.result.values);
		  		var range = 'A' + row + ":F" + row;
		  		var now = (Date.now() / 4).toString(36);
		  		var array = [[
		  		now,
		  		servuct.id,
		  		servuct.name,
		  		servuct.type,
		  		servuct.cost,
		  		servuct.discount
		  		]];
			  	updateSS(servuctsId, range, array).then(function(response){
				console.log('add servuct success');
				currentServuctId = now;
				loadPeople();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('add servuct error');
		  });
	}

	function editServuct(id, array){
		ss.values.get({
		    spreadsheetId: servuctsId,
		    range: 'A1:F',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){
		  			if (response.result.values[i][0] === id) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
		  		var range = 'B' + row + ":F" + row;
		  		console.log("updating:", id, range, array);
			  	updateSS(servuctsId, range, array).then(function(response){
				console.log('edit servuct success');
				loadPeople();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('edit servucts error');
		  });
	}

	function deleteServuct(id){
		ss.values.get({
		    spreadsheetId: servuctsId,
		    range: 'A1:F',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (response.result.values[i][0] === id) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
		  		var range = 'A' + row + ":F" + row;
		  		var array = [["", "", "", "", "", ""]];
			  	updateSS(servuctsId, range, array).then(function(response){
				console.log('delete servuct success');
				loadPeople();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('delete servuct error');
		  });
	}

	function addInventory(items){
		ss.values.get({
		    spreadsheetId: inventoryId,
		    range: 'A1:C',
		  }).then(function(response) {
		  	var takenRows = {};
		  	items.forEach(function(item){
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){	
		  			if (!response.result.values[i].length && !takenRows[(i+1).toString()]) {
		  				row = i + 1;
		  				takenRows[(i+1).toString()] = true;
		  			}
		  		}
		  		i = 1;
		  		while(!row) { 
		  			if(!takenRows[(response.result.values.length + i).toString()]){
		  				row = response.result.values.length + i;
		  				takenRows[(response.result.values.length + i).toString()] = true;
		  			}
		  			i++;
		  		}
		  		var range = 'A' + row + ":C" + row;
		  		var array = [[
		  		item.name,
		  		item.quantity,
		  		item.price
		  		]];
				console.log(inventoryId, range, array);
			  	updateSS(inventoryId, range, array).then(function(response){
					loadInventory();
				});
			  });
		  }, function(e) {
		  	console.log(e);
		    console.log('add inventory error');
		  });
	}

	function editInventory(itemName, array){
		ss.values.get({
		    spreadsheetId: inventoryId,
		    range: 'A1:C',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){
		  			if (response.result.values[i][0] === itemName) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('itemName not found');
		  			return;
		  		}
		  		var range = 'A' + row + ":C" + row;
		  		console.log("updating:", itemName, range, array);
			  	updateSS(servuctsId, range, array).then(function(response){
				console.log('edit inventory success');
				loadInventory();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('edit inventory error');
		  });
	}

	function deleteInventory(itemName){
		ss.values.get({
		    spreadsheetId: inventoryId,
		    range: 'A1:C',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){
		  			if (response.result.values[i][0] === itemName) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('item name not found');
		  			return;
		  		}
		  		var range = 'A' + row + ":C" + row;
		  		var array = [["", "", ""]];
		  		console.log("deleting:", itemName, range, array);
			  	updateSS(inventoryId, range, array).then(function(response){
				console.log('edit inventory success');
				loadInventory();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('delete inventory error');
		  });
	}

	function lowerQuantity(itemName){
		ss.values.get({
		    spreadsheetId: inventoryId,
		    range: 'A1:C',
		  }).then(function(response) {
		  		var row = null;
		  		var currentQuantity, currentItem;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){
		  			if (response.result.values[i][0] === itemName) {
		  				row = i + 1;
		  				if(response.result.values[i][0] === "Service") return;
		  				currentQuantity = Number(response.result.values[i][1]);
		  				currentItem = response.result.values[i];
		  			}
		  		}
		  		if(!row) {
		  			console.log('item name not found');
		  			return;
		  		}
		  		var range = 'A' + row + ":C" + row;
		  		currentItem[1] = --currentQuantity;
		  		var array = [currentItem];
		  		console.log("lowering:", itemName, range, array);
			  	updateSS(inventoryId, range, array).then(function(response){
				console.log('lower inventory success');
				loadInventory();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('lower inventory error');
		  });
	}

	function increaseQuantity(itemName){
		ss.values.get({
		    spreadsheetId: inventoryId,
		    range: 'A1:C',
		  }).then(function(response) {
		  		var row = null;
		  		var currentQuantity, currentItem;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){
		  			if (response.result.values[i][0] === itemName) {
		  				row = i + 1;
		  				if(response.result.values[i][0] === "Service") return;
		  				currentQuantity = Number(response.result.values[i][1]);
		  				currentItem = response.result.values[i];
		  			}
		  		}
		  		if(!row) {
		  			console.log('item name not found');
		  			return;
		  		}
		  		var range = 'A' + row + ":C" + row;
		  		currentItem[1] = ++currentQuantity;
		  		var array = [currentItem];
		  		console.log("increasing:", itemName, range, array);
			  	updateSS(inventoryId, range, array).then(function(response){
				console.log('increase inventory success');
				loadInventory();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('increase inventory error');
		  });
	}



	var sophie = {
		last: 'hia',
		first: 'sop',
		address: 'cali',
		cell: '424242424',
		email: 'sophia@sophia.com',
		dob: 8/7/1992
	};


	var sophiesLegRemoval = {
		id: '9daonruu',
  		name: 'Leg Removal',
  		type: 'Service',
  		cost: '5.00'
	};

	var sophiesLegRemoval2 = [[
		'9daonruu',
  		'Leg Removal',
  		'Service',
  		'11.00'
	]];

	//addServuct(sophiesLegRemoval);
	//editServuct(currentServuctId, sophiesLegRemoval2);
	//deleteServuct(currentServuctId);

	var sophiesBackMassage2 = [[
		'iql3h8vd',
  		'Back Massageeeee',
  		'2.32',
  		'200.00',
  		'.08',
  		'2.00',
  		'220.5',
  		new Date().toTimeString(),
  		new Date().toDateString(),
  		'seemed a little wasted'
	]];


	//addPerson(sophie);
	//addAppointment(sophiesBackMassage);
	//deletePerson('iql3h8vd');
	function saveCurrentAppt(){
		editAppointment(currentAppointmentId, [[
			currentPersonId,
			$('#tax').val(),
			$('#tip').val(),
			$('#discount').html(),
			$('#grandtotal').html() || '0.00',
			$('#time').val(),
			$('#servicedate').val(),
			$('#notes').val(),
			$('#cash').val(),
			$('#card').val(),
			]]);
		loadPeople();
	}

	$('#apptsave').click(function(){
		saveCurrentAppt();
		$('#apptModal').modal('hide');
	});
	
	$('#newappt').click(function(){
		newAppt = true;
		var now = (Date.now() / 2).toString(36);
		currentAppointmentId = now;
		$('#servicesCost').html('$' + 0);
		$('#productsCost').html('$' + 0);
		$('#numServices').html('0 Services:');
		$('#numProducts').html('0 Products:');
		$('#serviceBody').empty();
		$('#productBody').empty();
		$('#tax').val(8);
		$('#tip').val(0);
		$('#discount').val(0);
		$('#time').val("");
		$('#servicedate').val(0);
		$('#notes').val("");
		$('#cash').val("0.00");
		$('#card').val("0.00");
		calculateGrandTotal();
		var appointment = {
			id: currentPersonId,
			tax: $('#tax').val(),
			tip: $('#tip').val(),
			discount: '$0.00',
			total: '0.00',
			time: $('#time').val(),
			date: $('#servicedate').val(),
			notes: $('#notes').val(),
			cash: $('#cash').val(),
			credit: $('#card').val()
			};
		addAppointment(appointment);
		console.log('new appt made');
	});

	$('#delApptYes').click(function(){
		deleteAppointment(currentAppointmentId);
		$('#delApptModal').modal('hide');
		$('#apptModal').modal('hide');
	});

	$('#apptcancel').click(function(){
		$('#apptModal').modal('hide');
	});

	$('#save-client').click(function(){
		var client = [[
			currentPersonId,
			$('#fname').val(),
			$('#lname').val(),
			$('#address').val(),
			$('#phone').val(),
			$('#eMail').val(),
			$('#bday').val()
			]];

		editPerson(currentPersonId, client);
	});

	$('#newclientyes').click(function(){
		$('#newclientmodal').modal('hide');
		$('#lname').val("");
		$('#fname').val("");
		$('#address').val("");
		$('#phone').val("");
		$('#eMail').val("");
		$('#bday').val("");
		currentPersonId = null;
		console.log("adding person");
	});

	$('#delclientyes').click(function(){
		deletePerson(currentPersonId);
	});

	$('#delServuctYes').click(function(){
		if(currentServuctType === "Product") increaseQuantity(currentServuctName);
		deleteServuct(currentServuctId);
		updateAppt = true;
		$('#editServuctModal').modal('hide');
		$('#delServuctModal').modal('hide');
	});

	$('#editServuctSave').click(function(){
		updateAppt = true;
		var servuct = [[
			currentAppointmentId,
  			$('#editservname').val(),
  			currentServuctType,
  			$('#editservprice').val(),
  			$('#editservdiscount').val(),
		]];
		if(currentServuctId) editServuct(currentServuctId, servuct);
		else{
			addServuct({
				id: currentAppointmentId,
				name: $('#editservname').val(),
				type: currentServuctType,
				cost: $('#editservprice').val(),
				discount:$('#editservdiscount').val(),
			});
		}
		$('#editServuctModal').modal('hide');
	});

	$('#servadd').click(function(){
		currentServuctType = "Service";
		currentServuctId = null;
		$('#servuctHeader').html('Add Service');
		$('#servuctLabel').html('Service Name:');
		$('#editservname').val("");
		$('#editservprice').val(0.00);
		$('#editservdiscount').val(0.00);
		$('#serviceDisc').val(0.00);
		$('#addServuct').modal('show');
		createServiceList();
	});

	$('#proadd').click(function(){
		currentServuctType = "Product";
		currentServuctId = null;
		$('#productDisc').val();
		$('#servuctHeader').html('New Product');
		$('#servuctLabel').html('Product Name:');
		$('#editservname').val("");
		$('#editservprice').val(0.00);
		$('#productDisc').val(0.00);
		$('#editservdiscount').val(0.00);
		$('#addProduct').modal('show');
		createProductList();
	});

	$('#servsave').click(function(){
		updateAppt = true;
		var servuct = [[
			currentAppointmentId,
  			selectedServuct[0],
  			currentServuctType,
  			selectedServuct[1],
  			$('#serviceDisc').val(),
		]];
		if(currentServuctId) editServuct(currentServuctId, servuct);
		else{
			addServuct({
				id: currentAppointmentId,
				name: selectedServuct[0],
				type: currentServuctType,
				cost: selectedServuct[1],
				discount: $('#serviceDisc').val(),
			});
		}
		$('#addServuct').modal('hide');
		createProductList();
	});

	$('#prosave').click(function(){
		updateAppt = true;
		var servuct = [[
			currentAppointmentId,
  			selectedServuct[0],
  			currentServuctType,
  			selectedServuct[2],
  			$('#productDisc').val(),
		]];
		if(currentServuctId) editServuct(currentServuctId, servuct);
		else{
			addServuct({
				id: currentAppointmentId,
				name: selectedServuct[0],
				type: currentServuctType,
				cost: selectedServuct[2],
				discount: $('#productDisc').val(),
			});
		}
		lowerQuantity(selectedServuct[0]);
		$('#addProduct').modal('hide');
		createProductList();
	});

	$('#saveProduct').click(function(){
		$('#addProModal').modal('hide');
		var items = [];
		var length = $('#productGroup').children().length;
		for(var i = 1; i < length; i++){
			var name = $('#product' + i).val(), 
			quantity = $('#proQuantity' + i).val(), 
			price = $('#proPrice' + i).val();
			if(name && quantity && price)items.push({
				name: name,
				quantity: quantity,
				price: price
			});
		}
		addInventory(items);
		$('#product1').val("");
	    $('#proPrice1').val("");
	    $('#proQuantity1').val("");
	    for(i = 2; i < length; i++){
	    	$("#productDiv" + i).remove();
	    }
	});

	$('#saveService').click(function(){
		$('#addServModal').modal('hide');
		var items = [];
		var length = $('#serviceGroup').children().length;
		for(var i = 1; i < length; i++){
			var name = $('#service' + i).val(), 
			quantity = "Service", 
			price = $('#servPrice' + i).val();
			if(name && price) items.push({
				name: name,
				quantity: quantity,
				price: price
			});
		}
		addInventory(items);
		$('#service1').val("");
     	$('#servPrice1').val("");
     	for(i = 2; i < length; i++){
        	$("#serviceDiv" + i).remove();
      	}
	});

	$('#spreadsheet').click(function(){
		createReport();
		window.open("https://docs.google.com/spreadsheets/d/1WMw-xVQ3zRZx4lVcMUDwbJsdQlb6puhWGQooec1VDUg", '_blank');
	});

	$('.updateGrandTotal').keyup(calculateGrandTotal);
	$('.money').blur(function(event){
		$(this).html(twoNumberDecimal($(this).html()));
		$(this).val(twoNumberDecimal($(this).val()));
	});


// People search 
	function createList() {
		$('#listpeople').empty();
		var columns = {
		    valueNames: ['a', 'b', 'c', 'd', 'e'],
		    item: '<ul class="row-content person"><li class="a" id="a"></li><li class="b" id="b"></li><li class="c" id="c"></li><li class="d" id="d"></li><li class="e" id="e"></li></ul><>'
	    };
	    var values = [];
		var recentd = null;
		for(var i = 0; i < people.length ; i++){
			recentd = "None";
			for(var j = appointments.length - 1; j >= 0; j--){
				if (appointments[j][1] === people[i][0]){
				  	now = new Date();
				  	now = now.getFullYear() + "-" + 
				  	("0" + (now.getMonth() + 1)).slice(-2) + "-" + 
				  	("0" + now.getDate()).slice(-2);
					if(appointments[j][7] > now) {
						dateObject = new Date(Date.parse(appointments[j][7]));
						dateReadable = dateObject.toDateString();
						recentd = dateReadable;
					}
			  	}
			}
			values.push({a: people[i][2] || "",
		       b: people[i][1] || "",
		       c: people[i][4] || "",
		       d: recentd,
		       e: people[i][0],
		    });
			date = [];
		}
	    var searchable = new List('searchlist', columns, values);
	    $('.person').click(function(){
			console.log($(this).children('#e').html());
			currentPersonId = $(this).children('#e').html();
		    loadPerson(currentPersonId);
		    $('#clientLink').trigger('click');
		}).hover(function(){
			$(this).children().css('background-color', '#e6ffe6');
			$(this).children().css('cursor', 'pointer');
		}, function(){
			$(this).children().css('background-color', '#DBE8DC');
			$(this).children().css('cursor', 'default');
		});
	}	

// Double modal
	$('#addServuct').on('show', function() {
  		$('#apptModal').unbind();
	});
	$('#addProduct').on('show', function() {
  		$('#apptModal').unbind();
	});
	$('#delApptModal').on('show', function() {
  		$('#apptModal').unbind();
	});
	$('#delServuctModal').on('show', function() {
  		$('#editServuctModal').unbind();
	});

// add appointment products and services lists
	function createProductList() {
		$('#listproduct').empty();
		var productArray = [];
		inventory.forEach(function(servuct){
			if(servuct[1] !== "Service"){
				productArray.push(servuct);
			}
		});
		console.log(productArray);
		var columns = {
		    valueNames: ['pname', 'pquantity', 'pprice'],
		    item: '<ul class="row-content select-servuct"><li class="pname" id="pname"></li><li class="pquantity center" id="pquantity"></li><li class="pprice center" id="pprice"></li></ul>'
		};
	    var values = [];
	    for(var i = 0; i < productArray.length ; i++){
			values.push({pname: productArray[i][0] || "",
		       pquantity: productArray[i][1] || "",
		       pprice: productArray[i][2] || "",
		    });
		}
		console.log(values);
			var searchProducts = new List('searchproductlist', columns, values);
		$('.select-servuct').click(selectServuct);
	}
	function createServiceList() {
		$('#listservice').empty();
		var serviceArray = [];
		inventory.forEach(function(servuct){
			if(servuct[1] === "Service"){
				serviceArray.push(servuct);
			}
		});
		console.log(serviceArray);
		var columns = {
		    valueNames: ['sname', 'squantity', 'sprice'],
		    item: '<ul class="row-content select-servuct"><li class="sname" id="sname"></li><li class="sprice" id="sprice"></li></ul>'
		};
	    var values = [];
	    for(var i = 0; i < serviceArray.length ; i++){
			values.push({sname: serviceArray[i][0] || "",
		       sprice: serviceArray[i][2] || "",
		    });
		}
		console.log(values);
			var searchServices = new List('searchservicelist', columns, values);
		$('.select-servuct').click(selectServuct);
	}

}

