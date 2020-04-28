import { sendRequestPromise } from './sendRequestPromise.js';

export class TableData {

    constructor(getRequestString, getRowNodeId){
        this.rowData = [];
        this.loadedNodes = [];
        this.getRequestString = getRequestString;
        this.getRowNodeId = getRowNodeId;
    }

    setRequestString(getRequestString){
        this.getRequestString = getRequestString;
    }



    getRowData(){
        return this.rowData;
    }


    loadData(parentNode, reload = false){

        if (reload){
            this.rowData = [];
            this.loadedNodes =[];
        }

        var parentNodeKey = '';
        if (parentNode && parentNode.data){
            parentNodeKey = parentNode.data.node_key;
            this.loadedNodes.push(parentNodeKey);
        }



        return this.getTabData(parentNode)
            .then((data)=>{
                //удаляем фиктивную ноду
                this.rowData = this.rowData.filter(e => e.node_key !== parentNodeKey + '_dummy_child');
                return data;
            })
            .then((data)=>{
                //
                data.forEach(row=>{
                    if (row.children_loaded && row.children_loaded=="1"){
                        this.loadedNodes.push(row.node_key);
                    }
                });
                return data;
            })
            .then((data)=>{
                //добавляем hie_path где его нет (у нас грид всегда в режиме treeData=true)
                data.forEach(el=>{
                    if (!el.hie_path){
                        el['hie_path'] = [this.getRowNodeId(el)];
                    }
                });
                return data;
            })
            .then((data)=> {




                data.forEach(
                    (row)=>{
                        this.rowData.push(row);
                        if (row.column_data){
                            var colData =  row.column_data;
                            for (var colIndex=0; colIndex<colData.length; colIndex++){
                                this.rowData[this.rowData.length-1][colData[colIndex].key] = colData[colIndex].sql_value;
                            }
                        }
                        //вставляем фиктивную ноду под нераскрытую группу
                        if (row.groupfl==='1' && (!row.children_loaded || row.children_loaded!="1") ){
                            this.rowData.push({});
                            var dummy_hie_path = row.hie_path.slice();
                            dummy_hie_path.push(row.node_key + ' dummy child');
                            this.rowData[this.rowData.length-1]['hie_path'] = dummy_hie_path;
                            this.rowData[this.rowData.length-1]['node_key'] = row.node_key + '_dummy_child';
                            this.rowData[this.rowData.length-1]['name'] = 'DUMMY';
                        }
                    }
                );
                return this.rowData;
            });




    }

    getTabData(parentNode){

        var httpStr = this.getRequestString();

        var parentNodeKey;

        if (parentNode && parentNode.data){
            parentNodeKey = parentNode.data.node_key;
            httpStr += '&flt_id=' + parentNode.data.flt_id + '&flt_item_id=' + parentNode.data.flt_item_id;
        }

        if (parentNode && parentNode.data && parentNode.data.hie_path){
            var pathToExpandedNode = '';
            if (parentNode.data.hie_path_keys){
                parentNode.data.hie_path_keys.forEach(el=>{pathToExpandedNode += el+','});
            }else{
                parentNode.data.hie_path.forEach(el=>{pathToExpandedNode += el+','});
            }
            httpStr += '&group_keys='+pathToExpandedNode;
        }
        return sendRequestPromise(httpStr);

    }
}