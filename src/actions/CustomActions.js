import { Actions } from '@twilio/flex-ui';
import ConferenceService from '../services/ConferenceService';

const toggleHold = (payload, original, hold) => {
  const { task, targetSid, participantType } = payload;

  if (participantType !== 'unknown') {
    return original(payload);
  }

  const conference = task.attributes.conference.sid;
  const participantSid = targetSid;

  if (hold) {
    console.log('Holding participant', participantSid);
    return ConferenceService.holdParticipant(conference, participantSid);
  }

  console.log('Unholding participant', participantSid);
  return ConferenceService.unholdParticipant(conference, participantSid);
};

Actions.replaceAction('HoldParticipant', (payload, original) => {
  return toggleHold(payload, original, true);
});

Actions.replaceAction('UnholdParticipant', (payload, original) => {
  return toggleHold(payload, original, false);
});

Actions.replaceAction('KickParticipant', (payload, original) => {
  const { task, targetSid, participantType } = payload;

  if (participantType === 'worker') {
    return original(payload);
  }

  const conference = task.attributes.conference.sid;
  const participantSid = targetSid;

  console.log(`Removing participant ${participantSid} from conference`);
  return ConferenceService.removeParticipant(conference, participantSid);
});
