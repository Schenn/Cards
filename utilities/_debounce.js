/**
 * Debounce function
 *  Prevent multiple calls to the same callback as a means to throttle response to user input.
 *      e.g. As a user is typing, wait for the user to stop before triggering the callback.
 *
 * @param {function} func
 * @param {int} wait Timeout length
 * @param {boolean} immediate Whether to fire on the leading edge of timeouts instead of at the end.
 * @returns {Function}
 * @private
 *
 * Thanks to https://davidwalsh.name/function-debounce for the perfect debounce function.
 */
export const _debounce = function(func, wait, immediate = false) {
  let timeout;
  return function() {
    let context = this, args = arguments;
    let later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
