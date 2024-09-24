import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '../store/store.js';
import Login from './Login.jsx';

const root = ReactDOM.createRoot(document.getElementById('login'));
root.render(<Provider store={store}>
    <Login />
  </Provider>);
