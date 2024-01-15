const form = document.getElementById('control-row');
const domainInput = document.getElementById('domain');
const cookieName = document.getElementById('cookieName')
const message = document.getElementById('message');

// The async IIFE is necessary because Chrome <89 does not support top level await.
(async function initPopupWindow() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    try {
      let url = new URL(tab.url);
      domainInput.value = url.hostname;
    } catch {
      // ignore
    }
  }

  domainInput.focus();
})();

form.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(event) {
  console.log('ener handle formsubmit');
  event.preventDefault();

  clearMessage();

  let url = stringToUrl(domainInput.value);
  if (!url) {
    setMessage('Invalid URL');
    return;
  }

  let message = await deleteDomainCookie(url.hostname, cookieName.value);
  setMessage(message);
}

function stringToUrl(input) {
  try {
    return new URL(input);
  } catch {
    // ignore
  }
  try {
    return new URL('http://' + input);
  } catch {
    // ignore
  }
  // If that fails ¯\_(ツ)_/¯
  return null;
}

async function deleteDomainCookie(domain, cookieName) {
  try {
    const cookies = await chrome.cookies.getAll({ domain });

    if (cookies.length === 0) {
      return 'No cookies found';
    }
    const ourCookie = cookies.filter(item => item.name == cookieName)
    if (ourCookie.length == 0) {
      return `The cookie ${cookieName} not exists`
    }
    deleteCookie(ourCookie[0])
    // let pending = cookies.map(deleteCookie);
    // await Promise.all(pending);
    // cookiesDeleted = pending.length;
  } catch (error) {
    return `Unexpected error: ${error.message}`;
  }

  return `Deleted ${cookieName} cookie(s).`;
}

function deleteCookie(cookie) {
  // Cookie deletion is largely modeled off of how deleting cookies works when using HTTP headers.
  // Specific flags on the cookie object like `secure` or `hostOnly` are not exposed for deletion
  // purposes. Instead, cookies are deleted by URL, name, and storeId. Unlike HTTP headers, though,
  // we don't have to delete cookies by setting Max-Age=0; we have a method for that ;)
  //
  // To remove cookies set with a Secure attribute, we must provide the correct protocol in the
  // details object's `url` property.
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Secure
  const protocol = cookie.secure ? 'https:' : 'http:';

  // Note that the final URL may not be valid. The domain value for a standard cookie is prefixed
  // with a period (invalid) while cookies that are set to `cookie.hostOnly == true` do not have
  // this prefix (valid).
  // https://developer.chrome.com/docs/extensions/reference/cookies/#type-Cookie
  const cookieUrl = `${protocol}//${cookie.domain}${cookie.path}`;

  return chrome.cookies.remove({
    url: cookieUrl,
    name: cookie.name,
    storeId: cookie.storeId
  });
}

function setMessage(str) {
  message.textContent = str;
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = '';
}