try {
    //Gauge meters objects
    var oCaeAdm1FreeNodesGm;
    var oCaeNas1Home15UsageGm;
    var oCaeNas1Home15AwaitingTimeGm;
    //Chart objects
    var oCaeNas1Home15PerformanceChart;
    //Data providers
    var oHome15PerformanceData = [];
    //Some basic colors
    var _green = "#a9d70b";
    var _yellow = "#f9c802";
    var _red = "#ff0000";
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
    $(document).ready(function() {
        try {
            oCaeAdm1FreeNodesGm = new JustGage({
                id: 'cae-adm1-check-free-nodes-gm',
                name: 'oCaeAdm1freeNodesGm',
                title: 'free nodes',
                max: 90,
                decimals: 0,
                customSectors: [{
                    color: _red,
                    lo: 0,
                    hi: 5
                }, {
                    color: _yellow,
                    lo: 6,
                    hi: 10
                }, {
                    color: _green,
                    lo: 11,
                    hi: 200
                }],
                defaults: dfltOpts
            });
            oCaeNas1Home15UsageGm = new JustGage({
                id: 'cae-nas1-check-home15-usage-gm',
                title: 'home15 usage',
                max: 100,
                symbol: '%',
                decimals: 2,
                customSectors: [{
                    color: _green,
                    lo: 0.00,
                    hi: 98.99
                }, {
                    color: _yellow,
                    lo: 99.00,
                    hi: 99.99
                }, {
                    color: _red,
                    lo: 100.00,
                    hi: 100.00
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
                    color: _green,
                    lo: 0.00,
                    hi: 5.99
                }, {
                    color: _red,
                    lo: 5.99,
                    hi: 10.00
                }],
                defaults: dfltOpts
            });
            oCaeNas1Home15PerformanceChart = AmCharts.makeChart("cae-nas1-home15-performance-chart", {
                "type": "serial",
                "categoryField": "date",
                "columnSpacing": 4,
                "autoDisplay": true,
                "dataDateFormat": "HH:NN",
                "plotAreaFillAlphas": 0.23,
                "colors": ["#88E537", "#70A5BF"],
                "precision": 2,
                "categoryAxis": {
                    "minPeriod": "mm",
                    "parseDates": true,
                    "boldLabels": true,
                },
                "graphs": [{
                    "bullet": "round",
                    "bulletSize": 10,
                    "id": "usage-graph",
                    "lineThickness": 2,
                    "title": "Usage",
                    "valueAxis": "usage-axis",
                    "valueField": "usage",
                    "yAxis": "usage-axis"
                }, {
                    "bullet": "round",
                    "bulletSize": 10,
                    "id": "awaiting-time-graph",
                    "lineThickness": 2,
                    "title": "Awaiting time",
                    "valueAxis": "awaiting-time-axis",
                    "valueField": "awaiting-time",
                    "yAxis": "awaiting-time-axis"
                }],
                "valueAxes": [{
                    "id": "usage-axis",
                    "maximum": 100,
                    "autoGridCount": false,
                    "tickLength": 3,
                    "title": "Usage",
                    "titleFontSize": 13,
                    "strictMinMax": true,
                    "integersOnly": true,
                    "unit": "%",
                    "labelFrequency": 2,
                    "gridCount": 10
                }, {
                    "id": "awaiting-time-axis",
                    "position": "right",
                    "title": "Awaiting time (ms)",
                    //"maximum": 300,
                    "titleFontSize": 13,
                }],
                "balloon": {
                    "animationDuration": 0
                },
                "legend": {
                    "enabled": true,
                    "useGraphSettings": true,
                    "switchable": false
                },
                "titles": [{
                    "id": "hom15-performance",
                    "size": 15,
                    "text": "home15 performance"
                }],
                "initialized": false,
                "dataProvider": initializeChartData()
            });
            oCaeNas1Home15PerformanceChart.validateData();
            $("a[title='JavaScript charts']").hide();
            updateGm();
        } catch (ex) {
            console.log(ex.message);
        }
    });

    function initializeChartData(oDataProvider, iTimeInterval) {
        try {
            var oHome15PerformanceData = [];
            var oDate = moment();
            oHome15PerformanceData.unshift({
                "usage": "",
                "awaiting-time": "",
                "date": oDate.format("HH:mm")
            });
            for (i = 0; i < 10; i++) {
                oDate.subtract(1, "minute");
                oHome15PerformanceData.unshift({
                    "usage": "",
                    "awaiting-time": "",
                    "date": oDate.format("HH:mm")
                });
            }
            return oHome15PerformanceData;
        } catch (ex) {
            console.log(ex.message);
        }
    }

    function setValue(_oWidget, _logData) {
        try {
            if (_logData.match(/Error|Unknown|not defined/i) === null) {
                switch (_oWidget) {
                    case "oCaeAdm1FreeNodesGm":
                        _logData = _logData.match(/[0-9]+/g);
                        iFreeNodes = _logData[0];
                        iTotalNodes = _logData[1];
                        window[_oWidget].refresh(iFreeNodes, iTotalNodes);
                        break;
                    case "oCaeNas1Home15UsageGm":
                        _logData = _logData.match(/[0-9]+\.[0-9]{2}/g);
                        if (parseFloat(_logData[1]) > 100.00) {
                            _logData[1] = 100.00;
                        }
                        window[_oWidget].refresh(parseFloat(_logData[1]));
                        break;
                    case "oCaeNas1Home15AwaitingTimeGm":
                        _logData = _logData.match(/[0-9]+\.[0-9]{2}/g);
                        if (parseFloat(_logData) > 10) {
                            window[_oWidget].refresh(parseFloat(_logData[0]), Math.floor(parseFloat(_logData) + 1));
                        } else {
                            window[_oWidget].refresh(parseFloat(_logData[0]), 10);
                        }
                        break;
                    case "oCaeNas1Home15PerformanceChart":
                        var _perfData = _logData.match(/[0-9]+\.[0-9]{2}/g);
                        var _awaitingTime = _perfData[0];
                        var _usage
                        if (parseFloat(_perfData < 100.00)) {
                            _usage = 100.00;
                        } else {
                            _usage = parseFloat(_perfData[1]);
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
                        $("tspan:contains('Show all')").hide();
                        break;
                }
            } else {
                window[_oWidget].refresh("NaN");
            }
        } catch (ex) {
            console.log(ex.message);
        }
    }

    function loadData(_oWidget, _logName) {
        try {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var _logData = this.responseText;
                    setValue(_oWidget, _logData);
                }
            }
            xhttp.open("GET", "logs/" + _logName, true);
            xhttp.send();
        } catch (ex) {
            console.log(ex.message);
        }
    }

    function updateGm() {
        try {
            loadData("oCaeNas1Home15PerformanceChart", "cae_nas1_check_home15.htm");
            //loadData("oCaeAdm1FreeNodesGm", "cae_adm1_check_free_nodes.htm");
            loadData("oCaeNas1Home15UsageGm", "cae_nas1_check_home15.htm");
            loadData("oCaeNas1Home15AwaitingTimeGm", "cae_nas1_check_home15.htm");
            //oCaeNas1Home15PerformanceChart.validateData();
            //$("a[title='JavaScript charts']").hide();
        } catch (ex) {
            console.log(ex.message);
        }
    }
    setInterval(function() {
        updateGm();
    }, 60000);
} catch (ex) {
    console.log(ex.message);
}