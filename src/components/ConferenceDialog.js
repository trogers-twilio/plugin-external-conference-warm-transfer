import * as React from 'react';
import { connect } from 'react-redux';
import { Actions, withTheme } from '@twilio/flex-ui';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import ConferenceService from '../services/ConferenceService';

class ConferenceDialog extends React.Component {
  state = {
    conferenceTo: ''
  }

  handleClose = () => {
    this.closeDialog();
  }

  closeDialog = () => {
    Actions.invokeAction('SetComponentState', {
      name: 'ConferenceDialog',
      state: { isOpen: false }
    });
  }

  handleKeyPress = e => {
    const value = e.target.value;
    const key = e.key;

    if (key === 'Enter') {
      this.addConferenceParticipant();
      this.closeDialog();
    } else {
      this.setState({ conferenceTo: `${value}${key}` });
    }
  }

  handleDialButton = () => {
    this.addConferenceParticipant();
    this.closeDialog();
  }

  addConferenceParticipant = () => {
    const to = this.state.conferenceTo;
    const { from, task, task: { taskSid } } = this.props;
    const conference = task.attributes.conference.sid;
    const customerSid = task.attributes.conference.participants.customer;

    // Updating endConferenceOnExit so the agent can drop without ending the conference
    this.props.task.sourceObject.updateParticipant({ endConferenceOnExit: false });

    // Updating customer participant so conference doesn't end if they hangup\
    ConferenceService.setEndConferenceOnExit(conference, customerSid, false);

    // Adding entered number to the conference
    console.log(`Adding ${to} to conference`);
    ConferenceService.addParticipant(taskSid, from, to);
  }

  render() {
    return (
      <Dialog
        open={this.props.isOpen}
        onClose={this.handleClose}
      >
        <DialogContent>
          <DialogContentText>
            Enter phone number to add to the conference
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="conferenceNumber"
            label="Phone Number"
            fullWidth
            onKeyPress={this.handleKeyPress}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.handleDialButton}
            color="primary"
          >
            Dial
          </Button>
          <Button
            onClick={this.closeDialog}
            color="secondary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  const componentViewStates = state.flex.view.componentViewStates;
  const conferenceDialogState = componentViewStates && componentViewStates.ConferenceDialog;
  const isOpen = conferenceDialogState && conferenceDialogState.isOpen;
  return {
    isOpen
  };
};

export default connect(mapStateToProps)(withTheme(ConferenceDialog));
