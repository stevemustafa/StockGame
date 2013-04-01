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
                        
                        //stop the original event from firing (that would hide the spline)
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
            // console.log(item);
            
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