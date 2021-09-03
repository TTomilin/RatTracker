const DataExporter = function () {
    this.tableExport = null;
    let experimentHistory = [];
    let eventHistory = [];
    let headers = [];
    let mimeType = 'xlsx';
    const mainSheetName = 'Experiments';
    const n_horizontal_data_points = 19; // Number of rows in the data table before events
    const explorationBoxData = ['Enterings', 'Objects', 'Rearings', 'Line crossings'];
    const oMazeData = ['Open enterings', 'Closed enterings', 'Head dips', 'SAPs'];

    let excludedActivities;
    let experiment = $('#form-experiment').val();
    switch (experiment) { // Determine the excluded activities based on the experiment
        case 'exploration-box':
            excludedActivities = oMazeData;
            break;
        case 'o-maze':
            excludedActivities = explorationBoxData;
            break;
    }

    $("table.table-data tr").each(function(){
        let value = { v: $(this).find("td:first").text(), t: 's' };
        if (excludedActivities.indexOf(value.v) === -1) {
            headers.push(value); // Add every element in the first column of the data table
        }
    });
    headers.pop(); // Remove 'Event'
    experimentHistory.push(headers); // Add the headers as the first row of the experiment history

    this.exportData = function() {
        this.tableExport = $(".table").tableExport({
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
        let fileName = new Date(Date.now()).toISOString();
        this.tableExport.defaultFileName = fileName;
        try {
            const table = this.tableExport.getExportData()['tableexport-1'][mimeType];
            storeTableData(table.data);

            let wb = new this.tableExport.Workbook();
            let ws = this.tableExport.createSheet(experimentHistory);
            wb.SheetNames.push(mainSheetName);
            wb.Sheets[mainSheetName] = ws;
            eventHistory.forEach((eventSet) => { // Add a sheet for events of every experiment
                const sheetName = eventSet.rat.v;
                ws = this.tableExport.createSheet(eventSet.events);
                wb.SheetNames.push(sheetName);
                wb.Sheets[sheetName] = ws;
            });

            const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
            const wbout = XLSX.write(wb, wopts);

            let rawData = this.tableExport.string2ArrayBuffer(wbout);
            let options = { type: table.mimeType + ";" + this.charset };
            saveAs(new Blob([rawData], options), fileName + table.fileExtension, true);
        } catch(e) {
            console.error('Error exporting data as XLSX', e);
            console.log('Switching to CSV format as default');
            mimeType = 'csv';
        }
    };

    this.remove = function () {
        this.tableExport.remove();
    }

    const storeTableData = function (data) {
        let events = [];
        let values = [];
        for (let i = 0; i < data.length; i++) {
            if (excludedActivities.indexOf(data[i][0].v) > -1) {
                continue;
            }
            if (i < n_horizontal_data_points) {
                values.push(data[i][1]);
            } else {
                events.push(data[i]);
            }
        }
        const ratId = data[2][1];
        experimentHistory.push(values);
        eventHistory.push({ 'rat': ratId, 'events': events });
    };
}
