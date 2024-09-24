import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '../store/store.js';
import Dashboard from './Dashboard.jsx';

const root = ReactDOM.createRoot(document.getElementById('dashboard'));
root.render(<Provider store={store}>
    <Dashboard />
  </Provider>);
