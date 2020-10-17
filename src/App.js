import React, {useContext, useEffect} from 'react';
import {Switch, Route, BrowserRouter} from "react-router-dom";

import CalendarPage from "./Pages/CalendarPage/CalendarPage";
import RedirectPage from "./Pages/RedirectPage/RedirectPage";
import UserContext, {withUser} from "./contexts/user/user.context";


function App() {
  const userContext = useContext(UserContext);
  useEffect(() => {
    userContext.attemptRecoverAuthentication();
  }, [])

  return (
    <>
        <BrowserRouter>
          <Switch>
            <Route exact path="/redirect">
              <RedirectPage />
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
