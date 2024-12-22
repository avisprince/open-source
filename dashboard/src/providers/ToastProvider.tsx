import { HTMLAttributes } from 'react';
import { ToastContainer } from 'react-toastify';
import { DismissCircle20Filled } from '@fluentui/react-icons';
import 'react-toastify/dist/ReactToastify.css';

const contextClass = {
  success: 'bg-blue-600',
  error: 'bg-red-600',
  info: 'bg-gray-600',
  warning: 'bg-orange-400',
  default: 'bg-gray-dark',
  dark: 'bg-white-600 font-gray-300',
};

const progressContextClass = {
  success: 'bg-blue-300',
  error: 'bg-red-300',
  info: 'bg-gray-300',
  warning: 'bg-orange-300',
  default: 'toast-progress-salmon',
  dark: 'bg-white-300',
};

export default function ToastProvider({
  children,
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <ToastContainer
        style={{ marginTop: '60px' }}
        toastClassName={className =>
          contextClass[className?.type ?? 'default'] +
          ' text-white relative flex p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer shadow-soft mb-2'
        }
        progressClassName={className =>
          progressContextClass[className?.type ?? 'default'] +
          ' absolute bottom-0 left-0 h-1 w-full animate-toast-progress-duration-toast'
        }
        bodyClassName={() => 'text-sm text-white font-med block p-3'}
        closeButton={<div className="p-2"><DismissCircle20Filled /></div>}
      />
      {children}
    </>
  );
}
