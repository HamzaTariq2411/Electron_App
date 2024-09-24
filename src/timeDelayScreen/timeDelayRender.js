import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '../store/store.js';
import TimeDelay from './TimeDelay.jsx';

const root = ReactDOM.createRoot(document.getElementById('timeDelay'));
root.render(<Provider store={store}>
    <TimeDelay />
  </Provider>);
