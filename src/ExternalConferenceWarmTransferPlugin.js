import { FlexPlugin } from 'flex-plugin';
import React from 'react';
import ConferenceButton from './components/Conference';
import ParticipantActionsButtons from './components/ParticipantActionsButtons';
import ParticipantName from './components/ParticipantName';
import ParticipantStatus from './components/ParticipantStatus';
import './actions/CustomActions';

const PLUGIN_NAME = 'ExternalConferenceWarmTransferPlugin';

export default class ExternalConferenceWarmTransferPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    flex.CallCanvas.Content.add(<ConferenceButton
      key="conference"
      url={manager.serviceConfiguration.runtime_domain}
    />);

    const isUnknownParticipant = props => props.participant.participantType === 'unknown';

    flex.ParticipantCanvas.Content.remove('actions');
    flex.ParticipantCanvas.Content.add(
      <ParticipantActionsButtons
        key="custom-actions"
      />, { sortOrder: 10 }
    );
    flex.ParticipantCanvas.Content.remove('name', { if: isUnknownParticipant });
    flex.ParticipantCanvas.Content.add(
      <ParticipantName
        key="custom-name"
      />, { sortOrder: 1, if: isUnknownParticipant }
    );
    flex.ParticipantCanvas.Content.remove('status', { if: isUnknownParticipant });
    flex.ParticipantCanvas.Content.add(
      <ParticipantStatus
        key="custom-status"
      />, { sortOrder: 2, if: isUnknownParticipant }
    );
  }
}
