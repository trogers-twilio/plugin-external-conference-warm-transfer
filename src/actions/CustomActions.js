import { Actions, Manager } from '@twilio/flex-ui';

const manager = Manager.getInstance();
const runtimeUrl = `https://${manager.serviceConfiguration.runtime_domain}`;

function toggleHold(conference, participant, hold, original, payload) {
  const { task } = payload;
  const token = Manager.getInstance().user.token;

  return fetch(`${task.attributes.url || runtimeUrl}/hold-conference-participant`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    body: `token=${token}&conference=${conference}&participant=${participant}&hold=${hold}`
  })
    .then(() => {
      console.log(`${hold ? 'Hold' : 'Unhold'} successful for participant`, participant);
    })
    .catch(error => {
      console.error(`Error ${hold ? 'holding' : 'unholding'} participant ${participant}\r\n`, error);
    });
}

function removeParticipant(conference, participant) {
  const token = Manager.getInstance().user.token;

  return fetch(`${runtimeUrl}/remove-conference-participant`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    body: `token=${token}&conference=${conference}&participant=${participant}`
  })
    .then(() => {
      console.log(`Participant ${participant} removed from conference`);
    })
    .catch(error => {
      console.error(`Error removing participant ${participant} from conference\r\n`, error);
    });
}

Actions.replaceAction('HoldParticipant', (payload, original) => new Promise(resolve => {
  const { task, targetSid, participantType } = payload;

  if (participantType !== 'unknown') {
    original(payload);
  } else {
    const conference = task.attributes.conference.sid;
    const participant = targetSid;
    const hold = true;

    console.log('Holding participant', participant);
    toggleHold(conference, participant, hold, original, payload);
  }

  resolve();
}));

Actions.replaceAction('UnholdParticipant', (payload, original) => new Promise(resolve => {
  const { task, targetSid, participantType } = payload;

  if (participantType !== 'unknown') {
    original(payload);
  } else {
    const conference = task.attributes.conference.sid;
    const participant = targetSid;
    const hold = false;

    console.log('Unholding participant', participant);
    toggleHold(conference, participant, hold, original, payload);
  }

  resolve();
}));

Actions.replaceAction('KickParticipant', (payload, original) => new Promise(resolve => {
  const {
    task, targetSid, participantType
  } = payload;

  if (participantType === 'worker') {
    original(payload);
  } else {
    const conference = task.attributes.conference.sid;
    const participant = targetSid;

    console.log(`Removing participant ${participant} from conference`);
    removeParticipant(conference, participant);
  }

  resolve();
}));
