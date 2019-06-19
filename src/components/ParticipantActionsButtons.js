import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import {
  Actions,
  IconButton,
  TaskHelper,
  withTheme
} from '@twilio/flex-ui';

const ActionsContainer = styled('div')`
  margin-top: 10px;
  button {
      width: 36px;
      height: 36px;
      margin-left: 6px;
      margin-right: 6px;
  }
`;

class ParticipantActionsButtons extends React.Component {
  componentWillUnmount() {
    const { participant } = this.props;
    if (participant.status === 'recently_left') {
      this.props.clearParticipantComponentState();
    }
  }

  showKickConfirmation = () => this.props.setShowKickConfirmation(true);

  hideKickConfirmation = () => this.props.setShowKickConfirmation(false);

  onHoldParticipantClick = () => {
    const { participant, task } = this.props;
    const participantType = participant.participantType;
    Actions.invokeAction(participant.onHold ? 'UnholdParticipant' : 'HoldParticipant', {
      participantType,
      task,
      targetSid: participant.callSid
    });
  };

  onKickParticipantConfirmClick = () => {
    const { participant, task } = this.props;
    const participantType = participant.participantType;
    Actions.invokeAction('KickParticipant', {
      participantType,
      task,
      targetSid: participant.callSid
    });
    this.hideKickConfirmation();
  };

  renderKickConfirmation() {
    return (
      <React.Fragment>
        <IconButton
          icon="Accept"
          className="ParticipantCanvas-AcceptAction"
          onClick={this.onKickParticipantConfirmClick}
          themeOverride={this.props.theme.ParticipantsCanvas.ParticipantCanvas.Button}
        />
        <IconButton
          icon="Close"
          className="ParticipantCanvas-DeclineAction"
          onClick={this.hideKickConfirmation}
          themeOverride={this.props.theme.ParticipantsCanvas.ParticipantCanvas.Button}
        />
      </React.Fragment>
    );
  }

  renderActions() {
    const { participant, theme, task } = this.props;

    const holdParticipantTooltip = participant.onHold
      ? 'Hold Participant' : 'Unhold Participant';
    const kickParticipantTooltip = 'Remove Participant';

    return (
      <React.Fragment>
        <IconButton
          icon={participant.onHold ? 'HoldLargeBold' : 'HoldLarge'}
          className="ParticipantCanvas-HoldButton"
          disabled={!TaskHelper.canHold(task) || participant.status !== 'joined'}
          onClick={this.onHoldParticipantClick}
          themeOverride={theme.ParticipantsCanvas.ParticipantCanvas.Button}
          title={holdParticipantTooltip}
        />
        <IconButton
          icon="HangupLarge"
          className="ParticipantCanvas-HangupButton"
          onClick={this.showKickConfirmation}
          themeOverride={theme.ParticipantsCanvas.ParticipantCanvas.HangUpButton}
          title={kickParticipantTooltip}
        />
      </React.Fragment>
    );
  }

  render() {
    return (
      <ActionsContainer className="ParticipantCanvas-Actions">
        {this.props.showKickConfirmation
          ? this.renderKickConfirmation()
          : this.renderActions()
        }
      </ActionsContainer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { participant } = ownProps;
  const componentViewStates = state.flex.view.componentViewStates;
  const customParticipants = componentViewStates.customParticipants || {};
  const participantState = customParticipants[participant.callSid] || {};
  const customParticipantsState = {};

  return {
    showKickConfirmation: participantState.showKickConfirmation,
    setShowKickConfirmation: value => {
      customParticipantsState[participant.callSid] = {
        ...participantState,
        showKickConfirmation: value
      };
      Actions.invokeAction('SetComponentState', {
        name: 'customParticipants',
        state: customParticipantsState
      });
    },
    clearParticipantComponentState: () => {
      customParticipantsState[participant.callSid] = undefined;
      Actions.invokeAction('SetComponentState', {
        name: 'customParticipants',
        state: customParticipantsState
      });
    }
  };
};

export default connect(mapStateToProps)(withTheme(ParticipantActionsButtons));
