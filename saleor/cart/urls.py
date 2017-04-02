from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^update/(?P<variant_id>\d+)/$', views.update, name='update-line'),
    url(r'^summary/$', views.summary, name='cart-summary'),
    url(r'^delivery_date/$', views.delivery_date_view, name='delivery_date'),
    url(r'^shipingoptions/$', views.get_shipping_options,
        name='shipping-options')
]
