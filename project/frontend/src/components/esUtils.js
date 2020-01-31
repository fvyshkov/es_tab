
export function processTree(treeList, callbackForItem, childrenFieldName = 'items'){
    for (var i=0; i < treeList.length; i++ ){
        callbackForItem(treeList[i]);
        if (treeList[i][childrenFieldName]){
            processTree(treeList[i][childrenFieldName], callbackForItem);
        }
    }
}


export function getFilterSkeyByCell(params){
    if (params.context.getFilterSkey){
        return params.context.getFilterSkey();
    }else {
        return '';
    }
}

export function getFilterSkey(filterNodes){
        var skey = '';
        for (var filterID in filterNodes){
            if (Object.prototype.hasOwnProperty.call(filterNodes, filterID)) {
                var filterNodeList = filterNodes[filterID].filter_node_list;
                var itemID = getCheckedFilterNodeId(filterNodeList);
                if (itemID !='0'){
                    skey = skey+ 'FLT_ID_'+filterID+'=>'+itemID+',';
                }
            }
        }
        return skey;
    }

function getCheckedFilterNodeId(nodeList){
        for (var i=0; i<nodeList.length; i++){
            if (nodeList[i]['checked']){
                return nodeList[i]['id'];
            }
            if (nodeList[i]['children']){
                var nestedResult = getCheckedFilterNodeId(nodeList[i]['children']);
                if (nestedResult != '0'){
                   return nestedResult;
                }
            }
        }
        return '0';
    }