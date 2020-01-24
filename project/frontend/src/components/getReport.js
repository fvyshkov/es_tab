
export function getReport(reportCode, params){
    var requestParams={DBG: "1", RPT_CODE: reportCode, PARAMS: params}
    var httpStr = window.location.origin + '/get_report/?params='+ JSON.stringify(requestParams);
    downloadFile(httpStr);
}

function downloadFile(dataurl) {
    var a = document.createElement("a");
    a.href = dataurl;
    a.click();
}