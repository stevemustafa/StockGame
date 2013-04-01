var cash = 1000000;
var shares = [[0,0,0],[0,0,0],[0,0,0]];

function updateValues(){
    $("#txtCash").val(cash);

    var tableMap = $('#sharesTable > tbody > tr').map(function (){
        return $(this).children().map(function ()
        {
            return $(this);
        });
    });


    for(var i =0; i < shares.length; i++)
    {
        for(var j =0; j < shares[i].length; j++){
            if (j==2 && shares[i][0] == 0) 
                tableMap[i+1][j+1].text(0);
            else
                tableMap[i+1][j+1].text(shares[i][j]);
        }
    }
}

$(function () { 

		// Create the chart
		chart = $('#chart-container');
		chart.highcharts({
           chart : {
             renderTo: 'chart-container'
         },
         xAxis: {
                type: 'datetime',
                tickPixelInterval: 100
            },
        plotOptions: {
            series: {
                events: {
                    legendItemClick: function(event) {
                        //select the item from the legend and pipe it to the controls container
                        $('#txtCommodityName').val(this.name);
                        $('#txtCommodityPrice').val(this.data[this.data.length-1].y);
                        //TODO:
                        /*
                        Bind the event so that with every update, the price is also updated.
                        */
                        //stop the original event from firing (that would hide the return)
                        return false;
                    }
                }
            }
        },
        rangeSelector: {
           buttons: [{
              count: 1,
              type: 'seconds',
              text: '1S'
          }, {
              count: 10,
              type: 'seconds',
              text: '10S'
          }, {
              type: 'all',
              text: 'All'
          }],
          inputEnabled: false,
          selected: 0
      },
      title: {
       text: 'Stock Market - Note, this is not real'
   },
   exporting: {
    enabled: false
},
series : []
});
    });

$(function(){

    var socket = io.connect('http://localhost:1337');
    socket.on('prices', function (data) { handleNewState(data) });

    function handleNewState(data){
        var series;
        var time = Date.parse('now').seconds;

        //inject the received data into the series object
        for(var i = 0; i < data.prices.length; i++)
        {
            series = chart.highcharts().series;
            //check if the series exists first
            var item = $.parseJSON(data.prices[i]); 
            
            var com = findCommoditySeries(series, item);
            
            if(com == -1){
                chart.highcharts().addSeries({
                    name: item.commodity,
                    type: 'spline',
                    data: []                    
                });
            }
            else
            {
                var index = findCommoditySeries(series, item);
                var series = chart.highcharts().series[index];
                var shift = series.data.length > 10;
                series.addPoint([time,item.price],false,shift);
                chart.highcharts().redraw();
            }
        }

    }

    function findCommoditySeries(series, commodity){
        for(var i = 0; i < series.length; i++)
        {
            if(series[i].name == commodity.commodity)
                return i;
        }
        return -1; 
    }
});

$(function() {

    $("#txtCash").val(cash);

});

$(function() {

    $("#btnBuy").click(function(){
        var cost = $('#txtCommodityPrice').val() * 100;
        if((cash - cost) >= 0)
        {
            cash -= cost;
            switch($("#txtCommodityName").val())
            {
                case "gold": 
                    shares[0][2] = (shares[0][1] + cost)/(100 + shares[0][0]);
                    shares[0][0] += 100;
                    shares[0][1] = shares[0][0] * shares[0][2]
                    break;
                case "oil": 
                    // shares[1][2] = (shares[1][0] * shares[1][1] + cost)/(100 + shares[1][0]);
                    shares[1][2] = (shares[1][1] + cost)/(100 + shares[1][0]);
                    shares[1][0] += 100;
                    shares[1][1] = shares[1][0] * shares[1][2]
                    break;
                case "pork bellies": 
                    shares[2][2] = (shares[2][1] + cost)/(100 + shares[2][0]);
                    shares[2][0] += 100;
                    shares[2][1] = shares[2][0] * shares[2][2]
                    break;
            }

            updateValues();
        }
        
    });


    $("#btnSell").click(function(){
        var worth = $('#txtCommodityPrice').val() * 100;
        
        // check that there are shares, you cannot sell what you have - at least not yet

        

        switch($("#txtCommodityName").val())
            {
                case "gold": 
                    if(shares[0][0] == 0)
                        return;
                    shares[0][2] =  (shares[0][0] > 100) ? (shares[0][1] - worth)/(shares[0][0] - 100) : shares[0][1];
                    shares[0][0] -= 100;
                    shares[0][1] = shares[0][0] * shares[0][2]
                    break;
                case "oil": 
                    if(shares[1][0] == 0)
                        return;
                    shares[1][2] =  (shares[1][0] > 100) ? (shares[1][1] - worth)/(shares[1][0] - 100) : shares[1][1];
                    shares[1][0] -= 100;
                    shares[1][1] = shares[1][0] * shares[1][2]
                    break;
                case "pork bellies": 
                    if(shares[2][0] == 0)
                        return;
                    shares[2][2] =  (shares[2][0] > 100) ? (shares[2][1] - worth)/(shares[2][0] - 100) : shares[2][1];
                    shares[2][0] -= 100;
                    shares[2][1] = shares[2][0] * shares[2][2]
                    break;
            }
            cash += worth;
            updateValues();
    });
});