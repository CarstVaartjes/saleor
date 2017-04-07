import $ from 'jquery';
import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * See https://hacker0x01.github.io/react-datepicker/
 */
var DeliveryDatePicker = React.createClass({
    displayName: 'DeliveryDatePicker',

    getInitialState: function () {
        return {
            startDate: null  // force the user to select a date
        };
    },

    handleChange: function (date) {
        this.setState({
            startDate: date
        });
        if(date)
          this.submitDate(date.toJSON());
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
          url: '/cart/delivery_date/',
          type: 'POST',
          data: {
            delivery_date: date
          },
          success: (response) => {
            if(response.success){
                this.showValidationErrors();
            } else{
                var validationErrors = response.errors.delivery_date;
                var errorText = "";
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
            minDate={this.get_min_date()}
            placeholderText="Enter Day/Month/Year"
            isClearable={true}
            selected={this.state.startDate}
            filterDate={this.isPickupDay}
            onChange={this.handleChange}/>;
    }

});

export default DeliveryDatePicker;
