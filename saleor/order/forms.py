from django import forms
from django.conf import settings
from django.utils.translation import pgettext_lazy
from payments import PaymentStatus

from .models import Payment, Order, OrderStatus
from ..registration.forms import SignupForm
from ..vacation.vacation import vacation_list


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


class CheckAvailableQtyForm(forms.Form):
    """
    Validates the available qty for the delivery date
    """

    delivery_date = forms.DateField(required=True, input_formats=['%Y-%m-%d'])

    error_messages = {
        'no-date': pgettext_lazy(
            'No selected date',
            'Sorry. There is no selected date'
        )}

    def __init__(self, *args, **kwargs):
        super(CheckAvailableQtyForm, self).__init__(*args, **kwargs)

    def check_date(self):
        """
        Checks if the delivery date is valid and if so, checks if there's enough stock for that date
        Returns: the cleaned datetime

        """

        delivery_date = self.cleaned_data['delivery_date']
        if not delivery_date or delivery_date in vacation_list:
            return {'max_qty': -1, 'used_qty': -1, 'available_qty': 0}

        if settings.MAX_DAY_QUANTITY and settings.MAX_CART_TOTAL_QUANTITY:
            max_qty = min(settings.MAX_DAY_QUANTITY, settings.MAX_CART_TOTAL_QUANTITY)
        elif settings.MAX_CART_TOTAL_QUANTITY:
            max_qty = settings.MAX_CART_TOTAL_QUANTITY
        elif settings.MAX_DAY_QUANTITY:
            max_qty = settings.MAX_DAY_QUANTITY
        else:
            return {'max_qty': -1, 'used_qty': -1, 'available_qty': 0}

        orders_all = Order.objects.all()
        orders = orders_all.filter(delivery_date=delivery_date, status=OrderStatus.FULLY_PAID)
        used_qty = 0
        for order in orders:
            used_qty += order.get_total_quantity()

        return {'max_qty': max_qty, 'used_qty': used_qty, 'available_qty': max_qty-used_qty}
