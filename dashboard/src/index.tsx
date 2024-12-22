import { FluentProvider } from '@fluentui/react-components';
import 'bootstrap/dist/css/bootstrap.min.css';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import App from 'src/App';
import 'src/index.css';
import RelayProvider from 'src/providers/RelayProvider';
import reportWebVitals from 'src/reportWebVitals';
import { dokkimiTheme } from 'src/theme';
import { Stylesheet } from 'src/types/Stylesheet';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const styles: Stylesheet = {
  appWrapper: {
    height: '100vh',
    width: '100vw',
  },
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <RelayProvider>
      <RecoilRoot>
        <BrowserRouter>
          <FluentProvider theme={dokkimiTheme}>
            <div style={styles.appWrapper}>
              <App />
            </div>
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
