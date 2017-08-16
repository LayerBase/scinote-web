import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import InputDisabled from "./InputDisabled";
import InputTimezone from "./InputTimezone";

import { changeTimezone } from "../../../shared/actions/UsersActions";

class SettingsPreferences extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isTimeZoneEditable: true
    };
  }

  toggleIsEditable(fieldNameEnabled) {
    const editableState = this.state[fieldNameEnabled];
    this.setState({ [fieldNameEnabled]: !editableState });
  }

  render() {
    const isTimeZoneEditable = "isTimeZoneEditable";
    let timezoneField;

    if (this.state.isTimeZoneEditable) {
      timezoneField = (
        <InputTimezone
          labelValue="Time zone"
          inputValue={this.props.timezone}
          disableEdit={() => this.toggleIsEditable(isTimeZoneEditable)}
          saveData={timeZone => this.props.changeTimezone(timeZone)}
        />
      );
    } else {
      timezoneField = (
        <InputDisabled
          labelValue="Time zone"
          inputValue={this.props.timezone}
          inputType="text"
          enableEdit={() => this.toggleIsEditable(isTimeZoneEditable)}
        />
      );
    }

    return (
      <div className="col-xs-12 col-sm-7">
        {timezoneField}
        <small>
          Time zone setting affects all time & date fields throughout
          application.
        </small>
      </div>
    );
  }
}

SettingsPreferences.propTypes = {
  timezone: PropTypes.string.isRequired,
  changeTimezone: PropTypes.func.isRequired
};

const mapStateToProps = state => state.current_user;
const mapDispatchToProps = dispatch => ({
  changeTimezone(timezone) {
    dispatch(changeTimezone(timezone));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(
  SettingsPreferences
);
