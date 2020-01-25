
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