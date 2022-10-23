import { Button, Form, message, Select } from "antd";
import type { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from '../../styles/Record.module.scss'

const { Option } = Select;
const kbps = 1024
const Mbps = kbps * kbps
let localStream: MediaStream
let mediaRecorder: MediaRecorder

const Record: NextPage = () => {

    const config = useRef({
        devicesId: '',
        constraints: {
            audio: true,
            video: true
        } as MediaStreamConstraints
    })

    const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([])
    const [audioInDeviceList, setAudioInDeviceList] = useState<MediaDeviceInfo[]>([])
    const [audioOutDeviceList, setAudioOutDeviceList] = useState<MediaDeviceInfo[]>([])
    const [videoMimeType, setVideoMimeType] = useState<any[]>([])
    const [mimeType, setMimeType] = useState<string>('video/webm;codecs=vp9')
    const [timer, setTimer] = useState(0)

    // 获取本地音视频设备
    const getLocalDevices = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoList = devices.filter(device => device.kind === 'videoinput');
        setVideoDeviceList(videoList);
        const audioInList = devices.filter(device => device.kind === 'audioinput');
        setAudioInDeviceList(audioInList);
        const audioOutList = devices.filter(device => device.kind === 'audiooutput');
        setAudioOutDeviceList(audioOutList);
    }

    // 切换视频设备
    const switchVideoDevice = (deviceId: string) => {
        config.current.constraints = {
            audio: true,
            video: { deviceId }
        }
        getLocalStream()
    }

    // 切换音频设备
    const switchAudioDevice = (deviceId: string) => {
        config.current.constraints = {
            audio: { deviceId },
            video: true
        }
        getLocalStream()
    }

    // 获取本地音视频流
    const getLocalStream = async () => {
        // 获取媒体流
        localStream = await navigator.mediaDevices.getUserMedia(config.current.constraints)
        playLocalStream()
    }

    // 播放本地视频流
    const playLocalStream = () => {
        const videoEl = document.getElementById('localVideo') as HTMLVideoElement
        videoEl.srcObject = localStream
    }

    // 获取支持的媒体类型
    const getSupportedMimeTypes = () => {
        const media = 'video'
        const types = [
            'webm',
            'mp4',
            'ogg',
            'mov',
            'avi',
            'wmv',
            'flv',
            'mkv',
            'ts',
            'x-matroska',
        ]
        const codecs = ['vp9', 'vp9.0', 'vp8', 'vp8.0', 'avc1', 'av1', 'h265', 'h264']
        const isSupported = MediaRecorder.isTypeSupported
        const supported: string[] = []
        types.forEach((type: string) => {
            const mimeType = `${media}/${type}`
            if (isSupported(mimeType)) supported.push(mimeType)
            codecs.forEach((codec: string) => {
                [
                    `${mimeType};codecs=${codec}`,
                    `${mimeType};codecs=${codec.toUpperCase()}`,
                ].forEach((variation) => {
                    if (isSupported(variation)) supported.push(variation)
                })
            })
        })
        setVideoMimeType(supported)
    }

    // 开始录制
    const startRecord = () => {
        if (!localStream) {
            message.warning('请先获取本地音视频流')
            return
        }
        if (mediaRecorder?.state === 'recording') {
            mediaRecorder.stop()
            return
        }
        const options = {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
            mimeType: mimeType,
        }
        const chunks: Blob[] = []
        let timerId: any
        mediaRecorder = new MediaRecorder(localStream, options)
        mediaRecorder.start()

        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data)
        }

        mediaRecorder.onstart = () => {
            // 计时
            timerId = setInterval(() => {
                setTimer(timer => timer+1)
            }, 1000)
        }
        mediaRecorder.onstop = (e) => {
            setTimer(0)
            clearInterval(timerId)
            // 将录制的数据合并成一个 Blob 对象
            // const blob = new Blob(chunks, { type: chunks[0].type })
            const blob = new Blob(chunks, { type: mediaRecorder?.mimeType })
            downloadBlob(blob)
            chunks.length = 0
        }
    }

    // 下载Blob
    const downloadBlob = (blob: Blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${new Date().getTime()}.${
            blob.type.split('/')[1].split(';')[0]
        }`
        a.click()
        URL.revokeObjectURL(url)
    }

    // 分享屏幕
    const getScreenStream = async () => {
        localStream = await navigator.mediaDevices.getDisplayMedia({
            audio: {
                echoCancellation: true, // 回音消除
                noiseSuppression: true, // 噪音抑制
                autoGainControl: true  // 自动增益
            },
            video: {
              width: 1920, // 视频宽度
              height: 1080, // 视频高度
              frameRate: 60, // 帧率
              aspectRatio: 16 / 9, // 宽高比
            }
        })
        playLocalStream()
    }
 
    useEffect(() => {
        getSupportedMimeTypes()
        getLocalDevices()
    }, [])

    return (
        <div className={styles['webrtc-container']}>
            <div className={styles['local-video']}>
                <video id="localVideo" autoPlay playsInline muted></video>
            </div>
            <div className={styles.control}>
                <Form layout="inline">
                    <Form.Item label="视频输入设备切换">
                        <Select style={{ width: 200 }} placeholder="请选择" onChange={switchVideoDevice}>
                            {
                                videoDeviceList.map((item, index) => {
                                    return <Option key={index} value={item.deviceId}>{item.label}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="音频输入设备切换">
                        <Select style={{ width: 200 }} placeholder="请选择" onChange={switchAudioDevice}>
                            {
                                audioInDeviceList.map((item, index) => {
                                    return <Option key={index} value={item.deviceId}>{item.label}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="音频输出设备切换">
                        <Select style={{ width: 200 }} placeholder="请选择" onChange={switchAudioDevice}>
                            {
                                audioOutDeviceList.map((item, index) => {
                                    return <Option key={index} value={item.deviceId}>{item.label}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="录制视频格式">
                        <Select style={{ width: 200 }} placeholder="请选择" onChange={(v) => setMimeType(v)}>
                            {
                                videoMimeType.map((item, index) => {
                                    return <Option key={index} value={item}>{item}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                </Form>
                <div style={{ marginTop: 20 }}>
                    <Button type="primary" onClick={getLocalStream}>打开摄像头</Button>
                    <Button type="primary" onClick={getScreenStream}>分享屏幕</Button>
                    <Button type={timer === 0 ? 'primary' : 'dashed'} onClick={startRecord}>
                        {
                            timer === 0
                                ? '开始录制'
                                : '终止录制 | ' + timer
                        }
                    </Button>
                </div>
            </div>
            <div>
                {timer}
            </div>
        </div>
    )
}

export default Record;