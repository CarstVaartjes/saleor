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

    handleChange: function (date) {
        this.setState({
            startDate: date
        });
        if(date)
          this.submitDate(date.format('YYYY-MM-DD'));
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

    submitDate: function(date){
        $.ajax({
          url: '/cart/delivery_date_set/',
          type: 'POST',
          data: {
            delivery_date: date
          },
          success: (response, status) => {
            if(status !== 'success'){
                let validationErrors = response.errors.delivery_date;
                let errorText = "";
                for(var i= 0, len=validationErrors.length; i < len; i++){
                    errorText += validationErrors[i];
                }
                this.showValidationErrors(errorText);
            }
          },
          error: () => {
            this.showValidationErrors('Unexpected error updating date. Please try again later');
          }
        });
    },

  componentDidMount: function () {
    /* This function is automatically called when the component is mounted
       It will retrieve the current delivery date & available dates and will update the component status
    */
    var component = this;
    // 1.- Set the initial date:
    $.ajax({url: '/cart/delivery_date_retrieve/', type: 'POST'})
      .done((response, status) => {
        if (status === 'success') {
          if (response.delivery_date) {
            let parsedDate = moment(response.delivery_date, "YYYY-MM-DDTHH:mm:ss");
            component.setState({'startDate': parsedDate});
          }
        }
      }).fail(() => {});

    // 2.- Set the available dates:
    $.ajax({url: '/order/not_available_datelist_retrieve/', type: 'POST'})
      .done((response, status) => {
        if (status == 'success') {
          let parsedDateList = [];
          for (let exclude_date of response.not_available_datelist) {
            parsedDateList.push(moment(exclude_date, "YYYY-MM-DDTHH:mm:ss"));
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
      var min_date = moment();
      if (min_date.hour() < 13)
       {min_date.add(1, "days")}
      else
       {min_date.add(2, "days")};
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
            minDate={this.get_min_date}
            placeholderText="Enter Day/Month/Year"
            isClearable={true}
            excludeDates={this.state.excludeDates}
            selected={this.state.startDate}
            filterDate={this.isPickupDay}
            onChange={this.handleChange}/>;
    }

});

export default DeliveryDatePicker;
