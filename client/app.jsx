import React from 'react';
import Home from './pages/home';

import { parseRoute } from './lib';
import 'bootstrap/dist/css/bootstrap.min.css';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      route: parseRoute(window.location.hash)
    };
  }

  componentDidMount() {
    /**
     * Listen for hash change events on the window object
     * Each time the window.location.hash changes, parse
     * it with the parseRoute() function and update state
     */
    window.addEventListener('hashchange', () => {
      const newRoute = parseRoute(window.location.hash);
      this.setState({ route: newRoute });
    });
  }

  // renderPage() {
  //   const { route } = this.state;
  //   if (route.path === '') {
  //     return <Catalog />;
  //   }
  //   if (route.path === 'products') {
  //     const productId = route.params.get('productId');
  //     return <ProductDetails productId={productId} />;
  //   }
  //   return <NotFound />;
  // }

  render() {
    return <Home />;
  }
}
