function main(){
	var ss = gapi.client.sheets.spreadsheets;
	var appointmentsId = "1g_RV4hpbn-dJ5GsfyHHOZ6a3FxHecevTmts84kN2jp8";
	var peopleId = "1LRsyBbR57X9Gc2z1CLeUnHXkEpCiIwacnm2Hj4DbWSI";
	var currentPersonId = 'iql3hgup';
	var currentAppointmentId = null;
	var people = [];
	var appointments = [];
	// var templateArray = [
	// 	['First Name', 'Last Name', 'Address', 'Cell Phone', 'E-mail', 'DOB'],
	// 	['','','','',''],
	// 	['','','','',''],
	// 	['<APPOINTMENTS>','','','',''],
	// 	['Treatment Name', 'Product Cost', 'Treatment Fee', 'Total Cost', 'Date', 'Notes']
	// 	];

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
			if(res.result.values && res.result.values.length){
				res.result.values.forEach(function(value){
					if(value.length) appointments.push(value);
				});
			}
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
				$('#email').val(response.result.values[row][5]);
				$('#bday').val(response.result.values[row][6]);

				$('#appointments').empty();

				appointments.forEach(function(appointment){
					if(appointment[1] === currentPersonId){
						console.log(appointment);
						var notes = appointment[10] ? appointment[10] : "";
						$('#appointments').append($('<tr class="highlight" data-toggle="modal" data-id="1" data-target="#apptModal"><td>'+ appointment[9] +'</td><td>'+ appointment[2] +'</td><td>'+ appointment[7] +'</td><td>'+ notes +'</td></tr>'));
					}
				});
			}, function(e) {
			  	console.log(e);
			    console.log('edit person error');
		  });
		
	};

	loadPeople();
	loadAppointments();
	

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
				loadPeople();
			});
		  }, function(e) {
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
		  			if (response.result.values[i][0] === id) row = i + 2;
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


	
	$('#save-client').click(function(){
		var client = [[
			$('#lname').val(),
			$('#fname').val(),
			$('#address').val(),
			$('#phone').val(),
			$('#email').val(),
			$('#bday').val()
			]];

		editPerson(currentPersonId, client);
	});

	$('#newclientyes').click(function(){
		addPerson();
		$('#newclientmodal').modal('hide');
		console.log("adding person");
	});

	$('#delclientmodal').click(function(){
		deletePerson(currentPersonId);
	});

	// function parseId(res){
	// 	var string = JSON.stringify(res.body);
	// 	var ID = "";
	// 	for(var x = 27; string[x] != '\\' ; x++){
	// 		ID += string[x];
	// 	}
	// 	return ID;
	// }

	// function addPerson(per){
	// 	ss.create({properties: {title: per.last + ", " + per.first}})
	// 	.then(function(resp){
	// 		ID = parseId(resp);
	// 		window.localStorage.ssId = ID;

	// 		personalArray = templateArray;
	// 		personalArray[1] = [per.first, per.last, per.address, per.cell, per.email, per.dob];

	// 		updateSS(ID, 'A1:F5', personalArray).then(function(res){
	// 			console.log('GOTTEM');
	// 			loadPeople();
	// 			// go to person's page
	// 		});

	// 		appendRow(peopleId, [per.last + ", " + per.first, ID]);

			
	// 	}, function(e){
	// 		console.log(e);
	// 		console.log('creation error');
	// 	});
	// }

	
}