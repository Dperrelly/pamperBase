function main(){
	var ss = gapi.client.sheets.spreadsheets;
	var appointmentsId = "1g_RV4hpbn-dJ5GsfyHHOZ6a3FxHecevTmts84kN2jp8";
	var peopleId = "1LRsyBbR57X9Gc2z1CLeUnHXkEpCiIwacnm2Hj4DbWSI";
	var currentPersonId = null;
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
			console.log('load appointments success', appointments);

		}, function(e){
			console.log('load appointments error');
			console.log(e);
		});
	}

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
			  	updateSS(peopleId, range, array).then(function(response){
				console.log('delete person success');
				loadPeople();
				appointments.forEach(function(appointment){
					if(appointment[1] === id) deleteAppointment(appointment[0]);
				});
			});
		  }, function(e) {
		  	console.log(e);
		    console.log('delete person error');
		  });
	}


	function addPerson(per){
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
		  		var array = [[now, per.first, per.last, per.address, per.cell, per.email, per.dob]];
			  	console.log(array);
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
		  		var now = Date.now().toString(36);
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

	$('#deletesophie').click(function(){
		console.log('deleting sophie');
		deletePerson(peopleIds[0][1]);
	});

	$('#addsophie').click(function(){
		console.log('adding sophie');
		addPerson(sophie);
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