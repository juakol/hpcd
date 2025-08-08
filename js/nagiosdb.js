try{
    //Gauge meters objects
    var oCaeNas1Home15UsageGm;
    var oCaeNas1Home15AwaitingTimeGm;

    //Chart objects
    var oCaeNas1Home15PerformanceChart;

    //Data providers
    var oHome15PerformanceData = [];

    //Some basic colors
    var _green = "#28a745"; // Bootstrap success
    var _yellow ="#ffc107"; // Bootstrap warning
    var _red = "#dc3545";   // Bootstrap danger

    var UPDATE_INTERVAL_MS = 10000; // 10s per request
    var SIMULATE_RANDOM = true; // set to true to simulate random values for home15 and other widgets

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
                    "#0d6efd",   // primary
                    "#fd7e14"    // orange
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
                        "bulletSize": 6,
                        "id": "usage-graph",
                        "lineThickness": 2,
                        "title": "Usage",
                        "valueAxis": "usage-axis",
                        "valueField": "usage",
                        "yAxis": "usage-axis"
                    },
                    {
                        "bullet": "round",
                        "bulletSize": 6,
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
                    var iTotalRows = Math.ceil(oQuotas.length/iGroupsPerRow);
                    var rowIndex = 0;
                    while(rowIndex < iTotalRows){
                        var oRow = oTable.insertRow(oTable.rows.length);
                        var groupIndex = 0;
                        var cellCountLimit = iGroupsPerRow*2;
                        while(groupIndex < cellCountLimit && (rowIndex * iGroupsPerRow + Math.floor(groupIndex/2)) < oQuotas.length){
                            var currentIndex = rowIndex * iGroupsPerRow + Math.floor(groupIndex/2);
                            var oCellGrupo = oRow.insertCell(groupIndex++);
                            var oCellQuedan = oRow.insertCell(groupIndex++);

                            oCellGrupo.className = "grupo-cell";
                            oCellGrupo.id = oQuotas[currentIndex].grupo;
                            oCellGrupo.innerText = oQuotas[currentIndex].grupo;
                             
                            oCellQuedan.className = "quedan-cell";
                            oCellQuedan.innerText = oQuotas[currentIndex].quedan;
                            oCellQuedan.id = oQuotas[currentIndex].grupo+"-status";
                            if (currentIndex==oQuotas.length-1 && groupIndex<(iGroupsPerRow*2)-1){
                                oCellQuedan.style.borderRight = "3px solid black";
                            }
                        }
                        rowIndex++;
                    } 
                }
            }
            //xhttp.open("GET", "http://cae-adm.eadscasa.casa.corp:8880/nagios/logs/cae_adm_check_quotas.htm", true);
            xhttp.open("GET", "logs/cae_adm_check_quotas.htm", true);
            xhttp.send();  
        }
        catch(ex){console.log(ex.message);}    
    }

    function initializeChartData(){
        try{
            var oHome15PerformanceData = [];
            var oDate = moment();
            oHome15PerformanceData.unshift({
                "usage": "",
                "awaiting-time": "",
                "date": oDate.format("HH:mm")
            });
            for (var i=0;i<10;i++){
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
                        _logData = _logData.match(/[0-9]+\.[0-9]{2}/g);
                        var usageValue = parseFloat(_logData[1]);
                        if (usageValue > 100.00) { usageValue = 100.00; }
                        window[_oWidget].refresh(usageValue);
                    break;

                    case "oCaeNas1Home15AwaitingTimeGm":
                        _logData = _logData.match(/[0-9]+\.[0-9]{2}/g);
                        var awaitingValue = parseFloat(_logData[0]);
                        if (awaitingValue > 10) {
                            window[_oWidget].refresh(awaitingValue, Math.floor(awaitingValue) + 1);
                        } else {
                            window[_oWidget].refresh(awaitingValue, 10);
                        }
                    break;

                    case "oCaeNas1Home15PerformanceChart":
                            var _perfData = _logData.match(/[0-9]+\.[0-9]{2}/g);
                            var _awaitingTime = parseFloat(_perfData[0]);
                            var _usage = parseFloat(_perfData[1]);
                            if (_usage > 100.00) { _usage = 100.00; }
                            var oDate = moment();
                            oCaeNas1Home15PerformanceChart.dataProvider.shift();
                            oCaeNas1Home15PerformanceChart.dataProvider.push({
                                "usage": _usage,
                                "awaiting-time": _awaitingTime,
                                "date": oDate.format("HH:mm")
                            });
                            oCaeNas1Home15PerformanceChart.validateData();
                    break;

                    case "archivo-status":
                        _logData=String(_logData.match(/OK|CRITICAL/i));
                        switch(_logData){
                            case "OK":
                                $("#archivo-status").css({'background-color': _green, 'color':'#fff'});
                                $("#archivo-status").text("OK");
                            break;

                            case "CRITICAL":
                                $("#archivo-status").css({'background-color': _red, 'color':'#fff'});
                                $("#archivo-status").text("ERROR");
                            break;
                        }
                    break;

                    case "tarantella-status":
                        var perfData=_logData.match(/Accepting|NOT/g);
                        for (var i=1;i<=perfData.length;i++){
                            switch(perfData[i-1]){
                                case "Accepting":
                                    $("#tarantella-status-"+i).css({'background-color': _green, 'color':'#fff'});
                                    $("#tarantella-status-"+i).text('mln'+i+' OK');                                        
                                break;

                                case "NOT":
                                    $("#tarantella-status-"+i).css({'background-color': _red, 'color':'#fff'});
                                    $("#tarantella-status-"+i).text('mln'+i+' ERROR');                                        
                                break;
                            }
                        }
                    break;

                    case "queue-status":
                        $("#queue-status").text(String(_logData.match(/[0-9]+/))+" queued jobs");
                    break;

                    case "quotas-status":
                        var oQuotas = JSON.parse(_logData);
                        for(var i=0;i<oQuotas.length;i++){
                             var $grupoCell = $("#"+oQuotas[i].grupo);
                             var $statusCell = $("#"+oQuotas[i].grupo+"-status");
                             var quedanText = oQuotas[i].quedan;
                             $statusCell.text(quedanText);
                            if(quedanText === "OK"){
                                $grupoCell.css({'background-color': _green, 'color':'#fff'});
                                $statusCell.css({'background-color': _green, 'color':'#fff'});
                            }
                            else{
                                $grupoCell.css({'background-color': _yellow, 'color':'#111827'});
                                $statusCell.css({'background-color': _yellow, 'color':'#111827'});
                            }
                        }
                    break;
                }
            }
        }
        catch(ex){console.log(ex.message);}    
    }

    function fetchText(url, onSuccess){
        try{
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    onSuccess(this.responseText);
                }
            }
            xhttp.open("GET", url, true);
            xhttp.send();
        } catch(ex){ console.log(ex.message); }
    }

    function updateGm(){
        try{
            if (document.hidden) { return; }

            if (SIMULATE_RANDOM) {
                // home15 (usage/awaiting + chart)
                var usage = (Math.random() * 100).toFixed(2);
                var awaiting = (Math.random() * 10).toFixed(2);
                var simulated = "awaiting " + awaiting + " usage " + usage;
                setValue("oCaeNas1Home15PerformanceChart", simulated);
                setValue("oCaeNas1Home15UsageGm", simulated);
                setValue("oCaeNas1Home15AwaitingTimeGm", simulated);

                // Archivo status
                var archivoOk = Math.random() < 0.7; // 70% OK
                setValue("archivo-status", archivoOk ? "OK" : "CRITICAL");

                // Tarantella 4 nodes
                var tokens = [];
                for (var ti=0; ti<4; ti++){ tokens.push(Math.random()<0.8 ? "Accepting" : "NOT"); }
                setValue("tarantella-status", tokens.join(" "));

                // Queue size
                var q = Math.floor(Math.random()*200);
                setValue("queue-status", String(q));

                // Quotas: use existing groups in table if present
                var grupos = document.querySelectorAll('#quotas-table .grupo-cell');
                if (grupos && grupos.length){
                    var quotas = [];
                    for (var gi=0; gi<grupos.length; gi++){
                        var gId = grupos[gi].id || grupos[gi].textContent || ("G"+(gi+1));
                        var ok = Math.random() < 0.5;
                        quotas.push({ grupo: gId, quedan: ok ? "OK" : String(Math.floor(Math.random()*50)) });
                    }
                    setValue("quotas-status", JSON.stringify(quotas));
                }
            } else {
                // Fetch shared home15 log once
                fetchText("logs/cae_nas1_check_home15.htm", function(resp){
                    setValue("oCaeNas1Home15PerformanceChart", resp);
                    setValue("oCaeNas1Home15UsageGm", resp);
                    setValue("oCaeNas1Home15AwaitingTimeGm", resp);
                });
                // Independent lightweight requests
                fetchText("logs/cae_adm_check_archivo.htm", function(resp){ setValue("archivo-status", resp); });
                fetchText("logs/mln2_check_osgd.htm", function(resp){ setValue("tarantella-status", resp); });
                fetchText("logs/cae_adm1_check_queued_jobs.htm", function(resp){ setValue("queue-status", resp); });
                fetchText("logs/cae_adm_check_quotas.htm", function(resp){ setValue("quotas-status", resp); });
            }
        }
        catch(ex){console.log(ex.message);}    
    }

    setInterval(function(){ updateGm(); }, UPDATE_INTERVAL_MS);
}
catch(ex){console.log(ex.message);}