"""project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from backend import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('filter_nodes/', views.get_filter_nodes),
    path('sht_filters/', views.get_sht_filters),
    path('sht_nodes/', views.get_sheet_nodes),
    path('sht_columns/', views.get_sheet_columns),
    path('sheet_list/', views.get_sheet_list_plane),
    path('refer/', views.get_refer),
    path('refer_value/', views.get_refer_value),
    path('sht_info/', views.get_sheet_info),
    path('sht_info_update/', views.get_sheet_info_update),
    path('sht_state_update/', views.get_sheet_state_update),
    path('sht_state/', views.get_sheet_state),
    path('insert_record/', views.insert_table_record),
    path('update_record/', views.update_table_record),
    path('delete_record/', views.delete_table_record),
    path('update_tree_record/', views.update_tree_record),
    path('get_comments/', views.get_comments),
    path('delete_comment/', views.delete_comment),
    path('insert_comment/', views.insert_comment),
    path('upload_file/', views.upload_file),
    path('get_file/', views.get_file),
    path('get_schedule/', views.get_schedule_rows),
    path('get_flow/', views.get_flow_rows),
    path('scoring_form/', views.scoring_form),
    path('get_report/', views.get_report),
    path('sheet_confirm/', views.sheet_confirm),
    path('operlist/', views.get_operlist),
    path('run_oper/', views.run_oper),
    path('conf_opers/', views.get_conf_opers),
    path('recalc_sheet/', views.recalc_sheet),
    path('recalc_cell/', views.recalc_cell),
    path('get_conf_list/', views.get_conf_list),
    path('get_history/', views.get_history),
    path('get_flt/', views.get_flt),
    path('get_flt_items/', views.get_flt_items),
    path('get_reports/', views.get_reports),
    path('import_sheet_data/', views.import_sheet_data),
    path('get_layouts/', views.get_layouts),
    path('update_layout/', views.update_layout),
    path('delete_layout/', views.delete_layout),
    path('get_dm_dops/', views.get_dm_dops),
    path('create_payments/', views.create_payments),
    path('get_report_params/', views.get_report_params),
    path('get_ref_dscr/', views.get_ref_dscr),
    path('getref/', views.getref),
    path('reload_nodes/', views.reload_nodes),
    path('layout_set_default/', views.layout_set_default),
    path('get_cell_comment/', views.get_cell_comment),


    path('', include('frontend.urls')),
]

