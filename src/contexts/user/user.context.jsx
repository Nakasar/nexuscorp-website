import React from 'react';

const UserContext = React.createContext({authenticated: false});

function UserContextProvider(props) {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const [token, setToken] = React.useState(null);

  async function attemptRecoverAuthentication() {
    if (window.localStorage) {
      const token = window.localStorage.getItem('token');

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const tokenExpiresAt = new Date(0)
          tokenExpiresAt.setUTCSeconds(payload.exp);

          if (tokenExpiresAt > new Date()) {
            setToken(token);
            setAuthenticated(true);
          }
        } catch {}
      }
    }

    setInitialized(true);
  }

  async function connectWithDiscord() {
    const authRequest = await fetch(
      `https://nexus-calendar.glitch.me/authentication`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: process.env.REACT_APP_DOMAIN,
          redirectUri: `${process.env.REACT_APP_DOMAIN}/redirect`,
        }),
      }).then(res => res.json());

    window.location = `https://discord.com/api/oauth2/authorize?client_id=736495315393445978&redirect_uri=${encodeURIComponent(`${process.env.REACT_APP_DOMAIN}/redirect`)}&response_type=code&scope=identify&state=${authRequest.state}`;
  }

  async function disconnect() {
    if (window.localStorage) {
      window.localStorage.removeItem('token');
    }

    setAuthenticated(false);
    setToken(null);
  }

  async function finalizeDiscordAuthentication({ code, state }) {
    const authResultResponse = await fetch(`https://nexus-calendar.glitch.me/authentication/${state}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
      }),
    });

    if (!authResultResponse.ok) {
      console.log(await authResultResponse.json());
      throw new Error('Autentication failed.');
    }

    const authResult = await authResultResponse.json();

    if (window.localStorage) {
      window.localStorage.setItem('token', authResult.token);
    }

    setToken(authResult.token);
    setInitialized(true);
    setAuthenticated(true);
    return authResult.redirect;
  }

  async function getToken() {
    if (!authenticated) {
      throw new Error('User not authenticated.');
    }

    return token;
  }

  const value = {
    // Variables
    authenticated,
    initialized,
    // Methods
    attemptRecoverAuthentication,
    connectWithDiscord,
    disconnect,
    finalizeDiscordAuthentication,
    getToken,
  };

  return (
    <UserContext.Provider value={value}>{props.children}</UserContext.Provider>
  )
}

const UserContextConsumer = UserContext.Consumer;

export const withUser = Component => props => (
  <UserContextConsumer>
    {value => <Component {...props} userContext={value}/>}
  </UserContextConsumer>
);

export default UserContext;

export {UserContextConsumer, UserContextProvider};
