
var webpage = require('webpage');
var system = require('system');

function ez() {
  var page = webpage.create();
  var queue = [];
  var state = {};
  var actions = {
    'state': handleState,
    'delay': handleDelay,
    'click': handleClick,
    'input': handleInput,
    'open': handleOpen,
    'wait': handleWait,
    'points': handlePoints
  };

  page.settings.userAgent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:48.0) Gecko/20100101 Firefox/48.0';

  function next() {
    if (queue.length <= 0) {
      phantom.exit(0);
    } else {
      handle(queue.shift(), next);
    }
  }

  function handle(obj, after) {
    var f = actions[obj.action];
    if (!f) { throw new Error("Unknown action " + String(obj.action)); }
    f(obj, after);
  }

  function handleDelay(obj, after) {
    console.log('# Delaying for ', obj.ms);

    setTimeout(function () {
      after();
    }, obj.ms);
  }

  function handleWait(obj, after) {
    console.log('# Waiting for page to load');
    page.onLoadFinished = function (status) {
      page.onLoadFinished = null;
      after();
    };

    if ('trigger' in obj) {
      handle(obj.trigger, function () { });
    }
  }

  function handleOpen(obj, after) {
    console.log('# Opening page ', obj.url);

    page.open(obj.url, function () {
      console.log('# Page loaded ', obj.url);
      after();
    });
  }

  function handleClick(obj, after) {
    console.log('# Clicking ', obj.target);

    page.evaluate(function (target) {
      document.querySelector(target).click();
    }, obj.target);

    after();
  }

  function handleInput(obj, after) {
    console.log('# Setting input field ', obj.target);

    page.evaluate(function (target, value) {
      document.querySelector(target).value = value;
    }, obj.target, state[obj.value]);

    page.evaluate(function (target) {
      var e = document.createEvent("HTMLEvents");
      e.initEvent("change", false, true);
      document.querySelector(target).dispatchEvent(e);
    }, obj.target);

    after();
  }

  function handleState(obj, after) {
    console.log('# Enter username:password');
    var s = system.stdin.readLine().trim();
    var parts = s.split(':', 2);
    if (parts.length !== 2) { throw new Error("Expecting username:password"); }
    state.user = parts[0];
    state.pass = parts[1];
    if (state.length <= 0) { throw new Error("Username is empty"); }
    if (state.length <= 0) { throw new Error("Password is empty"); }
    after();
  }

  function handlePoints(obj, after) {
    var sum = 0;
    var value = page.evaluate(function (source) {
      var all = [];
      var list;

      if (window.$) {
        list = $(source);
      } else {
        list = document.querySelectorAll(source);
      }

      for (var i=0; i < list.length; i++) {
        if (list[i]) { all.push(list[i].innerText); }
      }

      return all;
    }, obj.source);

    if ('filter' in obj) {
      value = value.map(function (text) {
        if (text.matches(obj.filter)) {
          return "";
        } else {
          return filter;
        }
      });
    }

    if ('trim' in obj) {
      value = value.map(function (text) {
        return text.replace(obj.trim, '').trim();
      });
    }

    switch (obj.group) {
    case "sum":
      value.forEach(function (x) { sum += Number(x); });
      break;
    case "string":
    default:
      value = value.join(" ").trim();
      break;
    }

    console.log(JSON.stringify({points: value}));
    after();
  }

  phantom.onError = function (error) {
    console.log("jserror: ", error);
    phantom.exit(1);
  };

  for (var i=0; i < arguments.length; i++) {
    queue.push(arguments[i]);
  }

  handle({action: "state"}, next);
}

module.exports = ez;

