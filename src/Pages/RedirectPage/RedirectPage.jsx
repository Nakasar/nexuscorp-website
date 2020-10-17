import React, {useContext, useEffect} from "react";

import UserContext, {withUser} from "../../contexts/user/user.context";
import { withRouter, useLocation, Redirect } from "react-router-dom";

function RedirectPage() {
  const location = useLocation();
  const { authenticated, finalizeDiscordAuthentication } = useContext(UserContext);
  const [inProgress, setInProgress] = React.useState(false);

  const [error, setError] = React.useState(false)

  useEffect(() => {
    if (inProgress) {
      return;
    }
    const locationParams = new URLSearchParams(location.search);
    const code = locationParams.get('code');
    const state = locationParams.get('state');

    setInProgress(true);
    finalizeDiscordAuthentication({ code, state })
      .catch((error) => {
        console.error(error);
        setError(true);
      });
  }, [inProgress, location.search, finalizeDiscordAuthentication]);

  return (
    <>
      {error && <Redirect to="/" />}
      {authenticated && <Redirect to="/" />}
      <h1>Validating authentication...</h1>
    </>
  )
}

export default withUser(withRouter(RedirectPage));
