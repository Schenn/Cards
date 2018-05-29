/**
 * All ajax connections should use the same 'current' ajax token.
 *
 * If you're using a csrf token, you need to return a new token value in your post responses.
 *
 * @type {string}
 */

let token = '';

/**
 * token ref is the key to use for managing the token value.  It should be set by the server.
 * @type {string}
 */
let tokenRef = '';

function prepareData(data){
  if(tokenRef !== ''){
    data[tokenRef] = token;
  }
}

function tokenFromResponse(json){
  if(tokenRef !== ''){
    token = json[tokenRef];
    delete json[tokenRef];
  }
}

export class AjaxConnection {
  /**
   * If your ajax connections require a token to do post requests,
   *    then provide the property name to use for it.
   * @param {string} ref
   */
  set tokenRef(ref){
    tokenRef = ref;
  }

  post(url, data, onSuccess, onFailure) {
    prepareData(data);
    fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    }).then(res => {
      res.json().then((json) => {
        tokenFromResponse(json);
        onSuccess(json);
      });
    }).catch(err => {
      onFailure(err);
    });
  }

  get(url, data, onSuccess, onFailure, text=false) {
    if(data){
      url += "?" + Object.entries(data).map(([key, val]) => `${key}=${val}`).join('&');
    }
    let getPromise =fetch(url, {credentials: 'include'});
    if(text){
      getPromise.then((response) => {
        return response.text();
      }, (response)=>{
        onFailure(response);
      });
    }
    getPromise.then((response)=>{
      onSuccess(response);
    }, (response)=>{
      onFailure(response);
    })
  }

  put(url, data, onSuccess, onFailure) {
    prepareData(data);
  }

  patch(url, data, onSuccess, onFailure) {
    prepareData(data);
  }

  del(url, data, onSuccess, onFailure) {
    prepareData(data);

  }
}