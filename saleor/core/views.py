from django.template.response import TemplateResponse

from ..product.utils import products_with_availability, products_for_homepage


def home(request):
    products = products_for_homepage()[:8]
    products = products_with_availability(
        products, discounts=request.discounts, local_currency=request.currency)
    return TemplateResponse(
        request, 'home.html',
        {'products': products, 'parent': None})


def how_it_works(request):
    return TemplateResponse(
        request, 'how_it_works.html',
        {'parent': None})


def about_me(request):
    return TemplateResponse(
        request, 'about_me.html',
        {'parent': None})


def allergene_info(request):
    return TemplateResponse(
        request, 'allergene_info.html',
        {'parent': None})
