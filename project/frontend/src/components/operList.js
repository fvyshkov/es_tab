

export class operList{

    constructor(proc_id, bop_id, nstat){
        this.proc_id = proc_id;
        this.bop_id = bop_id;
        this.nstat = nstat;
        this.itemsList = [];

    }


    init(){
        var httpStr = 'operlist/?proc_id=' + this.proc_id;
        httpStr += '&bop_id=' + this.bop_id;
        httpStr += '&nstat=' + this.nstat;

        sendRequestPromise(httpStr)
            .then((operList)=> {
                this.itemsList = operList;
                //resolve(operList);
            });

    }

}