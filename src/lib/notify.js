'use client';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

let isInitialized = false;

/**
 * Lazy initialization helper for Notiflix to prevent SSR document.head errors in Next.js
 */
function initNotiflix() {
  if (typeof window !== 'undefined' && !isInitialized) {
    Notify.init({
      width: '340px',
      position: 'right-bottom',
      borderRadius: '16px',
      useIcon: true,
      fontFamily: 'inherit',
      fontSize: '13px',
      cssAnimationDuration: 300,
      cssAnimationStyle: 'fade',
      closeButton: false,
      clickToClose: true,
      timeout: 4000,
      success: {
        background: '#022c22',
        textColor: '#34d399',
        childClassName: 'notiflix-notify-success',
        notiflixIconColor: '#34d399',
      },
      failure: {
        background: '#4c0519',
        textColor: '#fb7185',
        childClassName: 'notiflix-notify-failure',
        notiflixIconColor: '#fb7185',
      },
      warning: {
        background: '#451a03',
        textColor: '#fbbf24',
        childClassName: 'notiflix-notify-warning',
        notiflixIconColor: '#fbbf24',
      },
    });
    isInitialized = true;
  }
}

export const notifySuccess = (message) => {
  if (typeof window !== 'undefined') {
    initNotiflix();
    Notify.success(message);
  }
};

export const notifyError = (message) => {
  if (typeof window !== 'undefined') {
    initNotiflix();
    Notify.failure(message);
  }
};

export const notifyWarning = (message) => {
  if (typeof window !== 'undefined') {
    initNotiflix();
    Notify.warning(message);
  }
};
