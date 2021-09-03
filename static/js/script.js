$(document).ready(function() {

    let experiment, specie, id, dob, sex, age, startTime, duration, ratsPerCage,
        approaches, totalScore, enterings, objects, rearings, crossings,
        openEnterings, closedEnterings, headDips, saps;
    const dataExporter = new DataExporter();
    const now = $.now()
    const nowDate = new Date(now);
    const timer = $('.timer').FlipClock(15 * 60, {
        clockFace: 'MinuteCounter',
        countdown: true,
        autoStart: false,
        callbacks: {
            start: function() {
                $('.btn-counter').prop('disabled', false);
            },
            stop: function() {
                $('#table-time-spent').html(clock.getTime().time - 1);
                dataExporter.exportData();
                clock.stop();
                $('.alert').show();
            }
        }
    });
    const clock = $('.counter').FlipClock({
        clockFace: 'MinuteCounter',
        countdown: false,
        autoStart: false
    });

    const increaseTotal = function() {
        totalScore++;
        $('#table-total').html(totalScore.toString());
    };

    const startClock = function() {
        calculateLatency();
        clock.start();
    };

    const calculateLatency = function() {
        const latency = $('#table-latency');
        if (latency.html() === undefined || latency.html() === '') {
            latency.html(Math.floor(($.now() - startTime) / 1000));
        }
    };

    const reset = function() {
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

        if (dataExporter.tableExport) {
            dataExporter.remove();
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
        const form = $('#input-form');
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
        const experiment = $('#form-experiment').val();
        let duration;
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

    const logEvent = function(event, className) {
        const seconds = timer.original - timer.getTime().getTimeSeconds();
        let date = new Date(null);
        date.setSeconds(seconds);
        const time = date.toISOString().substr(14, 5);
        let lastEvent = $('.table .event:first');
        const newRow = '<tr class="event ' + className + '"><td>' + event + '</td><td>' + time + '</td></tr>';
        if (lastEvent.length > 0) {
            lastEvent.before(newRow);
        } else {
            $('.table tr:last').after(newRow);
        }
    };

    reset();
    // $('#input-form').submit();
});
