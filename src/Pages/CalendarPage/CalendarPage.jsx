import React, {useContext, useEffect, useReducer} from "react";
import Calendar from '@toast-ui/react-calendar';

import 'tui-calendar/dist/tui-calendar.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
import UserContext, {withUser} from "../../contexts/user/user.context";

function CalendarPage() {
  const userContext = useContext(UserContext);

  const [schedules, dispatchSchedules] = useReducer((state, action) => {
    switch (action.type) {
      case 'add':
        return [...state, action.schedule];
      case 'set':
        return action.schedules;
      default:
        throw new Error('unknown dispatchSchedules action type');
    }
  }, []);
  const [calendars, dispatchCalendars] = useReducer((state, action) => {
    switch (action.type) {
      case 'add':
        return [...state, action.calendar];
      case 'set':
        return action.calendars;
      default:
        throw new Error('unknown dispatchSchedules action type');
    }
  }, []);

  useEffect(() =>{
    if (!userContext.initialized) {
      return;
    }

    async function fetchEvents() {
      const headers = {};

      if (userContext.authenticated) {
        const token = await userContext.getToken();

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const calendarsResponse = await fetch(
        `${process.env.REACT_APP_NEXUS_API_ENDPOINT}/calendars`,
        {
          headers: {
            ...headers,
          },
        },
      );

      if (!calendarsResponse.ok) {
        console.error("Could not get calendars.");
        return;
      }
      const calendarsRetrieved = await calendarsResponse.json();

      dispatchCalendars({
        type: 'set',
        calendars: calendarsRetrieved,
      });

      const events = [];

      for (const calendar of calendarsRetrieved) {
        const eventsResponse = await fetch(
          `https://nexus-calendar.glitch.me/calendars/${calendar.id}/events`,
          {
            headers: { ...headers },
          }
        );

        if (!eventsResponse.ok) {
          console.error("Could not get calendar.");
          return;
        }

        const eventsRetrieved = await eventsResponse.json();

        events.push(...eventsRetrieved.map(event => ({
          id: event.id,
          calendarId: event.calendar.id,
          title: event.title,
          category: "time",
          dueDateClass: "",
          start: event.start,
          end: event.end
        })));
      }

      return events;
    }

    fetchEvents().then(schedules => {
      dispatchSchedules({
        type: 'set',
        schedules,
      });
    });
  }, [userContext]);

  async function createEvent(calendarId, event) {
    const calendar = calendars.find(c => c.id === calendarId);

    if (!userContext.authenticated) {
      alert('Please authenticate to create events.');
      return;
    }

    if (!calendar || !calendar.canWrite) {
      alert('You cannot write events to this calendar.');
      return;
    }


    const token = await userContext.getToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const createEventResponse = await fetch(
      `https://nexus-calendar.glitch.me/calendars/${calendarId}/events`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: event.title,
          start: event.start,
          end: event.end
        })
      }
    );

    if (!createEventResponse.ok) {
      console.error("Could not create the event.");
      throw new Error("Could not create the event.");
    }

    return createEventResponse.json();
  }

  async function createSchedule(schedule) {
    try {
      const event = await createEvent(schedule.calendarId, {
        title: schedule.title,
        start: schedule.start.toDate().toISOString(),
        end: schedule.end.toDate().toISOString(),
      });

      dispatchSchedules({
        type: 'add',
        schedule: {
          ...event,
          calendarId: event.calendar.id,
          category: "time",
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function connectWithDiscord() {
    await userContext.connectWithDiscord();
  }

  async function disconnect() {
    await userContext.disconnect();
  }

  return (
    <>
      {userContext.authenticated ? (
        <>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ): (
        <>
          <button onClick={connectWithDiscord}>Connect with discord</button>
        </>
      )}

      <Calendar
        view={"month"}
        scheduleView={true}
        useCreationPopup={true}
        useDetailPopup={true}
        schedules={schedules}
        calendars={calendars.map(calendar => ({
          id: calendar.id,
          name: calendar.name,
          color: '#ffffff',
          bgColor: calendar.color,
          dragBgColor: calendar.color,
          borderColor: calendar.color
        }))}
        month={{
          startDayOfWeek: 1
        }}
        template={{
          time(schedule) {
            const html = [];

            const [hours, minutes] = schedule.start.toDate().toLocaleTimeString().split(':');
            html.push(`<strong>${hours}:${minutes}</strong>`);
            html.push(" " + schedule.title);

            return html.join("");
          }
        }}
        onBeforeCreateSchedule={createSchedule}
      />
    </>
  )
}

export default withUser(CalendarPage);
