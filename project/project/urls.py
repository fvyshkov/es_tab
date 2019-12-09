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
    path('insert_record/', views.add_table_record),
    path('update_record/', views.update_table_record),
    path('delete_record/', views.delete_table_record),

    path('', include('frontend.urls')),
]

