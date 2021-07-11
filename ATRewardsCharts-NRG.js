var rewards = []
var masternodeRequirement = 1000.0
var masternodeBalance = 0.0
var balanceRange = []
var lastNrgPrice = 0.0
balanceRange.minimum = 0.0
balanceRange.maximum = 0.0

function createChart() {
    var chart = fullBalanceAreaChart("chartContainer")
    chart.render()
}

function createBalanceIncrementChart() {
    var chart = fullBalanceIncrementAreaChart("incrementAreaChartContainer")
    chart.render()
}

function createBalanceDifferencesChart() {
    var chart = balanceDifferencesAreaChart("balanceDifferencesAreaChartContainer")
    chart.render()
}

function createCharts() {
    updateTips()
    updateHeader()
    createChart()
    createBalanceIncrementChart()
    createBalanceDifferencesChart()
}

function createChartsFromFile() {
    parseRewardData(createCharts)
}

function updateHeader() {
    $("#nrgPriceContainer").html("Last parsed Energi price (NRG): $" + addZeroes(lastNrgPrice))
}

function updateTips() {
    $("#helfullTipsContainer").show()
}

function updateSelectedFileContainer() {
    var filename = $("#csvfile").val()
    filename = filename.replace(/^.*[\\\/]/, '')
    $("#selectedFileContainer").html("Selected: <b>" + filename + "</b>")
}

function Reward(rewardArray) {
    var self = this
    var rewardTimeString = rewardArray[0]
    rewardTimeString = rewardTimeString.replaceAll('"', '')
    rewardTimeString = rewardTimeString.replace(" ", "T") + "Z"
    self.rewardTime = new Date(rewardTimeString)
    self.blockNum = rewardArray[1]
    self.rewardType = rewardArray[2]
    self.mnAddress = rewardArray[3]
    self.balance = parseFloat(rewardArray[4])
    self.reward = parseFloat(rewardArray[5])
    self.nrgPrice = parseFloat(rewardArray[6])
}

function rewardArray(csv) {
	var csvArray = csv.split(",")
	return csvArray
}

function parseRewardData(callback) {
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv)$/

    //Checks whether the file is a valid csv file    
    if (regex.test($("#csvfile").val().toLowerCase())) {
        //Checks whether the browser supports HTML5
        if (typeof(FileReader) != "undefined") {
            var reader = new FileReader()

            reader.onload = function(e) {

                //Splitting of Rows in the csv file
                var csvrows = e.target.result.split("\n")
                
                for (var i = 0; i < csvrows.length; i++) {
                    if (csvrows[i] != "") {

                        // create reward array
                        var thisRewardArray = rewardArray(csvrows[i])
                        var thisReward = new Reward(thisRewardArray)
                        updateData(thisReward)

                        var rewardsLength = rewards.push(thisReward)
                        //console.log("reward: " + thisReward.reward + ", rewardsLength: " + rewardsLength)
                    }
                }

                callback()
            }

            reader.readAsText($("#csvfile")[0].files[0]);
        } else {
            alert("Sorry! Your browser does not support HTML5!");
        }
    } else {
        alert("Please upload a valid CSV file!");
    }
}

function updateData(reward) {
    if (reward.rewardType == "M") {
        masternodeBalance = reward.balance
    }
    if ($.isNumeric(reward.nrgPrice)) {
        lastNrgPrice = reward.nrgPrice
    }
    updateBalanceRange(reward)
}

function updateBalanceRange(reward) {
    var balance = 0.0
    if (reward.balance) {
        balance = reward.balance

        // handle masternode balance or staking balance
        if (balance >= masternodeBalance) {
            balance -= masternodeBalance
        }

        balance += masternodeBalance

        // lowest
        if (balance < balanceRange.minimum) {
            balanceRange.minimum = balance
        }

        // highest
        if (balance > balanceRange.maximum) {
            balanceRange.maximum = balance
        }       
    }
}

function chartRange() {
    var range = []
    var max = balanceRange.maximum
    if (max < masternodeRequirement) {
        max = masternodeRequirement
    }

    range.maximum = Math.ceil(max / 20) * 20
    range.maximum += masternodeRequirement
    range.minimum = 0

    if (range.minimum < -20) {
        range.minimum = -20
    }

    range.interval = range.maximum / 10

    return range
}

function incrementChartRange(rewardsArray) {

    for (var i = 0; i < rewardsArray.length; i++) {
        var reward = rewardsArray[i]
    }  

    var range = []
    var max = balanceRange.maximum
    if (max < 1000) {
        max = 1000
    }

    range.maximum = Math.ceil(max / 1000) * 1000;
    range.maximum += 1000
    range.minimum = -20

    range.interval = range.maximum / 10

    return range
}

function averageRewards() {

}

function balanceIncrementDataFromRewards(rewardsArray) {
    var tableDataPoints = []
    var differenceDataPoints = []
    var usDollarDataPoints = []
    var nrgPrice = lastNrgPrice
    var previousBalance = 0
    var runningTotal = 0
    var range = []
    range.maximum = 0.0
    range.minimum = 0.0

    var differenceRange = []
    differenceRange.maximum = 0.0
    differenceRange.minimum = 0.0

    for (var i = 0; i < rewards.length; i++) {
        var reward = rewardsArray[i]
        var balance = reward.balance
        
        if (balance && reward.rewardType != "M") {

            while (balance >= masternodeRequirement) {
                balance -= masternodeRequirement
            }

            // add the masternodeBalance back
            balance += masternodeBalance

            if (balance != previousBalance) {
                if (tableDataPoints.length == 0) {
                    previousBalance = balance
                }

                var difference = balance - previousBalance
                previousBalance = balance

                runningTotal += difference

                if (runningTotal < range.minimum) {
                    range.minimum = runningTotal
                }

                if (runningTotal > range.maximum) {
                    range.maximum = runningTotal
                }

                if (difference < differenceRange.minimum) {
                    differenceRange.minimum = difference
                }

                if (difference > differenceRange.maximum) {
                    differenceRange.maximum = difference
                }
                var differencePrefix = difference < 0 ? "" : "+"
                var dataPoint = { y: runningTotal, x: reward.rewardTime, label: differencePrefix + difference + "NRG" }
                var differenceDataPoint = { y: difference, x: reward.rewardTime }
                var usDollarDataPoint = { y: runningTotal * nrgPrice, x: reward.rewardTime, label: differencePrefix + (difference * nrgPrice) + "USD" }
                tableDataPoints.push(dataPoint)
                differenceDataPoints.push(differenceDataPoint)
                usDollarDataPoints.push(usDollarDataPoint)

            }
        }       
    }

    var results = []
    results.tableDataPoints = tableDataPoints
    results.differenceDataPoints = differenceDataPoints
    results.range = range
    results.differenceRange = differenceRange
    results.usDollarDataPoints = usDollarDataPoints

    // console.log("tableDataPoints:")
    // console.log(tableDataPoints)
    return results
}

function fullBalanceDataFromRewards(rewardsArray) {
    var tableDataPoints = []

    // start at 1 since the first item in the array is the column titles
    for (var i = 1; i < rewardsArray.length; i++) {
        var reward = rewardsArray[i]
        var balance = reward.balance
        var previousBalance = 0
        
        if (balance) {

            // handle masternode balance or staking balance
            while (balance >= masternodeBalance) {
                balance -= masternodeBalance
            }

            if (balance != previousBalance && balance != 0) {
                previousBalance = balance

                // add the masternodeBalance back
                balance += masternodeBalance
                var dataPoint = { y: balance, x: reward.rewardTime }
                tableDataPoints.push(dataPoint)
            }
        }       
    }

    return tableDataPoints
}

function fullBalanceAreaChart(elementId) {
    var dataPoints = fullBalanceDataFromRewards(rewards)
    var range = chartRange()
    var chart = new CanvasJS.Chart(elementId,
    {
        zoomEnabled: true,
        zoomType: "xy",
        title: {
            text: "NRG Balance"
        },
        toolTip: {
            shared: true
        },
        axisX: {
            valueFormatString: "MMM YYYY",
            interval: 1,
            intervalType: "month"
        },
        axisY:{
            maximum: range.maximum,
            minimum: range.minimum,
            interval: range.interval
        },

        legend: {
        verticalAlign: "bottom",
        horizontalAlign: "center"
        },
        data: [
            {
                type: "area",
                name: "balance",
                showInLegend: "true",
                dataPoints: dataPoints
            }
        ]
    });

    // console.log("datapoints:")
    // console.log(dataPoints)
    return chart
}

function fullBalanceIncrementAreaChart(elementId) {
    var data = balanceIncrementDataFromRewards(rewards)
    var dataPoints = data.tableDataPoints
    var usDollarDataPoints = data.usDollarDataPoints
    var range = data.range
    if (lastNrgPrice > 1.0) {
        range.maximum = range.maximum * lastNrgPrice
        range.minimum = range.minimum * lastNrgPrice
    }
    var maximum = Math.ceil(range.maximum / 10) * 10
    var minimum = Math.ceil(range.minimum / 10) * 10
    
    if (minimum < 0) {
        minimum -= 10
    }

    if (minimum < -100) {
        minimum = -100
    }

    var interval = maximum / 10

    var chart = new CanvasJS.Chart(elementId,
    {
        zoomEnabled: true,
        zoomType: "xy",
        title: {
            text: "Balance Increments"
        },
        toolTip: {
            shared: true,
            content: "{name}: {y} ({label})"
        },
        axisX: {
            valueFormatString: "MMM YYYY",
            interval: 1,
            intervalType: "month"
        },
        axisY:{
            maximum: maximum,
            minimum: minimum,
            interval: interval
        },

        legend: {
        verticalAlign: "bottom",
        horizontalAlign: "center"
        },
        data: [
            {
                type: "area",
                name: "Running Total (NRG)",
                showInLegend: "true",
                dataPoints: dataPoints,
                color: "blue"
            },
            {
                type: "area",
                name: "Running Total (USD)",
                showInLegend: "true",
                dataPoints: usDollarDataPoints,
                color: "green"
            }
        ]
    });

    // console.log("datapoints:")
    // console.log(dataPoints)
    return chart
}

function balanceDifferencesAreaChart(elementId) {
    var data = balanceIncrementDataFromRewards(rewards)
    var dataPoints = data.differenceDataPoints
    var range = data.differenceRange
    var maximum = Math.ceil(range.maximum / 5) * 5
    var minimum = Math.ceil(range.minimum / 5) * 5

    if (minimum < 0) {
        minimum -= 5
    }

    if (minimum < -20) {
        minimum = -20
    }

    var interval = maximum / 10

    var chart = new CanvasJS.Chart(elementId,
    {
        zoomEnabled: true,
        zoomType: "xy",
        title: {
            text: "Balance Differences"
        },
        toolTip: {
            shared: true
        },
        axisX: {
            valueFormatString: "MMM YYYY",
            interval: 1,
            intervalType: "month"
        },
        axisY:{
            maximum: maximum,
            minimum: minimum,
            interval: interval
        },

        legend: {
        verticalAlign: "bottom",
        horizontalAlign: "center"
        },
        data: [
            {
                type: "column",
                name: "difference",
                showInLegend: "true",
                dataPoints: dataPoints
            }
        ]
    });

    // console.log("datapoints:")
    // console.log(dataPoints)
    return chart
}

function addZeroesForNumber(num) {
    let numberString = String(num)
  const dec = numberString.split('.')[1]
  const len = dec && dec.length > 2 ? dec.length : 2
  var fixedNum = Number(num).toFixed(len)
  return fixedNum
}

function addZeroes(num) {
    let numberString = String(num)
  const dec = numberString.split('.')[1]
  const len = dec && dec.length > 2 ? dec.length : 2
  var fixedNum = Number(num).toFixed(len)
  return String(fixedNum)
}
