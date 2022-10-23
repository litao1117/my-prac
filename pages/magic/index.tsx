import { NextPage } from "next";
import { Card } from "antd";

import styles from '../../styles/Magic.module.scss'

const Magic: NextPage = () => {
    return <div className={styles['magic-container']}>
        <Card title="按钮边框旋转" style={{ width: 300 }}>
            <div className={styles['button-wrap']}>
                <div className={styles["button"]}>
                    边框旋转
                    <div className={styles['after']}></div>
                </div>
            </div>
        </Card>
    </div>
}

export default Magic