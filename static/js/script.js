$(document).ready(function() {

    var tableExport, experiment, specie, id, dob, sex, age, startTime, duration, ratsPerCage,
        approaches, totalScore, enterings, objects, rearings, crossings,
        openEnterings, closedEnterings, headDips, saps;
    var explorationBoxData = ['Enterings', 'Objects', 'Rearings', 'Line crossings'];
    var oMazeData = ['Open enterings', 'Closed enterings', 'Head dips', 'SAPs'];
    var now = $.now()
    var nowDate = new Date(now);
    var timer = $('.timer').FlipClock(15 * 60, {
        clockFace: 'MinuteCounter',
        countdown: true,
        autoStart: false,
        callbacks: {
            start: function() {
                $('.btn-counter').prop('disabled', false);
            },
            stop: function() {
                $('#table-time-spent').html(clock.getTime().time - 1);
                exportTable();
                clock.stop();
                $('.alert').show();
            }
        }
    });
    var clock = $('.counter').FlipClock({
        clockFace: 'MinuteCounter',
        countdown: false,
        autoStart: false
    });

    var increaseTotal = function() {
        totalScore++;
        $('#table-total').html(totalScore.toString());
    };

    var startClock = function() {
        calculateLatency();
        clock.start();
    };

    var calculateLatency = function() {
        var latency = $('#table-latency');
        if (latency.html() === undefined || latency.html() === '') {
            latency.html(Math.floor(($.now() - startTime) / 1000));
        }
    };

    var exportTable = function() {
        tableExport = $(".table").tableExport({
            headers: true,
            formats: ["xlsx", "csv"],
            fileName: "experiment",
            bootstrap: true,
            exportButtons: true,
            position: "bottom",
            ignoreRows: null,
            ignoreCols: null,
            trimWhitespace: false,
            RTL: false,
            sheetname: "id"
        });
        $.fn.tableExport.defaultFileName = id;
        tableExport.createSheet = function(data, merges) {
            var ws = {};
            var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
            var types = this.typeConfig;
            for (var R = 0; R !== data.length; ++R) {
                for (var C = 0; C !== data[R].length; ++C) {
                    if (range.s.r > R) range.s.r = R;
                    if (range.s.c > C) range.s.c = C;
                    if (range.e.r < R) range.e.r = R;
                    if (range.e.c < C) range.e.c = C;
                    var cell = data[R][C];
                    if (!cell || !cell.v) continue;
                    var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

                    if (!cell.t) {
                        if (types.number.assert(cell.v)) cell.t = 'n';
                        else if (types.boolean.assert(cell.v)) cell.t = 'b';
                        else if (types.date.assert(cell.v)) cell.t = 'd';
                        else cell.t = 's';
                    }
                    if (cell.t === 'd') {
                        cell.t = 'n';
                        cell.z = XLSX.SSF._table[14];
                    }
                    ws[cell_ref] = cell;
                }
            }
            ws["!merges"] = merges;
            if (range.s.c < 10000000) ws["!ref"] = XLSX.utils.encode_range(range);
            return ws;
        };
        try {
            exportData('xlsx');
        } catch(e) {
            console.error(e);
            try {
                exportData('csv');
            } catch(e) {
                console.error(e);
            }
        }
    };

    var exportData = function(mimeType) {
        var data = tableExport.getExportData()['tableexport-1'][mimeType];
        tableExport.export2file(convertTableData(data.data), data.mimeType, id, data.fileExtension);
    };

    var convertTableData = function(data) {
        var newData = [];
        var headers = [];
        var values = [];
        var excludedValues;
        var n_horizontal_data_points = 19;
        var experiment = $('#form-experiment').val();
        if (experiment === 'exploration-box') {
            excludedValues = oMazeData;
        } else if (experiment === 'o-maze') {
            excludedValues = explorationBoxData;
        }
        for (var i = 0; i < data.length; i++) {
            if (excludedValues.indexOf(data[i][0].v) > -1) {
                continue;
            }
            if (i < n_horizontal_data_points) {
                headers.push(data[i][0]);
                values.push(data[i][1]);
            } else {
                if (i === n_horizontal_data_points) {
                    newData.push(headers);
                    newData.push(values);
                    newData.push([]);
                }
                newData.push(data[i]);
            }
        }
        return newData;
    };

    var reset = function() {
        enterings = objects = rearings = crossings = openEnterings = closedEnterings = headDips = saps = approaches = totalScore = 0;
        $('#table-latency').html('');
        $('#table-time-spent').html('0');
        $('#table-total').html('0');
        $('.counter-element').html('0');
        $('#main-container').hide();
        $('.experiment-box').hide();
        $('.experiment-maze').hide();
        $('.alert').hide();
        $('#form-div').show();
        $('.table .event').remove();
        $('#navbar-title').html('Activity tracker');

        if (tableExport) {
            tableExport.remove();
        }
        if (timer.running) {
            timer.stop();
        }
        if (clock.running) {
            clock.stop();
        }
        timer.setTime(duration === undefined ? 900 : duration);
        clock.reset();
    };

    $('#input-form').submit(function () {
        var form = $('#input-form');
        experiment = form.find('select[name=experiment]').val();
        specie = form.find('input[name=specie]').val();
        id = form.find('input[name=id]').val();
        sex = form.find('select[name=sex]').val();
        dob = form.find('input[name=dob]').val();
        specie = form.find('input[name=specie]').val();
        duration = form.find('input[name=duration]').val();
        ratsPerCage = form.find('input[name=rpc]').val();
        age = Math.round((now - new Date(dob).getTime()) / (7 * 24 * 60 * 60 * 1000));

        $('#table-date').html(nowDate.toLocaleDateString('en-GB'));
        $('#table-specie').html(specie);
        $('#table-id').html(id);
        $('#table-sex').html(sex);
        $('#table-dob').html(new Date(dob).toLocaleDateString('en-GB'));
        $('#table-age').html(age);
        $('#table-rpc').html(ratsPerCage);

        timer.setTime(duration);
        timer.original = duration;

        $('#main-container').show();
        $('#form-div').hide();

        if (experiment === 'exploration-box') {
            $('#navbar-title').html('Exploration Box');
            $('.experiment-box').show();
            $('.experiment-box-buttons').css('display', 'flex');
        } else if (experiment === 'o-maze') {
            $('#navbar-title').html('O-maze');
            $('.experiment-maze').show();
        }
        return false;
    });

    $('#form-experiment').change(function() {
        var experiment = $('#form-experiment').val();
        var duration;
        if (experiment === 'exploration-box') {
            duration = 15 * 60;
        } else if (experiment === 'o-maze') {
            duration = 5 * 60;
        }
        $('#form-duration').val(duration);
    });

    $('.start-timer').click(function() {
        timer.start();
        startTime = $.now();
    });

    $('.start-counter').click(function() {
        startClock();
    });

    $('.pause-counter').click(function() {
        clock.stop();
    });

    // Exploration box
    $('.btn-entering').click(function() {
        enterings++;
        startClock();
        $('#table-enterings').html(enterings);
        logEvent('Entering', 'table-enterings-row');
    });
    $('.btn-object').click(function() {
        objects++;
        $('#table-objects').html(objects);
        increaseTotal();
        logEvent('Object', 'table-objects-row');
    });
    $('.btn-rearing').click(function() {
        rearings++;
        $('#table-rearings').html(rearings);
        increaseTotal();
        logEvent('Rearing', 'table-rearings-row');
    });
    $('.btn-crossing').click(function() {
        crossings++;
        $('#table-crossings').html(crossings);
        increaseTotal();
        logEvent('Line crossing', 'table-crossings-row');
    });

    // O-maze
    $('.btn-open-entering').click(function() {
        openEnterings++;
        startClock();
        $('#table-open-enterings').html(openEnterings);
        logEvent('Open entering', 'table-open-enterings-row');
    });
    $('.btn-closed-entering').click(function() {
        closedEnterings++;
        calculateLatency();
        clock.stop();
        $('#table-closed-enterings').html(closedEnterings);
        logEvent('Closed entering', 'table-closed-enterings-row');
    });
    $('.btn-head-dip').click(function() {
        headDips++;
        $('#table-head-dips').html(headDips);
        increaseTotal();
        logEvent('Head dip', 'table-head-dips-row');
    });
    $('.btn-sap').click(function() {
        saps++;
        $('#table-saps').html(saps);
        increaseTotal();
        logEvent('SAP', 'table-saps-row');
    });

    // Both experiments
    $('.btn-approach').click(function() {
        approaches++;
        $('#table-approaches').html(approaches);
        logEvent('Approach', 'table-approaches-row');
    });

    $('.btn-reset').click(function() {
        reset();
    });

    var logEvent = function(event, className) {
        var seconds = timer.original - timer.getTime().getTimeSeconds();
        var date = new Date(null);
        date.setSeconds(seconds);
        var time = date.toISOString().substr(14, 5);
        var lastEvent = $('.table .event:first');
        var newRow = '<tr class="event ' + className + '"><td>' + event + '</td><td>' + time + '</td></tr>';
        if (lastEvent.length > 0) {
            lastEvent.before(newRow);
        } else {
            $('.table tr:last').after(newRow);
        }
    };

    reset();
    // $('#input-form').submit();
});
