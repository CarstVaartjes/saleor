from django import forms
from django.conf import settings
from django.utils.translation import pgettext_lazy
from payments import PaymentStatus

from .models import Payment, Order
from ..registration.forms import SignupForm


class PaymentMethodsForm(forms.Form):
    method = forms.ChoiceField(
        label=pgettext_lazy('Payment methods form label', 'Method'),
        choices=settings.CHECKOUT_PAYMENT_CHOICES, widget=forms.RadioSelect,
        initial=settings.CHECKOUT_PAYMENT_CHOICES[0][0])


class PaymentDeleteForm(forms.Form):
    payment_id = forms.IntegerField(widget=forms.HiddenInput())

    def __init__(self, *args, **kwargs):
        self.order = kwargs.pop('order')
        super(PaymentDeleteForm, self).__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super(PaymentDeleteForm, self).clean()
        payment_id = cleaned_data.get('payment_id')
        waiting_payments = self.order.payments.filter(
            status=PaymentStatus.WAITING)
        try:
            payment = waiting_payments.get(id=payment_id)
        except Payment.DoesNotExist:
            self._errors['number'] = self.error_class([
                pgettext_lazy(
                    'Payment delete form error',
                    'Payment does not exist')])
        else:
            cleaned_data['payment'] = payment
        return cleaned_data

    def save(self):
        payment = self.cleaned_data['payment']
        payment.status = PaymentStatus.REJECTED
        payment.save()


class PasswordForm(SignupForm):
    def __init__(self, *args, **kwargs):
        super(PasswordForm, self).__init__(*args, **kwargs)
        self.fields['email'].widget = forms.HiddenInput()


class AvailableDateForm(forms.Form):
    """
    Validates the available dates
    """

    error_messages = {}

    def __init__(self, *args, **kwargs):
        super(AvailableDateForm, self).__init__(*args, **kwargs)

    def create_available_datelist(self):
        """
        Checks if the delivery date is valid and if so, checks if there's enough stock for that date
        Returns: the cleaned datetime

        """
        orders_all = Order.objects.prefetch_related(
            'groups', 'payments', 'groups__items', 'user').all()
        orders = orders_all.filter(status=active_status)

        delivery_date = self.cleaned_data['delivery_date']
        if not self.cart.check_qty(delivery_date):
            msg = self.error_messages['insufficient-stock']
            self.add_error('delivery_date', msg.format(delivery_date.strftime('%d/%m/%Y')))
        return delivery_date

    def save(self):
        """Updates cart delivery date"""
        self.cart.delivery_date = self.cleaned_data['delivery_date']
        self.cart.save()
        return True
