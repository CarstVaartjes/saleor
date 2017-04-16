from __future__ import unicode_literals
from django.conf.urls import url
from django.conf import settings
from django.http.response import HttpResponseBadRequest, HttpResponse
from ..core import TOKEN_PATTERN
from . import views
from django.views.decorators.csrf import csrf_exempt
from .models import Payment
from payments_stripe_sources import StripeSourcesProvider

import stripe
import json


@csrf_exempt
def stripe_source_callback(request):
    """
    we get a callback after the end of the payment, so that we can try to charge if it was successful

    :param request: 
    :return: 
    """
    stripe.api_key = settings.STRIPE_SECRET_KEY
    # Retrieve the request's body and parse it as JSON
    try:
        event_json = json.loads(request.body.decode('utf-8'))
    except TypeError:
        return HttpResponseBadRequest()
    # Verify the event by fetching it from Stripe
    print('event_id: ' + event_json["id"])
    event = stripe.Event.retrieve(event_json["id"])
    # Now retrieve the payment
    payment_id = event.data.object.metadata.payment_id
    print('payment_id: ' + event_json["id"])
    # retrieve the class
    payments = Payment.objects.all()
    try:
        payment = payments.get(id=payment_id)
    except Payment.DoesNotExist:
        # ignore
        return HttpResponseBadRequest()
    # now charge
    StripeSourcesProvider.charge(None, payment)  # yes using the None for self is horrible and i need to check this ;)
    return HttpResponse()


urlpatterns = [
    url(r'^%s/$' % (TOKEN_PATTERN,), views.details, name='details'),
    url(r'^%s/payment/$' % (TOKEN_PATTERN,),
        views.payment, name='payment'),
    url(r'^%s/payment/(?P<variant>[-\w]+)/$' % (TOKEN_PATTERN,),
        views.start_payment, name='payment'),
    url(r'^%s/cancel-payment/$' % (TOKEN_PATTERN,), views.cancel_payment,
        name='cancel-payment'),
    url(r'^%s/create-password/$' % (TOKEN_PATTERN,),
        views.create_password, name='create-password'),
    url(r'^%s/attach/$' % (TOKEN_PATTERN,),
        views.connect_order_with_user, name='connect-order-with-user'),
    url(r'^not_available_datelist_retrieve/$', views.not_available_datelist_retrieve,
        name='not_available_datelist_retrieve'),
    url(r'^check_available_quantity/$', views.check_available_quantity,
        name='check_available_quantity'),
    url(r'^stripe_source/$', stripe_source_callback,
        name='stripe_source'),
]
