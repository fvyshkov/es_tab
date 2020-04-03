from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.db import connection
import json
import ntpath
from django.core.files.base import ContentFile
import cx_Oracle


def get_schedule(request):
    param_dict = dict(request.GET)
    if 'req_id' not in param_dict:
        return JsonResponse([], safe = False)
    else:
        req_id = param_dict.get('req_id', [''])[0]
        sht_id = param_dict.get('sht_id', [''])[0]
        schedule_list = get_schedule_list(sht_id, req_id)

        return JsonResponse(schedule_list, safe = False)


def get_schedule_list(req_id):
    return []

def get_file(request):
    file_id = dict(request.GET).get('file_id', [''])[0]
    file_node = get_sql_result("select filedata, filename from c_es_file where id = %s", [file_id])
    filedata = file_node[0]['filedata']
    filename = ntpath.basename(file_node[0]['filename'])
    print('fn="', "="+filename+'=')
    response = HttpResponse(filedata.read(), content_type='application/octet-stream')
    response['Content-Disposition'] = 'attachment; filename="'+filename+'"'
    return response

def get_report(request):
    from urllib.request import urlopen
    from urllib.parse import quote

    print('rptParams', dict(request.GET).get('params', [''])[0])
    url = 'http://127.0.0.1:60000/rpt/?params='+ quote(dict(request.GET).get('params', [''])[0])


    report_data = urlopen(url).read()


    response = HttpResponse(report_data, content_type='application/octet-stream')
    response['Content-Disposition'] = 'attachment; filename="' + 'REPORT.xml' + '"'
    return response




def upload_file(request):
    file = request.FILES['files[]']
    p_file_data = file.read()
    p_filename = str(file)
    connection = get_oracle_connection()
    cursor = connection.cursor()

    p_id = cursor.var(cx_Oracle.STRING)

    cursor.execute("""declare iid int;
                     begin c_pkgconnect.popen();
                           C_PKGESUTILS.pSaveFile( iid, :filename ); 
                           update c_es_file
                           set filedata=:file
                           where id = iid;
                           :id := iid;
                           commit; 
                           end; """, [ p_filename, p_file_data, p_id])

    return JsonResponse([{'file_id':int(p_id.getvalue())}], safe=False)


def recalc_sheet(request):
    param_dict = dict(request.GET)
    sht_id = param_dict.get('sht_id', [''])[0]
    skey = param_dict.get('skey', [''])[0]

    with connection.cursor() as cursor:
        cursor.execute("""begin c_pkgconnect.popen();
                              C_PKGESSHEET.pRecalcSheetParallel(P_SHT_ID => %s, P_SKEY => %s, P_CELL_TYPE => '0');
                            end; """, [ sht_id, skey])

    return JsonResponse([], safe=False)

def recalc_cell(request):
    param_dict = dict(request.GET)
    sht_id = param_dict.get('sht_id', [''])[0]
    skey = param_dict.get('skey', [''])[0]
    sht_skey = param_dict.get('sht_skey', [''])[0]
    node_list = json.loads(request.body.decode("utf-8"))

    with connection.cursor() as cursor:
        cursor.execute("""begin c_pkgconnect.popen(); 
                        C_PKGESCALC.PCALCREPORT(%s, %s);  
                        end; """,
                       [sht_id, skey])

    sheet_info = get_sheet_info_list(sht_id)

    for node in node_list:
        group_keys = ''# node['node_key']
        for path_step in node['hie_path']:
            if path_step != node['hie_path'][-1]:
                group_keys += path_step+','
        if not "dummy" in node['node_key']:
            process_node(sht_id, sht_skey, node, group_keys, sheet_info[0])

    return JsonResponse(node_list, safe=False)

def get_history(request):

    param_dict = dict(request.GET)
    sht_id = param_dict.get('sht_id', [''])[0]
    ind_id = param_dict.get('ind_id', [''])[0]
    skey = param_dict.get('skey', [''])[0]


    connection = get_oracle_connection()
    cursor = connection.cursor()
    refCursor = connection.cursor()



    cursor.execute("""begin c_pkgconnect.popen();
                           :1 := C_PKGESSHEET.fGetCursorHist(
                                              p_sht_id=> :2,
                                              p_ind_id=> :3,
                                              p_skey=> :4,
                                              p_cell_type=>'0');
                        end;""", [refCursor, sht_id, ind_id, skey])

    history_list = []

    row_id = 0

    for row in refCursor:
        row_dict = {}
        column_data = []
        for column_idx in range(len(refCursor.description)):
            column_name = refCursor.description[column_idx][0].lower()
            row_dict[column_name] = row[column_idx]

        row_dict['node_key'] = row_id
        row_id = row_id +1

        history_list.append(row_dict)

    return JsonResponse(history_list, safe=False)

def get_conf_list(request):
    param_dict = dict(request.GET)
    sht_id = param_dict.get('sht_id', [''])[0]

    conf_list = get_sql_result("""
                    select c.id,
                       c.base,
                       case 
                         when c.skey is null and exists(select 1 from C_ES_CONF where proc_id = p.id and ID <> c.ID)
                             then Localize('Все значения кроме утвержденных ранее')
                         when c.skey is null and not exists(select 1 from C_ES_CONF where proc_id = p.id and ID <> c.ID)
                             then Localize('Все значения')
                         else
                           C_PKGESSHEET.fGetConsDscr(c.skey, null) 
                       end as flt_desc,
                       o.execdt,
                       o.dscr,
                       colvir.c_pkgusr.fUsrName(o.tus_id) usr,
                       o.njrn node_key,
                       o.njrn
                from  C_ES_CONF c,
                      colvir.T_OPERJRN o, 
                      colvir.T_PROCESS p,
                      colvir.T_SCEN_STD s
                where o.bop_id = p.bop_id
                
                  and c.proc_id(+) = p.id  and c.njrn(+) = o.njrn
                  
                  and o.noper = s.NORD
                  and s.code in ('CONFIRM', 'CONFIRM_ROOT')
                  and o.id = p.id
                  and s.id = o.bop_id
                  and p.id = (select proc_id from c_es_ver_sheet where id= %s )
                  --and o.undofl='0'
                order by o.execdt desc
    
    """, [ sht_id])

    return JsonResponse(conf_list, safe=False)


def get_comments(request):
    param_dict = dict(request.GET)
    if 'ind_id' not in param_dict:
        return JsonResponse([], safe = False)
    else:
        ind_id = param_dict.get('ind_id', [''])[0]
        req_id = param_dict.get('req_id', [''])[0]
        skey = param_dict.get('skey', [''])[0]
        if (req_id):
            cell_skey='REQ_ID=>'+req_id
        else:
            cell_skey = skey

        print('ind_id', ind_id, 'cell_key', cell_skey)
        comments_list = get_comments_list(ind_id, cell_skey)

        return JsonResponse(comments_list, safe = False)


def get_comments_list(ind_id, skey):
    res = get_sql_result("""
                        select *
                        from
                        (
                        select 
                        rownum com_id,
                         c.*,
                          (select C_PKGESSHEET.FGETSHEETPATH(i.sht_id,'1') 
                           from c_es_ver_sheet_ind i where id = c.ind_id) sht_path,
                            c_pkgescalc.fGetAnlDscr(c.skey) flt_dscr,
                              c_pkgusr.fUsrName(c.id_us) usr_name,
                              (select  json_arrayagg(json_object('filename' value filename, 'id' value id))
                              from  C_ES_COMM_FILES cf,
                                     C_ES_FILE f
                              where c.ind_id = cf.ind_id
                                    and c.skey = cf.skey
                                    and c.proc_id = cf.proc_id
                                    and c.njrn = cf.njrn
                                    and cf.file_id = f.id) file_list
                        from C_ES_SHT_VAL_COMMENT c
                        where   c.ind_id =  %s 
                        and c.skey = C_PKGEScalc.fNormalizeKey(%s)
                        order by ind_id, skey, proc_id, njrn
                        )
                        order by correctdt desc
                            """,
                        [ind_id, skey])
    for row in res:
        column_data = []

        cell ={}
        cell['key'] = 'prim'
        cell['editfl'] = '0'
        cell['sql_value'] = row.get('prim')
        column_data.append(cell)

        cell = {}
        cell['key'] = 'correctdt'
        cell['editfl'] = '0'
        cell['sql_value'] = row.get('correctdt')
        column_data.append(cell)

        cell = {}
        cell['key'] = 'usr_name'
        cell['editfl'] = '0'
        cell['sql_value'] = row.get('usr_name')
        column_data.append(cell)

        cell = {}
        cell['key'] = 'file_list'
        cell['editfl'] = '0'
        cell['sql_value'] = row.get('file_list')
        cell['filelistfl'] = 1
        column_data.append(cell)

        row['column_data'] = column_data

    return res

def get_cell_skey(request):
    param_dict = dict(request.GET)
    flt_id = param_dict.get('flt_id', [''])[0]
    flt_item_id = param_dict.get('flt_item_id', [''])[0]
    skey = param_dict.get('skey', [''])[0]
    group_keys = param_dict.get('group_keys', [''])[0]

    skey_total = skey+','+ group_keys;

    if (flt_id):
        skey_total += ',FLT_ID_'+flt_id+'=>'+flt_item_id;
    print('SK total', skey_total)
    skey_total = Skey(skey_total).process()
    return  skey_total

def delete_table_record(request):
    param_dict = dict(request.GET)
    req_id = param_dict.get('req_id', [''])[0]

    with connection.cursor() as cursor:
        cursor.execute("begin c_pkgconnect.popen(); "
                       " c_pkgesreq.pDelReq( "
                       "                p_id => %s); " 
                       " end; ",
                       [req_id])

    return JsonResponse([], safe=False)

def create_payments(request):
    param_dict = dict(request.GET)
    sht_id = param_dict.get('sht_id', [''])[0]
    dop = param_dict.get('dop', [''])[0]
    skey = param_dict.get('skey', [''])[0]
    print('create_payments', sht_id, dop, skey)
    with connection.cursor() as cursor:
        cursor.execute("""
                            declare
                                sMsg varchar2(4000);
                            begin
                                c_pkgconnect.popen();
                                smsg := c_pkgesreg.fGetPaymentFlowsGenMsg(%s, %s, %s);
                                if  length(smsg)>0 then
                                    raise_application_error(-20000, smsg);
                                else
                                    C_PKGESDM.PPROCESSSHD(p_sht_id =>  %s, p_skey => %s ,p_dop => %s);
                                end if;
                            end;
                        """, [sht_id, skey, dop, sht_id, skey, dop])

    return JsonResponse([], safe=False)

def get_dm_dops(request):
    param_dict = dict(request.GET)
    sht_id = param_dict.get('sht_id', [''])[0]

    dop_list = get_sql_result("""
                    select      to_char(x.doper, 'dd.mm.yy') dop,
                                to_char(x.doper, 'ddmmyy') dop_key,
                               x.execdt, 
                               x.correctdt,
                               x.user_name, 
                               x.confirmfl, 
                               to_char(x.doper, 'yyyy') as YOPER, 
                               x.doper as DTOPER
                          from table(c_pkgesdm.fGetDMDates(%s)) x
                         order by x.DOPER desc 
                        """,
                        [sht_id])

    return JsonResponse(dop_list, safe=False)

def delete_comment(request):
    param_dict = dict(request.GET)
    proc_id = param_dict.get('proc_id', [''])[0]
    njrn = param_dict.get('njrn', [''])[0]


    with connection.cursor() as cursor:
        cursor.execute("begin c_pkgconnect.popen(); "
                       " C_PKGESSHEET.PDELCELLCOMMENT(%s, %s); " 
                       " end; ",
                       [proc_id, njrn])

    return JsonResponse([], safe=False)

def insert_comment(request):
    param_dict = dict(request.GET)
    prim = param_dict.get('prim', [''])[0]
    ind_id = param_dict.get('ind_id', [''])[0]
    skey = param_dict.get('skey', [''])[0]
    cell_type = param_dict.get('cell_type', [''])[0]
    fids = param_dict.get('fileids', [''])[0]

    with connection.cursor() as cursor:
        cursor.execute("begin c_pkgconnect.popen(); "
                       " C_PKGESSHEET.pAddCellComment(%s, %s, %s, %s, %s); " 
                       " end; ",
                       [ind_id, skey, prim, cell_type, fids])

    return JsonResponse([], safe=False)

def update_table_record(request):
    param_dict = dict(request.GET)
    col_id = param_dict.get('col_id', [''])[0]
    req_id = param_dict.get('req_id', [''])[0]
    value = param_dict.get('value', [''])[0]

    if col_id:
        with connection.cursor() as cursor:
            cursor.execute("""
                            declare
                                i int;
                                ncol_id number(10) := %s;
                                nreq_id number(10) := %s;
                                sval varchar2(250) := %s;
                                scalc_value varchar2(250);
                                nent_id number(10);
                            begin 
                                c_pkgconnect.popen(); 
                                
                                select ent_id
                                into nent_id
                                from c_es_ver_sheet_ind
                                where id = ncol_id;
                                
                                if nent_id is not null then
                                    begin
                                        select id into scalc_value
                                        from    c_es_ent_item
                                        where ent_id = nent_id and longname = sval;
                                        
                                    exception
                                        when no_data_found then
                                            null;
                                    end;
                                else
                                   scalc_value := sval; 
                                end if;
                                
                                c_pkgesreq.pAddReqVal( 
                                           p_col_id => ncol_id, 
                                           p_req_id => nreq_id, 
                                           p_val => scalc_value 
                                           );
                           
                                c_pkgesreq.pRecalcReq(nreq_id);
                           
                            end; """,
                           [col_id, req_id, value])
    else:
        with connection.cursor() as cursor:
            cursor.execute("""
                        begin 
                            c_pkgconnect.popen(); 
                            c_pkgesreq.pRecalcReq(%s);
                        end; 
                        """,
                       [req_id])

    # нужно переделать на извлечение одной записи, а не всех по ключу с дальнейшим отбором!
    row = get_anl_table_row_by_id(req_id)
    return JsonResponse([row], safe=False)

    #return JsonResponse([], safe=False)

def sheet_confirm(request):
    param_dict = dict(request.GET)
    prim = param_dict.get('prim', [''])[0]
    sht_id = param_dict.get('sht_id', [''])[0]
    fileids = param_dict.get('fileids', [''])[0]
    skey = param_dict.get('skey', [''])[0]

    skey = skey.replace('=>','%')
    skey = skey.replace(',','#')

    with connection.cursor() as cursor:
        cursor.execute("""
                        declare
                            nPROC_ID number(10);
                            nSHT_ID   number(10) := %s;
                            nVER_ID number(10);
                            sYEAR varchar2(4);
                            sFileIDS varchar2(250) := %s;
                            sPRIM varchar2(250) := %s;
                            sSKEY varchar2(250) := %s;
                            sOUT_PRM varchar2(2000);
                            nOPER_RESULT int;
                        begin
                            c_pkgconnect.popen;
                            
                            select c.year, v.id, s.proc_id
                            into syear, nver_id,  nPROC_ID
                            from c_es_ver_camp c, c_es_vrs v , c_es_ver_sheet s
                            where s.id = nSHT_ID
                            and v.ID = s.VER_ID
                            and c.id = v.cmp_id;
                               
                           nOPER_RESULT := t_pkgrunoprutl.fRunOperation( 
                                  nProcId => nProc_Id,
                                 sOperCode =>  'CONFIRM',
                                 sInOperParams => 'PRIM=>' || sPRIM || 
                                                  ',FILE_IDS=>' || sFileIDS||
                                                  ',SKEY=>'||sSKEY||
                                                  ',VER_ID=>'||nver_id||
                                                  ',YEAR=>'||syear||
                                                  ',BPFL=>1'
                                                  ,
                                 sOutOperParams => sOUT_PRM);                 
                                
                          
                        end;
                        """,
                       [sht_id,
                        fileids,
                        prim,
                        skey])

    return JsonResponse([], safe=False)


def run_oper(request):
    param_dict = dict(request.GET)
    proc_id = param_dict.get('proc_id', [''])[0]
    oper_code = param_dict.get('oper_code', [''])[0]
    oper_params = param_dict.get('oper_params', [''])[0]

    with connection.cursor() as cursor:
        cursor.execute("""
                        declare
                            sOUT_PRM varchar2(2000);
                            nOPER_RESULT int;
                        begin
                            c_pkgconnect.popen;
                            nOPER_RESULT := t_pkgrunoprutl.fRunOperation( 
                                  nProcId => %s,
                                  sOperCode =>  %s,
                                  sInOperParams => %s,
                                  sOutOperParams => sOUT_PRM);                 
                        end;
                        """, [proc_id, oper_code, oper_params])

    return JsonResponse([], safe=False)


def update_tree_record(request):
    param_dict = dict(request.GET)
    sht_id = param_dict.get('sht_id', [''])[0]
    cell_skey = param_dict.get('cell_skey', [''])[0]
    skey = param_dict.get('skey', [''])[0]
    ind_id = param_dict.get('ind_id', [''])[0]
    value = param_dict.get('value', [''])[0]

    print('ind_id', ind_id)
    print('sht_id', sht_id)

    print('SK=', skey  + cell_skey)

    with connection.cursor() as cursor:
        cursor.execute("begin c_pkgconnect.popen(); "
                       "   C_PKGESSHEET.pSetShtValueHand(P_SHT_ID => %s, P_IND_ID => %s, P_SKEY => %s, P_SQL_VALUE => %s); end; ",
                       [sht_id, '', skey+cell_skey, value])

    return JsonResponse([], safe=False)

def add_table_record(request):
    param_dict = dict(request.GET)
    data = json.loads(request.body.decode("utf-8"))
    sht_id = param_dict.get('sht_id', [''])[0]
    parent_id = param_dict.get('parent_id', [''])[0]
    req_id = param_dict.get('id', [''])[0]
    skey = param_dict.get('skey', [''])[0]
    dop = param_dict.get('dop', [''])[0]
    ind_id = param_dict.get('ind_id', [''])[0]

    req_id = get_sql_result("select C_ES_VER_SHEET_REQ_KEY.nextval new_id from dual",[])[0].get("new_id")


    with connection.cursor() as cursor:
        cursor.execute("""begin c_pkgconnect.popen(); 
                            c_pkgesreq.paddreq( 
                                       p_id=> %s, 
                                       p_sht_id => %s, 
                                       p_skey => %s , 
                                       p_ind_id => %s, 
                                       p_dop => %s , 
                                       p_parent_id => %s); 
                       
                            c_pkgesreq.pRecalcReq(%s);
                       end;
                       """,
                       [req_id,
                        sht_id,
                        skey,
                        ind_id,
                        dop,
                        parent_id,
                        req_id])

    row = get_anl_table_row_by_id(req_id)
    return JsonResponse([row], safe=False)




def import_sheet_data(request):
    param_dict = dict(request.GET)
    sht_id = param_dict['sht_id'][0]
    skey = param_dict['skey'][0]
    del_existed = param_dict['del_existed'][0]

    header_info = get_xml_excel_header_info(request.body)
    header_top = header_info.get('first_row')
    header_bottom = header_info.get('last_row')

    print('header_top bottom', header_top, header_bottom)


    connection = get_oracle_connection()
    cursor = connection.cursor()
    my_clob = cursor.var(cx_Oracle.CLOB)
    my_clob.setvalue(0, request.body)
    cursor.execute("""begin c_pkgconnect.popen();
                                C_PKGESIMP.pImportReqFromXLS(p_xml => :1, 
                                                            p_sht_id => :2, 
                                                            p_header_top => :3, 
                                                            p_header_bottom => :4,
                                                            p_del_existed_req => :5,
                                                            p_skey => :6
                                                            );
                                commit;                                                            
                        end;""", [my_clob, sht_id, header_top, header_bottom, del_existed, skey])

    return JsonResponse([], safe=False)


def get_xml_excel_header_info(xml_text):
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(xml_text, features="xml")
    sheets = soup.find_all('Worksheet')
    sheet_data = sheets[0]

    colored_background_style_ids = []
    idx = 0
    for style in soup.find_all('Style'):
        idx = idx + 1
        if style.find('Interior').get('ss:Color'):
            colored_background_style_ids.append(style['ss:ID'])

    colored_rows = []
    row_index = 0
    for row in sheet_data.find_all('Row'):
        row_has_colored_cells = False
        row_index = row_index + 1
        for cell in row.find_all('Cell'):
            if cell.get('ss:StyleID') in colored_background_style_ids:
                row_has_colored_cells = True

        if row_has_colored_cells:
            colored_rows.append(row_index)

    header_info = {}
    header_info['first_row'] = colored_rows[0]
    header_info['last_row'] = colored_rows[-1]
    return header_info


def get_sheet_state_update(request):
    param_dict = dict(request.GET)
    data = json.loads(request.body.decode("utf-8"))
    filter_nodes =  json.dumps(data.get('filterNodes'))

    column_states = json.dumps(data.get('columnStates'))
    expanded_ids = json.dumps(data.get('expandedGroupIds'))

    sht_id = param_dict.get('sht_id', [''])[0]



    with connection.cursor() as cursor:
        cursor.execute("begin c_pkgconnect.popen(); UPDATE c_es_ver_sheet_usr_state s "
                       "SET s.id_us = p_idus, "
                       "s.filternodes = %s, "
                       "s.columnstates = %s, "
                       "s.expandedgroupids = %s "
                       "where sht_id = %s; "
                       " if sql%%notfound then "
                       " insert into c_es_ver_sheet_usr_state(filternodes,columnstates,expandedgroupids, sht_id, id_us) "
                       " values(%s, %s, %s, %s, p_idus);"
                       " end if; "
                       "end; ",[filter_nodes,
                                column_states,
                                expanded_ids,
                                sht_id,

                                filter_nodes,
                                column_states,
                                expanded_ids,
                                sht_id])

    return JsonResponse([], safe=False)

def get_layouts(request):

    layout_list = get_sql_result("select * from c_es_layout where id_us = p_idus order by longname",[])
    for layout in layout_list:
        test = layout.get('layout').read()
        d = json.loads(test)
        print('test', d)
        layout['layout'] = d


    return JsonResponse(layout_list, safe=False)

def update_layout(request):
    param_dict = dict(request.GET)
    data = json.loads(request.body.decode("utf-8"))
    #layout =  json.dumps(data.get('filterNodes'))
    layout =  json.dumps(data)
    layout_id = param_dict.get('layout_id', [''])[0]
    longname = param_dict.get('longname', [''])[0]
    print('params id=[', layout_id, "]")
    #layout = "test"

    #return JsonResponse([], safe=False)
    with connection.cursor() as cursor:
        cursor.execute("""
                            begin
                                c_pkgconnect.popen();
                                
                                update  c_es_layout
                                set     layout = %s
                                where   id = %s;
                                
                                if sql%%notfound then
                                    insert into c_es_layout(longname, layout)
                                    values( %s , %s);
                                end if;
                            end;
                        """, [layout, layout_id, longname, layout])

    return JsonResponse([], safe=False)


def delete_layout(request):
    data = json.loads(request.body.decode("utf-8"))
    print('delete layoput', data)
    for layout in data.get("ids"):
        print("id=", layout['id'])
        with connection.cursor() as cursor:
            cursor.execute("""
                                begin
                                    c_pkgconnect.popen();

                                    delete  c_es_layout
                                    where   id = %s;
                                end;
                            """, [layout['id']])

    return JsonResponse([], safe=False)




def get_sheet_info_update(request):
    param_dict = dict(request.GET)
    print('get_sheet_info_update', param_dict)
    sht_id = param_dict['sht_id'][0]
    colorArest = param_dict['colorArest'][0]
    colorHand = param_dict['colorHand'][0]
    colorCons = param_dict['colorCons'][0]
    colorConf = param_dict['colorConf'][0]
    colorConfPart = param_dict['colorConfPart'][0]
    colorFilter = param_dict['colorFilter'][0]
    colorTotal = param_dict['colorTotal'][0]

    with connection.cursor() as cursor:

        cursor.execute("UPDATE c_es_ver_sheet s "
                       "SET s.COLOR_RESTRICT= %s, "
                       "s.COLOR_HAND_INPUT = %s, "
                       "s.COLOR_TOTALS= %s, "
                       "s.COLOR_CONS= %s, "
                       "s.COLOR_CONFIRM= %s, "
                       "s.COLOR_PART_CONFIRM= %s,  "
                       "s.COLOR_FLT= %s "
                       "WHERE id = %s",
                       [colorArest,
                        colorHand,
                        colorTotal,
                        colorCons,
                        colorConf,
                        colorConfPart,
                        colorFilter,
                        sht_id])


    return JsonResponse([], safe=False)

def get_sheet_type(sht_id):
    sql_res = get_sql_result(
        'select t.stype from c_es_sheet_type t, c_es_ver_sheet s  where s.id = %s and t.id = s.type_id', [sht_id])
    if len(sql_res)>0:
        if sql_res[0].get('stype') in ['R', 'DM', 'MULTY_DM']:
            return 'TABLE'
        else:
            return 'TREE'
    else:
        return 'NONE'


def get_sheet_info(request):
    param_dict = dict(request.GET)
    if 'sht_id' not in param_dict:
        return JsonResponse([], safe = False)
    else:
        sht_id = param_dict['sht_id'][0]
        sheet_info = get_sheet_info_list(sht_id)
        return JsonResponse(sheet_info, safe = False)


def get_sheet_state(request):
    param_dict = dict(request.GET)
    if 'sht_id' not in param_dict:
        return JsonResponse([], safe = False)
    else:
        sht_id = param_dict['sht_id'][0]
        sheet_state = get_sheet_state_list(sht_id)
        return JsonResponse(sheet_state, safe = False)

def get_sheet_state_list(sht_id):
    sheet_info = get_sql_result("select * from c_es_ver_sheet_usr_state where sht_id=%s  and id_us = p_idus ", [sht_id])
    if len(sheet_info)>0:
        sheet_info[0]['filternodes'] = json.loads(sheet_info[0].get("filternodes"))
        sheet_info[0]['columnstates'] = json.loads(sheet_info[0].get("columnstates"))
        sheet_info[0]['expandedgroupids'] = json.loads(sheet_info[0].get("expandedgroupids"))
    else:
        sheet_info.append({})

    filter_list = get_sql_result('select f.id flt_id, c_pkgesbook.fGetSheetFltName(f.id) name'
                                 ' from c_es_ver_sheet_flt f where sht_id = %s',
                                 [sht_id])
    for filter in filter_list:
        filter['filter_node_list'] = get_filter_node_list(filter.get('flt_id'))
    sheet_info[0]['filter'] = filter_list

    return sheet_info



def mark_selected(item, selected_nodes_list):
    print('selected_nodes_list', selected_nodes_list, 'item', item)
    if selected_nodes_list and (str(item.get('id')) in selected_nodes_list):
        print('checked! old', item.get('checked'))
        item['checked'] = True
    else:
        item['checked'] = False

def process_tree(tree, hierarchy_field_name, callback, *args):
    for item in tree:
        callback(item, *args)
        if item.get(hierarchy_field_name):
            process_tree(item.get(hierarchy_field_name), hierarchy_field_name, callback, *args)

def get_sheet_info_list(sht_id):
    try:
        sheet_info = get_sql_result("select s.*, C_PKGESSHEET.FGETSHEETPATH(s.id,'1') sheet_path from c_es_ver_sheet s where id=%s ", [sht_id])
    except:
        print('get_sheet_info_list ERROR')
        return []

    if len(sheet_info)==0:
        return []

    sheet_info[0]['color_restrict_hex'] = delphi_color_to_hex(sheet_info[0].get('color_restrict'))
    sheet_info[0]['color_hand_hex'] = delphi_color_to_hex(sheet_info[0].get('color_hand_input'))
    sheet_info[0]['color_total_hex'] = delphi_color_to_hex(sheet_info[0].get('color_totals'))
    sheet_info[0]['color_filter_hex'] = delphi_color_to_hex(sheet_info[0].get('color_flt'))
    sheet_info[0]['color_cons_hex'] = delphi_color_to_hex(sheet_info[0].get('color_cons'))
    sheet_info[0]['color_conf_hex'] = delphi_color_to_hex(sheet_info[0].get('color_confirm'))
    sheet_info[0]['color_conf_part_hex'] = delphi_color_to_hex(sheet_info[0].get('color_part_confirm'))


    return sheet_info


def get_report_params(request):
    param_dict = dict(request.GET)
    rpt_code = param_dict.get('rpt_code', [''])[0]

    params_list = get_sql_result("""
                            select *
                            from C_RPTPRM p
                            where p.rpt_code =%s
                                """, [rpt_code])

    return JsonResponse(params_list, safe=False)

def get_ref_dscr(request):
    param_dict = dict(request.GET)
    ref_code = param_dict.get('ref_code', [''])[0]

    ref_dscr_list = []
    ref_dscr = {
                'title': 'Аналитики',
                'istree': True,
                'columns': [
                    {'caption': 'Наименование', 'field': 'name'}
                ]
                }
    ref_dscr_list.append(ref_dscr)



    return JsonResponse(ref_dscr_list, safe=False)

def get_conf_opers(request):
    param_dict = dict(request.GET)
    proc_id = param_dict.get('proc_id', [''])[0]
    rootfl = param_dict.get('rootfl', [''])[0]

    operlist = get_conf_opers_list(proc_id, rootfl)

    return JsonResponse(operlist, safe=False)


def get_conf_opers_list(proc_id, rootfl):
    conf_opers_list = get_sql_result(
                    """
                    select o.execdt,
                    c.njrn as ID, 
                   o.dscr,
                   case 
                     when c.skey is null and exists(select 1 from C_ES_CONF where proc_id = p.id and ID <> c.ID)
                         then Localize('Все значения, кроме утвержденных ранее')
                     when c.skey is null and not exists(select 1 from C_ES_CONF where proc_id = p.id and ID <> c.ID)
                         then Localize('Все значения')
                     else
                       c_pkgessheet.fGetConsDscr(c.skey, null) 
                   end as anls_dscr,
                   colvir.c_pkgusr.fUsrName(o.tus_id) usr,
                   c.njrn,
                   c.ID CONF_ID
             from  C_ES_CONF c,
                   T_OPERJRN o, 
                   T_PROCESS p,
                   T_SCEN_STD s
             where o.bop_id = p.bop_id
               and c.proc_id = p.id
               and c.njrn = o.njrn
               and o.noper = s.NORD
               and (s.code ='CONFIRM' and nvl(%s,'0')='0'
                    or s.code = 'CONFIRM_ROOT' and ROOTFL = '1')
               and c.conf_id is null
               and o.id = p.id
               and s.id = o.bop_id
               and p.id = %s
             order by EXECDT desc 
            """,[rootfl, proc_id])

    return conf_opers_list


def get_sheet_list_plane(request):

    sheet_list = get_sql_result("select b.code||' '|| b.longname book_name, cmp.year, "
                               "cmp.year cmp_name,v.CODE ver_name,g.longname grp_name, s.LONGNAME sheet_name,    "
                               "s.id sheet_id, "
                                "b.id book_id, cmp.id cmp_id, v.id ver_id, g.id grp_id , s.proc_id, p.bop_id,  p.nstat,  "
                                " t.stype, "
                                " c_pkgessheet.fGetSheetPath(s.id) sheet_path "
                               "from t_process p, c_es_sheet_type t, c_es_ver_sheet s, c_es_ver_sheet_grp g, "
                                "       C_ES_VRS v, c_es_ver_camp cmp, c_es_book b, c_es_class c "
                               "where c.id = b.CLASS_ID "
                               "and c.code='MIS' and cmp.BOOK_ID = b.id "
                            "  and t.id = s.type_id "
                            "  and p.id = s.proc_id "
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
                 'sheet_type' : sheet_type,
                 'stype' : sheet_list.get('stype'),
                 'sheet_path' : sheet_list.get('sheet_path'),
                 'proc_id' : sheet_list.get('proc_id'),
                 'nstat' : sheet_list.get('nstat'),
                 'bop_id' : sheet_list.get('bop_id'),
                 'ver_id' : sheet_list.get('bop_id'),
                 'year' : sheet_list.get('bop_id')
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
        if not self.value or len(self.value)==0:
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

    def get_value_by_name(self, prm_name):
        if len(self.value)==0:
            return ''
        skey_array=self.value.split(',')

        for item in skey_array:
            if item:
                curr_key = item.split("=>",1)[0]
                curr_val = item.split("=>",1)[1]
                if curr_key == prm_name:
                    return curr_val

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

    p_ind_id = param_dict.get('ind_id', [''])[0]
    p_parent_id = param_dict.get('parent_id', [''])[0]

    sheet_type = get_sheet_type(p_sht_id)

    if sheet_type=='TREE':
        node_list = get_tree_node_list(request)
    elif p_ind_id:
        node_list = get_anl_detail_table_rows(p_sht_id, p_key, p_ind_id, p_parent_id)
    else:
        node_list = get_anl_table_rows(p_sht_id,p_key)


    return JsonResponse(node_list, safe = False)

def get_tree_node_list(request):

    param_dict = dict(request.GET)
    p_sht_id = ''
    p_flt_id = ''
    p_flt_item_id = ''
    p_key = ''
    p_flt_root_id = ''
    p_cell_key = ''



    if 'sht_id' in param_dict:
        p_sht_id = param_dict['sht_id'][0]
    else:
        return []

    group_keys = param_dict.get('group_keys', [''])[0]

    if 'flt_id' in param_dict:
        p_flt_id = param_dict['flt_id'][0]
    if 'flt_item_id' in param_dict:
        p_flt_item_id = param_dict['flt_item_id'][0]
    if 'group_keys' in param_dict:
        p_cell_key = Skey(group_keys).process()
    if 'skey' in param_dict:
        p_key = param_dict['skey'][0]



    sheet_info = get_sheet_info_list(p_sht_id)

    node_list = get_sql_result("select 'FLT_ID_'||x.flt_id||'=>'||x.flt_item_id as node_key, "
                               "x.*, dt.atr_type, dt.round_size, i.ENT_ID "
                               "from table(C_PKGESsheet.fGetNodes(%s,%s,%s,%s,%s,%s)) x, "
                               "C_ES_DTYPE dt, "
                               "C_ES_VER_SHEET_IND i "
                               "where dt.id(+) = x.dtype_id "
                               "and i.id(+) = x.IND_ID "
                               "order by x.npp", [p_sht_id, p_key, p_flt_id, p_flt_item_id, p_flt_root_id, p_cell_key])

    for node in node_list:
        print("group_keys=", group_keys)
        process_node(p_sht_id, p_key, node, group_keys, sheet_info[0])

    return node_list

def process_node(p_sht_id, p_key, node, group_keys, sheet_info):

    p_tmp_cell_key = p_key +','+ node['node_key']
    print("process_node p_sht_id, p_tmp_cell_key, group_keys", p_sht_id, p_tmp_cell_key, "GK", group_keys)

    cell_list = get_sql_result("""
                                with params as (select %s sht_id, %s skey from dual)
                                select f.styles, 
                                        c_pkgescalc.fGetAnlDscr(p.skey) flt_dscr,
                                        case when x.commentfl=1 
                                        then (
                                              select c.prim
                                              from C_ES_SHT_VAL_COMMENT c
                                              where c.ind_id = x.ind_id
                                              and  c.skey = c_pkgescalc.fNormalizeKey( c_pkgescalc.fRemoveIndFlt(p.sht_id, p.skey||','||x.key))
                                              and correctdt=(
                                                            select max(c.correctdt)
                                                            from C_ES_SHT_VAL_COMMENT c
                                                            where c.ind_id = x.ind_id
                                                            and  c.skey = c_pkgescalc.fNormalizeKey( c_pkgescalc.fRemoveIndFlt(p.sht_id, p.skey||','||x.key))
                                                           )
                                            ) 
                                        else null end comment_text,
                                        case when x.commentfl=1 
                                        then (select c_pkgusr.fLongname( c.id_us)
                                             from C_ES_SHT_VAL_COMMENT c
                                              where c.ind_id = x.ind_id
                                              and  c.skey = c_pkgescalc.fNormalizeKey( c_pkgescalc.fRemoveIndFlt(p.sht_id, p.skey||','||x.key))
                                              and correctdt=(
                                                            select max(c.correctdt)
                                                            from C_ES_SHT_VAL_COMMENT c
                                                            where c.ind_id = x.ind_id
                                                            and  c.skey = c_pkgescalc.fNormalizeKey( c_pkgescalc.fRemoveIndFlt(p.sht_id, p.skey||','||x.key))
                                                           ) 
                                             ) 
                                        else null end comment_usr_name,
                                        x.*  
                                from params p, table(C_PKGESSHEET.fGetDataCells(p.sht_id, p.skey)) x,
                                     c_es_ver_sheet_ind_frmt f
                                where f.ind_id(+) = x.ind_id and f.tbl_id(+)= x.mark_tbl_id
                                """,
                               [p_sht_id, p_tmp_cell_key])

    cell_list = list( map(process_cell_styles, cell_list,   [node]*len(cell_list), [sheet_info]*len(cell_list)))

    cell_list.append({'key': 'name',
                      'font.italic':1,
                      'border.color': 'black',
                      'brush.color': sheet_info.get('color_restrict_hex'),
                      'font.color': 'black',
                      'sql_value': node['name']
                      })

    hie_path = []
    if (group_keys):
        skeys =group_keys.split(',')
        for item in skeys:
            if item:
                hie_path.append(item)

    hie_path.append(node['node_key'])

    node['hie_path'] = hie_path


    node['column_data'] = cell_list


def process_cell_styles(cell_src, node, sheet_info):

    cell = cell_src.copy()
    cell['brush.color'] = 'white'
    cell['font.color'] = 'black'
    cell['border.color'] = 'black'
    cell['font.italic'] = '0'
    cell['font.bold'] = '0'
    #для упрощения отладки
    cell['node_name'] = node['name']

    if node.get('groupfl') == '1' or cell.get('editfl') == 0:
        cell['brush.color'] = sheet_info.get('color_restrict_hex')
    else:
        cell['brush.color'] = sheet_info.get('color_hand_hex')

    if cell.get('oldfl') == 1:
        cell['font.color'] = 'red'
        cell['border.color'] = 'red'
        cell['font.italic'] = '1'
        cell['font.bold'] = '1'

    elif cell.get('styles'):
        styles = cell.get('styles').split(',')
        for style in styles:
            style_name = style.split('=')[0].lower().replace('"','')
            if style_name.endswith('color'):

                cell[style_name] = delphi_color_to_hex(int(style.split('=')[1]))
            else:
                cell[style_name] = style.split('=')[1]
    elif cell.get('confirmfl') == '1':
        cell['border.color'] = 'blue'

    return cell

def get_sheet_columns(request):
    param_dict = dict(request.GET)
    p_sht_id =''
    p_skey = ''

    if 'sht_id' in param_dict:
        p_sht_id = param_dict['sht_id'][0]
    if 'skey' in param_dict:
        p_skey = param_dict['skey'][0]

    p_ind_id = param_dict.get('ind_id', [''])[0]
    view_type = param_dict.get('viewType', [''])[0]


    if view_type=='CommentView':
        columns = []
        columns.append({'name': 'Комментарий', 'key': 'prim'})
        columns.append({'name': 'Исполнитель', 'key': 'usr_name'})
        columns.append({'name': 'Дата и время', 'key': 'correctdt'})
        columns.append({'name': 'Файлы', 'key': 'file_list'})
    elif view_type=='ScheduleView':
        p_req_id = param_dict.get('req_id', [''])[0]
        columns = get_schedule_column_list(p_sht_id, p_req_id)
    elif view_type=='FlowView':
        dop = param_dict.get('dop', [''])[0]
        columns = get_flow_column_list(p_sht_id, dop, p_skey)
    elif view_type=='ConfView':

        columns = []
        columns.append({'name': 'Дата и время', 'key': 'execdt'})
        columns.append({'name': 'Исполнитель', 'key': 'usr'})
        columns.append({'name': 'Описание', 'key': 'dscr'})

    elif view_type=='HistoryView':
        skey = param_dict.get('skey', [''])[0]

        if skey:
            columns = []
        else:
            columns = get_sql_result(
                                        """
                                        select x.id, 'flt_id_' | | x.id key, x.name
                                        from
                                        (
                                        select f.id, c_pkgesbook.fGetSheetFltName(f.id) name, f.npp, f.flt_type
                                        from C_ES_VER_SHEET_FLT f
                                        where f.sht_id = %s
                                           and f.ind_id is null
                                           and f.SRC_TYPE != 'IND'
                                        ) x
                                        order by decode(x.flt_type, 'F', 0, 'H', 1, 'V', 2, 3), x.npp
                                        """, [p_sht_id])

            columns.append({'name': 'Показатель', 'key': 'ind_name'})


        columns.append({'name': 'Значение', 'key': 'text_value'})
        columns.append({'name': 'Исполнитель', 'key': 'usr_name'})
        columns.append({'name': 'Дата и время', 'key': 'correctdt'})



    elif len(p_ind_id)>0:
        p_parent_id = param_dict.get('parent_id',[''])[0]

        columns = get_sheet_details_columns_list(p_sht_id, p_skey, p_ind_id)
    else:
        sheet_type = get_sheet_type(p_sht_id)
        columns = get_sheet_columns_list(sheet_type, p_sht_id, p_skey)


    for column in columns:
        if 'ent_id' in column and column['ent_id']:
            ind_id = column['ind_id']
            column['refer_data'] = get_refer_list(ind_id)

    return JsonResponse(columns, safe=False)

def get_schedule_column_list(p_sht_id, p_req_id):
    columns = get_sql_result(' select c.code key, c.longname name, '
                             '  case when c.READONLYFL=1 then 0 '
                             '      else 1 '
                             ' end editfl, '
                             ' c.atr_type '
                             ' from table(C_PKGESdm.fGetColumns(%s, %s)) c '
                             ' order by c.npp',
                             [p_sht_id, p_req_id])

    return columns

def get_flow_column_list(sht_id, dop, skey):
    print('get_flow_cols sht_id, dop, skey = ', sht_id, dop, skey)
    run_sql(      '  begin  '
                  ' C_PKGESSHEET.PADDFILTER(%s, %s ); '
                  ' C_PKGESSHEET.PADDFILTER(%s, %s ); '
                  ' C_PKGESSHEET.PADDFILTER(%s, %s ); '
                  '  end; ', ['SHT_ID', sht_id, 'PERIOD_STEP', '6', 'DOP',  dop])

    columns = [{'name':'Аналитика/показатель', 'key': 'name', 'editfl': 0 }]

    columns = columns + get_sql_result(""" select c.*, to_char(c.dfrom,'ddmmyyyy')||'_'||c.period_step as key ,
                                        'N' atr_type
                              from table(C_PKGESreq.fGetPaymentFlowsColumns(%s) ) c """,
                             [skey])

    return columns

def get_sheet_details_columns_list(p_sht_id, p_skey, p_ind_id):
    columns = get_sql_result('select c.idx, c.code key, c.longname name, c.editfl, c.ent_id, atr_type,'
                              ' c.ind_id,  null ind_id_hi '
                             ' from table(C_PKGESREQ.fGetDetColumns(%s, %s, %s)) c', [p_sht_id, p_ind_id, p_skey])
    return columns

def get_sheet_columns_list(sheet_type, sht_id, skey):
    if sheet_type=='TREE':
        columns = get_sql_result('select * from table(C_PKGESsheet.fGetColumns(%s, %s))', [sht_id, skey])
        for column in columns:
            column['atr_type'] = 'N' #в целях эксперимента, конечно это не всегда так


        group_column = {'idx': 0, 'key': 'name', 'name': 'Показатель', 'editfl': 0, 'rowgroupfl': 1}
        columns.insert(0, group_column)
        return columns
    else:
        return get_sql_result("""select c.idx, c.code key, c.longname name, c.editfl, c.ent_id, atr_type,
                               c.ind_id, c.ind_id_hi,visiblefl,
                               (
                               select sign(count(*))
                                from C_ES_DEC_TBL_RULE r,
                                     C_ES_VER_SHEET_IND_TBL t 
                                where t.ind_id = c.ind_id and t.tbl_type='R'
                                and   r.row_id = t.tbl_id
                                and   r.rule_type='D'
                                ) detailfl 
                                from table(C_PKGESreq.fGetColumns(%s,%s)) c
                                where visiblefl = 1
                                """, [skey,sht_id])



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

        sheet_stype = param_dict.get('stype', [''])[0]
        if sheet_stype=='DM' or sheet_stype=='MULTY_DM':
            dop_flt = {}
            dop_flt['flt_id'] = "DOP"
            dop_flt['name'] = "Дата загрузки"
            dop_flt['filter_node_list'] = get_sql_result("""
                                                            select to_char(d.doper, 'dd.mm.yy') id, to_char(d.doper, 'dd.mm.yy') label, 'DOP' flt_id 
                                                            from table(c_pkgesdm.fGetDMDates(%s)) d
                                                            order by d.DOPER desc 
                                                        """,[sht_id])



            filter_list.append(dop_flt)

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


def get_oracle_connection():
    import cx_Oracle
    from django.conf import settings
    db_settings =  settings.DATABASES.get('default')
    db_connection_prams = db_settings['USER']+'/'+db_settings['PASSWORD']+'@'+db_settings['HOST']+'/'+db_settings['NAME']
    return cx_Oracle.connect(db_connection_prams)


def get_operlist(request):
    param_dict = dict(request.GET)
    proc_id = param_dict.get('proc_id', [''])[0]
    bop_id = param_dict.get('bop_id', [''])[0]
    nstat = param_dict.get('nstat', [''])[0]

    operlist = get_operlist_list(proc_id, bop_id, nstat)

    return JsonResponse(operlist, safe=False)

def getref(request):

    param_dict = dict(request.GET)

    print("param_dict", param_dict)

    ref_code = param_dict.get('CODE', [''])[0]
    ref_keyvalues = param_dict.get('KEYVALUES', [''])[0]
    #ref_params = json.loads(param_dict.get('PARAMS', [''])[0])
    ref_params = {}



    key_values_dict = {}

    print("ref_keyvalues", ref_keyvalues)
    #print("key_values_list", key_values_list)

    if ref_keyvalues:
        key_values_list = ref_keyvalues.split(',')
        for key_record in key_values_list:
            key_values_dict[key_record.split('=>')[1]] = key_record.split('=>')[0].strip("'")


    for param in ref_params:
        if param != 'KEYVALUES':
            key_values_dict[param] = ref_params[param]

    print("key_values_dict", key_values_dict)

    #key_values_dict2 = {"ID":"8748"}

    if ref_code=="TfrmShtFltNodeRef":
        ref_data = get_sql_result("""
                                    select t.* 
                                    from table(c_pkgesbook.fGetFilterNodesFull(:ID)) t, 
                                            C_ES_VER_SHEET_FLT_HIE h
                                    where h.id = :ID and h.id_node = t.id
                                  """,key_values_dict)

    for row in ref_data:
        if not row['id_hi']:
            row['id_hi']='0'

    print("ref_data",ref_data)

    return JsonResponse(ref_data, safe=False)

def get_flt(request):
    param_dict = dict(request.GET)
    sht_id = param_dict.get('sht_id', [''])[0]
    sht_flt_id = param_dict.get('sht_flt_id', [''])[0]
    row_flt_id = param_dict.get('row_flt_id', [''])[0]
    col_flt_id = param_dict.get('col_flt_id', [''])[0]


    flt_list = get_sql_result(""" 
    
                                select f.id, c_pkgesbook.fGetSheetFltName(f.id) name,
                                   (
                                     select c.ent_id
                                       from C_ES_VER_CON c
                                      where c.id = f.anl_id
                                   ) ent_id
                               from c_es_ver_sheet_flt f
                             where f.sht_id = %s
                               and f.flt_type <> 'F'
                               and f.id <> nvl(%s, 0)
                               and f.id <> nvl(%s, 0)
                               and f.id <> nvl(%s, 0) 
                            order by name
                                """, [sht_id, sht_flt_id, row_flt_id, col_flt_id])

    return JsonResponse(flt_list, safe=False)


def get_flt_items(request):
    param_dict = dict(request.GET)
    flt_id = param_dict.get('flt_id', [''])[0]

    flt_items_list = get_sql_result(""" 
                                        select id, nvl(id_hi,0) parent_id, name
                                        from table(c_pkgesbook.fGetFilterNodesFull(%s))
                                        where id<>'#OTHER#'
                                """, [flt_id])

    return JsonResponse(flt_items_list, safe=False)


def get_reports(request):
    param_dict = dict(request.GET)
    src_id = '21732839'
    task_id = '140007'
    report_list = get_sql_result(""" 
                                     select x.*, 
       C_PkgRptUtl.fGetRptLangs(x.CODE, x.LANGTYPE) as LANGUAGES
from (
select
  r.ID, c.LONGNAME, c.MOD_ID, r.TGR_ID, r.TAS_ID, r.CODE, c.ARCFL,
  c.CORRECTDT, c.ID_US, c.PRIM, r.DEFFILE, r.DEFTYP, r.SHAREFL, r.RUNQUEUEEXTFL, r.RUN_PROC,
  r.EMPTYFL, r.REPTYPE, p.NAME as TYPE_NAME, p.CODE as TYPE_CODE,
  r.POST_PROC, r.LANGTYPE
from C_CLASS C, CV_PROVAL p,
 (select
    rp.ID, rp.TGR_ID, rp.TAS_ID, rp.CODE, rp.DEFFILE, rp.DEFTYP, rp.SHAREFL, rp.RUNQUEUEEXTFL,
    rp.RUN_PROC, rp.EMPTYFL, rp.REPTYPE, rp.POST_PROC, rp.LANGTYPE
  from C_RPT rp, C_USRMNURPT t
  where t.SCR_ID = %s
    and rp.ID = t.REP_ID
    and t.USE_ID = P_USEID
    and rp.ARESTFL = 0
union
  select
    rp.ID, rp.TGR_ID, rp.TAS_ID, rp.CODE, rp.DEFFILE, rp.DEFTYP, rp.SHAREFL, rp.RUNQUEUEEXTFL,
    rp.RUN_PROC, rp.EMPTYFL, rp.REPTYPE, rp.POST_PROC, rp.LANGTYPE
  from C_RPT rp
  where rp.TAS_ID = %s
    and rp.ARESTFL = 0
minus
  select
    rp.ID, rp.TGR_ID, rp.TAS_ID, rp.CODE, rp.DEFFILE, rp.DEFTYP, rp.SHAREFL, rp.RUNQUEUEEXTFL,
    rp.RUN_PROC, rp.EMPTYFL, rp.REPTYPE, rp.POST_PROC, rp.LANGTYPE
  from C_RPT rp, C_TASRPT t
  where rp.CODE = t.CODE
    and t.TAS_ID = %s
    and rp.ARESTFL = 0
    and t.AVAILCOND IS NOT NULL
union
  select
    rp.ID, rp.TGR_ID, rp.TAS_ID, rp.CODE, rp.DEFFILE, rp.DEFTYP, rp.SHAREFL, rp.RUNQUEUEEXTFL,
    rp.RUN_PROC, rp.EMPTYFL, rp.REPTYPE, rp.POST_PROC, rp.LANGTYPE
  from C_RPT rp, C_TASRPT t
  where rp.CODE = t.CODE
    and t.TAS_ID = %s
    and rp.ARESTFL = 0
    and t.AVAILCOND IS NULL
union
  select
    rp.ID, rp.TGR_ID, rp.TAS_ID, rp.CODE, rp.DEFFILE, rp.DEFTYP, rp.SHAREFL, rp.RUNQUEUEEXTFL,
    rp.RUN_PROC, rp.EMPTYFL, rp.REPTYPE, rp.POST_PROC, rp.LANGTYPE
  from C_RPT rp, C_TASRPT t
  where rp.CODE = t.CODE
    and t.TAS_ID = %s
    and rp.ARESTFL = 0
    and C_PkgRptUtl.fGetRptAvailable(rp.CODE, t.AVAILCOND) = '1'
    and t.AVAILCOND IS NOT NULL
  ) r
where p.TNAME = 'C_RPT'
  and p.FNAME = 'REPTYPE'
  and p.CONSTVAL = to_char(r.REPTYPE)
  and c.CODE = r.CODE
  and c.ARCFL = '0'  
  and exists (select 1 from dual where C_PkgGrant.fChkGrnRpt(r.CODE, 1) = 1)
) x
where 1=1
 order by CODE asc 
 

                                """, [src_id, task_id, task_id, task_id, task_id])

    return JsonResponse(report_list, safe=False)

def get_operlist_list(proc_id, bop_id, nstat):
    connection = get_oracle_connection()
    cursor = connection.cursor()
    refCursor =  connection.cursor()

    cursor.execute("""begin c_pkgconnect.popen();
                        bs_operation.OPERLIST(:1, :2, :3, :4);
                    end;""", [refCursor, proc_id, bop_id, nstat])

    print('operlist', refCursor)
    operlist = []
    for oper in refCursor:
        #print('oper', oper)

        row_dict = {}
        column_data = []
        for column_idx in range(len(refCursor.description)):
            column_name = refCursor.description[column_idx][0].lower()
            row_dict[column_name] = oper[column_idx]

        row_dict['proc_id'] = proc_id

        operlist.append(row_dict)

    return operlist

def get_anl_table_row_by_id(id):
    #пока некрасиво получим все записи по ключу, поскольку пока нет серверной части, чтобы получить одну запись со всеми колонками
    row = get_sql_result("select sht_id, skey, parent_id, ind_id from c_es_ver_sheet_req where id= %s", [id])
    if len(row)==0:
        return {}
    else:
        parent_id = row[0].get('parent_id', '')

        if not parent_id:
            skey = row[0].get('skey', '')
            rows = get_anl_table_rows(row[0].get('sht_id'), skey)
        else:
            rows = get_anl_detail_table_rows(row[0].get('sht_id',''), '', row[0].get('ind_id',''), parent_id)

        for row in rows:
            print('id', row.get('id'), '=ID', id)
            if str(row.get('id')) == str(id):
                return row


def get_anl_table_rows(sht_id, skey):
    print('sht_id=',sht_id, 'sk', skey)
    connection = get_oracle_connection()
    cursor = connection.cursor()
    refCursor =  connection.cursor()

    dop = Skey(skey).get_flt_value('DOP')
    if skey:
        skey_cleaned = skey.replace("FLT_ID_DOP=>"+dop+",","")
    else:
        skey_cleaned = ''

    try:
        cursor.execute("""begin c_pkgconnect.popen();
                        :1 := c_pkgesreq.fGetCursor( :2, :3,:4,5000,''); 
                    end;""", [refCursor, sht_id, skey_cleaned, dop])
    except:
        print("get_anl_table_rows ERROR")
        return []


    ref_cursor =[]

    sheet_info = get_sheet_info_list(sht_id)

    color_restrict = sheet_info[0].get('color_restrict_hex')
    color_hand = sheet_info[0].get('color_hand_hex')
    color_filter = sheet_info[0].get('color_filter_hex')

    columns = get_sheet_columns_list('TABLE', sht_id, skey)

    refer_items = get_sql_result("""
                                select t. *, i.ENT_ID 
                                from c_es_ver_sheet_ind i, table(C_PKGESent.fGetColComboMain(i.id, i.IND_MAIN_ID)) t
                                where i.SHT_ID  = %s
                                """,
                                 [sht_id])

    for row in refCursor:

        row_dict = {}
        column_data = []
        for column_idx in range(len(refCursor.description)):
            cell={}
            cell['brush.color'] = 'white'
            cell['font.color'] = 'black'
            cell['border.color'] = 'black'
            cell['font.italic'] = '0'
            cell['font.bold'] = '0'

            column_name = refCursor.description[column_idx][0].lower()
            row_dict[column_name] = row[column_idx]
            if any([True for column in columns if column['key'] == column_name.upper()]):

                column_list = [column for column in columns if column['key'] == column_name.upper()]
                if len(column_list)>0:

                    cell['ent_id'] = column_list[0].get('ent_id')
                    cell['atr_type'] = column_list[0].get('atr_type')
                    cell['editfl'] = column_list[0].get('editfl')
                    cell['name'] = column_list[0].get('name')

                    if column_name.upper().startswith('FLT'):
                        cell['brush.color'] = color_filter
                    elif cell['editfl'] ==0:
                        cell['brush.color'] = color_restrict
                    else:
                        cell['brush.color'] = color_hand

                else:
                    cell['ent_id'] =  None
                    cell['atr_type'] = None
                    cell['editfl'] = 0
                    cell['brush.color'] = color_restric


                cell['key'] = column_name.upper()
                if cell['editfl']==1 and cell['ent_id'] and row[column_idx]:
                    selected_refer_items = [item for item in refer_items if item['ent_id'] == cell['ent_id'] and item['id'] == row[column_idx]]
                    if len(selected_refer_items)>0:
                        cell['sql_value'] = selected_refer_items[0].get("name")
                else:
                    cell['sql_value'] = row[column_idx]


                column_data.append(cell)



        row_dict['node_key'] = row_dict['id']
        row_dict['column_data'] = column_data
        row_dict['hie_path'] = [row_dict['node_key']]
        ref_cursor.append(row_dict)


    return ref_cursor


def get_schedule_rows(request):
    param_dict = dict(request.GET)

    sht_id = param_dict['sht_id'][0]
    req_id = param_dict['req_id'][0]
    dop_dirty = param_dict['dop'][0]
    #dop_dirty = 2016-10-03T00:00:00
    if dop_dirty:
        dop = dop_dirty[8:10]+'.'+ dop_dirty[5:7]+'.'+dop_dirty[0:4]
    else:
        dop = ''

    print('get_schedule_rows (sht_id, req_id, dop)=',sht_id, req_id, dop)
    connection = get_oracle_connection()
    cursor = connection.cursor()
    refCursor =  connection.cursor()

    cursor.execute("""begin c_pkgconnect.popen();
                          :1 := C_PKGESdm.fGetCursor(:2, :3);
                    end;""", [refCursor, req_id, dop])



    ref_cursor =[]

    sheet_info = get_sheet_info_list(sht_id)

    color_restrict = sheet_info[0].get('color_restrict_hex')
    color_hand = sheet_info[0].get('color_hand_hex')
    color_filter = sheet_info[0].get('color_filter_hex')

    columns = get_schedule_column_list(sht_id, req_id)
    for row in refCursor:
        #print('shd row')
        row_dict = {}
        column_data = []
        for column_idx in range(len(refCursor.description)):
            cell={}
            cell['brush.color'] = 'white'
            cell['font.color'] = 'black'
            cell['border.color'] = 'black'
            cell['font.italic'] = '0'
            cell['font.bold'] = '0'

            column_name = refCursor.description[column_idx][0].lower()
            row_dict[column_name] = row[column_idx]
            if any([True for column in columns if column['key'] == column_name.upper()]):
                column_list = [column for column in columns if column['key'] == column_name.upper()]
                if len(column_list)>0:
                    cell['ent_id'] = column_list[0].get('ent_id')
                    cell['atr_type'] = column_list[0].get('atr_type')
                    cell['editfl'] = column_list[0].get('editfl')

                    if column_name.upper().startswith('FLT'):
                        cell['brush.color'] = color_filter
                    elif cell['editfl'] ==0:
                        cell['brush.color'] = color_restrict
                    else:
                        cell['brush.color'] = color_hand

                else:
                    cell['ent_id'] =  None
                    cell['atr_type'] = None
                    cell['editfl'] = 0
                    cell['brush.color'] = color_restric


                cell['key'] = column_name.upper()
                cell['sql_value'] = row[column_idx]


                column_data.append(cell)

        row_dict['node_key'] = row_dict['dop']
        row_dict['column_data'] = column_data
        ref_cursor.append(row_dict)

    return JsonResponse(ref_cursor, safe=False)

def get_flow_rows(request):
    param_dict = dict(request.GET)

    sht_id = param_dict['sht_id'][0]
    req_id = param_dict['req_id'][0]
    dop = param_dict['dop'][0]
    skey = param_dict['skey'][0]

    columns = get_flow_column_list(sht_id, dop, skey)

    print('get_payment_rows (sht_id, req_id, dop, skey)=',sht_id, req_id, dop, skey)
    flow_list = get_sql_result("""
                                select x.id, x.longname, C_PKGESreq.fPaymentFlowIsEditable(%s, x.id) editable,
                                  decode(x.PAY_SHD, 'HAND', 1, 0) as IS_HAND_INPUT_IND,
                                  d.ROUND_SIZE
                          from (
                                 select i.id, i.longname, i.paymentfl, i.PAY_SHD, i.DTYPE_ID
                                   from C_ES_VER_SHEET_IND i
                                  start with i.sht_id = %s and i.id_hi is null connect by prior i.id = i.id_hi
                                  order siblings by i.npp
                               ) x,
                              C_ES_DTYPE_STD d
                         where x.paymentfl = '1'
                            and x.DTYPE_ID = d.ID(+)""", [req_id, sht_id])

    flow_data_sql = """
                    select x.DFROM,x.IND_ID,x.PERIOD_STEP,x.AMOUNT,i.PAY_SHD as PAY_SHD_CODE,
                    /*params.REQ_ID*/%s as REQ_ID
                    --from table(c_pkgesreq.fGetPaymentFlows(params.SHT_ID, params.REQ_ID, params.SKEY, params.DOP)) x,
                    from table(c_pkgesreq.fGetPaymentFlows(%s, %s, %s, %s)) x,
                            C_ES_VER_SHEET_IND_STD i
                    where i.ID = x.IND_ID and /*params.REQ_ID*/%s is not null
                        union all
                    select x.DFROM, x.IND_ID, x.PERIOD_STEP, sum(x.AMOUNT) as AMOUNT, 
                    i.PAY_SHD as PAY_SHD_CODE, %s  as  REQ_ID
                    from table(c_pkgesreq.fGetPaymentFlows(%s, %s, %s, %s)) x,
                    C_ES_VER_SHEET_IND_STD i
                    where i.ID = x.IND_ID and %s is null
                    group by x.DFROM, x.IND_ID, x.PERIOD_STEP, i.PAY_SHD
                """

    flow_data = get_sql_result(flow_data_sql, [req_id, sht_id, req_id, skey, dop, req_id,
                                                req_id, sht_id, req_id, skey, dop, req_id])
    sheet_info = get_sheet_info_list(sht_id)

    color_restrict = sheet_info[0].get('color_restrict_hex')
    color_hand = sheet_info[0].get('color_hand_hex')


    ref_cursor = []
    for row in flow_list:
        row_dict = {}
        column_data = []

        for column in columns:
            cell = {}
            cell['brush.color'] = 'white'
            cell['font.color'] = 'black'
            cell['border.color'] = 'black'
            cell['font.italic'] = '0'
            cell['font.bold'] = '0'

            cell['key'] = column.get('key')

            if column.get('key')=='name':
                cell['sql_value'] = row.get('longname')
            else:
                cell['atr_type']= 'N'
                values_list = [flow_row.get('amount') for flow_row in flow_data if (flow_row.get('dfrom') == column.get('dfrom') and flow_row.get('period_step') == column.get('period_step') and flow_row.get('ind_id') == row.get('id'))]
                if len(values_list)>0:
                    cell['sql_value'] = values_list[0]


            cell['editfl'] = row.get('editfl')

            if cell['editfl'] == 0:
                cell['brush.color'] = color_restrict
            else:
                cell['brush.color'] = color_hand



            column_data.append(cell)

        row_dict['node_key'] = row.get('id')
        row_dict['column_data'] = column_data
        ref_cursor.append(row_dict)

    return JsonResponse(ref_cursor, safe=False)

def get_anl_detail_table_rows(sht_id, skey, ind_id, parent_id):
    connection = get_oracle_connection()
    cursor = connection.cursor()
    refCursor =  connection.cursor()

    cursor.execute("""begin c_pkgconnect.popen();
                        :1 := c_pkgesreq.fGetDetailsCursor( :2, :3, :4, :5); 
                    end;""", [refCursor, sht_id, ind_id, skey, parent_id])
    ref_cursor =[]

    sheet_info = get_sheet_info_list(sht_id)

    color_restrict = sheet_info[0].get('color_restrict_hex')
    color_hand = sheet_info[0].get('color_hand_hex')
    color_filter = sheet_info[0].get('color_filter_hex')


    columns = get_sheet_details_columns_list(sht_id, skey, ind_id)
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
                    if column_name.upper().startswith('FLT'):
                        color = color_filter
                    elif editfl==0:
                        color = color_restrict
                    else:
                        color = color_hand

                else:
                    ent_id = None
                    atr_type = None
                    editfl = 0
                    color = color_restric

                column_data.append({
                                        'key':column_name.upper(),
                                        'sql_value': row[column_idx],
                                        'editfl':editfl,
                                        'ent_id':ent_id,
                                        'atr_type':atr_type,
                                        'color':color

                })


        row_dict['node_key'] = row_dict['id']
        row_dict['column_data'] = column_data
        row_dict['hie_path'] = [row_dict['node_key']]

        ref_cursor.append(row_dict)

    return ref_cursor;

def get_sql_result(sql, params):
    with connection.cursor() as cursor:
        cursor.execute('call c_pkgconnect.popen();' )
        cursor.execute(sql, params)
        return dict_fetch_all(cursor)

def run_sql(sql, params):
    with connection.cursor() as cursor:
        cursor.execute('call c_pkgconnect.popen();' )
        cursor.execute(sql, params)


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


def delphi_color_to_hex(delphi_color):
    if delphi_color:
        hexStr = hex(delphi_color)
        color =  ('#'+hexStr[6:8] + hexStr[4:6] + hexStr[2:4])
        return color.ljust(7,'0')
    else:
        return '#0'


def scoring_form(request):
    from .forms import ScoringForm
    form = ScoringForm()
    return render(request, 'scoring.html', {'form': form})
