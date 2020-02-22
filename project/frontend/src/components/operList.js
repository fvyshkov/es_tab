import {sendRequestPromise} from './sendRequestPromise.js';
import notify from 'devextreme/ui/notify';

export class operList{

    constructor(proc_id, bop_id, nstat, callbackBeforeOperRun, callbackAfterOperRun){
        this.proc_id = proc_id;
        this.bop_id = bop_id;
        this.nstat = nstat;
        this.itemsList = [];
        this.operMenuList=[];
        this.callbackBeforeOperRun = callbackBeforeOperRun;
        this.callbackAfterOperRun = callbackAfterOperRun;
        console.log('CONSTRUCTOR callbackAfterOperRun', callbackAfterOperRun);
    }

    runOper(item){
        //notify(item.longname+'='+item.name);


        if (this.callbackBeforeOperRun){
            this.callbackBeforeOperRun(item, this.runOperCallback);

        }
    }

    runOperCallback(item, userParams){
        console.log('runOperCallback1', item, userParams, 'this.callbackAfterOperRun', this.callbackAfterOperRun);
        console.log('runOperCallback2', this);
        //return;
        var httpStr = 'run_oper/?proc_id=' + item.proc_id;
        httpStr += '&oper_code=' + item.code;

        if (userParams){
            httpStr += '&oper_params='+userParams;
        }

        sendRequestPromise(httpStr)
            .then(()=>{
                console.log('RUNOPER callbackAfterOperRun', this.callbackAfterOperRun);
                if (this.callbackAfterOperRun){
                    this.callbackAfterOperRun();
                }
            })
            .then(()=>notify('Операция "'+item.name+'" успешно завершена'));
            //перечитаем список операций
            //.then(()=>this.init());
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
        this.init();
        var operMenuList = [];

        if (this.itemsList.length>0){
            operMenuList = [
                            {
                                id: '1_6',
                                name: 'Операции',
                                icon: 'menu',
                                onClick: ()=> {console.log('onItemContextMenu');},
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
        console.log('operList init START', this);
        if (this.proc_id){
            var httpStr = 'operlist/?proc_id=' + this.proc_id;
            httpStr += '&bop_id=' + this.bop_id;
            httpStr += '&nstat=' + this.nstat;

            sendRequestPromise(httpStr)
                .then((operList)=> {
                    this.itemsList = operList;
                });
        }
        console.log('operList init   END', this);
    }

}