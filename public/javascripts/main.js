function main(){
	var ss = gapi.client.sheets.spreadsheets;
	var appointmentsId = "1g_RV4hpbn-dJ5GsfyHHOZ6a3FxHecevTmts84kN2jp8";
	var peopleId = "1LRsyBbR57X9Gc2z1CLeUnHXkEpCiIwacnm2Hj4DbWSI";
	var servuctsId = '1S0rzD4T5ougGfzZGqp6H8bm-QP8Zy29oPJeQpDiUYQ0';
	var inventoryId = '18y6mvDC7vVcNISpyU7_Xuq_NSxVUcv8ZMhyz-xkHaLU';
	var currentPersonId = 'iql3hgup';
	var currentAppointmentId = null;
	var currentServuctId = '68w2dvp2.o00y66r';
	var currentServuctType = "Service";
	var people = [];
	var appointments = [];
	var servucts = [];
	var inventory = [];
	var newAppt = false;
	var parseTimeRegex1 = /^(\d+)/;
	var parseTimeRegex2 = /:(\d+)/;
	var parseTimeRegex3 = /\s(.*)$/;

	$('#time').timepicker({
	    timeFormat: 'h:mm p',
	    dropdown: false,
	});

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
			    },
	    });
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
		$('#grandtotal').html(total);
		$('#taxtotal').html(taxTotal);
	}

	var setCurrentAppointmentId = function(event){
		console.log("setting current appointment ID and fields");
		newAppt = false;
		if(event) {
			currentAppointmentId = event.currentTarget.attributes.apptId.nodeValue;
			appointments.forEach(function(appointment){
				if(appointment[0] === currentAppointmentId){
					$('#tax').val(appointment[2]);
					$('#tip').val(appointment[3]);
					$('#grandtotal').val(appointment[5]);
					$('#time').val(appointment[6]);
					$('#servicedate').val(appointment[7]);
					$('#notes').val(appointment[8]);
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
					newNode = $('<tr class="highlight clearboth" data-toggle="modal" href="#addServuct" servuctId="' + servuct[0] + '"><td class="col200">'+ servuct[2] +'</td><td class="col100">$'+ servuct[4] +'</td></tr>');
					$('#serviceBody').append(newNode);
					newNode.click(loadService);
					numServices++;
					servTotal += Number(servuct[4]);
				} else if(servuct[3] === "Product"){
					newNode = $('<tr class="highlight clearboth" data-toggle="modal" href="#addServuct" servuctId="' + servuct[0] + '"><td class="col200">'+ servuct[2] +'</td><td class="col100">$'+ servuct[4] +'</td></tr>');
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
			range: 'A2:I'
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
						var total = appointment[5];
						var notes = appointment[8] ? appointment[8] : "";
						var newNode = $('<tr apptId="' + appointment[0]+ '"class="highlight clearboth" data-toggle="modal" data-id="1" data-target="#apptModal"><td>'+ date +'</td><td>'+ service +'</td><td>$'+ total +'</td><td>'+ notes +'</td></tr>');
						$('#appointments').append(newNode);
						newNode.click(setCurrentAppointmentId);
					}
				});
			}, function(e) {
			  	console.log(e);
			    console.log('edit person error');
		  });
	};

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
			var servTotal = 0, proTotal = 0, taxTotal = 0, discTotal = 0, tax;
			var apptKey = {};
			appointments.forEach(function(appointment){
				apptKey[appointment[0]] = appointment;
			});
			servucts.forEach(function(servuct){
				discTotal += Number(servuct[5]);
				if(servuct[3] === "Service"){
					servTotal += Number(servuct[4]);
				} else if(servuct[3] === "Product"){
					proTotal += Number(servuct[4]);
					tax = Number(apptKey[servuct[1]][2]) / 100;
					taxTotal += servuct[4] * tax;
				}
			});
			$('#servTotal').html("Service Total: $" + twoNumberDecimal(servTotal));
			$('#proTotal').html("Product Total: $" + twoNumberDecimal(proTotal));
			$('#taxTotal').html("Tax Total: $" + twoNumberDecimal(taxTotal));
			$('#discTotal').html("Discount Total: $" + twoNumberDecimal(discTotal));
			$('#yearlyTotal').html(
				"Yearly Total: $" + twoNumberDecimal(taxTotal + proTotal + servTotal - discTotal));
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
					newNode = $('<tr class="highlight"><td class="colServuct">' + item[0] + '</td><td class="col200">$' + twoNumberDecimal(item[2]) + '</td></tr>');
					$('#services').append(newNode);
				}else{
					newNode = $('<tr class="highlight"><td class="colServuct">' + item[0] + '</td><td class="col200">$' + twoNumberDecimal(item[2]) + '</td><td class="col200">' + item[1] + '</td></tr>');
					$('#products').append(newNode);
				}
			});
		}, function(e){
			console.log('load inventory error');
			console.log(e);
		});
	}

	loadPeople();	

	function updateSS(id, range, array){
		return ss.values.update({valueInputOption: 'RAW', majorDimension: 'ROWS', spreadsheetId: id, range: range, values: array}).then(function(response){
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
		    range: 'A1:I',
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
		  			console.log((i+1).toString());	
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
			  	updateSS(servuctsId, range, array).then(function(response){
				console.log('edit inventory success');
				loadInventory();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('delete inventory error');
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

	$('#apptsave').click(function(){
		var appointment = {
		id: currentPersonId,
		tax: $('#tax').val(),
		tip: $('#tip').val(),
		discount: $('#discount').html(),
		total: $('#grandtotal').html() || '0.00',
		time: $('#time').val(),
		date: $('#servicedate').val(),
		notes: $('#notes').val(),
		};
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
			$('#credit').val(),
			]]);
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
			};
		addAppointment(appointment);
		console.log('new appt made');
	});

	$('#apptdelete').click(function(){
		deleteAppointment(currentAppointmentId);
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

	$('#servdelete').click(function(){
		deleteServuct(currentServuctId);
		$('#addServuct').modal('hide');
	});

	$('#servsave').click(function(){
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
		$('#addServuct').modal('hide');
	});

	$('#servadd').click(function(){
		currentServuctType = "Service";
		currentServuctId = null;
		$('#servuctHeader').html('New Service');
		$('#servuctLabel').html('Service Name:');
		$('#editservname').val("");
		$('#editservprice').val(0.00);
		$('#editservdiscount').val(0.00);
		$('#addServuct').modal('show');
	});

	$('#proadd').click(function(){
		currentServuctType = "Product";
		currentServuctId = null;
		$('#servuctHeader').html('New Product');
		$('#servuctLabel').html('Product Name:');
		$('#editservname').val("");
		$('#editservprice').val(0.00);
		$('#editservdiscount').val(0.00);
		$('#addServuct').modal('show');
	});

	$('#saveProduct').click(function(){
		$('#addProModal').modal('hide');
		var items = [];
		for(var i = 1; i < $('#productGroup').children().length; i++){
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
	});

	$('#saveService').click(function(){
		$('#addServModal').modal('hide');
		var items = [];
		for(var i = 1; i < $('#serviceGroup').children().length; i++){
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
	});

	$('.updateGrandTotal').keyup(calculateGrandTotal);
	$('.money').blur(function(event){
		$(this).html(twoNumberDecimal($(this).html()));
		$(this).val(twoNumberDecimal($(this).val()));
	});

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

	$('#addServuct').on('show', function() {
  		$('#apptModal').unbind();
	});
	// $('#proModal').on('show', function() {
 //  		$('#apptModal').unbind();
	// });
}

