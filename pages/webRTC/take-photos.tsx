import { Button, Form, message, Select } from "antd";
import type { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from '../../styles/TakePhoto.module.scss'

const { Option } = Select;

// 添加滤镜
const FILTERLIST = [
  'blur(5px)', // 模糊
  'brightness(0.5)', // 亮度
  'contrast(200%)', // 对比度
  'grayscale(100%)', // 灰度
  'hue-rotate(90deg)', // 色相旋转
  'invert(100%)', // 反色
  'opacity(90%)', // 透明度
  'saturate(200%)', // 饱和度
  'saturate(20%)', // 饱和度
  'sepia(100%)', // 褐色
  'drop-shadow(4px 4px 8px blue)', // 阴影
]

const TakePhotos: NextPage = () => {
    const config = useRef({
        devicesId: '',
        constraints: {
            audio: false,
            video: true
        } as MediaStreamConstraints
    })
    const [imgList, setImgList] = useState<string[]>([])
    const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([])

    // 获取本地音视频设备
    const getLocalDevices = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const list = devices.filter(device => device.kind === 'videoinput');
        setDeviceList(list);
    }

    // 切换前后摄像头
    const switchCamera = (val: number) => {
        config.current.constraints.video = {
            facingMode: {
                exact: val === 1 ? 'user' : 'environment'
            }
        }
        navigator.mediaDevices
            .getUserMedia(config.current.constraints)
            .then(stream => {
                message.success('切换成功');
                playLocalStream(stream);
            })
            .catch(_e => {
                message.error('你的设备不支持切换前后摄像头')
            })
    }

    // 切换设备
    const switchDevice = (deviceId: string) => {
        config.current.constraints.video = {
            deviceId: { exact: deviceId }
        }
        getLocalStream()
    }

    // 获取本地音视频流
    const getLocalStream = async (constrains: MediaStreamConstraints = config.current.constraints) => {
        // 获取媒体流
        const stream = await navigator.mediaDevices.getUserMedia(constrains)
        playLocalStream(stream)
    }

    // 播放本地视频流
    const playLocalStream = useCallback((stream: MediaStream) => {
        const videoEl = document.getElementById('localVideo') as HTMLVideoElement
        videoEl.srcObject = stream
    }, [])

    // 拍照
    const takePhoto = () => {
        const videoEl = document.getElementById('localVideo') as HTMLVideoElement;
        const canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const newImgList = [...imgList, canvas.toDataURL('image/png')];
        for(let i = 0; i < FILTERLIST.length; i++) {
            ctx.filter = FILTERLIST[i];
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            newImgList.push(canvas.toDataURL('image/png'));
        }
        setImgList(newImgList)
    }

    useEffect(() => {
        getLocalStream()
        getLocalDevices()
    }, [])

    return (
        <div className={styles['webrtc-container']}>
            <div className={styles['photo-list']}>
                {
                    imgList.map((item, index) => {
                        return <div key={index} className={styles['item-image']}>
                            <img src={item} alt="" />
                        </div>
                    })
                }
            </div>
            <div className={styles.control}>
                <video id="localVideo" autoPlay playsInline muted></video>
                <Form>
                    <Form.Item label="切换设备">
                        <Select placeholder="请选择" onChange={switchDevice}>
                            {
                                deviceList.map((item, index) => {
                                    return <Option key={index} value={item.deviceId}>{item.label}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="切换方向">
                        <Select placeholder="请选择" onChange={switchCamera}>
                            <Option value={1}>前置摄像头</Option>
                            <Option value={2}>后置摄像头</Option>
                        </Select>
                    </Form.Item>
                </Form>
                <Button type="primary" onClick={takePhoto}>拍照</Button>
                <Button type="primary" onClick={() => setImgList([])}>清空</Button>
            </div>
        </div>
    )
}

export default TakePhotos;