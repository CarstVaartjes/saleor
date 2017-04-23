import $ from 'jquery';
import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * See https://hacker0x01.github.io/react-datepicker/
 * Note the next:
 * Deprecation warning: value provided is not in a recognized RFC2822 or ISO format.
 * moment construction falls back to js Date(), which is not reliable across all browsers and versions.
 * Non RFC2822/ISO date formats are discouraged and will be removed in an upcoming major release.
 * Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.
 *
 */
var DeliveryDatePicker = React.createClass({
    displayName: 'DeliveryDatePicker',

    getInitialState: function () {
        return {
          startDate: null,
          excludeDates: null
        };
    },

    listenCartQuantityChanges: function(){
        /*
           event listener to validate the selected date when the cart item quantities are refreshed
         */
        let $cartLine = $('.cart__line');
        let component = this;
        $cartLine.each(function() {
          let $quantityInput = $(this).find('#id_quantity');
          $(this).on('change', $quantityInput, (e) => {
              let currentDate = component.props.delivery_date;
              if(currentDate){
                  component.submitDate(currentDate)
              }
          });
        });
    },

    handleChange: function (newDate) {
        this.setState({
            startDate: newDate
        });
        if(newDate)
          this.submitDate(newDate);
        else{
          this.showValidationErrors('Please, select a delivery date');
        }
    },

    showValidationErrors: function(errorText){
        var $deliveryDateErrors = $('#delivery_date_errors');
        var $checkoutButton = $("#checkout_button");
        if(errorText){
            $checkoutButton.hide();
            $deliveryDateErrors.html(errorText);
            $deliveryDateErrors.show();
        } else{
            $checkoutButton.show();
            $deliveryDateErrors.empty();
            $deliveryDateErrors.hide();
        }
    },

    totalCartQuantity: function(){
        let $cartLine = $('.cart__line');
        let component = this;
        let total_qty = 0;
        $cartLine.each(function() {
          let $quantityInput = $(this).find('#id_quantity');
          total_qty += Number($quantityInput.val());
          });
        return total_qty
    },

    checkStock: function(date, callback){
        let component = this;
        let cartTotalQty = this.totalCartQuantity();

        $.ajax({
            url: '/order/check_available_quantity/',
            type: 'POST',
            data: {
                delivery_date: date.format('YYYY-MM-DD')
            }
        }).done((response, status)=>{
            if(status !== 'success'){
                let validationErrors = response.errors.delivery_date;
                let errorText = "";
                for(var i= 0, len=validationErrors.length; i < len; i++){
                    errorText += validationErrors[i];
                }
                component.showValidationErrors(errorText);
            } else{
                let availableQty = response.available_qty;
                if(cartTotalQty >= 0){
                    // console.log('carttotal: ', cartTotalQty);
                    // console.log('available: ', availableQty);
                    if(cartTotalQty > availableQty){
                        component.showValidationErrors('sorry, the maximum available for this day is '
                            + availableQty + ' units');
                    }else{
                        callback();
                    }
                }
            }
        }).fail(() => {
            component.showValidationErrors('Unexpected error updating date. Please try again later');
        });
    },

    setDeliveryDate: function(date){
      let component = this;
      $.ajax({
          url: '/cart/delivery_date_set/',
          type: 'POST',
          data: {
            delivery_date: date.format('YYYY-MM-DD')
          },
          success: (response, status) => {
            if(status !== 'success'){
                let validationErrors = response.errors.delivery_date;
                let errorText = "";
                for(var i= 0, len=validationErrors.length; i < len; i++){
                    errorText += validationErrors[i];
                }
                component.showValidationErrors(errorText);
            } else{
                component.showValidationErrors(); // clear validation errors
            }
          },
          error: () => {
            component.showValidationErrors('Unexpected error updating date. Please try again later');
          }
      });
    },

    submitDate: function(newDate){
        let component = this;
        component.props.delivery_date = newDate;
        this.checkStock(newDate, () => {
            component.setDeliveryDate(newDate)
        });
    },

  componentDidMount: function () {
    /* This function is automatically called when the component is mounted
       It will retrieve the current delivery date & available dates and will update the component status
    */
    this.listenCartQuantityChanges();
    var component = this;
    // 1.- Set the initial date:
    $.ajax({url: '/cart/delivery_date_retrieve/', type: 'POST'})
      .done((response, status) => {
        if (status === 'success') {
          if (response.delivery_date) {
            let parsedDate = moment(response.delivery_date, "YYYY-MM-DDTHH:mm:ss").startOf('day');
            //check if the date is not before the minimum date
            let minDate = component.get_min_date();
            // console.log('Retrieved date: ' + parsedDate.format('YYYY/MM/DD'));
            // console.log('Min date: ' + minDate.format('YYYY/MM/DD'));
            if (parsedDate < minDate) {
              parsedDate = minDate;
            }
            console.log('Set date: ' + parsedDate.format('YYYY/MM/DD'));
            // check excluded days
            $.ajax({url: '/order/not_available_datelist_retrieve/', type: 'POST'})
            .done((response, status) => {
              if (status == 'success') {
                for (let exclude_date of response.not_available_datelist) {
                  let parsed_exclude_date = moment(exclude_date, "YYYY-MM-DDTHH:mm:ss").startOf('day');
                  // console.log('excluded date: ' + parsed_exclude_date.format('YYYY/MM/DD'));
                  if (parsedDate.isSame(parsed_exclude_date)) {
                    parsedDate = parsedDate.add(1, 'days');
                    // console.log('Added day: ' + parsedDate.format('YYYY/MM/DD'));
                  }
                }
                component.setState({'startDate': parsedDate});
            component.props.delivery_date = parsedDate;
            this.submitDate(parsedDate);
            component.forceUpdate();
              }
            }).fail(() => {
              component.setState({'startDate': parsedDate});
            component.props.delivery_date = parsedDate;
            this.submitDate(parsedDate);
            component.forceUpdate();
            });
          }
        }
      }).fail(() => {});

    // 2.- Set the available dates:
    $.ajax({url: '/order/not_available_datelist_retrieve/', type: 'POST'})
      .done((response, status) => {
        if (status == 'success') {
          let parsedDateList = [];
          for (let exclude_date of response.not_available_datelist) {
            parsedDateList.push(moment(exclude_date, "YYYY-MM-DDTHH:mm:ss").startOf('day'));
          }
          component.setState({'excludeDates': parsedDateList});
        }
      }).fail(() => {});
  },

    isPickupDay: function(date){
	    var day = date.day();
	    return day !== 0 && day !== 1;
    },

    propTypes: {
        onClick: React.PropTypes.func,
        value: React.PropTypes.string
    },

    get_min_date: function() {
      // before 13:00, the next day is possible, if not, two days later
      let min_date = moment().startOf('day');
      if (min_date.hour() < 13)
       {min_date.add(1, "days")}
      else
       {min_date.add(2, "days")}
      // check if we are not setting the date for a sunday or monday
      if (min_date.day() == 0)
       {min_date.add(2, "days")}
      if (min_date.day() == 1)
       {min_date.add(1, "days")}
      return min_date;
    },

    render: function () {
        return <DatePicker
            dateFormat="D/M/Y"
            locale="en"
            minDate={this.get_min_date()}
            placeholderText="Enter Day/Month/Year"
            isClearable={true}
            excludeDates={this.state.excludeDates}
            selected={this.state.startDate}
            filterDate={this.isPickupDay}
            onChange={this.handleChange}/>;
    }

});

export default DeliveryDatePicker;
