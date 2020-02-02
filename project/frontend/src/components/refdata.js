let refdscr = {
  REF_CODE: {
    title: 'Справочник валют',
    columns: [
      {caption: 'Код', field: 'CODE'},
      {caption: 'Наименование', field: 'LONGNAME'}
    ]
  },
  REF_CODE1: {
    title: 'Справочник чего-то',
    columns: [
      {caption: 'Код 1', field: 'CODE'},
      {caption: 'Наименование 1', field: 'NAME'},
      {caption: 'Длинное наименование 1', field: 'LONGNAME'}
    ]
  }
}

let val = [
{
  'ID' : 1,
  'CODE' : 'KZT',
  'ALTERCODE' : '398',
  'NAME' : 'тенге',
  'LONGNAME' : 'Казахстанский тенге'
},
{
  'ID' : 2,
  'CODE' : 'USD',
  'ALTERCODE' : '840',
  'NAME' : 'доллары',
  'LONGNAME' : 'Доллар  США'
},
{
  'ID' : 3,
  'CODE' : 'EUR',
  'ALTERCODE' : '978',
  'NAME' : 'ЕВРО',
  'LONGNAME' : 'ЕВРО'
}
]

let test1 = [
{
  'ID' : 1,
  'CODE' : 'CODE 1',
  'ALTERCODE' : '398',
  'NAME' : 'тенге',
  'LONGNAME' : 'Наименование 1'
},
{
  'ID' : 2,
  'CODE' : 'CODE 2',
  'ALTERCODE' : '840',
  'NAME' : 'доллары',
  'LONGNAME' : 'Наименование 2'
},
{
  'ID' : 3,
  'CODE' : 'CODE 3',
  'ALTERCODE' : '978',
  'NAME' : 'ЕВРО',
  'LONGNAME' : 'Наименование 3'
},
{
  'ID' : 4,
  'CODE' : 'CODE 4',
  'ALTERCODE' : '978',
  'NAME' : 'ЕВРО',
  'LONGNAME' : 'Наименование 4'
},
{
  'ID' : 5,
  'CODE' : 'CODE 5',
  'ALTERCODE' : '978',
  'NAME' : 'ЕВРО',
  'LONGNAME' : 'Наименование 5'
},
{
  'ID' : 6,
  'CODE' : 'CODE 6',
  'ALTERCODE' : '978',
  'NAME' : 'ЕВРО',
  'LONGNAME' : 'Наименование 6'
},
{
  'ID' : 7,
  'CODE' : 'CODE 7',
  'ALTERCODE' : '978',
  'NAME' : 'ЕВРО',
  'LONGNAME' : 'Наименование 7'
},
{
  'ID' : 8,
  'CODE' : 'CODE 8',
  'ALTERCODE' : '978',
  'NAME' : 'ЕВРО',
  'LONGNAME' : 'Наименование 8'
}
]

export default {
  getRefData(refCode) {
    if (refCode === 'REF_CODE') {
      return val;
    }
    else {
      return test1;
    }
  },
  getRefDscr(refCode) {
    return refdscr[refCode]
  }
};
