import 'reflect-metadata';
import { AppProps } from 'next/app';
import { Container } from 'typedi';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
