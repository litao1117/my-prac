import '../styles/globals.css'
import 'antd/dist/antd.css'
import type { AppProps } from 'next/app'
import MyLayout from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return <MyLayout>
    <Component {...pageProps} />
  </MyLayout>
}

export default MyApp
