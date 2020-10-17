export async function getUser(userId, { token }) {
  const userResponse = await fetch(
    `${process.env.REACT_APP_NEXUS_API_ENDPOINT}/users/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    },
  );

  if (!userResponse.ok) {
    console.error(await userResponse.json());
    throw new Error('Could not fetch user');
  }

  const user = await userResponse.json();

  return user;
}

export async function getCalendars({ token }) {
  const calendarsResponse = await fetch(
    `${process.env.REACT_APP_NEXUS_API_ENDPOINT}/calendars`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    },
  );

  if (!calendarsResponse.ok) {
    console.error(await calendarsResponse.json());
    throw new Error('Could not fetch calendars');
  }

  const calendars = await calendarsResponse.json();

  return calendars;
}

export async function getCalendarKeys(calendarId, { token }) {
  const calendarKeysResponse = await fetch(
    `${process.env.REACT_APP_NEXUS_API_ENDPOINT}/calendars/${calendarId}/keys`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    },
  );

  if (!calendarKeysResponse.ok) {
    console.error(await calendarKeysResponse.json());
    throw new Error('Could not retrieve calendar keys.');
  }

  const calendarKeys = await calendarKeysResponse.json();

  return calendarKeys;
}

export async function createCalendarKey(calendarId, { token }) {
  const calendarKeyResponse = await fetch(
    `${process.env.REACT_APP_NEXUS_API_ENDPOINT}/calendars/${calendarId}/keys`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    },
  );

  if (!calendarKeyResponse.ok) {
    console.error(await calendarKeyResponse.json());
    throw new Error('Could not create calendar keys.');
  }

  const calendarKey = await calendarKeyResponse.json();

  return calendarKey;
}

export async function deleteEvent(eventId, { token }) {
  const deleteEventResponse = await fetch(
    `${process.env.REACT_APP_NEXUS_API_ENDPOINT}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    },
  );

  if (!deleteEventResponse.ok) {
    console.error(await deleteEventResponse.json());
    throw new Error('Could not delete event.');
  }
}
