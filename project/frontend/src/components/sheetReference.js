class Refer {
  constructor(){
   if(! Refer.instance){
     Refer.instance = this;
   }

   return Refer.instance;
  }

  getKeyByColumnCode(column_code){
    return 'REF_BY_COLUMN_'+column_code;
  }

  setData(column_code, referData){
    localStorage.setItem(this.getKeyByColumnCode(column_code),referData);
  }

  getData(column_code){
        var refData = localStorage.getItem(this.getKeyByColumnCode(column_code));

        if (refData)
            return refData;
        else
            return [];
 }


}

const referStore = new Refer();
Object.freeze(referStore);

export default referStore;
