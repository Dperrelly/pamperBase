function main(){
	var ss = gapi.client.sheets.spreadsheets;
	var templateId = "1g_RV4hpbn-dJ5GsfyHHOZ6a3FxHecevTmts84kN2jp8";
	var templateArray = [
		['First Name', 'Last Name', 'Address', 'Cell Phone', 'E-mail', 'DOB'],
		['','','','',''],
		['','','','',''],
		['<APPOINTMENTS>','','','',''],
		['Treatment Name', 'Product Cost', 'Treatment Fee', 'Total Cost', 'Date', 'Notes']
		];
	var peopleId = "1LRsyBbR57X9Gc2z1CLeUnHXkEpCiIwacnm2Hj4DbWSI";
	var peopleIds = [];
	var peopleIdsRaw = [];
	var people = [];
	window.localStorage.ssId = null;

	function loadPeople(){
		ss.values.get({
			spreadsheetId: peopleId,
			range: 'A2:B'
		}).then(function(res){
			if(res.result.values.length){
				res.result.values.forEach(function(value){
					peopleIdsRaw.push(value);
					if(value[0] && value[1]) peopleIds.push(value);
				});
				peopleIds.forEach(function(person){
					ss.values.get({
						spreadsheetId: person[1],
						range: "A1:F"
					}).then(function(res){
						people.push(res.result.values);
					}, function(e){
						console.log('load people error');
						console.log(e);
					});
				});
			}
		}, function(e){
			console.log('load peopleIds error');
			console.log(e);
		});
	}

	loadPeople();

	function deletePerson(id){
		var personRow;
		peopleIdsRaw.forEach(function(person, index){
			console.log(person);
			if(person[1] === id) personRow = index + 2;
		});
		if(personRow){
			updateSS(peopleId, 'A' + personRow + ":B" + personRow, [["", ""]]);
		} else {
			console.log('person not found');
		}
	}

	$('#deletesophie').click(function(){
		console.log('deleting sophie');
		deletePerson(peopleIds[0][1]);
	});

	$('#addsophie').click(function(){
		console.log('adding sophie');
		addPerson(sophie);
	});
	

	function updateSS(id, range, array){
		return ss.values.update({valueInputOption: 'RAW', majorDimension: 'ROWS', spreadsheetId: id, range: range, values: array}).then(function(response){
			console.log('update success');
			loadPeople();
		}, function(e){
			console.log('update error');
			console.log(e);
		});
	}

	function appendRow(id, array){
		ss.values.get({
		    spreadsheetId: id,
		    range: 'A1:F',
		  }).then(function(response) {
		  		range = 'A' + (response.result.values.length + 1) + ":F" + (response.result.values.length + 1);
			  	ss.values.update({valueInputOption: 'RAW', majorDimension: 'ROWS', spreadsheetId: id, range: range, values: [array]}).then(function(response){
				console.log('update success');
				loadPeople();
			}, function(e){
				console.log('update error');
				console.log(e);
		});
		  }, function(response) {
		    console.log('append error');
		  });
	}

	function parseId(res){
		var string = JSON.stringify(res.body);
		var ID = "";
		for(var x = 27; string[x] != '\\' ; x++){
			ID += string[x];
		}
		return ID;
	}

	function addPerson(per){
		ss.create({properties: {title: per.last + ", " + per.first}})
		.then(function(resp){
			ID = parseId(resp);
			window.localStorage.ssId = ID;

			personalArray = templateArray;
			personalArray[1] = [per.first, per.last, per.address, per.cell, per.email, per.dob];

			updateSS(ID, 'A1:F5', personalArray).then(function(res){
				console.log('GOTTEM');
				loadPeople();
				// go to person's page
			});

			appendRow(peopleId, [per.last + ", " + per.first, ID]);

			
		}, function(e){
			console.log(e);
			console.log('creation error');
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
}