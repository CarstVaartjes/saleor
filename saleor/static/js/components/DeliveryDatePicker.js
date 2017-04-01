import $ from 'jquery';
import React from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
//import 'react-datepicker/dist/react-datepicker.css'; //TODO: add a css loader

/**
 * See https://hacker0x01.github.io/react-datepicker/
 */
var DeliveryDatePicker = React.createClass({
    displayName: 'DeliveryDatePicker',

    getInitialState: function () {
        return {
            startDate: moment()
        };
    },

    handleChange: function (date) {
        this.setState({
            startDate: date
        });
        this.submitDate(date.toJSON());
    },

    submitDate: function(date){
        $.ajax({
          url: '/cart/delivery_date/',
          type: 'POST',
          data: {
            delivery_date: date
          },
          success: () => {
            console.log('delivery date success');
          },
          error: (response) => {
            console.log(response);
          }
        });
    },

    propTypes: {
        onClick: React.PropTypes.func,
        value: React.PropTypes.string
    },

    render: function () {
        return <DatePicker
            minDate={moment()}
            placeholderText="Select delivery date"
            isClearable={true}
            selected={this.state.startDate}
            onChange={this.handleChange}/>;
    }

    //render () {
    //    return (
    //        <button
    //            className="datepicker-custom-input"
    //            onClick={this.props.onClick}>
    //            {this.props.value}
    //        </button>
    //    )
    //}
});


export default DeliveryDatePicker;
