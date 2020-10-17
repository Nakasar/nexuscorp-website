import React, {useContext, useEffect} from 'react';
import {Switch, Route, BrowserRouter, Link as RouterLink } from "react-router-dom";
import Button from '@material-ui/core/Button';

import CalendarPage from "./Pages/CalendarPage/CalendarPage";
import RedirectPage from "./Pages/RedirectPage/RedirectPage";
import UserContext, {withUser} from "./contexts/user/user.context";
import Settings from "./Pages/Settings/Settings";


function App() {
  const { attemptRecoverAuthentication } = useContext(UserContext);

  useEffect(() => {
    attemptRecoverAuthentication();
  }, [attemptRecoverAuthentication])

  return (
    <>
        <BrowserRouter>
          <header>
            <Button color="primary" component={RouterLink} to="/">
              Calendrier
            </Button>
            <Button color="primary" component={RouterLink} to="/settings">
              Paramètres
            </Button>
          </header>
          <Switch>
            <Route exact path="/redirect">
              <RedirectPage />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route>
              <CalendarPage />
            </Route>
          </Switch>
        </BrowserRouter>
    </>
  );
}

export default withUser(App);
