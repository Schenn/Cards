let token = '';
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
      credentials: 'include',
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

  get(url, data, onSuccess, onFailure) {
    if(data){
      url += "?" + Object.entries(data).map(([key, val]) => `${key}=${val}`).join('&');
    }
    fetch(url, {credentials: 'include'}).then((response)=>{
      if(response.ok){
        onSuccess(response);
      } else {
        onFailure(response);
      }
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