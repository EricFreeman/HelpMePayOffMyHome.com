$(function() {
	var loanAmount, interestRate, monthlyPayment, 
		extraMonthly, startDate, isBiMonthly;
	
	//get new value of fields
	$('#recalculate').click(function() {
		loanAmount = $('#loanAmount').val();
		interestRate = $('#interestRate').val();
		monthlyPayment = $('#monthlyPayment').val();
		extraMonthly = $('#extraMonthly').val();
		startDate = new Date('7/1/2013');
		isBiMonthly = $('#isBiMonthly').prop('checked');
		
		if(isBiMonthly) monthlyPayment /= 2;
		
		calculateTable();
	});
	
	//rounds to two decimal points and the .000001 fixes 1.005 not rounding to 1.01
	function toMoney(inp) {
		var num = parseFloat(inp);
		return Math.round((num + 0.00001) * 100) / 100
	}
	
	//calculate new 
	function calculateTable() {
		var balance = toMoney(loanAmount),
			interestPaidAllTime = 0.0,
			monthlyInterest = 0.0,
			table = "<table><tr><td>Payment #</td><td>Date Paid</td><td>Balance</td><td>Towards Principal</td><td>Towards Interest</td><td>Total Interest Paid</td></tr>",
			lastMonth, currMonth,
			towardsPrincipal,
			towardsInterest,
			paymentNum = 1;
			
		extraMonthly = toMoney(extraMonthly);
		monthlyPayment = toMoney(monthlyPayment);
		
		//clear out previous table
		$("#here_table").html("");
		
		while(balance >= monthlyPayment + extraMonthly) {
			monthlyInterest = getInterestPayment(balance);
			interestPaidAllTime = toMoney(interestPaidAllTime + monthlyInterest);
			
			//only the portion of your payment that doesn't go to interest goes to your principal
			balance = toMoney(balance - monthlyPayment - extraMonthly);
			
			if(lastMonth != startDate.getMonth()) {
				balance = toMoney( balance + monthlyInterest);
				towardsPrincipal = toMoney(monthlyPayment + extraMonthly - monthlyInterest);
				towardsInterest = toMoney(monthlyInterest);
			}
			else {
				towardsPrincipal = toMoney(monthlyPayment + extraMonthly);
				towardsInterest = 0;
			}
			
			table += "<tr>";
			table += "<td>" + paymentNum + "</td>";
			table += "<td>" + (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear() + "</td>";
			table += "<td>" + balance + "</td>";
			table += "<td>" + towardsPrincipal + "</td>";
			table += "<td>" + towardsInterest + "</td>";
			table += "<td>" + interestPaidAllTime + "</td>";
			
			table += "</tr>";
			
			lastMonth = startDate.getMonth();
			if(isBiMonthly)
				startDate.setDate(startDate.getDate() + 14);
			else
				startDate.setMonth(startDate.getMonth() + 1);
				
			paymentNum++;
		}
		
		if(balance > 0) {
			//do one last payment for balance
		}
		
		table += "</table>";
		
		$('#here_table').append(table);
	}
	
	//get the part of payment that goes towards interest
	function getInterestPayment(balance) {
		// blance * interestRate / months in year
		return toMoney(balance * interestRate / 100 / 12);
	}
});