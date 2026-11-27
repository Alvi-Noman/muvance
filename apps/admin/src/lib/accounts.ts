/**
 * The Muvance account page (accounts.muvance.com): where people choose and change their password
 * and see their apps. Locally it runs on port 5178.
 */
export function accountsUrl(path = '/') {
  const { protocol, hostname } = window.location;
  if (hostname === 'localhost' || /^[\d.]+$/.test(hostname)) {
    return `http://localhost:5178${path}`;
  }
  const domain = hostname.split('.').slice(-2).join('.');
  return `${protocol}//accounts.${domain}${path}`;
}

/** Where each Muvance app lives (for the account page's app links). */
export function appUrl(app: 'admin' | 'mail' | 'chat' | 'meet') {
  const { protocol, hostname } = window.location;
  if (hostname === 'localhost' || /^[\d.]+$/.test(hostname)) {
    const ports = { admin: 5174, mail: 5176, chat: 5177, meet: 5175 };
    return `http://localhost:${ports[app]}/`;
  }
  const domain = hostname.split('.').slice(-2).join('.');
  return `${protocol}//${app}.${domain}/`;
}
