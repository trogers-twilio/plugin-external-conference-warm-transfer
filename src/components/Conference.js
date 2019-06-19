import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'react-emotion';
import { withTaskContext, Manager, Actions } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import IconButton from '@material-ui/core/IconButton';
import GroupAdd from '@material-ui/icons/GroupAdd';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  root: {
    flexGrow: 1,
    height: 250,
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing.unit * 2,
  }
});

const iconButtons = css`
  display: contents !important;
`;

const conferenceButton = css`
  margin: 20px;
`;

const wrapper = css`
  height: 400px;
`;

const conferenceKeypad = css`
  display: flex;
  flex-direction: column;
  height: 400px;
`;

export class ConferenceButton2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'none',
      conferenceTo: '',
      error: false,
      helpText: ''
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.eventListener, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.eventListener, false);
  }

  eventListener = e => {
    this.keyPressListener(e);
  }

  handleConferenceToChange = e => {
    this.setState({
      conferenceTo: e.target.value,
      error: false,
      helpText: ''
    });
  }

  dialPad = () => {
    const { classes, theme } = this.props;

    const inputStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    if (this.state.mode === 'conference') {
      // Populate suggestions list
      const suggestions = [];
      for (const i in this.state.workerList) {
        suggestions.push({
          label: this.state.workerList[i].attributes.full_name,
          value: this.state.workerList[i].attributes.contact_uri
        });
      }

      return (
        <div className={conferenceKeypad}>
          <NoSsr>
            <TextField
              id="conference-to-number"
              classes={classes}
              style={inputStyles}
              label="Phone number to conference"
              placeholder="Enter phone number to conference"
              onChange={this.handleConferenceToChange}
              margin="normal"
              value={this.state.conferenceTo}
              error={this.state.error}
              helperText={this.state.helpText}
            />
          </NoSsr>
        </div>
      );
    }

    return (
      <div />
    );
  }

  keyPressListener = e => {
    if (e.keyCode === 13) { // listen for enter
      if (this.state.conferenceTo.length < 10) {
        this.setState({
          error: true,
          helpText: 'Number must be at least 10 digits'
        });
      } else {
        this.addConferenceParticipant();
        this.setState({
          conferenceTo: '',
          mode: 'none'
        });
      }
    }
  }

  addConferenceParticipant = () => {
    const to = this.state.conferenceTo;
    const { from, task, task: { taskSid } } = this.props;
    const conference = task.attributes.conference.sid;
    const customerSid = task.attributes.conference.participants.customer;
    const manager = Manager.getInstance();
    const token = manager.user.token;

    // Updating endConferenceOnExit so the agent can drop without ending the conference
    this.props.task.sourceObject.updateParticipant({ endConferenceOnExit: false });

    fetch(`https://${this.props.url}/update-conference-participant`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: `token=${token}&conference=${conference}&participant=${customerSid}&endConferenceOnExit=${false}`
    })
      .then(response => response.json())
      .then(json => {
        console.log('Participant updated');
      });

    fetch(`https://${this.props.url}/add-conference-participant`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: `token=${token}&taskSid=${taskSid}&from=${from}&to=${to}`
    })
      .then(response => response.json())
      .then(json => {
        if (json.status === 200) {
          console.log('Participant added:\r\n  ', json);
          const participantCallSid = json.callSid;
          this.props.setCustomParticipantState(
            participantCallSid, { name: to }
          );
        }
      });
  }

  displayConferenceInput = () => {
    this.setState(state => ({ mode: state.mode === 'conference' ? 'none' : 'conference' }));
  }

  render() {
    return (
      <div className={wrapper}>
        <IconButton color="inherit" className={iconButtons} component="div">
          <GroupAdd className={conferenceButton} onClick={() => this.displayConferenceInput()} />
        </IconButton>
        <this.dialPad />
      </div>
    );
  }
}

ConferenceButton2.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

const ConferenceButton = withTaskContext(ConferenceButton2);

const mapStateToProps = state => {
  const componentViewStates = state.flex.view.componentViewStates;
  const customParticipants = componentViewStates.customParticipants || {};
  return {
    from: state.flex.worker.attributes.phone,
    activeCall: state.flex.phone.connections,
    workerName: state.flex.worker.attributes.full_name,
    setCustomParticipantState: (participantCallSid, newState) => {
      const participantState = customParticipants[participantCallSid] || {};
      const customParticipantsState = {};
      customParticipantsState[participantCallSid] = {
        ...participantState,
        ...newState
      };
      participantState[participantCallSid] = newState;
      Actions.invokeAction('SetComponentState', {
        name: 'customParticipants',
        state: customParticipantsState
      });
    }
  };
};

export default connect(mapStateToProps)(withStyles(styles)(ConferenceButton));
