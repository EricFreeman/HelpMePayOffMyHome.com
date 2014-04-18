$(function() {
	var loanAmount, interestRate, monthlyPayment, 
		extraMonthly, startDate, isBiMonthly;
		
	populateStartYear();
	
	//default value of text boxes to $0.00 so code won't break when they're empty
	$('input[type="text"]').focusout(function() {
		if(this.value=='') this.value = toMoney(0);
	});
	
	//get new value of fields
	$('#recalculate').click(function() {
		loanAmount = fromMoney($('#loanAmount').val());
		interestRate = $('#interestRate').val();
		monthlyPayment = fromMoney($('#monthlyPayment').val());
		extraMonthly = fromMoney($('#extraMonthly').val());
		isBiMonthly = $('#isBiMonthly').prop('checked');
		if(isBiMonthly) monthlyPayment /= 2;
		
		var startMonth = $('#startDateMonth').val();
		var startYear = $('#startDateYear').val();
		startDate = new Date(startMonth + '/1/' + startYear);
		
		calculateTable();
		
		$('#loanAmount').val(toMoney(fromMoney($('#loanAmount').val())));
		$('#monthlyPayment').val(toMoney(fromMoney($('#monthlyPayment').val())));
		$('#extraMonthly').val(toMoney(fromMoney($('#extraMonthly').val())));
	});
	
	//rounds to two decimal points and the .000001 fixes 1.005 not rounding to 1.01
	function round(inp) {
		var num = parseFloat(inp);
		return Math.round((num + 0.00001) * 100) / 100
	}
	
	//calculate new 
	function calculateTable() {
		var balance = round(loanAmount),
			interestPaidAllTime = 0.0,
			monthlyInterest = 0.0,
			table = "<table><tr><td>Payment #</td><td>Date Paid</td><td>Balance</td><td>Towards Principal</td><td>Towards Interest</td><td>Total Interest Paid</td></tr>",
			lastMonth, currMonth,
			towardsPrincipal,
			towardsInterest,
			paymentNum = 1;
			
		extraMonthly = round(extraMonthly);
		monthlyPayment = round(monthlyPayment);
		
		//clear out previous table
		$("#here_table").html("");
		
		while(balance > 0) {
			monthlyInterest = getInterestPayment(balance);
			
			//only the portion of your payment that doesn't go to interest goes to your principal
			balance = round(balance - monthlyPayment - extraMonthly);
			
			//if it's still the previous month, don't add in interest again (for bi-weekly payments)
			if(lastMonth != startDate.getMonth()) {
				balance = round(balance + monthlyInterest);
				towardsPrincipal = round(monthlyPayment + extraMonthly - monthlyInterest);
				towardsInterest = round(monthlyInterest);
				interestPaidAllTime = round(interestPaidAllTime + monthlyInterest);
			}
			else {
				towardsPrincipal = round(monthlyPayment + extraMonthly);
				towardsInterest = 0;
			}
			
			//if your final payments goes under balance, then take that part out of the payment and reset balance to 0
			if(balance < 0) {
				towardsPrincipal = round(towardsPrincipal - Math.abs(balance));
				balance = 0;
			}
			
			//add the row to the table
			table += createRow(paymentNum, startDate, balance, towardsPrincipal, towardsInterest, interestPaidAllTime);
			
			//increment the date by 1 month or 14 days depending on payment schedule
			lastMonth = startDate.getMonth();
			if(isBiMonthly)
				startDate.setDate(startDate.getDate() + 14);
			else
				startDate.setMonth(startDate.getMonth() + 1);
			
			//every 25th row throw in an advertisement row as well
			if(paymentNum%25==0)
				table += createAdRow();
				
			paymentNum++;
		}
		
		table += "</table>";
		
		$('#here_table').append(table);
	}
	
	//populate the combobox for start year
	function populateStartYear() {
		var d = new Date(),
			combo = $('#startDateYear');
		
		for(var i = d.getFullYear(); i >= d.getFullYear() - 30; i--) {
			combo.append("<option value='" + i + "'>" + i + "</option>");
		}
	}
	
	//get the part of payment that goes towards interest
	function getInterestPayment(balance) {
		// blance * interestRate / months in year
		return round(balance * (interestRate / 100) / 12);
	}
	
	//create a new row in the table using the parameters
	function createRow(paymentNum, startDate, balance, towardsPrincipal, towardsInterest, interestPaidAllTime) {
		var row = "";
		
		row += "<tr>";
		row += "<td>" + paymentNum + "</td>";
		row += "<td>" + (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear() + "</td>";
		row += "<td>" + toMoney(balance) + "</td>";
		row += "<td>" + toMoney(towardsPrincipal) + "</td>";
		row += "<td>" + toMoney(towardsInterest) + "</td>";
		row += "<td>" + toMoney(interestPaidAllTime) + "</td>";
		row += "</tr>";
		
		return row;
	}
	
	//I'm a horrible person for this, I know :(
	function createAdRow() {
		var row = "";
		
		row += "<tr>";
		row += "<td colspan='6'>";
		row += "<iframe src='http://rcm-na.amazon-adsystem.com/e/cm?t=hemepaofmyho-20&o=1&p=12&l=ur1&category=local&banner=0ASW3QKMM8DXW61JZ6G2&f=ifr' width='300' height='250' scrolling='no' border='0' marginwidth='0' style='border:none;' frameborder='0'></iframe><iframe src='http://rcm-na.amazon-adsystem.com/e/cm?t=hemepaofmyho-20&o=1&p=12&l=ur1&category=electronicsrot&f=ifr' width='300' height='250' scrolling='no' border='0' marginwidth='0' style='border:none;' frameborder='0'></iframe>";
		row += "</td>";
		row += "</tr>";
		
		return row;
	}
	
	//format the passed in float as money
	function toMoney(num) {
		var numStart = 1;
		num = "$" + num;
		if(num.indexOf('.') < 0)
			num = num + ".00";
		else if(/\.\d$/.test(num))
			num += "0";
			
		//fix bug where it was putting comma if number was negative because it started with two chatacters ($-)
		if (num.substr(0, 2) == '$-') numStart = 2;
		
		//format the number with commas
		for(var i = num.indexOf('.') - 3; i > numStart; i=i-3) {
			num = num.substr(0, i) + ',' + num.substr(i, num.length);
		}
			
		return num;
	}
	
	//take a string formatted as money and turn it into a float
	function fromMoney(num) {
		return parseFloat(num.replace('$', '').replace(',', ''));
	}
});