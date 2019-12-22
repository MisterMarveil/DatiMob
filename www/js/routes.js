var routes = [
  // Index page
  {
    path: '/',
    url: './home.html',
    name: 'home',
  },
  //  country_list
  {
    path: '/country_list/',
    componentUrl: './pages/country_list.html',
    name: 'country_list',
  },
  //  country_list
  {
    path: '/register_form/',
    componentUrl: './pages/register_form.html',
    name: 'register_form',
  },
  //  token_code
  {
    path: '/token_code/',
    componentUrl: './pages/token_code.html',
    name: 'token_code',
  },
  //  country_list
  {
    path: '/password/:passType/',
    componentUrl: './pages/password.html',
    name: 'password',
  },
  //  services
  {
    path: '/services/',
    componentUrl: './pages/services.html',
    name: 'services',
  },
  // mont_topup page
  {
    path: '/mont_topup/',
    componentUrl: './pages/mont_topup.html',
    name: 'mont_topup',
  },
  // payment_methode page
  {
    path: '/payment_methode/',
    componentUrl: './pages/payment_methode.html',
    name: 'payment_methode',
  },
  // payment_card page
  {
    path: '/payment_card/',
    componentUrl: './pages/payment_card.html',
    name: 'payment_card',
  },
  // International_call page
  {
    path: '/International_call/',
    componentUrl: './pages/International_call.html',
    name: 'International_call',
  },
  // send_call page
  {
    path: '/send_call/:num/',
    componentUrl: './pages/send_call.html',
    name: 'send_call',
  },
  // menu page
  {
    path: '/menu/',
    componentUrl: './pages/menu.html',
    name: 'menu',
  },
  // About page
  {
    path: '/about/',
    url: './pages/about.html',
    name: 'about',
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
