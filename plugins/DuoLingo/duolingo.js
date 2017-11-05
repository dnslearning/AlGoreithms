
var ez = require('../ez.js');

ez(
  {action: "open", url: "https://www.duolingo.com/"},
  {action: "click", target: "#sign-in-btn"},
  {action: "delay", ms: 500},
  {action: "input", target: "#top_login", value: "user"},
  {action: "input", target: "#top_password", value: "pass"},
  {action: "delay", ms: 500},
  {action: "wait", trigger: {action: "click", target: "#login-button"}},
  {action: "delay", ms: 500},
  {action: "wait", trigger: {action: "click", target: ".topbar-username a"}},
  {action: "delay", ms: 500},
  {action: "points", source: '.substat', group: 'sum', filter: /total/i, trim: /[^0-9]+/g}
);

