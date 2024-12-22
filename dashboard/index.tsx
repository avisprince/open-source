import { FluentProvider } from '@fluentui/react-components';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { RecoilRoot } from 'recoil';

import App from 'src/App';
import RelayProvider from 'src/providers/RelayProvider';
import ToastProvider from 'src/providers/ToastProvider';
import reportWebVitals from 'src/reportWebVitals';
import { dokkimiTheme } from 'src/theme';
import { Stylesheet } from 'src/types/Stylesheet';

import './index.css';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const styles = {
  appWrapper: {
    height: '100vh',
    width: '100vw',
  },
} satisfies Stylesheet;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <RelayProvider>
      <RecoilRoot>
        <BrowserRouter>
          <FluentProvider theme={dokkimiTheme}>
            <ToastProvider>
              <div style={styles.appWrapper}>
                <App />
              </div>
            </ToastProvider>
          </FluentProvider>
        </BrowserRouter>
      </RecoilRoot>
    </RelayProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
