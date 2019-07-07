import * as React from 'react';
import {
  Actions,
  IconButton,
  withTheme
} from '@twilio/flex-ui';

class ConferenceButton extends React.PureComponent {
  handleClick = () => {
    Actions.invokeAction('SetComponentState', {
      name: 'ConferenceDialog',
      state: { isOpen: true }
    });
  }

  render() {
    return (
      <React.Fragment>
        <IconButton
          icon="Add"
          onClick={this.handleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title="Add conference participant"
        />
      </React.Fragment>
    );
  }
}

export default withTheme(ConferenceButton);
