from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^update/(?P<variant_id>\d+)/$', views.update, name='update-line'),
    url(r'^summary/$', views.summary, name='cart-summary'),
    url(r'^delivery_date_set/$', views.delivery_date_set, name='delivery_date_set'),
    url(r'^delivery_date_retrieve/$', views.delivery_date_retrieve, name='delivery_date_retrieve'),
    url(r'^total_qty_retrieve/$', views.total_qty_retrieve, name='total_qty_retrieve'),
    url(r'^shipingoptions/$', views.get_shipping_options,
        name='shipping-options')
]
