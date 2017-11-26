from django.template.response import TemplateResponse

from ..dashboard.views import staff_member_required
from ..product.utils import products_with_availability, products_for_homepage


def home(request):
    products = products_for_homepage()[:8]
    products = products_with_availability(
        products, discounts=request.discounts, local_currency=request.currency)
    return TemplateResponse(
        request, 'home.html',
        {'products': products, 'parent': None})


@staff_member_required
def styleguide(request):
    return TemplateResponse(request, 'styleguide.html')


def how_it_works(request):
    return TemplateResponse(
        request, 'happy_baker/how_it_works.html',
        {'parent': None})


def about_me(request):
    return TemplateResponse(
        request, 'happy_baker/about_me.html',
        {'parent': None})


def allergy_info(request):
    return TemplateResponse(
        request, 'happy_baker/allergy_info.html',
        {'parent': None})


