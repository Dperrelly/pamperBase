function main(){
	var ss = gapi.client.sheets.spreadsheets;
	var appointmentsId = "1g_RV4hpbn-dJ5GsfyHHOZ6a3FxHecevTmts84kN2jp8";
	var peopleId = "1LRsyBbR57X9Gc2z1CLeUnHXkEpCiIwacnm2Hj4DbWSI";
	var currentPersonId = 'iql3hgup';
	var currentAppointmentId = null;
	var people = [];
	var appointments = [];

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
		console.log(appointments);
		appointments.forEach(function(appointment){
			var first, last;
			people.forEach(function(person){
				if(person[0] === appointment[1]){
					console.log(person[0], appointment[1]);
					first = person[1];
					last = person[2];
				}
			});
			events.push({
				start: appointment[9] + "T" + parseTime(appointment[8]),
				title: last + ", " + first
			});
		});
		console.log('events: ', events);
		$('#calendar').fullCalendar({
	            events: events,
	            height: 800,
	            contentHeight: 800
	    });
	};

	var setCurrentAppointmentId = function(event){
		console.log(event.currentTarget.attributes.apptId.nodeValue);
		currentAppointmentId = event.currentTarget.attributes.apptId.nodeValue;
		appointments.forEach(function(appointment){
			if(appointment[0] === currentAppointmentId){
				$('#servicerender').val(appointment[2]);
				$('#productfee').val(appointment[3]);
				$('#servicefee').val(appointment[4]);
				$('#tax').val(appointment[5]);
				$('#tip').val(appointment[6]);
				$('#totalfee').val(appointment[7]);
				$('#time').val(appointment[8]);
				$('#servicedate').val(appointment[9]);
				$('#notes').val(appointment[10]);
			}
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
			if(res.result.values && res.result.values.length){
				res.result.values.forEach(function(value){
					if(value.length) people.push(value);
				});
			}
			loadAppointments();
			console.log('load people success', people);

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
			calendarSetup();
			createList();
			loadPerson(currentPersonId);
			console.log('load appointments success', appointments);

		}, function(e){
			console.log('load appointments error');
			console.log(e);
		});
	}

	var loadPerson = function(id){
		ss.values.get({
		    spreadsheetId: peopleId,
		    range: 'A1:G',
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
						var date = appointment[9] ? appointment[9] : "";
						var service = appointment[2] ? appointment[2] : "";
						var fees = appointment[7] ? "$" + appointment[7] : "";
						var notes = appointment[10] ? appointment[10] : "";
						var newNode = $('<tr apptId="' + appointment[0]+ '"class="highlight clearboth" data-toggle="modal" data-id="1" data-target="#apptModal"><td>'+ date +'</td><td>'+ service +'</td><td>'+ fees +'</td><td>'+ notes +'</td></tr>');
						$('#appointments').append(newNode);
						newNode.click(setCurrentAppointmentId);
					}
				});
			}, function(e) {
			  	console.log(e);
			    console.log('edit person error');
		  });
		
	};

	loadPeople();	

	function updateSS(id, range, array){
		return ss.values.update({valueInputOption: 'RAW', majorDimension: 'ROWS', spreadsheetId: id, range: range, values: array}).then(function(response){
			console.log('update success');
			//loadPeople();
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
			  	console.log(array);
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
		  		if(!row) {
		  			console.log('id not found');
		  			return;
		  		}
		  		var range = 'B' + row + ":G" + row;
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
		    range: 'A1:K',
		  }).then(function(response) {
		  		var row = null;
		  		for(var i = response.result.values.length - 1 ; i > 0 ; i--){		
		  			if (!response.result.values[i].length) row = i + 1;
		  		}
		  		if(!row) row = response.result.values.length + 1;
		  		var range = 'A' + row + ":K" + row;
		  		var now = (Date.now() / 2).toString(36);
		  		var array = [[
		  		now,
		  		appt.id,
		  		appt.service,
		  		appt.pfee,
		  		appt.sfee,
		  		appt.tax,
		  		appt.tip,
		  		appt.total,
		  		appt.time,
		  		appt.date,
		  		appt.notes
		  		]];
			  	console.log(array);
			  	updateSS(appointmentsId, range, array).then(function(response){
				console.log('add appointment success');
				currentAppointmentId = now;
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
		    range: 'A1:K',
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
		  		var range = 'B' + row + ":K" + row;
			  	updateSS(appointmentsId, range, array).then(function(response){
				console.log('edit appointment success', range, array);
				loadAppointments();
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('edit editAppointment error');
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


	var sophiesBackMassage = {
		id: 'iql3h8vd',
  		service: 'Back Massage',
  		pfee: '2.32',
  		sfee: '200.00',
  		tax: '.08',
  		tip: '2.00',
  		total: '220.5',
  		time: new Date().toTimeString(),
  		date: new Date().toDateString(),
  		notes: 'seemed a little drunk'
	};

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
		service: $('#servicerender').val(),
		pfee: $('#productfee').val(),
		sfee: $('#servicefee').val(),
		tax: $('#tax').val(),
		tip: $('#tip').val(),
		total: $('#totalfee').val(),
		time: $('#time').val(),
		date: $('#servicedate').val(),
		notes: $('#notes').val(),
		};
		if(!currentAppointmentId){
			addAppointment(appointment);
		}else{
			editAppointment(currentAppointmentId, [[
				currentPersonId,
				$('#servicerender').val(),
				$('#productfee').val(),
				$('#servicefee').val(),
				$('#tax').val(),
				$('#tip').val(),
				$('#totalfee').val(),
				$('#time').val(),
				$('#servicedate').val(),
				$('#notes').val(),
				]]);
		}
		$('#apptModal').modal('hide');
	});
	
	$('#newappt').click(function(){
		currentAppointmentId = null;
		$('#servicerender').val("");
		$('#productfee').val(0);
		$('#servicefee').val(0);
		$('#tax').val(8);
		$('#tip').val(0);
		$('#totalfee').val(0);
		$('#time').val(0);
		$('#servicedate').val(0);
		$('#notes').val("");
		console.log('current appt nulled');
	});

	$('#apptdelete').click(function(){
		deleteAppointment(currentAppointmentId);
		$('#apptModal').modal('hide');
	});

	$('#save-client').click(function(){
		var client = [[
			$('#lname').val(),
			$('#fname').val(),
			$('#address').val(),
			$('#phone').val(),
			$('#eMail').val(),
			$('#bday').val()
			]];

		editPerson(currentPersonId, client);
	});

	$('#newclientyes').click(function(){
		addPerson();
		$('#newclientmodal').modal('hide');
		console.log("adding person");
	});

	$('#delclientyes').click(function(){
		deletePerson(currentPersonId);
	});

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
	console.log(people);
	
}

// for(var i = 0 ; i < date.length ; i++){
// 			for(var j = 1 ; j < date.length ; j++){
// 			  	if (date[i] > date[j]){
// 			  		recentd = date[i]; 
// 			  	}
// 			  	else if (date[j] > date[i]){
// 			  		recentd = date[j];
// 			  	}
// 			}	
// 			values.push({d: recentd,});
// 			console.log('date', recentd);
// 		}


