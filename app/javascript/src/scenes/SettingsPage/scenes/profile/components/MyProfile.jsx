import React, { Component } from "react";
import { func } from "prop-types";
import styled from "styled-components";
import { FormattedMessage } from "react-intl";
import { getUserProfileInfo } from "../../../../../services/api/users_api";

import AvatarInputField from "./AvatarInputField";
import ProfileInputField from "./ProfileInputField";

const AvatarLabel = styled.h4`
  margin-top: 15px;
  font-size: 13px;
  font-weight: 700;
`;

class MyProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fullName: "",
      avatarThumb: "",
      initials: "",
      email: "",
      timeZone: "",
      newEmail: ""
    };
    this.loadInfo = this.loadInfo.bind(this)
  }

  componentDidMount() {
    this.loadInfo();
  }

  loadInfo() {
    getUserProfileInfo()
      .then(data => {
        const { fullName, initials, email, avatarThumb, timeZone } = data;
        this.setState({ fullName, initials, email, avatarThumb, timeZone });
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <div>
        <h2>
          <FormattedMessage id="settings_page.my_profile" />
        </h2>
        <AvatarLabel>
          <FormattedMessage id="settings_page.avatar" />
        </AvatarLabel>
        <AvatarInputField imgSource={this.state.avatarThumb} />

        <ProfileInputField
          value={this.state.fullName}
          inputType="text"
          labelTitle="settings_page.full_name"
          labelValue="Full name"
          reloadInfo={this.loadInfo}
          dataField="full_name"
        />

        <ProfileInputField
          value={this.state.initials}
          inputType="text"
          labelTitle="settings_page.initials"
          labelValue="Initials"
          reloadInfo={this.loadInfo}
          dataField="initials"
        />
        <ProfileInputField
          value={this.state.email}
          inputType="email"
          labelTitle="settings_page.new_email"
          labelValue="New email"
          reloadInfo={this.loadInfo}
          dataField="email"
        />

        <ProfileInputField
          value="********"
          inputType="password"
          labelTitle="settings_page.change_password"
          labelValue="password"
          reloadInfo={this.loadInfo}
          dataField="password"
        />
      </div>
    );
  }
}

export default MyProfile;
