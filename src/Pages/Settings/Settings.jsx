import React, {useEffect} from "react";

import { Redirect} from "react-router-dom";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from "@material-ui/core/Button";

import UserContext, {withUser} from "../../contexts/user/user.context";
import * as NexusApi from "../../services/nexus-api/nexus-api.service";

function Settings() {
  const userContext = React.useContext(UserContext);

  const [loaded, setLoaded] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [calendars, setCalendars] = React.useState([]);
  const [showExistingKeyDialog, setShowExistingKeyDialog] = React.useState(false);
  const [showNewKeyDialog, setShowNewKeyDialog] = React.useState(false);
  const [keyUrl, setKeyUrl] = React.useState('');

  useEffect(() => {
    if (!userContext.initialized || !userContext.authenticated) {
      return;
    }

    userContext.getToken().then(async token => {
      setUser(await NexusApi.getUser(userContext.userId, { token }));
      setCalendars(await NexusApi.getCalendars({ token }));
      setLoaded(true);
    });
  }, [userContext, setLoaded]);

  async function generateExportUrl(calendarId, calendarShortUrl) {
    try {
      const token = await userContext.getToken();
      const existingCalendarKeys = await NexusApi.getCalendarKeys(calendarId, { token });

      if (existingCalendarKeys.length > 0) {
        const key = existingCalendarKeys[0];
        setKeyUrl(`${process.env.REACT_APP_NEXUS_API_ENDPOINT}/calendars/${key.calendar.shortUrl}/${key.key}/calendar.ics`);
        setShowExistingKeyDialog(true)
        return;
      }

      const key = await NexusApi.createCalendarKey(calendarId, { token });
      setKeyUrl(`${process.env.REACT_APP_NEXUS_API_ENDPOINT}/calendars/${key.calendar.shortUrl}/${key.key}/calendar.ics`);
      setShowNewKeyDialog(true);
    } catch (error) {
      console.error(error);
      alert('Could not create or retrieve the access key.')
    }
  }

  if (!userContext.initialized) {
    return <>Verifying credentials...</>;
  }

  if (!userContext.authenticated) {
    return <Redirect to="/" />;
  }

  if (!loaded) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>Paramètres</h1>

      <h2>Profile</h2>
      <p><strong>Nom d'utilisateur :</strong> {user.username}</p>
      <p><strong>Rôles :</strong> {user.roles.join(', ')}</p>

      <h2>Calendriers</h2>
      <p>Vous avez accès aux calendriers suivants :</p>
      <ul>
        {calendars.map(calendar => {
          return <li key={calendar.id}><strong>{calendar.name}</strong> <button onClick={() => generateExportUrl(calendar.id, calendar.shortUrl)}>Générer un URL d'export (outlook, gmail, ...)</button></li>;
        })}
      </ul>

      <Dialog
        open={showExistingKeyDialog}
        onClose={() => setShowExistingKeyDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Clé d'accès au calendrier</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Vous possédez déjà une clé d'accès à ce calendrier. Utilisez le lien suivant pour synchroniser ce calendrier dans un autre : <a href={keyUrl}>{keyUrl}</a>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExistingKeyDialog(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showNewKeyDialog}
        onClose={() => setShowNewKeyDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Clé d'accès au calendrier</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Utilisez le lien suivant pour synchroniser ce calendrier dans un autre : <a href={keyUrl}>{keyUrl}</a>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewKeyDialog(false)} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default withUser(Settings);
