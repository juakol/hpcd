try{
    //Gauge meters objects
    var oCaeNas1Home15UsageGm;
    var oCaeNas1Home15AwaitingTimeGm;

    //Chart objects
    var oCaeNas1Home15PerformanceChart;

    //Data providers
    var oHome15PerformanceData = [];

    //Some basic colors
    var _green = "#a9d70b";
    var _yellow ="#f9c802";
    var _red = "#FF0E41";

    //Default options for gauge meters
    var dfltOpts = {
        min: 0,
        pointer: true,
        pointerOptions: {
            value: 0,
            toplength: -15,
            bottomlength: 10,
            bottomwidth: 12,
            color: '#8e8e93',
            stroke: '#ffffff',
            stroke_width: 3,
            stroke_linecap: 'round'
        },
        gaugeWidthScale: 0.8,
        counter: false
    }

    $(document).ready(function(){
        try{
            oCaeNas1Home15UsageGm = new JustGage({
                id: 'cae-nas1-check-home15-usage-gm',
                title: 'home15 usage',
                max: 100,
                symbol: '%',
                decimals: 2,
                customSectors: [{
                    color : _green,
                    lo : 0.00,
                    hi : 98.99
                  },{
                    color : _yellow,
                    lo : 99.00,
                    hi : 99.99
                  },{
                    color : _red,
                    lo : 99.99,
                    hi : 101.00
                  }],
                  defaults: dfltOpts
            });

            oCaeNas1Home15AwaitingTimeGm = new JustGage({
                id: 'cae-nas1-check-home15-awaiting-time-gm',
                title: 'home15 awaiting time',
                max: 10,
                symbol: ' ms',
                decimals: 2,
                customSectors: [{
                    color : _green,
                    lo : 0.00,
                    hi : 5.99
                  },{
                    color : _red,
                    lo : 5.99,
                    hi : 2000.00
                  }], 
                  defaults: dfltOpts
              });

            oCaeNas1Home15PerformanceChart = AmCharts.makeChart("home15-performance-chart",{
                "type": "serial",
                "categoryField": "date",
                "columnSpacing": 4,
                "autoDisplay": true,
                "dataDateFormat": "HH:NN",
                "plotAreaFillAlphas": 0.23,
                "colors": [
                    "#88E537",
                    "#70A5BF"
                ],
                "precision": 2,
                "categoryAxis": {
                    "minPeriod": "mm",
                    "parseDates": true,
                    "boldLabels": true,
                },
                "graphs": [
                    {
                        "bullet": "round",
                        "bulletSize": 10,
                        "id": "usage-graph",
                        "lineThickness": 2,
                        "title": "Usage",
                        "valueAxis": "usage-axis",
                        "valueField": "usage",
                        "yAxis": "usage-axis"
                    },
                    {
                        "bullet": "round",
                        "bulletSize": 10,
                        "id": "awaiting-time-graph",
                        "lineThickness": 2,
                        "title": "Awaiting time",
                        "valueAxis": "awaiting-time-axis",
                        "valueField": "awaiting-time",
                        "yAxis": "awaiting-time-axis"
                    }
                ],
                "valueAxes": [
                    {
                        "id": "usage-axis",
                        "maximum": 100,
                        "autoGridCount": false,
                        "tickLength": 3,
                        "title": "Usage",
                        "titleFontSize": 13,
                        "strictMinMax": true,
                        "integersOnly": true,
                        "unit":"%",
                        "labelFrequency": 2,
                        "gridCount": 10
                    },
                    {
                        "id": "awaiting-time-axis",
                        "position": "right",
                        "title": "Awaiting time (ms)",
                        //"maximum": 300,
                        "titleFontSize": 13,
                    }
                ],
                "balloon": {
                    "animationDuration": 0
                },
                "legend": {
                    "enabled": true,
                    "useGraphSettings": true,
                    "switchable": false
                },
                "titles": [
                    {
                        "id": "hom15-performance",
                        "size": 15,
                        "text": "home15 performance"
                    }
                ],
                "initialized": false,
                "dataProvider": initializeChartData()
            });
            oCaeNas1Home15PerformanceChart.validateData();
            $("a[title='JavaScript charts']").hide();

            initializeQuotasTable();

            updateGm();
        }
        catch(ex){console.log(ex.message);}
    });

    function initializeQuotasTable(){
        try{
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200){
                    var iGroupsPerRow = 8;
                    var oQuotas = JSON.parse(this.responseText);
                    var oTable = document.getElementById("quotas-table");
                    var oRow, oCellGrupo, oCellQuedan;
                    var iTotalRows = Math.ceil(oQuotas.length/iGroupsPerRow);
                    var i = j = 0;
                    while(j < iTotalRows){
                        oRow = oTable.insertRow(oTable.rows.length);
                        var k = 0;
                        while(k < iGroupsPerRow*2 && i < oQuotas.length){
                            oCellGrupo = oRow.insertCell(k++);
                            oCellQuedan = oRow.insertCell(k++);
                            
                            oCellGrupo.className = "grupo-cell";
                            oCellGrupo.id = oCellGrupo.innerText = oQuotas[i].grupo;
                             
                            oCellQuedan.className = "quedan-cell";
                            oCellQuedan.innerText = oQuotas[i].quedan;
                            oCellQuedan.id = oQuotas[i].grupo+"-status";
                            i++;
                        }
                        j++;
                    } 
                }
            }
            xhttp.open("GET", "http://cae-adm.eadscasa.casa.corp:8880/nagios/logs/cae_adm_check_quotas.htm", true);
            xhttp.send();  
        }
        catch(ex){console.log(ex.message);}
    }

    function initializeChartData(oDataProvider, iTimeInterval){
        try{
            var oHome15PerformanceData = [];
            var oDate = moment();
            oHome15PerformanceData.unshift({
                "usage": "",
                "awaiting-time": "",
                "date": oDate.format("HH:mm")
            });
            for (i=0;i<10;i++){
                oDate.subtract(1,"minute");
                oHome15PerformanceData.unshift({
                    "usage": "",
                    "awaiting-time": "",
                    "date": oDate.format("HH:mm")
                });
            }
            return oHome15PerformanceData;
        }
        catch(ex){console.log(ex.message);}
    }

    function setValue(_oWidget, _logData){
        try
        {
            if (_logData.match(/Unknown|not defined/gi)===null)
            {
                switch(_oWidget)
                {
                    case "oCaeNas1Home15UsageGm":
                        _logData =_logData.match(/[0-9]+\.[0-9]{2}/g);
                        if(parseFloat(_logData[1])>100.00){_logData[1]=100.00;}
                        window[_oWidget].refresh(parseFloat(_logData[1]));
                    break;

                    case "oCaeNas1Home15AwaitingTimeGm":
                        _logData =_logData.match(/[0-9]+\.[0-9]{2}/g);
                        if(parseFloat(_logData)>10){
                            window[_oWidget].refresh(parseFloat(_logData[0]), Math.floor(parseFloat(_logData)+1));
                        }
                        else{
                            window[_oWidget].refresh(parseFloat(_logData[0]), 10);
                        }
                    break;

                    case "oCaeNas1Home15PerformanceChart":
                            var _perfData = _logData.match(/[0-9]+\.[0-9]{2}/g);
                            var _awaitingTime = _perfData[0];
                            var _usage
                            if(parseFloat(_perfData<100.00)){
                                _usage=100.00;
                            }
                            else{
                                _usage=parseFloat(_perfData[1]);
                            }
                            var oDate = moment();
                            oCaeNas1Home15PerformanceChart.dataProvider.shift();
                            oCaeNas1Home15PerformanceChart.dataProvider.push({
                                "usage": _usage,
                                "awaiting-time": _awaitingTime,
                                "date": oDate.format("HH:mm")
                            });
                            oCaeNas1Home15PerformanceChart.validateData();
                            $("a[title='JavaScript charts']").hide();
                    break;

                    case "archivo-status":
                        _logData=String(_logData.match(/OK|CRITICAL/i));
                        switch(_logData){
                            case "OK":
                                $("#archivo-status").css('background-color', _green);
                                $("#archivo-status").text("OK");
                            break;

                            case "CRITICAL":
                                $("#archivo-status").css('background-color', _red);
                                $("#archivo-status").text("ERROR");
                            break;
                        }
                    break;

                    case "tarantella-status":
                        var perfData=_logData.match(/Accepting|NOT/g);
                        for (i=1;i<=perfData.length;i++){
                            switch(perfData[i-1]){
                                case "Accepting":
                                    $("#tarantella-status-"+i).css('background-color', _green);
                                    $("#tarantella-status-"+i).text('mln'+i+' OK');                                        
                                break;

                                case "NOT":
                                    $("#tarantella-status-"+i).css('background-color', _red);
                                    $("#tarantella-status-"+i).text('mln'+i+' ERROR');                                        
                                break;
                            }
                        }
                    break;

                    case "queue-status":
                        $("#queue-status").text(String(_logData.match(/[0-9]+/))+" queued jobs");
                    break;
                }
            }
        }
        catch(ex){console.log(ex.message);}
    }

    function loadData(_oWidget, _logName){
        try{
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    setValue(_oWidget, this.responseText);
                }
            }
            xhttp.open("GET", "http://cae-adm.eadscasa.casa.corp:8880/nagios/logs/"+_logName, true);
            //xhttp.open("GET", "logs/"+ _logName, true);
            xhttp.send();
        }
        catch(ex){console.log(ex.message);}
    }

    function updateGm(){
        try{
            loadData("oCaeNas1Home15PerformanceChart", "cae_nas1_check_home15.htm");
            loadData("oCaeNas1Home15UsageGm", "cae_nas1_check_home15.htm");
            loadData("oCaeNas1Home15AwaitingTimeGm", "cae_nas1_check_home15.htm");
            loadData("archivo-status", "cae_adm_check_archivo.htm");
            loadData("tarantella-status", "mln2_check_osgd.htm");
            loadData("queue-status", "cae_adm1_check_queued_jobs.htm");
            loadData("quotas-status", "cae_adm_check_quotas.htm");
            //oCaeNas1Home15PerformanceChart.validateData();
            //$("a[title='JavaScript charts']").hide();
        }
        catch(ex){console.log(ex.message);}
    }

    setInterval(function(){updateGm();}, 60000);
}
catch(ex){console.log(ex.message);}