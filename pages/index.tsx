import type { NextPage } from 'next'

import { Button } from 'antd'

import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Button type='primary'>WebRTC</Button>
      </main>
    </div>
  )
}

export default Home
