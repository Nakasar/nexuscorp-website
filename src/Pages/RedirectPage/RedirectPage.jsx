import React, {useContext, useEffect} from "react";

import UserContext, {withUser} from "../../contexts/user/user.context";
import { withRouter, useLocation, Redirect } from "react-router-dom";

function RedirectPage() {
  const location = useLocation();
  const { authenticated, finalizeDiscordAuthentication } = useContext(UserContext);

  const [error, setError] = React.useState(false)

  useEffect(() => {
    const locationParams = new URLSearchParams(location.search);
    const code = locationParams.get('code');
    const state = locationParams.get('state');

    finalizeDiscordAuthentication({ code, state })
      .catch((error) => {
        console.log('here');
        console.error(error);
        setError(true);
      });
  }, [location.search, finalizeDiscordAuthentication]);

  return (
    <>
      {error && <Redirect to="/" />}
      {authenticated && <Redirect to="/" />}
      <h1>Validating authentication...</h1>
    </>
  )
}

export default withUser(withRouter(RedirectPage));
