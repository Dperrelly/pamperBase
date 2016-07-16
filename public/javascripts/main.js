function main(){
	var ss = gapi.client.sheets.spreadsheets;
	var appointmentsId = "1g_RV4hpbn-dJ5GsfyHHOZ6a3FxHecevTmts84kN2jp8";
	var peopleId = "1LRsyBbR57X9Gc2z1CLeUnHXkEpCiIwacnm2Hj4DbWSI";
	var servuctsId = '1S0rzD4T5ougGfzZGqp6H8bm-QP8Zy29oPJeQpDiUYQ0';
	var currentPersonId = 'iql3hgup';
	var currentAppointmentId = null;
	var currentServuctId = '68w2dvp2.o00y66r';
	var people = [];
	var appointments = [];
	var servucts = [];

	$('#time').timepicker({
	    timeFormat: 'h:mm p',
	    dropdown: false,
	});

	function parseTime(time){
		var hours = Number(time.match(/^(\d+)/)[1]);
		var minutes = Number(time.match(/:(\d+)/)[1]);
		var AMPM = time.match(/\s(.*)$/)[1];
		if(AMPM == "PM" && hours<12) hours = hours+12;
		if(AMPM == "AM" && hours==12) hours = hours-12;
		var sHours = hours.toString();
		var sMinutes = minutes.toString();
		if(hours<10) sHours = "0" + sHours;
		if(minutes<10) sMinutes = "0" + sMinutes;
		return sHours + ":" + sMinutes + ":00";
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
			events.push({
				id: appointment[0],
				clientId: appointment[1],
				start: appointment[7] + "T" + parseTime(appointment[6]),
				title: last + ", " + first
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
			    }
	    });
	};

	function calculateGrandTotal(){
		var total = 0;
		var tax = $('#tax').val();
		var tip = $('#tip').val();
		var discount = $('#discount').val();
		var cost = 0;
		servucts.forEach(function(servuct){
			if(servuct[1] === currentAppointmentId) {
				cost = Number(servuct[4]);
				if(servuct[3] === "Service") total += cost;
				else total += (cost * (tax / 100 + 1));
				console.log(total);
			}
		});
		total += (tip - discount);
		total = Math.round(total * 100) / 100;
		$('#grandtotal').val(total);
	}

	var setCurrentAppointmentId = function(event){
		console.log("setting current appointment ID and fields");
		currentAppointmentId = event.currentTarget.attributes.apptId.nodeValue;
		appointments.forEach(function(appointment){
			if(appointment[0] === currentAppointmentId){
				$('#tax').val(appointment[2]);
				$('#tip').val(appointment[3]);
				$('#discount').val(appointment[4]);
				$('#grandtotal').val(appointment[5]);
				$('#time').val(appointment[6]);
				$('#servicedate').val(appointment[7]);
				$('#notes').val(appointment[8]);
			}
		});
		servucts.forEach(function(servuct){
			$('#serviceBody').empty();
			$('#productBody').empty();
			var chart = servuct[3] === "Service" ? '#serviceBody' : '#productBody';
			if(servuct[1] === currentAppointmentId) $(chart).append('<tr class="highlight clearboth" data-toggle="modal" data-target="#apptModal"><td>'+ servuct[2] +'</td><td>'+ servuct[4] +'</td></tr>');
		});

	};

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
		  		$('#lname').val(response.result.values[row][1]);
				$('#fname').val(response.result.values[row][2]);
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
						var service = 'MAKE LIST';
						var total = 'CALCULATE THIS';
						var notes = appointment[8] ? appointment[8] : "";
						var newNode = $('<tr apptId="' + appointment[0]+ '"class="highlight clearboth" data-toggle="modal" data-id="1" data-target="#apptModal"><td>'+ date +'</td><td>'+ service +'</td><td>'+ total +'</td><td>'+ notes +'</td></tr>');
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
			range: 'A2:E'
		}).then(function(res){
			servucts = [];
			if(res.result.values && res.result.values.length){
				res.result.values.forEach(function(value){
					if(value.length) servucts.push(value);
				});
			}
			loadPerson(currentPersonId);
		}, function(e){
			console.log('load servucts error');
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
				loadPerson(now);
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
			  			if (!response.result.values[i].length) row = i + 1;
			  		}
			  		if(!row) row = response.result.values.length + 1;
			  		var now = Date.now().toString(36);
				  	updateSS(peopleId, range, array).then(function(response){
					  	currentPersonId = now;
						console.log('add person success');
						loadPeople();
						loadPerson(now);
						window.setTimeout(function(){
							$('#save-client').val('Save Changes');
						},2000);
					});
		  			return;
		  		}
			  	updateSS(peopleId, range, array).then(function(response){
				console.log('edit person success');
				$('#save-client').val('Saved!');
				window.setTimeout(function(){
					$('#save-client').val('Save Changes');
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
		  		var range = 'A' + row + ":I" + row;
		  		var array = [[
		  		currentAppointmentId,
		  		appt.id,
		  		appt.tax,
		  		appt.tip,
		  		appt.discount,
		  		appt.total,
		  		appt.time,
		  		appt.date,
		  		appt.notes
		  		]];
			  	console.log(array);
			  	updateSS(appointmentsId, range, array).then(function(response){
				console.log('add appointment success');
				loadAppointments();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('add appointment error');
		  });
	}


	function deleteAppointment(id){
		ss.values.get({
		    spreadsheetId: appointmentsId,
		    range: 'A1:I',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (response.result.values[i][0] === id) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
		  		var range = 'A' + row + ":I" + row;
		  		var array = [["", "", "", "", "", "", "", "", ""]];
			  	updateSS(appointmentsId, range, array).then(function(response){
				console.log('delete appointment success');
				loadAppointments();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('delete appointment error');
		  });
	}

	function editAppointment(id, array){
		ss.values.get({
		    spreadsheetId: appointmentsId,
		    range: 'A1:I',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){
		  		console.log(id, response.result.values[i][0]);		
		  			if (response.result.values[i][0] === id) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
		  		var range = 'B' + row + ":I" + row;
			  	updateSS(appointmentsId, range, array).then(function(response){
				console.log('edit appointment success', range, array);
				loadAppointments();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('edit appointment error');
		  });
	}

	function addServuct(servuct){
		ss.values.get({
		    spreadsheetId: servuctsId,
		    range: 'A1:E',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (!response.result.values[i].length) row = i + 1;
		  		}
		  		if(!row) row = response.result.values.length + 1;
		  		console.log("here:", row, response.result.values);
		  		var range = 'A' + row + ":E" + row;
		  		var now = (Date.now() / 25).toString(36);
		  		var array = [[
		  		now,
		  		servuct.id,
		  		servuct.name,
		  		servuct.type,
		  		servuct.cost,
		  		]];
			  	updateSS(servuctsId, range, array).then(function(response){
				console.log('add servuct success');
				currentServuctId = now;
				loadServucts();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('add servuct error');
		  });
	}

	function editServuct(id, array){
		ss.values.get({
		    spreadsheetId: servuctsId,
		    range: 'A1:E',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){
		  			if (response.result.values[i][0] === id) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
		  		var range = 'B' + row + ":E" + row;
		  		console.log("updating:", id, range, array);
			  	updateSS(servuctsId, range, array).then(function(response){
				console.log('edit servuct success');
				loadAppointments();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('edit servucts error');
		  });
	}

	function deleteServuct(id){
		ss.values.get({
		    spreadsheetId: servuctsId,
		    range: 'A1:E',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (response.result.values[i][0] === id) row = i + 1;
		  		}
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
		  		var range = 'A' + row + ":E" + row;
		  		var array = [["", "", "", "", ""]];
			  	updateSS(servuctsId, range, array).then(function(response){
				console.log('delete servuct success');
				loadAppointments();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('delete servuct error');
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
		discount: $('#discount').val(),
		total: $('#grandtotal').val(),
		time: $('#time').val(),
		date: $('#servicedate').val(),
		notes: $('#notes').val(),
		};
		if(!currentAppointmentId){
			addAppointment(appointment);
		}else{
			editAppointment(currentAppointmentId, [[
				currentPersonId,
				$('#tax').val(),
				$('#tip').val(),
				$('#discount').val(),
				$('#grandtotal').val(),
				$('#time').val(),
				$('#servicedate').val(),
				$('#notes').val(),
				]]);
		}
		$('#apptModal').modal('hide');
	});
	
	$('#newappt').click(function(){
		var now = (Date.now() / 2).toString(36);
		currentAppointmentId = now;
		$('#serviceBody').empty();
		$('#productBody').empty();
		$('#tax').val(8);
		$('#tip').val(0);
		$('#discount').val(0);
		$('#time').val("");
		$('#servicedate').val(0);
		$('#notes').val("");
		calculateGrandTotal();
		console.log('current appt nulled');
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

	$('#tax').keyup(calculateGrandTotal);
	$('#tip').keyup(calculateGrandTotal);
	$('#discount').keyup(calculateGrandTotal);

	function createList() {
		var columns = {
		    valueNames: ['a', 'b', 'c', 'd'],
		    item: '<ul class="row-content"><li class ="a" id="a"></li><li class="b" id="b"></li><li class="c" id="c"></li><li class="d" id="d"></li></ul>'
	    };
	    var values = [];
		var date = [];
		var sortByDateDesc = function (lhs, rhs) { return lhs < rhs ? 1 : lhs > rhs ? -1 : 0; };
		var recentd = null;
		for(var i = 0; i < people.length ; i++){
			for(var j = 0; j < appointments.length; j++){
				if (appointments[j][1] === people[i][0]){
			  		date.push(appointments[j][9]);
			  	}
			}
			date.sort(sortByDateDesc);
			recentd = date[0];
			values.push({a: people[i][2],
		       b: people[i][1],
		       c: people[i][4],
		       d: recentd,});
			date = [];
		}
	    var searchable = new List('searchlist', columns, values);
	}	

	$('#servModal').on('show', function() {
  		$('#apptModal').unbind();
	});
	$('#proModal').on('show', function() {
  		$('#apptModal').unbind();
	});
}

