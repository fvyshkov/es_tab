import {sendRequestPromise} from './sendRequestPromise.js';
import notify from 'devextreme/ui/notify';

export class operList{

    constructor(proc_id, bop_id, nstat){
        this.proc_id = proc_id;
        this.bop_id = bop_id;
        this.nstat = nstat;
        this.itemsList = [];
        this.operMenuList=[];
    }

    runOper(item){
          notify(item.longname+'='+item.name);

    }

    operMenuItemRender(item){
        if (item.cancelfl==="1"){
            var element = document.createElement("span");
            element.setAttribute("class" , "cancelOperation");
            element.appendChild(document.createTextNode(item.name));
            return element;

        }else{
            return item.name;
        }
    }

    getOperMenuList(){

        var operMenuList = [];

        if (this.itemsList.length>0){
            operMenuList = [
                            {
                                id: '1_6',
                                name: 'Операции',
                                icon: 'menu',
                                items: this.itemsList.map((item)=>{
                                   return {
                                            id: item.nord,
                                            name: item.name,
                                            onClick: () => this.runOper(item),
                                            template: this.operMenuItemRender,
                                            getDisabled: ()=> { return item.enable==="1" ? false: true;},
                                            cancelfl: item.cancelfl
                                          };
                                })
                            }
                    ];

        }

        return operMenuList;
    }


    init(){
        var httpStr = 'operlist/?proc_id=' + this.proc_id;
        httpStr += '&bop_id=' + this.bop_id;
        httpStr += '&nstat=' + this.nstat;

        console.log('INIT');
        sendRequestPromise(httpStr)
            .then((operList)=> {
                this.itemsList = operList;
                //resolve(operList);
            });

    }

}