/* Live copy only, while the owner tests the hub with a few people: no account options anywhere, every tool open.
   Turn off by removing window.HUB_TEST in server.js (and this script line in app.html). */
(function () {
  if (!window.HUB_TEST) return;
  var st = document.createElement('style');
  st.textContent = '[data-join],.whyacct{display:none!important}';
  document.head.appendChild(st);
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-join]')) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  try {
    var L = window.LCH, acc = L.V.account;
    L.V.account = function (id) {
      if (L.profile) return acc(id);
      return '<div class="wrap"><h1>Accounts are coming soon</h1><p class="lede">You’re one of the first people trying the Luton Community Hub. While we test it, everything is open: no account needed. Have a look around and tell us what you think.</p><div class="row" style="margin-top:14px"><a class="btn p" href="#home">Back to home</a></div></div>';
    };
    // Case studies aren't ready: the old #lets link shows a coming-soon page
    L.V.lets = function () { return '<div class="wrap"><h1>Case studies</h1><p class="lede">Coming soon. We’re putting together examples of our campaigns for schools, mosques and charities.</p><div class="row" style="margin-top:14px"><a class="btn p" href="#alltools">See all tools</a></div></div>'; };
    L.render();
  } catch (e) {}
})();
