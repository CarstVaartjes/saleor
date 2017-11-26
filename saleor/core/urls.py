from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.home, name='home'),
    url(r'^style-guide/', views.styleguide, name='styleguide'),
    url(r'^how_it_works$', views.how_it_works, name='how_it_works'),
    url(r'^about_me$', views.about_me, name='about_me'),
    url(r'^allergy_info$', views.allergy_info, name='allergy_info'),
]
