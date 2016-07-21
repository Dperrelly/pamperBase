function main(){
	var ss = gapi.client.sheets.spreadsheets;
	var apptID = window.location.pathname.substr(7);
	var appointmentsId = "1g_RV4hpbn-dJ5GsfyHHOZ6a3FxHecevTmts84kN2jp8";
	var peopleId = "1LRsyBbR57X9Gc2z1CLeUnHXkEpCiIwacnm2Hj4DbWSI";
	var servuctsId = '1S0rzD4T5ougGfzZGqp6H8bm-QP8Zy29oPJeQpDiUYQ0';
	var appointment = [];
	var person = [];
	var services = [];
	var products = [];
	var done = {
		person: false,
		servucts: false,
		done: false
	};
	var total = 0;

	function twoNumberDecimal(number) {
		if(number === "") return 0;
	    return parseFloat(number).toFixed(2);
	}
	
	ss.values.get({
			spreadsheetId: appointmentsId,
			range: 'A2:K'
		}).then(function(res){
			if(res.result.values && res.result.values.length){
				res.result.values.forEach(function(value){
					if(value[0] === apptID) $.merge(appointment, value);
				});
			}
			getPerson();
			getServucts();
			dateObject = new Date(Date.parse(appointment[7]));
			dateReadable = dateObject.toDateString();
			$('#date').text(dateReadable);
			$('#time').text(" " + appointment[6]);
			$('#taxPercent').text("Tax: (" + Number(appointment[2]) + "%)");
			$('#paid').text("Paid: $" + twoNumberDecimal((Number(appointment[9]) + Number(appointment[10]))) + " ");
			$('#cashcredit').text("($" + twoNumberDecimal(appointment[9]) + " cash, $" + twoNumberDecimal(appointment[10]) + " credit)");
			$('#notes').text("Notes: " + appointment[8]);
			total += Number(appointment[3]);
		}, function(e){
			console.log('load appointment error');
			console.log(e);
		});

	function getPerson(){
		ss.values.get({
				spreadsheetId: peopleId,
				range: 'A2:G'
			}).then(function(res){
				if(res.result.values && res.result.values.length){
					res.result.values.forEach(function(value){
						if(value[0] === appointment[1]) person = value;
					});
				}
				$("#name").text(person[1] + " " + person[2]);
				done.person = true;
				if(done.person && done.servucts && !done.done){
					done.done = true;
					$('#cat').hide();
					$('#hider').show();
					window.print();
				}
			}, function(e){
				console.log('load person error');
				console.log(e);
			});
	}

	function getServucts(){
		ss.values.get({
				spreadsheetId: servuctsId,
				range: 'A2:F'
			}).then(function(res){
				console.log(appointment);
				if(res.result.values && res.result.values.length){
					res.result.values.forEach(function(value){
						if(value[1] === apptID) {
							if(value[3] === "Service") services.push(value);
							else if(value[3] === "Product") products.push(value);
						}
					});
				}
				var serviceTotal = 0, productTotal = 0, taxTotal = 0;
				var discount = "";
				var br = "";
				if(services.length)services.forEach(function(service){
					discount = "";
					br = "";
					serviceTotal += Number(service[4]);
					if(Number(service[5]) > 0) {
						serviceTotal -= service[5];
						discount = "(-$" + twoNumberDecimal(service[5]) + ")";
						br = "<br>";
					}
					$('#serviceList').append($('<li>' + service[2] + '</li>' + br));
					$('#servicePriceList').append($('<li>$' + service[4] + "<br>" + discount + '</li>'));
				});
				if(products.length)products.forEach(function(product){
					discount = "";
					br = "";
					if(Number(product[5]) > 0) {
						productTotal -= product[5];
						discount = "(-$" + twoNumberDecimal(product[5]) + ")";
						br = "<br>";
					}
					var thisTax = twoNumberDecimal((Number(appointment[2]) / 100) * product[4]);
					taxTotal += Number(thisTax);
					$('#taxList').append($('<li>$' + thisTax + '</li>' + br));
					$('#productList').append($('<li>' + product[2] +'</li>' + br));
					$('#productPriceList').append($('<li>$' + product[4] + "<br>" + discount +'</li>'));
					productTotal += Number(product[4]);
				});
				total += taxTotal;
				total += productTotal;
				total += serviceTotal;
				$('#serviceList').append($('<li class="subtotal">Subtotal: </li>'));
				$('#servicePriceList').append($('<li class="subtotal">$' + twoNumberDecimal(serviceTotal) +'</li>'));
				$('#productList').append($('<li class="subtotal">Subtotal: </li>'));
				$('#productPriceList').append($('<li class="subtotal">$' + twoNumberDecimal(productTotal) +'</li>'));
				$('#taxList').append($('<li class="subtotal">$' + twoNumberDecimal(taxTotal) +'</li>'));

				$('#tip').text("Tip: $" + twoNumberDecimal(appointment[3]));
				$('#total').text("Total: $" + twoNumberDecimal(total));
				$('#owed').text("Owed: $" + ( twoNumberDecimal(total) - (twoNumberDecimal((Number(appointment[9]) + Number(appointment[10]))))));
				done.servucts = true;
				if(done.person && done.servucts && !done.done){
					done.done = true;
					$('#cat').hide();
					$('#hider').show();
					window.print();
				}
			}, function(e){
				console.log('load servucts error');
				console.log(e);
			});
	}

	



}