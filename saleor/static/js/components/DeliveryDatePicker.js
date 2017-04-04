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

    isWeekDayOrSaturday: function(date){
        return date.day() != 0;
    },

    propTypes: {
        onClick: React.PropTypes.func,
        value: React.PropTypes.string
    },

    render: function () {
        return <DatePicker
            dateFormat="D/M/Y"
            locale="en"
            minDate={moment()}
            placeholderText="Enter Day/Month/Year"
            isClearable={true}
            selected={this.state.startDate}
            filterDate={this.isWeekDayOrSaturday}
            onChange={this.handleChange}/>;
    }

});

export default DeliveryDatePicker;
