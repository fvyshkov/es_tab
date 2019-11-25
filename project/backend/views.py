from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection


def get_sheet_type(sht_id):
    sql_res = get_sql_result(
        'select t.stype from c_es_sheet_type t, c_es_ver_sheet s  where s.id = %s and t.id = s.type_id', [sht_id])
    if sql_res[0].get('stype') in ['R', 'DM', 'MULTY_DM']:
        return 'TABLE'
    else:
        return 'TREE'

def get_sheet_list_plane(request):

    sheet_list = get_sql_result("select b.code||' '|| b.longname book_name, "
                               "cmp.year cmp_name,v.CODE ver_name,g.longname grp_name, s.LONGNAME sheet_name,    "
                               "s.id sheet_id, "
                                "b.id book_id, cmp.id cmp_id, v.id ver_id, g.id grp_id ,"
                                " t.stype "
                               "from c_es_sheet_type t, c_es_ver_sheet s, c_es_ver_sheet_grp g, "
                                "       C_ES_VRS v, c_es_ver_camp cmp, c_es_book b, c_es_class c "
                               "where c.id = b.CLASS_ID "
                               "and c.code='MIS' and cmp.BOOK_ID = b.id"
                            "  and t.id = s.type_id "
                               "and v.cmp_id = cmp.id and g.VER_ID = v.ID and s.grp_id = g.id order by 1,2,3,4,5",[])
    book = {}
    cmp = {}
    ver = {}
    grp = {}

    sheet_tree = []

    for sheet_list in sheet_list:

        if not book  or book.get('label') != sheet_list.get('book_name'):
            book = {'label': sheet_list.get('book_name'), 'type': 'BOOK', 'id': str(sheet_list.get('book_id')), 'parent_id':"0", 'icon':'activefolder'}
            sheet_tree.append(book)
            cmp ={}

        if not cmp or cmp.get('label') != sheet_list.get('cmp_name'):
            cmp = {'label': sheet_list.get('cmp_name'), 'type': 'CMP', 'id': book.get('id')+'_'+ str(sheet_list.get('cmp_id')),
                   'parent_id':book.get('id'), 'icon':'event'}
            ver = {}
            sheet_tree.append(cmp)


        if not ver or ver.get('label') != sheet_list.get('ver_name'):
            ver = {'label': sheet_list.get('ver_name'), 'type': 'VER',
                   'id': cmp.get('id')+'_'+ str( sheet_list.get('ver_id')),
                   'parent_id':cmp.get('id'), 'icon':'product'
                   }
            grp = {}
            sheet_tree.append(ver)


        if not grp or grp.get('label') != sheet_list.get('grp_name'):
            grp = {'label': sheet_list.get('grp_name'), 'type': 'GRP', 'id': ver.get('id')+'_'+ str( sheet_list.get('grp_id')),
                   'parent_id':ver.get('id'), 'icon':'hierarchy'}
            sheet_tree.append(grp)
        if sheet_list.get('stype') in ['R','DM', 'MULTY_DM']:
            sheet_type = 'table'
        else:
            sheet_type = 'tree'

        sheet = {'label': sheet_list.get('sheet_name'),
                 'type': 'SHEET',
                 'id': str(sheet_list.get('sheet_id')),
                 'parent_id':grp.get('id'),
                 'hasItems': False,
                 'icon' : 'detailslayout',
                 'sheet_type' : sheet_type
                 }
        sheet_tree.append(sheet)

    return JsonResponse(sheet_tree, safe = False)



def get_sheet_list(request):

    sheet_list = get_sql_result("select b.code||' '|| b.longname book_name, "
                               "cmp.year cmp_name,v.CODE ver_name,g.longname grp_name, s.LONGNAME sheet_name,    "
                               "s.id sheet_id, "
                                "b.id book_id, cmp.id cmp_id, v.id ver_id, g.id grp_id "
                               "from c_es_ver_sheet s, c_es_ver_sheet_grp g, C_ES_VRS v, c_es_ver_camp cmp, c_es_book b, c_es_class c "
                               "where c.id = b.CLASS_ID "
                               "and c.code='MIS' and cmp.BOOK_ID = b.id "
                               "and v.cmp_id = cmp.id and g.VER_ID = v.ID and s.grp_id = g.id order by 1,2,3,4",[])
    book = {}
    cmp = {}
    ver = {}
    grp = {}

    sheet_tree = []

    for sheet_list in sheet_list:

        if not book  or book.get('label') != sheet_list.get('book_name'):
            book = {'label': sheet_list.get('book_name'), 'type': 'BOOK', 'id':sheet_list.get('book_id')}
            sheet_tree.append(book)
            cmp ={}

        if not cmp or cmp.get('label') != sheet_list.get('cmp_name'):
            cmp = {'label': sheet_list.get('cmp_name'), 'type': 'CMP', 'id': sheet_list.get('cmp_id')}
            ver = {}
            if 'children' in book:
                book['children'].append(cmp)
            else:
                book['children']=[cmp]

        if not ver or ver.get('label') != sheet_list.get('ver_name'):
            ver = {'label': sheet_list.get('ver_name'), 'type': 'VER', 'id': sheet_list.get('ver_id')}
            grp = {}
            if 'children' in cmp:
                cmp['children'].append(ver)
            else:
                cmp['children'] = [ver]

        if not grp or grp.get('label') != sheet_list.get('grp_name'):
            grp = {'label': sheet_list.get('grp_name'), 'type': 'GRP', 'id': sheet_list.get('grp_id')}

            if 'children' in ver:
                ver['children'].append(grp)
            else:
                ver['children'] = [grp]

        sheet = {'label': sheet_list.get('sheet_name'), 'type': 'SHEET', 'id': sheet_list.get('sheet_id')}
        if 'children' in grp:
            grp['children'].append(sheet)
        else:
            grp['children'] = [sheet]

    return JsonResponse(sheet_tree, safe = False)






class Skey(object):


    def __init__(self, skey):
        self.value = skey

    def process(self):
        if len(self.value)==0:
            return ''
        skey_array=self.value.split(',')
        skey_dict ={}


        for item in skey_array:
            if item:
                curr_key = item.split("=>",1)[0]
                curr_val = item.split("=>",1)[1]
                skey_dict[curr_key] = curr_val

        result=''
        for dic_item in skey_dict:
            result += dic_item+'=>'+skey_dict[dic_item]+','

        return result


    def get_flt_value(self, flt_id):

        self.value = self.process()

        if len(self.value)==0:
            return ''
        skey_array=self.value.split(',')

        for item in skey_array:
            if item:
                curr_key = item.split("=>",1)[0]
                if curr_key=='FLT_ID_'+str(flt_id):
                    return item.split("=>",1)[1]

        return ''

def get_sheet_nodes(request):
    param_dict = dict(request.GET)
    p_sht_id = ''
    p_flt_id = ''
    p_flt_item_id = ''
    p_key = ''


    p_flt_root_id = ''
    p_cell_key = ''

    if 'sht_id' in param_dict:
        p_sht_id = param_dict['sht_id'][0]
    if 'flt_id' in param_dict:
        p_flt_id = param_dict['flt_id'][0]
    if 'flt_item_id' in param_dict:
        p_flt_item_id = param_dict['flt_item_id'][0]
    if 'group_keys' in param_dict:
        p_cell_key = Skey(param_dict['group_keys'][0]).process()
    if 'skey' in param_dict:
        p_key = param_dict['skey'][0]

    if p_sht_id=='':
        return JsonResponse([], safe=False)

    sql_result = get_sql_result("select c_pkgessheet.fGetMainFlt(%s) main_flt_id from dual", [p_sht_id])
    main_flt_id = sql_result[0].get('main_flt_id')
    p_flt_root_id = Skey(p_key+','+p_cell_key).get_flt_value(main_flt_id)


    sheet_type = get_sheet_type(p_sht_id)

    if sheet_type=='TREE':
        node_list = get_tree_node_list(request)
    else:
        node_list = get_anl_table_rows(p_sht_id,p_key)


    return JsonResponse(node_list, safe = False)

def get_tree_node_list(request):

    param_dict = dict(request.GET)
    p_sht_id = ''
    p_flt_id = ''
    p_flt_item_id = ''
    p_key = ''


    p_flt_root_id = ''#'50241'
    p_cell_key = ''

    if 'sht_id' in param_dict:
        p_sht_id = param_dict['sht_id'][0]
    if 'flt_id' in param_dict:
        p_flt_id = param_dict['flt_id'][0]
    if 'flt_item_id' in param_dict:
        p_flt_item_id = param_dict['flt_item_id'][0]
    if 'group_keys' in param_dict:
        p_cell_key = Skey(param_dict['group_keys'][0]).process()
    if 'skey' in param_dict:
        p_key = param_dict['skey'][0]

    node_list = get_sql_result("select 'FLT_ID_'||x.flt_id||'=>'||x.flt_item_id as node_key, "
                               "x.*, dt.atr_type, dt.round_size, i.ENT_ID "
                               "from table(C_PKGESsheet.fGetNodes(%s,%s,%s,%s,%s,%s)) x, "
                               "C_ES_DTYPE dt, "
                               "C_ES_VER_SHEET_IND i "
                               "where dt.id(+) = x.dtype_id "
                               "and i.id(+) = x.IND_ID "
                               "order by x.npp", [p_sht_id, p_key, p_flt_id, p_flt_item_id, p_flt_root_id, p_cell_key])

    for node in node_list:
        p_tmp_cell_key = p_key + ',' + p_cell_key + ',' + 'FLT_ID_' + node['flt_id'] + '=>' + node['flt_item_id']
        p_cell_key += 'FLT_ID_' + node['flt_id'] + '=>' + node['flt_item_id']
        p_tmp_cell_key = Skey(p_tmp_cell_key).process()
        cell_list = get_sql_result('''select x.*  from table(C_PKGESSHEET.fGetDataCells(%s, %s)) x''',
                                   [p_sht_id, p_tmp_cell_key])

        node['column_data'] = cell_list

    return node_list

def get_sheet_columns(request):
    param_dict = dict(request.GET)
    p_sht_id =''
    p_skey = ''

    if 'sht_id' in param_dict:
        p_sht_id = param_dict['sht_id'][0]
    if 'skey' in param_dict:
        p_skey = param_dict['skey'][0]


    if p_sht_id=='':
        return JsonResponse([], safe=False)

    sheet_type = get_sheet_type(p_sht_id)
    columns = get_sheet_columns_list(sheet_type, p_sht_id, p_skey)


    for column in columns:
        if 'ent_id' in column and column['ent_id']:
            ind_id = column['key'][1:]
            column['refer_data'] = get_refer_list(ind_id)

    return JsonResponse(columns, safe=False)


def get_sheet_columns_list(sheet_type, sht_id, skey):
    if sheet_type=='TREE':
        columns = get_sql_result('select * from table(C_PKGESsheet.fGetColumns(%s, %s))', [sht_id, skey])
        #columns.insert(0,{'id': 100, 'name': "Показатель", 'rowGroup': True})
        return columns
    else:
        return get_sql_result('select c.idx, c.code key, c.longname name, c.editfl, c.ent_id, atr_type,'
                              ' c.ind_id, c.ind_id_hi '
                                 'from table(C_PKGESreq.fGetColumns(%s,%s)) c', [skey,sht_id])



def get_sht_filters(request):
    param_dict = dict(request.GET)
    if 'sht_id' not in param_dict:
        return JsonResponse({})
    else:
        sht_id = param_dict['sht_id'][0]
        filter_list = get_sql_result('select f.id flt_id, c_pkgesbook.fGetSheetFltName(f.id) name'
                                     ' from c_es_ver_sheet_flt f where sht_id = %s',
                                       [sht_id])
        for filter in filter_list:
            filter['filter_node_list'] = get_filter_node_list(filter.get('flt_id'))

        #return JsonResponse({"data": filter_list})
        return JsonResponse( filter_list, safe=False)

def get_filter_node_list(filter_id):
    filter_plane_list = get_sql_result('select n.*, %s flt_id, n.name as label '
                                           ' from table(c_pkgescalc.fGetSheetFilterNodes(%s, null)) n ',
                                           [filter_id, filter_id]);
    filter_tree = []
    for filter_node in filter_plane_list:
        filter_tree = append_node_by_parent_id(filter_tree, filter_node)

    return filter_tree

def get_filter_nodes(request):
    param_dict = dict(request.GET)
    if 'filter_id' not in param_dict:
        return JsonResponse({})
    else:
        filter_id = param_dict['filter_id'][0]
        filter_header = get_sql_result('select id flt_id,  '
                                    'c_pkgesbook.fGetSheetFltName(h.id) name '
                                    'from c_es_ver_sheet_flt h where id = %s',
                                           [filter_id])
        if len(filter_header) == 0:
            return JsonResponse({})
        else:
            filter_plane_list = get_sql_result('select n.*, %s flt_id '
                                                   ' from table(c_pkgescalc.fGetSheetFilterNodes(%s, null)) n ',
                                                   [filter_id, filter_id]);
            filter_tree = []
            for filter_node in filter_plane_list:
                filter_tree = append_node_by_parent_id(filter_tree, filter_node)

            return JsonResponse(filter_tree, safe = False)


def get_anl_table_rows(sht_id, skey):
    import cx_Oracle
    from django.conf import settings
    db_settings =  settings.DATABASES.get('default')
    db_connection_prams = db_settings['USER']+'/'+db_settings['PASSWORD']+'@'+db_settings['HOST']+'/'+db_settings['NAME']
    connection = cx_Oracle.connect(db_connection_prams)
    cursor = connection.cursor()
    refCursor =  connection.cursor()

    cursor.execute("""begin c_pkgconnect.popen();
                        :1 := c_pkgesreq.fGetCursor( :2, :3,null,5000,''); 
                    end;""", [refCursor, sht_id, skey])
    ref_cursor =[]

    columns = get_sheet_columns_list('TABLE', sht_id, skey)
    for row in refCursor:
        row_dict = {}
        column_data = []
        for column_idx in range(len(refCursor.description)):
            column_name = refCursor.description[column_idx][0].lower()
            row_dict[column_name] = row[column_idx]
            if any([True for column in columns if column['key'] == column_name.upper()]):
                column_list = [column for column in columns if column['key'] == column_name.upper()]
                if len(column_list)>0:
                    ent_id = column_list[0].get('ent_id')
                    atr_type = column_list[0].get('atr_type')
                    editfl = column_list[0].get('editfl')
                else:
                    ent_id = None
                    atr_type = None
                    editfl = 0
                column_data.append({
                                        'key':column_name.upper(),
                                        'sql_value': row[column_idx],
                                        'editfl':editfl,
                                        'ent_id':ent_id,
                                        'atr_type':atr_type
                })


        row_dict['node_key'] = row_dict['id']
        row_dict['column_data'] = column_data
        ref_cursor.append(row_dict)

    return ref_cursor;

def get_sql_result(sql, params):
    with connection.cursor() as cursor:
        cursor.execute('call c_pkgconnect.popen();' );
        cursor.execute(sql, params);
        return dict_fetch_all(cursor);

def dict_fetch_all(cursor):
    columns = [col[0] for col in cursor.description]
    for i in range(len(columns)):
        columns[i] = columns[i].lower()
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def append_node_by_parent_id(node_list, node_to_append):
    chilrden_field_name = 'children'
    parent_id = node_to_append.get('id_hi')
    if parent_id == None:
        node_list.append(node_to_append)
    else:
        for node in node_list:
            if node.get('id')==parent_id:
                if node.get(chilrden_field_name)==None:
                    node[chilrden_field_name] = [node_to_append]
                else:
                    node[chilrden_field_name].append(node_to_append)
            elif node.get(chilrden_field_name)!=None:
                append_node_by_parent_id(node.get(chilrden_field_name), node_to_append)
    return node_list


def get_refer(request):
    param_dict = dict(request.GET)
    if 'col_id' not in param_dict:
        return JsonResponse([], safe=False)
    else:
        col_id = param_dict['col_id'][0]
        ind_id = col_id[1:]
        nodes= get_sql_result( 'select t. *, i.ENT_ID '
                               'from c_es_ver_sheet_ind i, table(C_PKGESent.fGetColComboMain(i.id, i.IND_MAIN_ID)) t '
                               'where i.id = % s', [ind_id])
        return JsonResponse(nodes, safe=False);

def get_refer_list(ind_id):
        nodes= get_sql_result( 'select t. *, i.ENT_ID '
                               'from c_es_ver_sheet_ind i, table(C_PKGESent.fGetColComboMain(i.id, i.IND_MAIN_ID)) t '
                               'where i.id = % s', [ind_id])
        return nodes

def get_refer_value(request):
    param_dict = dict(request.GET)
    if 'col_id' not in param_dict:
        return JsonResponse([], safe=False)
    elif 'item_id' not in param_dict:
        return JsonResponse([], safe=False)
    else:
        col_id = param_dict['col_id'][0]
        item_id = param_dict['item_id'][0]
        ind_id = col_id[1:]
        nodes= get_sql_result( 'select t.name '
                               'from c_es_ver_sheet_ind i, table(C_PKGESent.fGetColComboMain(i.id, i.IND_MAIN_ID)) t '
                               'where i.id = %s '
                               'and t.id= %s ', [ind_id, item_id])
        return JsonResponse(nodes, safe=False);